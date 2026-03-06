'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTION_NAME } from '@/lib/firebase/client';
import { useAuth } from '@/lib/useAuth';
import { generateSlug, getDriveImageEmbedUrl } from '@/lib/utils';
import type { TeardownFormData, TeardownDocument, ContentLink } from '@/lib/types';

import TeardownCard from '@/components/public/TeardownCard';
import VideoPlayer from '@/components/public/VideoPlayer';
import PresentationViewer from '@/components/public/PresentationViewer';
import ArticleContent from '@/components/public/ArticleContent';
import FeedbackModule from '@/components/public/FeedbackModule';

const INITIAL_FORM: TeardownFormData = {
    name: '',
    description: '',
    thumbnail_url: '',
    presentation_url: '',
    status: 'draft',
    video_url: '',
    content_links: [],
    feedback_parameters: '',
};

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const { user, loading: authLoading } = useAuth();

    const [form, setForm] = useState<TeardownFormData>(INITIAL_FORM);
    const [teardownId, setTeardownId] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');



    // Generate or use existing teardown ID
    useEffect(() => {
        if (editId) {
            setTeardownId(editId);
            const fetchDoc = async () => {
                try {
                    const docRef = doc(db, COLLECTION_NAME, editId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as TeardownDocument;
                        setForm({
                            name: data.name || '',
                            description: data.description || '',
                            thumbnail_url: data.thumbnail_url || '',
                            presentation_url: data.presentation_url || '',
                            status: data.status || 'draft',
                            video_url: data.video_url || '',
                            content_links: data.content_links || [],
                            feedback_parameters: data.feedback_parameters || '',
                        });
                    }
                } catch (err) {
                    console.error('Error fetching teardown:', err);
                }
            };
            fetchDoc();
        } else {
            setTeardownId(`td_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        }
    }, [editId]);

    const updateField = useCallback((field: keyof TeardownFormData, value: string | ContentLink[]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    // ─── Content Links Management ─────────────────────────────
    const addContentLink = () => {
        setForm((prev) => ({
            ...prev,
            content_links: [...prev.content_links, { name: '', url: '' }],
        }));
    };

    const updateContentLink = (index: number, field: 'name' | 'url', value: string) => {
        setForm((prev) => {
            const updated = [...prev.content_links];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, content_links: updated };
        });
    };

    const removeContentLink = (index: number) => {
        setForm((prev) => ({
            ...prev,
            content_links: prev.content_links.filter((_, i) => i !== index),
        }));
    };

    // ─── Save / Publish ───────────────────────────────────────
    const handleSave = async (status: 'draft' | 'published') => {
        if (!form.name.trim()) {
            setError('Teardown name is required');
            return;
        }
        if (!form.description.trim()) {
            setError('Description is required');
            return;
        }

        const isDraft = status === 'draft';
        isDraft ? setSaving(true) : setPublishing(true);
        setError('');

        try {
            const slug = generateSlug(form.name);
            const docData: Record<string, unknown> = {
                name: form.name,
                description: form.description,
                thumbnail_url: form.thumbnail_url || null,
                presentation_url: form.presentation_url || null,
                status,
                slug,
                video_url: form.video_url || null,
                content_links: form.content_links.filter((l) => l.name.trim() || l.url.trim()),
                feedback_parameters: form.feedback_parameters || null,
                updatedAt: serverTimestamp(),
            };

            if (!editId) {
                docData.createdAt = serverTimestamp();
            }

            await setDoc(doc(db, COLLECTION_NAME, teardownId), docData, { merge: true });
            router.push('/admin/dashboard');
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    };

    // Show loading while auth resolves
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background-admin flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-admin">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-admin/95 backdrop-blur-md border-b border-border-dark">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-xl">deployed_code</span>
                        <span className="text-white text-sm font-semibold">AI Teardowns</span>
                    </div>

                    <div className="flex bg-neutral-dark rounded-lg p-1 border border-border-dark hidden md:flex">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'edit' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saving || publishing}
                            className="border border-border-medium text-white text-sm font-medium px-5 py-2 rounded-lg hover:border-text-muted transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            disabled={saving || publishing}
                            className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {publishing ? 'Publishing...' : 'Publish to Live'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-black text-white mb-2">{editId ? 'Editing Teardown' : 'Drafting New Teardown'}</h1>
                <p className="text-text-muted text-sm mb-10">Create and configure your next architectural deep dive.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Mobile Preview Toggle (Visible only on small screens) */}
                <div className="flex bg-neutral-dark rounded-lg p-1 border border-border-dark md:hidden mb-6">
                    <button
                        onClick={() => setViewMode('edit')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'edit' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                    >
                        Preview
                    </button>
                </div>

                {viewMode === 'edit' ? (
                    <>
                        {/* ─── Required Fields ────────────────────────────────── */}

                        {/* Teardown Name */}
                        <label className="block mb-6">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                                Teardown Name
                            </span>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g. GPT-4o Tokenizer Architecture Analysis"
                                className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 px-4 text-white placeholder:text-text-secondary text-sm"
                            />
                        </label>

                        {/* Description */}
                        <label className="block mb-6">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                                Description
                            </span>
                            <textarea
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Briefly explain what this teardown covers..."
                                rows={4}
                                className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 px-4 text-white placeholder:text-text-secondary text-sm resize-y"
                            />
                        </label>

                        {/* Card Image URL */}
                        <label className="block mb-6">
                            <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                                    Card Image URL <span className="text-red-400">*</span>
                                </span>
                                <span className="text-xs text-text-secondary">
                                    (4:3 Ratio, recommended 1200x900px)
                                </span>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-lg">image</span>
                                <input
                                    type="url"
                                    value={form.thumbnail_url}
                                    onChange={(e) => updateField('thumbnail_url', e.target.value)}
                                    placeholder="https://example.com/thumbnail.jpg"
                                    className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 pl-11 pr-4 text-white placeholder:text-text-secondary text-sm"
                                />
                            </div>
                            {form.thumbnail_url && (
                                <div className="mt-3 border border-border-dark rounded-lg overflow-hidden">
                                    <img src={getDriveImageEmbedUrl(form.thumbnail_url)} alt="Card Image Preview" className="w-full max-h-48 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </label>

                        {/* Presentation URL */}
                        <label className="block mb-10">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                                Presentation URL
                            </span>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-lg">description</span>
                                <input
                                    type="url"
                                    value={form.presentation_url}
                                    onChange={(e) => updateField('presentation_url', e.target.value)}
                                    placeholder="https://example.com/presentation.pdf"
                                    className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 pl-11 pr-4 text-white placeholder:text-text-secondary text-sm"
                                />
                            </div>
                        </label>

                        {/* ─── Optional Components ────────────────────────────── */}
                        <div className="mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-muted text-lg">settings_suggest</span>
                            <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                                Optional Components
                            </h2>
                        </div>

                        {/* Video URL */}
                        <label className="block mb-6">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                                Video URL
                            </span>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-lg">link</span>
                                <input
                                    type="url"
                                    value={form.video_url}
                                    onChange={(e) => updateField('video_url', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 pl-11 pr-4 text-white placeholder:text-text-secondary text-sm"
                                />
                            </div>
                        </label>

                        {/* ─── Content Links ─────────────────────────────────── */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                                    Content Links
                                </span>
                                <button
                                    onClick={addContentLink}
                                    className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:text-primary-hover transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">add_circle</span>
                                    Add Link
                                </button>
                            </div>

                            {form.content_links.length === 0 && (
                                <div className="border border-dashed border-border-dark rounded-lg py-8 text-center">
                                    <span className="material-symbols-outlined text-2xl text-text-secondary mb-2 block">link</span>
                                    <p className="text-text-secondary text-sm">No content links added yet.</p>
                                    <button
                                        onClick={addContentLink}
                                        className="text-primary text-sm mt-2 hover:text-primary-hover transition-colors"
                                    >
                                        + Add your first link
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {form.content_links.map((link, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={link.name}
                                                onChange={(e) => updateContentLink(index, 'name', e.target.value)}
                                                placeholder="Content Name"
                                                className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3 px-4 text-white placeholder:text-text-secondary text-sm"
                                            />
                                            <input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) => updateContentLink(index, 'url', e.target.value)}
                                                placeholder="Content URL"
                                                className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3 px-4 text-white placeholder:text-text-secondary text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeContentLink(index)}
                                            className="mt-2.5 text-text-secondary hover:text-red-400 transition-colors shrink-0"
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Parameters */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                                    Feedback Parameters
                                </span>
                                <span className="text-text-secondary text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                                    Markdown Supported
                                </span>
                            </div>
                            <p className="text-text-secondary text-xs mb-2">Define metrics using Markdown list (one per line)</p>
                            <textarea
                                value={form.feedback_parameters}
                                onChange={(e) => updateField('feedback_parameters', e.target.value)}
                                placeholder={`- Architecture Clarity\n- Technical Depth\n- Implementation Feasibility`}
                                rows={5}
                                className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 px-4 text-white placeholder:text-text-secondary text-sm resize-y"
                                style={{ fontFamily: 'var(--font-mono)' }}
                            />
                        </div>
                    </>
                ) : (
                    /* ─── Preview Mode ────────────────────────────────── */
                    <div className="space-y-16 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-border-dark pb-3">Homepage Card Preview</h2>
                            <div className="max-w-sm">
                                <TeardownCard teardown={{
                                    id: 'preview',
                                    slug: 'preview',
                                    name: form.name || 'Untitled Teardown',
                                    description: form.description || 'Description will appear here.',
                                    thumbnail_url: form.thumbnail_url,
                                    presentation_url: form.presentation_url,
                                    video_url: form.video_url,
                                    content_links: form.content_links,
                                    feedback_parameters: form.feedback_parameters,
                                    status: form.status,
                                    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
                                } as any} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-border-dark pb-3">Teardown Page Preview</h2>
                            <div className="border border-border-dark rounded-lg p-8 bg-background-card isolate">
                                <div className="mb-10">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight">
                                        {form.name || 'Untitled Teardown'}
                                    </h1>
                                    <p className="text-text-muted text-lg leading-relaxed">
                                        {form.description || 'Description will appear here.'}
                                    </p>
                                </div>

                                {form.video_url && (
                                    <VideoPlayer videoUrl={form.video_url} thumbnailUrl={form.thumbnail_url} />
                                )}

                                {form.presentation_url && (
                                    <PresentationViewer presentationUrl={form.presentation_url} />
                                )}

                                <ArticleContent contentLinks={form.content_links} />
                                <FeedbackModule feedbackParameters={form.feedback_parameters} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t border-border-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-text-secondary text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">cloud_done</span>
                            Autosaved at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="cursor-pointer hover:text-text-muted">Editor Guide</span>
                        <span className="cursor-pointer hover:text-text-muted">Asset Requirements</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background-admin flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
