'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db, COLLECTION_NAME } from '@/lib/firebase/client';
import type { TeardownWithId } from '@/lib/types';
import HeroSection from '@/components/public/HeroSection';
import SearchBar from '@/components/public/SearchBar';
import TeardownGrid from '@/components/public/TeardownGrid';
import LoadMoreButton from '@/components/public/LoadMoreButton';
import Footer from '@/components/public/Footer';

const PAGE_SIZE = 12;

export default function LandingPage() {
  const [teardowns, setTeardowns] = useState<TeardownWithId[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTeardowns = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let q;
      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeardownWithId[];

      if (isLoadMore) {
        setTeardowns((prev) => [...prev, ...docs]);
      } else {
        setTeardowns(docs);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching teardowns:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTeardowns();
  }, []);

  // Client-side search filtering
  const filteredTeardowns = useMemo(() => {
    if (!searchQuery.trim()) return teardowns;
    const q = searchQuery.toLowerCase();
    return teardowns.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [teardowns, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background-admin">
      {/* Navigation */}
      <nav className="border-b border-border-dark">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">deployed_code</span>
          <span className="text-white text-base font-bold">
            AI Teardowns
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <SearchBar onSearch={setSearchQuery} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">progress_activity</span>
              <span className="text-text-secondary text-sm">Loading intelligence...</span>
            </div>
          </div>
        ) : (
          <>
            <TeardownGrid teardowns={filteredTeardowns} />
            {!searchQuery && (
              <LoadMoreButton
                onClick={() => fetchTeardowns(true)}
                loading={loadingMore}
                hasMore={hasMore}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
