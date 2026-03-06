'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

export function useAuth(requireAuth = true) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (requireAuth && !firebaseUser) {
                router.push('/admin/login');
            }
        });

        return () => unsubscribe();
    }, [requireAuth, router]);

    return { user, loading };
}
