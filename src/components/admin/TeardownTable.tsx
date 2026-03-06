import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { formatDateDash } from '@/lib/utils';
import type { TeardownWithId } from '@/lib/types';

interface TeardownTableProps {
    teardowns: TeardownWithId[];
    onDelete?: (id: string) => void;
}

export default function TeardownTable({ teardowns, onDelete }: TeardownTableProps) {
    return (
        <div className="border border-border-dark rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[120px_1fr_180px_80px] gap-4 px-6 py-3 border-b border-border-dark">
                <span className="text-text-secondary text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Status</span>
                <span className="text-text-secondary text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Name</span>
                <span className="text-text-secondary text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Date Uploaded</span>
                <span className="text-text-secondary text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>Action</span>
            </div>

            {/* Rows */}
            {teardowns.length === 0 && (
                <div className="px-6 py-8 text-center text-text-muted text-sm">
                    No teardowns yet. Create your first one.
                </div>
            )}

            {teardowns.map((teardown) => (
                <div
                    key={teardown.id}
                    className="grid grid-cols-[120px_1fr_180px_80px] gap-4 px-6 py-4 border-b border-border-dark last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
                >
                    <div>
                        <StatusBadge status={teardown.status} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{teardown.name}</p>
                        <p className="text-text-secondary text-xs truncate mt-0.5">{teardown.description}</p>
                    </div>
                    <div>
                        <span className="text-text-muted text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                            {formatDateDash(teardown.createdAt)}
                        </span>
                    </div>
                    <div>
                        <Link
                            href={`/admin/editor?id=${teardown.id}`}
                            className="text-primary text-sm hover:text-primary-hover transition-colors"
                        >
                            Edit
                        </Link>
                        {onDelete && (
                            <>
                                <span className="text-border-medium mx-3">|</span>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to permanently delete this teardown?')) {
                                            onDelete(teardown.id);
                                        }
                                    }}
                                    className="text-text-secondary text-sm hover:text-red-400 transition-colors"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
