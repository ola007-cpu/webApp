import UploadArea from "@/components/UploadArea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UploadPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <header className="p-4 border-b border-gray-800 flex items-center">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="ml-4 text-xl font-bold">New Post</h1>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black p-1 rounded-3xl">
                    <UploadArea />
                </div>
            </div>
        </main>
    );
}
