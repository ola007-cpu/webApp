export interface Video {
    id: string;
    type: string;
    videoUrl: string;
    thumbnailUrl: string;
    caption: string;
    likes: number;
    userId?: string;
    createdAt: string;
}
