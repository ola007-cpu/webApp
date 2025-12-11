"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UploadArea() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        setError(null);
        setSuccess(false);

        if (!selectedFile.type.startsWith("video/")) {
            setError("Please select a video file.");
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || uploading) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append("video", file);

        let progressInterval: NodeJS.Timeout | null = null;

        try {
            // Create a fake progress interval for UX since fetch doesn't support progress events easily 
            // without XMLHttpRequest or streams (for a simple prototype)
            progressInterval = setInterval(() => {
                setProgress((prev) => (prev >= 90 ? prev : prev + 10));
            }, 500);

            const response = await fetch("/api/videos", {
                method: "POST",
                body: formData,
            });

            let result: any = {};
            try {
                result = await response.json();
            } catch {
                // ignore JSON parse error if body is empty or invalid
            }

            if (!response.ok) {
                // Use the result we just parsed, or fallback to default
                throw new Error(result.error || "Upload failed");
            }

            setProgress(100);
            setSuccess(true);
            setFile(null);

            // Reset success UI after delay
            setTimeout(() => {
                setSuccess(false);
                setProgress(0);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to upload video. Please try again.");
            console.error("Upload error:", err);
        } finally {
            if (progressInterval) clearInterval(progressInterval);
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${file ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-400 hover:bg-gray-800"}
        `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={(e) =>
                        e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                />

                {file ? (
                    <div
                        className="flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-white w-6 h-6" />
                        </div>
                        <p className="text-white font-medium truncate max-w-full px-4">
                            {file.name}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            onClick={() => setFile(null)}
                            className="mt-4 p-2 bg-gray-800 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-blue-400">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-semibold text-white">Upload Video</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                            MP4, WebM, MOV
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Upload Successful!
                </div>
            )}

            {file && !success && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full mt-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
            ${uploading
                            ? "bg-blue-600/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-900/20"
                        } text-white`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading {progress}%
                        </>
                    ) : (
                        "Post Video"
                    )}
                </button>
            )}
        </div>
    );
}
