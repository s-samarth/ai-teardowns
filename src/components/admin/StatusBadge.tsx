interface StatusBadgeProps {
    status: 'draft' | 'published';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const isLive = status === 'published';

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold tracking-wider uppercase ${isLive
                    ? 'bg-emerald/15 text-emerald border border-emerald/30'
                    : 'bg-text-secondary/15 text-text-muted border border-text-secondary/30'
                }`}
            style={{ fontFamily: 'var(--font-mono)' }}
        >
            {isLive ? 'Live' : 'Draft'}
        </span>
    );
}
