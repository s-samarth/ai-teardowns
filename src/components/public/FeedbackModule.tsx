import Markdown from 'react-markdown';

interface FeedbackModuleProps {
    feedbackParameters?: string;
}

export default function FeedbackModule({ feedbackParameters }: FeedbackModuleProps) {
    if (!feedbackParameters) return null;

    return (
        <section className="mb-12">
            <div className="border border-border-dark rounded-lg p-6 bg-neutral-dark/50">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">feedback</span>
                    <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                        Feedback Acknowledged
                    </h2>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-text-muted [&_li]:text-text-muted [&_strong]:text-white [&_em]:text-text-muted">
                    <Markdown>{feedbackParameters}</Markdown>
                </div>
            </div>
        </section>
    );
}
