import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Video from "@/models/Video";
import { getContainerClient, generateVideoSasUrl } from "@/lib/azure/storage";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

        // Map _id to id for frontend compatibility AND sign the URLs
        const videosWithId = videos.map((video: any) => {
            // Extract blob name from URL
            // URL format: https://<account>.blob.core.windows.net/<container>/<blobname>
            let signedUrl = video.videoUrl;
            try {
                const url = new URL(video.videoUrl);
                const blobName = url.pathname.split('/').pop(); // Last segment is blob name
                if (blobName) {
                    signedUrl = generateVideoSasUrl(blobName);
                }
            } catch (e) {
                console.error("Error signing URL for video:", video._id, e);
            }

            return {
                ...video,
                videoUrl: signedUrl,
                id: video._id.toString(),
            };
        });

        return NextResponse.json(videosWithId);
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("video") as File;
        const caption = formData.get("caption") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No video file provided" },
                { status: 400 }
            );
        }

        // Connect to DB and Azure Storage
        await connectDB();

        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
            throw new Error("Azure Storage connection string is missing in environment variables");
        }

        console.log(`Starting upload: ${file.name}, size: ${file.size}, type: ${file.type}`);

        const containerClient = await getContainerClient();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `video-${timestamp}-${Math.random().toString(36).substring(2, 9)}.mp4`;
        const blockBlobClient = containerClient.getBlockBlobClient(filename);

        // Convert file to buffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Azure
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: file.type || "video/mp4",
            },
        });

        // Save metadata to MongoDB
        const video = await Video.create({
            videoUrl: blockBlobClient.url,
            caption: caption || "",
            userId: "user-1", // Placeholder for auth
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            video: {
                ...video.toObject(),
                id: video._id.toString(),
            }
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed: " + error.message },
            { status: 500 }
        );
    }
}
