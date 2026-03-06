'use client';

import Link from 'next/link';
import { useState } from 'react';

interface DetailHeaderProps {
    name: string;
}

export default function DetailHeader({ name }: DetailHeaderProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-md border-b border-border-dark">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-primary text-sm hover:opacity-80 transition-opacity"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Back to Archive</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">deployed_code</span>
                    <span className="text-white text-sm font-medium">AI Teardowns</span>
                </div>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-sm text-white bg-neutral-dark border border-border-medium px-4 py-2 rounded-lg hover:border-text-muted transition-colors"
                >
                    <span className="material-symbols-outlined text-base">share</span>
                    {copied ? 'Copied!' : 'Share'}
                </button>
            </div>
        </header>
    );
}
