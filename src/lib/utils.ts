import { Timestamp } from 'firebase/firestore';

/**
 * Generate a URL-safe slug from a teardown name.
 * e.g. "Sora v1 Architecture" → "sora-v1-architecture"
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Format a Firestore Timestamp to MM.DD.YYYY
 */
export function formatDate(timestamp: Timestamp | { seconds: number; nanoseconds: number } | null | undefined): string {
    if (!timestamp) return '';

    let date: Date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        return '';
    }

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}.${dd}.${yyyy}`;
}

/**
 * Format a Firestore Timestamp to YYYY-MM-DD
 */
export function formatDateDash(timestamp: Timestamp | { seconds: number; nanoseconds: number } | null | undefined): string {
    if (!timestamp) return '';

    let date: Date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        return '';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert a YouTube watch URL to an embed URL.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;

    // Already an embed URL
    if (url.includes('youtube.com/embed/')) return url;

    // Standard watch URL
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // Short URL
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    return null;
}

/**
 * Merge class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Convert Google Drive sharing link to direct thumbnail URL
 */
export function getDriveImageEmbedUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            // Use Google Drive thumbnail API — works directly in <img> tags without CORS issues
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`;
        }
    }
    return url;
}

/**
 * Convert Google Drive sharing link to iframe preview URL
 */
export function getDriveIframeUrl(url: string): string {
    if (!url) return url;
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
        }
    }
    return url;
}
