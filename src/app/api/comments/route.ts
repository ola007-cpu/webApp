import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    try {
        await connectDB();
        const comments = await Comment.find({ videoId }).sort({ createdAt: -1 }).lean();

        // Map _id to id
        const commentsWithId = comments.map((comment: any) => ({
            ...comment,
            id: comment._id.toString()
        }));

        return NextResponse.json(commentsWithId);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, text } = body;

        if (!videoId || !text) {
            return NextResponse.json({ error: "videoId and text are required" }, { status: 400 });
        }

        await connectDB();

        // Create new comment
        const newComment = await Comment.create({
            videoId, // Mongoose will cast string to ObjectId if valid, else error
            userId: "anon_user",
            text,
        });

        const commentObj = newComment.toObject();
        commentObj.id = commentObj._id.toString();

        return NextResponse.json(commentObj);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
