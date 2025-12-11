import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Video from "@/models/Video";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId } = body;

        if (!videoId) {
            return NextResponse.json({ error: "videoId is required" }, { status: 400 });
        }

        await connectDB();

        // Atomically increment likes
        await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to like video" }, { status: 500 });
    }
}
