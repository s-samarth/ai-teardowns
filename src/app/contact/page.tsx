import DetailHeader from '@/components/public/DetailHeader';
import Footer from '@/components/public/Footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background-admin flex flex-col">
            <DetailHeader name="Contact" />
            <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full text-center mt-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/30">
                    <span className="material-symbols-outlined text-3xl">mail</span>
                </div>
                <h1 className="text-4xl font-black text-sand mb-4 tracking-tight">Contact Us</h1>
                <p className="text-lg text-text-secondary mb-12">
                    Have questions or want to collaborate on a deep dive? Reach out via email or explore my portfolio.
                </p>

                <div className="bg-background-card border border-border-medium rounded-xl p-8 shadow-2xl space-y-8 text-left max-w-md mx-auto">
                    <div>
                        <span className="text-sm font-bold text-text-muted mb-1 block uppercase tracking-wider">Name</span>
                        <p className="text-white text-lg font-medium">Samarth Saraswat</p>
                    </div>

                    <div>
                        <span className="text-sm font-bold text-text-muted mb-1 block uppercase tracking-wider">Email</span>
                        <a
                            href="mailto:samarth.iitg@gmail.com"
                            className="text-primary hover:text-primary-hover text-lg font-medium transition-colors break-all"
                        >
                            samarth.iitg@gmail.com
                        </a>
                    </div>

                    <div>
                        <span className="text-sm font-bold text-text-muted mb-1 block uppercase tracking-wider">Portfolio</span>
                        <a
                            href="https://s-samarth.lovable.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary-hover text-lg font-medium transition-colors"
                        >
                            s-samarth.lovable.app
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
