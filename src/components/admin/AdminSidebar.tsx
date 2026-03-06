'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

const navItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
    { label: 'Teardowns', icon: 'list_alt', href: '/admin/dashboard' },
    { label: 'Analytics', icon: 'monitoring', href: '/admin/dashboard' },
    { label: 'Settings', icon: 'settings', href: '/admin/dashboard' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background-admin border-r border-border-dark flex flex-col z-40">
            {/* Logo */}
            <div className="px-5 py-5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">insights</span>
                </div>
                <span className="text-white text-sm font-semibold">AI Teardowns</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href && item.label === 'Dashboard';
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${isActive
                                ? 'text-primary bg-primary/10'
                                : 'text-text-muted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Version */}
            <div className="px-5 py-4 border-t border-border-dark">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-dark rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-text-muted text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">Admin Panel</p>
                        <p className="text-text-secondary text-xs" style={{ fontFamily: 'var(--font-mono)' }}>v2.4.0-stable</p>
                    </div>
                    <button onClick={handleLogout} className="text-text-secondary hover:text-red-400 transition-colors" title="Logout">
                        <span className="material-symbols-outlined text-lg">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
