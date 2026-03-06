'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, COLLECTION_NAME } from '@/lib/firebase/client';
import { useAuth } from '@/lib/useAuth';
import type { TeardownWithId, TeardownDocument } from '@/lib/types';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MetricsGrid from '@/components/admin/MetricsGrid';
import TeardownTable from '@/components/admin/TeardownTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 6;

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [teardowns, setTeardowns] = useState<TeardownWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);



    // Metrics
    const [total, setTotal] = useState(0);
    const [live, setLive] = useState(0);
    const [draft, setDraft] = useState(0);
    const [growth, setGrowth] = useState('+0%');

    useEffect(() => {
        async function fetchAll() {
            try {
                const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const allDocs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as TeardownWithId[];

                setTeardowns(allDocs);
                setTotal(allDocs.length);
                setLive(allDocs.filter((d) => d.status === 'published').length);
                setDraft(allDocs.filter((d) => d.status === 'draft').length);

                // Calculate monthly growth
                const now = new Date();
                const thisMonth = allDocs.filter((d) => {
                    if (!d.createdAt) return false;
                    const date = 'toDate' in d.createdAt ? d.createdAt.toDate() : new Date((d.createdAt as unknown as { seconds: number }).seconds * 1000);
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length;

                const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonth = allDocs.filter((d) => {
                    if (!d.createdAt) return false;
                    const date = 'toDate' in d.createdAt ? d.createdAt.toDate() : new Date((d.createdAt as unknown as { seconds: number }).seconds * 1000);
                    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
                }).length;

                if (lastMonth > 0) {
                    const pct = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
                    setGrowth(`+${pct}%`);
                } else if (thisMonth > 0) {
                    setGrowth('+100%');
                } else {
                    setGrowth('+0%');
                }
            } catch (error) {
                console.error('Error fetching teardowns:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            setTeardowns((prev) => {
                const updated = prev.filter((t) => t.id !== id);
                setTotal(updated.length);
                setLive(updated.filter((d) => d.status === 'published').length);
                setDraft(updated.filter((d) => d.status === 'draft').length);
                return updated;
            });
        } catch (error) {
            console.error('Error deleting teardown:', error);
            alert('Failed to delete teardown. Please try again.');
        }
    };

    const totalPages = Math.ceil(teardowns.length / PAGE_SIZE);
    const paginatedTeardowns = teardowns.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

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
            <AdminSidebar />

            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">Intelligence Command</h1>
                    <Link
                        href="/admin/editor"
                        className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                    >
                        <span className="text-lg">+</span>
                        New Teardown
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
                    </div>
                ) : (
                    <>
                        <MetricsGrid total={total} live={live} draft={draft} growth={growth} />
                        <TeardownTable teardowns={paginatedTeardowns} onDelete={handleDelete} />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={teardowns.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
