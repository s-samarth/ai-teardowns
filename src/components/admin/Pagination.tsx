interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-text-secondary text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                Showing {start} to {end} of {totalItems} teardowns
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 border border-border-dark rounded text-text-muted text-sm hover:border-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    ‹
                </button>
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1.5 border rounded text-sm transition-colors ${page === currentPage
                                ? 'bg-primary border-primary text-white'
                                : 'border-border-dark text-text-muted hover:border-text-muted'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 border border-border-dark rounded text-text-muted text-sm hover:border-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
