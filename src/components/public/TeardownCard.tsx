'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDate, getDriveImageEmbedUrl } from '@/lib/utils';
import type { TeardownWithId } from '@/lib/types';

interface TeardownCardProps {
    teardown: TeardownWithId;
}

export default function TeardownCard({ teardown }: TeardownCardProps) {
    const slug = teardown.slug || teardown.id;
    const [imgError, setImgError] = useState(false);
    const resolvedThumbnailUrl = getDriveImageEmbedUrl(teardown.thumbnail_url);

    return (
        <Link
            href={`/teardowns?id=${slug}`}
            className="group block border border-border-dark rounded-lg overflow-hidden bg-background-card hover:border-border-medium transition-all duration-300 hover:translate-y-[-2px]"
        >
            {/* Thumbnail */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-dark">
                {resolvedThumbnailUrl && !imgError ? (
                    <img
                        src={resolvedThumbnailUrl}
                        alt={teardown.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-text-secondary">image</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-sand text-sm font-semibold mb-2">
                    {teardown.name}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed line-clamp-3 mb-4">
                    {teardown.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-xs font-medium">
                        {formatDate(teardown.createdAt)}
                    </span>
                    <span className="material-symbols-outlined text-text-secondary text-base group-hover:text-primary transition-colors">
                        arrow_forward
                    </span>
                </div>
            </div>
        </Link>
    );
}
