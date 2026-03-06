'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTION_NAME } from '@/lib/firebase/client';
import type { TeardownWithId } from '@/lib/types';
import DetailHeader from '@/components/public/DetailHeader';
import VideoPlayer from '@/components/public/VideoPlayer';
import PresentationViewer from '@/components/public/PresentationViewer';
import ArticleContent from '@/components/public/ArticleContent';
import FeedbackModule from '@/components/public/FeedbackModule';

function TeardownContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('id') || '';

    const [teardown, setTeardown] = useState<TeardownWithId | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        async function fetchTeardown() {
            try {
                // Try slug field first since the URL usually contains the slug
                const q = query(
                    collection(db, COLLECTION_NAME),
                    where('slug', '==', slug),
                    where('status', '==', 'published')
                );
                try {
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        const first = snapshot.docs[0];
                        setTeardown({ id: first.id, ...first.data() } as TeardownWithId);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.log("Slug query failed or returned empty:", e);
                }

                // If not found by slug, try direct document lookup by ID
                try {
                    const docRef = doc(db, COLLECTION_NAME, slug);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists() && docSnap.data().status === 'published') {
                        setTeardown({ id: docSnap.id, ...docSnap.data() } as TeardownWithId);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.log("ID lookup failed:", e);
                }

                // If both fail, it's truly not found
                setNotFound(true);
            } catch (error) {
                console.error('Error fetching teardown fallback:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }

        fetchTeardown();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
                    <span className="text-text-secondary text-sm">Loading teardown...</span>
                </div>
            </div>
        );
    }

    if (notFound || !teardown) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">search_off</span>
                    <h1 className="text-2xl font-bold text-white mb-2">Teardown Not Found</h1>
                    <p className="text-text-muted">This intelligence report doesn&apos;t exist or hasn&apos;t been published yet.</p>
                </div>
            </div>
        );
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
    };

    const handleShareX = () => {
        const text = `${teardown.name} — AI Teardown`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const handleShareLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-background-admin">
            <DetailHeader name={teardown.name} />

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Hero Title */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-sand mb-3 tracking-tight">
                        {teardown.name}
                    </h1>
                    <p className="text-text-muted text-lg leading-relaxed">
                        {teardown.description}
                    </p>
                </div>

                {/* Video Player */}
                {teardown.video_url && (
                    <VideoPlayer videoUrl={teardown.video_url} thumbnailUrl={teardown.thumbnail_url} />
                )}

                {/* Presentation Viewer */}
                {teardown.presentation_url && (
                    <PresentationViewer presentationUrl={teardown.presentation_url} />
                )}

                {/* Article Content */}
                <ArticleContent contentLinks={teardown.content_links} />

                {/* Feedback Module */}
                <FeedbackModule feedbackParameters={teardown.feedback_parameters} />

                {/* Share CTA */}
                <section className="border-t border-border-dark pt-10 pb-16 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Distribute the Intelligence</h3>
                    <p className="text-text-muted text-sm mb-6">Propagate this teardown through your professional network.</p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 bg-neutral-dark border border-border-medium px-5 py-2.5 rounded-lg text-sm text-white hover:border-text-muted transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">link</span>
                            Copy Link
                        </button>
                        <button
                            onClick={handleShareX}
                            className="flex items-center gap-2 bg-neutral-dark border border-border-medium px-5 py-2.5 rounded-lg text-sm text-white hover:border-text-muted transition-colors"
                        >
                            <span className="text-sm font-bold">𝕏</span>
                            Share to X
                        </button>
                        <button
                            onClick={handleShareLinkedIn}
                            className="flex items-center gap-2 bg-neutral-dark border border-border-medium px-5 py-2.5 rounded-lg text-sm text-white hover:border-text-muted transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">apartment</span>
                            Share to LinkedIn
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default function TeardownPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background-admin flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
            </div>
        }>
            <TeardownContent />
        </Suspense>
    );
}
