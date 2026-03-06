'use client';

interface LoadMoreButtonProps {
    onClick: () => void;
    loading?: boolean;
    hasMore: boolean;
}

export default function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <div className="flex justify-center py-12">
            <button
                onClick={onClick}
                disabled={loading}
                className="border border-border-medium text-white text-xs font-semibold tracking-[0.15em] uppercase px-8 py-3.5 rounded-lg hover:border-text-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-mono)' }}
            >
                {loading ? 'Loading...' : 'Load More Teardowns'}
            </button>
        </div>
    );
}
