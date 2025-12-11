"use client";

import { useState, useEffect, useRef } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Video } from "@/types";
import Link from "next/link";
import { Upload, Loader2 } from "lucide-react";

export default function VideoFeed() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch("/api/videos");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setVideos(data);
                    if (data.length > 0) setActiveVideoId(data[0].id);
                }
            } catch (e) {
                console.error("Failed to fetch videos", e);
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const height = container.clientHeight;
        const scrollTop = container.scrollTop;

        const index = Math.round(scrollTop / height);
        if (videos[index] && videos[index].id !== activeVideoId) {
            setActiveVideoId(videos[index].id);
        }
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            {/* Top Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="text-white font-bold text-xl tracking-tight pointer-events-auto">WeGist</div>
                <Link href="/upload" className="pointer-events-auto p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-all">
                    <Upload className="text-white w-6 h-6" />
                </Link>
            </div>

            {/* Video Scroller */}
            <div
                ref={containerRef}
                className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
                style={{ scrollBehavior: 'smooth' }}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p>Loading your feed...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 text-center p-6">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-white mb-2">No videos yet</p>
                        <p className="text-sm">Be the first to share a moment!</p>
                        <Link href="/upload" className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                            Upload Video
                        </Link>
                    </div>
                ) : (
                    videos.map((video) => (
                        <div key={video.id} className="w-full h-[100dvh] snap-start border-b border-gray-900">
                            <VideoPlayer video={video} isActive={video.id === activeVideoId} />
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Nav (Optional placeholder) */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
    );
}
