import mongoose, { Schema, model, models } from "mongoose";

const VideoSchema = new Schema({
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    caption: { type: String },
    likes: { type: Number, default: 0 },
    userId: { type: String, default: "anon" },
    createdAt: { type: Date, default: Date.now },
});

// Use existing model if present (hot reload fix)
const Video = models.Video || model("Video", VideoSchema);

export default Video;
