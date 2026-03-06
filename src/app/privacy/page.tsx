import DetailHeader from '@/components/public/DetailHeader';
import Footer from '@/components/public/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background-admin flex flex-col">
            <DetailHeader name="Privacy Policy" />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
                <h1 className="text-4xl font-bold text-sand mb-8">Privacy Policy</h1>
                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-white max-w-none">
                    <p className="mb-6">
                        At AI Teardowns, we take your privacy seriously. This Privacy Policy details the information we collect, how we use it, and how we protect it.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">1. Information We Collect</h2>
                    <p className="mb-6">
                        We currently only collect basic usage analytics to improve our content delivery. We do not require account registration to view public teardown reports. If you choose to contact us, we collect the information provided in your correspondence.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">2. Application Storage</h2>
                    <p className="mb-6">
                        We safely use Google Firebase to handle administrative login and state management. No user-side trackers, third-party advertising pixels, or invasive behavioral profiling tools are deployed on our public application.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">3. External Links</h2>
                    <p className="mb-6">
                        Our intelligence reports (Teardowns) often contain links to external sites or embedded Google Drive media. We are not responsible for the privacy practices or the content of these external websites.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">4. Updates</h2>
                    <p className="mb-6">
                        We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
                    </p>
                    <p className="text-sm text-text-muted mt-12 border-t border-border-dark pt-6">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
