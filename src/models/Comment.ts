import mongoose, { Schema, model, models } from "mongoose";

const CommentSchema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    userId: { type: String, default: "anon" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
