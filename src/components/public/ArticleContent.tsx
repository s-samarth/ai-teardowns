import type { ContentLink } from '@/lib/types';

interface ArticleContentProps {
    contentLinks?: ContentLink[];
}

export default function ArticleContent({ contentLinks }: ArticleContentProps) {
    if (!contentLinks || contentLinks.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="border border-border-dark rounded-lg p-6 bg-neutral-dark/50">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">article</span>
                    <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                        Additional Resources
                    </h2>
                </div>

                <div className="space-y-3">
                    {contentLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">link</span>
                            <span className="text-sm">{link.name || link.url}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
