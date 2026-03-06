import DetailHeader from '@/components/public/DetailHeader';
import Footer from '@/components/public/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background-admin flex flex-col">
            <DetailHeader name="Terms of Service" />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
                <h1 className="text-4xl font-bold text-sand mb-8">Terms of Service</h1>
                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-white max-w-none">
                    <p className="mb-6">
                        Welcome to AI Teardowns. By accessing our platform and utilizing our technical due diligence reports, you consent to these terms.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">1. Use of Content</h2>
                    <p className="mb-6">
                        All teardown reports, architectures, and intellectual analysis provided on this site are for informational and educational purposes only. They do not constitute formal technical advice or investment guidance.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">2. Intellectual Property</h2>
                    <p className="mb-6">
                        The structured analysis and content authored by AI Teardowns remains our exclusive intellectual property. However, we acknowledge and respect that the products being torn down remain the trademarks and copyright of their respective owners. We operate under fair use for educational reporting.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">3. Unwarranted Reliability</h2>
                    <p className="mb-6">
                        While we strive for precision and accuracy in decoding latent interfaces and transformer architectures, AI applications evolve rapidly. We cannot guarantee that our teardowns reflect the absolute, up-to-the-minute operational reality of any product analyzed.
                    </p>
                    <p className="text-sm text-text-muted mt-12 border-t border-border-dark pt-6">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
