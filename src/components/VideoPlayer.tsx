"use client";

import { useRef, useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";
import { Video } from "@/types";
import CommentsSheet from "./CommentsSheet";

interface VideoPlayerProps {
    video: Video;
    isActive: boolean;
}

export default function VideoPlayer({ video, isActive }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(video.likes);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        setLikeCount(video.likes);
    }, [video.likes]);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().then(() => setPlaying(true)).catch(() => {
                setPlaying(false);
            });
        } else {
            videoRef.current?.pause();
            setPlaying(false);
        }
    }, [isActive]);

    const toggleLike = async () => {
        if (liked) return;
        setLiked(true);
        setLikeCount(prev => prev + 1);

        try {
            await fetch("/api/likes", {
                method: "POST",
                body: JSON.stringify({ videoId: video.id })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setPlaying(true);
        } else {
            videoRef.current?.pause();
            setPlaying(false);
        }
    };

    return (
        <div className="relative w-full h-full bg-black snap-start shrink-0 flex items-center justify-center">
            <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlay}
            />

            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                    <Play className="w-16 h-16 text-white/80 animate-pulse fill-white" />
                </div>
            )}

            {/* Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={toggleLike}
                >
                    <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/80 backdrop-blur-sm transition-all group-active:scale-90">
                        <Heart
                            className={`w-8 h-8 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{likeCount}</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={() => setShowComments(true)}
                >
                    <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/80 backdrop-blur-sm transition-all group-active:scale-90">
                        <MessageCircle className="w-8 h-8 text-white fill-white/10" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Comment</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-gray-800/60 rounded-full hover:bg-gray-700/80 backdrop-blur-sm transition-all group-active:scale-90">
                        <Share2 className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
                </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-6 left-4 right-20">
                <div className="flex flex-col gap-2">
                    <h3 className="text-white font-bold text-shadow drop-shadow-md">@user_{video.id.substring(0, 6)}</h3>
                    <p className="text-white/90 text-sm leading-relaxed drop-shadow-md break-words">
                        {video.caption}
                    </p>
                </div>
            </div>

            <CommentsSheet
                videoId={video.id}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
            />
        </div>
    );
}
