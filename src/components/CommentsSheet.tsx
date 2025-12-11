"use client";

import { useState, useEffect } from "react";
import { X, Send, User } from "lucide-react";

interface Comment {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
}

interface CommentsSheetProps {
    videoId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function CommentsSheet({ videoId, isOpen, onClose }: CommentsSheetProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen, videoId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?videoId=${videoId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setComments(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePost = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, text: newComment }),
            });
            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full h-[70vh] bg-gray-900 rounded-t-3xl flex flex-col overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-white font-bold">{comments.length} comments</h3>
                    <button onClick={onClose}><X className="text-white w-6 h-6" /></button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400">User {comment.userId.substring(0, 4)}</p>
                                <p className="text-white text-sm">{comment.text}</p>
                                <p className="text-xs text-gray-600 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-800 flex gap-2 items-center bg-gray-900">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a comment..."
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                    />
                    <button
                        onClick={handlePost}
                        disabled={loading || !newComment.trim()}
                        className="p-2 bg-blue-600 rounded-full text-white disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
