import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-border-dark mt-20">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo + Copyright */}
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">deployed_code</span>
                    <span className="text-white text-sm font-semibold tracking-wide uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                        AI Teardowns
                    </span>
                </div>
                <p className="text-text-secondary text-xs tracking-wide uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                    © {new Date().getFullYear()} Proprietary Intelligence Report
                </p>

                {/* Links */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/privacy"
                        className="text-text-secondary text-xs tracking-wide uppercase hover:text-text-muted transition-colors"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-text-secondary text-xs tracking-wide uppercase hover:text-text-muted transition-colors"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        Terms
                    </Link>
                    <Link
                        href="/contact"
                        className="text-text-secondary text-xs tracking-wide uppercase hover:text-text-muted transition-colors"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        Contact
                    </Link>
                    <Link
                        href="/admin/login"
                        className="text-text-secondary text-xs tracking-wide uppercase border border-border-dark px-4 py-1.5 rounded hover:border-text-muted hover:text-text-muted transition-colors"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        Admin Login
                    </Link>
                </div>
            </div>
        </footer>
    );
}
