import { Timestamp } from 'firebase/firestore';

export interface ContentLink {
  name: string;
  url: string;
}

export interface TeardownDocument {
  // ─── Required Fields ──────────────────────────────────────
  name: string;
  description: string;
  thumbnail_url: string;
  presentation_url: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // ─── Optional Fields ──────────────────────────────────────
  video_url?: string;
  content_links?: ContentLink[];
  feedback_parameters?: string;
  slug?: string;
}

export interface TeardownFormData {
  name: string;
  description: string;
  thumbnail_url: string;
  presentation_url: string;
  status: 'draft' | 'published';
  video_url: string;
  content_links: ContentLink[];
  feedback_parameters: string;
}

export interface TeardownWithId extends TeardownDocument {
  id: string;
}
