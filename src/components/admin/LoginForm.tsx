'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Firebase Auth persists state in browser automatically
            router.push('/admin/dashboard');
        } catch (err: any) {
            let message = 'Authentication failed. Please try again.';

            if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
                message = 'Wrong Email Address or Wrong Password';
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            {/* Back to Home Link */}
            <div className="mb-6 flex justify-center">
                <Link
                    href="/"
                    className="group flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                        arrow_back
                    </span>
                    Back to Homepage
                </Link>
            </div>

            <div className="bg-background-card border border-border-medium rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/30">
                        <span className="material-symbols-outlined text-2xl">deployed_code</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1.5">Welcome Back</h1>
                    <p className="text-text-secondary text-sm">Sign in to AI Teardowns Admin</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Email */}
                <label className="block mb-5">
                    <span className="text-sm font-medium text-text-muted mb-1.5 block">
                        Email Address
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@aiteardowns.ai"
                        required
                        className="w-full bg-neutral-dark border border-border-medium rounded-lg py-3 px-4 text-white placeholder:text-text-secondary text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </label>

                {/* Password */}
                <label className="block mb-8">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-text-muted">
                            Password
                        </span>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-neutral-dark border border-border-medium rounded-lg py-3 px-4 text-white placeholder:text-text-secondary text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-medium text-sm py-3 rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
        </form>
    );
}
