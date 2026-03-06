import { getDriveIframeUrl } from '@/lib/utils';

interface PresentationViewerProps {
    presentationUrl: string;
}

export default function PresentationViewer({ presentationUrl }: PresentationViewerProps) {
    if (!presentationUrl) return null;

    // Check if URL is a PDF or Google Drive link — render in iframe
    const isIframe = presentationUrl.toLowerCase().includes('.pdf') || presentationUrl.includes('drive.google.com');
    const iframeUrl = isIframe ? getDriveIframeUrl(presentationUrl) : presentationUrl;

    return (
        <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Detailed Teardown</h2>
            <div className="border border-border-dark rounded-lg overflow-hidden bg-neutral-dark">
                {isIframe ? (
                    <iframe
                        src={iframeUrl}
                        title="Presentation"
                        className="w-full h-[600px] bg-white"
                        allow="autoplay"
                    />
                ) : (
                    <div className="relative aspect-video">
                        <img
                            src={presentationUrl}
                            alt="Teardown Presentation"
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
