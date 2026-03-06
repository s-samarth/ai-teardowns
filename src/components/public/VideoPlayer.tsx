'use client';

import { getYouTubeEmbedUrl, getDriveImageEmbedUrl } from '@/lib/utils';

interface VideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
}

export default function VideoPlayer({ videoUrl, thumbnailUrl }: VideoPlayerProps) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    const resolvedThumbnail = getDriveImageEmbedUrl(thumbnailUrl || '');

    if (!embedUrl && !videoUrl) return null;

    return (
        <section className="mb-12">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-dark border border-border-dark">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        title="Teardown Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                ) : (
                    <video
                        src={videoUrl}
                        controls
                        poster={resolvedThumbnail}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
            </div>
        </section>
    );
}
