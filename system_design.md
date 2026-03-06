# AI Teardowns — System Design Document

> **Version:** 1.3  
> **Classification:** Internal — Architecture Document  
> **Last Updated:** 2026-03-07

---

## 1. High-Level Architecture

AI Teardowns is a **Next.js 14+ (App Router)** application deployed on **Firebase Hosting**, powered entirely by the **Firebase** backend ecosystem. The architecture follows a clean separation between public read-only surfaces and authenticated admin write surfaces.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│                                                                      │
│  ┌─────────────────────────┐   ┌──────────────────────────────────┐  │
│  │    PUBLIC ROUTES         │   │       ADMIN ROUTES (Protected)   │  │
│  │ /                        │   │ /admin/login                     │  │
│  │ /teardowns?id=[slug]     │   │ /admin/dashboard                 │  │
│  │                          │   │ /admin/editor                    │  │
│  │  (Static Export)         │   │ /admin/editor?id=[id]            │  │
│  │  Firebase Client SDK     │   │                                  │  │
│  │  (read-only Firestore)   │   │  (Client Components)             │  │
│  │  (read-only Firestore)   │   │  (Client Components)             │  │
│  └────────────┬─────────────┘   │  Firebase Client SDK             │  │
│               │                  │  (Auth + Firestore + Storage)    │  │
│               │                  └──────────────┬───────────────────┘  │
└───────────────┼─────────────────────────────────┼────────────────────┘
                │                                  │
                ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       FIREBASE PLATFORM                              │
│                                                                      │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────────┐    │
│  │ Firebase Auth │  │ Cloud Firestore │  │ Firebase Cloud       │    │
│  │ (Email/Pass)  │  │ (NoSQL DB)      │  │ Storage              │    │
│  │               │  │                 │  │ /thumbnails          │    │
│  │ Admin-only    │  │ teardowns       │  │ /presentations       │    │
│  │ authentication│  │ collection      │  │                      │    │
│  └──────────────┘  └─────────────────┘  └──────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   Firebase Hosting (CDN)                      │    │
│  │         Serves Fully Static Export Directory (`out/`)         │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision                        | Rationale                                                                                    |
| :------------------------------ | :------------------------------------------------------------------------------------------- |
| **Next.js App Router**          | Utilized for powerful file-based routing and structure.                                       |
| **Static Export**               | `output: 'export'` applied. Runs 100% on the Firebase Hosting free tier without needing Cloud Functions. |
| **Client Components (Admin)**   | Admin pages require interactive state (Auth, file uploads, form management).                  |
| **Firebase Client SDK**         | Used directly in Client Components for Auth, Firestore reads/writes, and Storage uploads.     |
| **Query Parameter Routing**     | Because standard Static Export conflicts with dynamically generated routes at runtime, teardown details are handled via `/teardowns?id=slug`. |
| **No dedicated API layer**      | Removed server environment. The Firebase Client SDK serves entirely as the data and auth layer. |

---

## 2. Firebase Infrastructure

### 2.1 Authentication

| Property              | Value                                                    |
| :-------------------- | :------------------------------------------------------- |
| **Provider**          | Firebase Authentication — Email/Password                 |
| **Users**             | Single admin user (pre-provisioned in Firebase Console)   |
| **Protected Routes**  | `/admin/*`                                               |
| **Login Flow**        | `signInWithEmailAndPassword(auth, email, password)`      |
| **Session Strategy**  | Client-side persistence via `onAuthStateChanged`. Component-level hooks (`useAuth.ts`) verify active sessions on `/admin/*` routes and execute a redirect to `/admin/login` on failure. |
| **Password Recovery** | `sendPasswordResetEmail(auth, email)`                    |

**Implementation Notes:**
- A client-side React Hook (`useAuth.ts`) guards all requests to `/admin/*` (except `/admin/login`). It reads the `onAuthStateChanged` hook and redirects unauthenticated users to `/admin/login`.
- Server-side middleware and cookies have been removed. All authentication is strictly persisted by Firebase directly in the browser's IndexedDB.

### 2.2 Cloud Firestore — NoSQL Schema

#### Collections: `dev_teardowns` and `prod_teardowns`

To maintain a clean slate for production without requiring a paid multi-environment setup, the application dynamically targets collections based on `process.env.NODE_ENV`:
- **Development (`npm run dev`)**: Reads/writes to `dev_teardowns`.
- **Production (`npm run build`)**: Reads/writes to `prod_teardowns`.

Each document represents a single teardown report. The document ID serves as the resource identifier (used in URLs as the slug).

```typescript
// Firestore Document Schema: teardowns/{teardownId}
interface TeardownDocument {
  // ─── Required Fields ──────────────────────────────────────
  name: string;                    // Human-readable title
                                   // e.g., "Sora_v1_Architecture"

  description: string;             // Short summary, 2-3 sentences

  thumbnail_url: string;           // Cloud Storage download URL
                                   // e.g., "https://firebasestorage.googleapis.com/...thumbnails/..."

  presentation_url: string;        // Cloud Storage download URL
                                   // e.g., "https://firebasestorage.googleapis.com/...presentations/..."

  status: 'draft' | 'published';   // Publication state
                                   // Controls public visibility

  createdAt: Timestamp;            // Firestore server timestamp
                                   // Used for chronological sorting

  updatedAt: Timestamp;            // Firestore server timestamp
                                   // Updated on every save

  // ─── Optional Fields ──────────────────────────────
  video_url?: string;              // External video embed URL
                                   // e.g., "https://youtube.com/watch?v=xyz"

  content_links?: ContentLink[];   // Array of content reference links
                                   // Each entry: { name: string, url: string }

  feedback_parameters?: string;    // Markdown-formatted evaluation criteria
                                   // e.g., "- Architecture Clarity\n- Technical Depth"

  slug?: string;                   // URL-safe identifier (auto-generated from name)
}
```

**Indexing Requirements:**
- **Composite Index**: `status` (ASC) + `createdAt` (DESC) — used for the public landing page query (`status == 'published'`, ordered by newest).
- **Single-field Index**: `name` — used for admin dashboard search.

### 2.3 Cloud Storage — Bucket Structure

```
gs://<project-id>.appspot.com/
├── thumbnails/
│   ├── {teardownId}_{timestamp}.{ext}    # PNG or JPG
│   └── ...
└── presentations/
    ├── {teardownId}_{timestamp}.{ext}    # PDF, PPTX, or Keynote
    └── ...
```

**File Naming Convention:** `{teardownId}_{unix_timestamp}.{extension}` — ensures uniqueness and traceability.

**Upload Constraints:**
| Path              | Max Size | Accepted Types              |
| :---------------- | :------- | :-------------------------- |
| `/thumbnails`     | 5 MB     | `image/png`, `image/jpeg`   |
| `/presentations`  | 50 MB    | `application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/x-iwork-keynote-sffkey` |

---

## 3. Security & Rules

### 3.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Production Teardowns Collection ───────────────────────────────
    match /prod_teardowns/{teardownId} {

      // PUBLIC READ: Only published teardowns are accessible
      allow read: if resource.data.status == 'published';

      // ADMIN READ: Authenticated users can read all teardowns (including drafts)
      allow read: if request.auth != null;

      // ADMIN WRITE: Only authenticated users can create, update, or delete
      allow create: if request.auth != null
                    && request.resource.data.keys().hasAll(['name', 'description', 'status'])
                    && request.resource.data.status in ['draft', 'published'];

      allow update: if request.auth != null
                    && request.resource.data.status in ['draft', 'published'];

      allow delete: if request.auth != null;
    }

    // ─── Development Teardowns Collection ───────────────────────────────
    match /dev_teardowns/{teardownId} {

      // PUBLIC READ: Only published teardowns are accessible
      allow read: if resource.data.status == 'published';

      // ADMIN READ: Authenticated users can read all teardowns (including drafts)
      allow read: if request.auth != null;

      // ADMIN WRITE: Only authenticated users can create, update, or delete
      allow create: if request.auth != null
                    && request.resource.data.keys().hasAll(['name', 'description', 'status'])
                    && request.resource.data.status in ['draft', 'published'];

      allow update: if request.auth != null
                    && request.resource.data.status in ['draft', 'published'];

      allow delete: if request.auth != null;
    }

    // ─── Deny all other access ──────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> **Note:** The `create` rule no longer requires `createdAt` in `keys().hasAll()` since `serverTimestamp()` is set client-side and doesn't need to be validated at the rule level.

### 3.2 Cloud Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ─── Thumbnails ─────────────────────────────────────────
    match /thumbnails/{fileName} {
      allow read: if true;                         // Public read for thumbnail display
      allow write: if request.auth != null         // Admin-only upload
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    // ─── Presentations ──────────────────────────────────────
    match /presentations/{fileName} {
      allow read: if true;                         // Public read for presentation display
      allow write: if request.auth != null         // Admin-only upload
                   && request.resource.size < 50 * 1024 * 1024;
    }

    // ─── Deny all other access ──────────────────────────────
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Component Architecture

The Next.js application is organized into modular React components that map directly to the visual elements in the UI screens.

### 4.1 Component Tree

```
app/
├── layout.tsx                     # Root layout — dark mode wrapper, font imports
├── page.tsx                       # Public Landing Page (Server Component)
│   ├── <HeroSection />            # Headline + tagline
│   ├── <SearchBar />              # Dynamic search input
│   ├── <TeardownGrid />           # 3-column responsive grid
│   │   └── <TeardownCard />       # Individual card (thumbnail, title, desc, date)
│   └── <LoadMoreButton />         # Pagination trigger
│
├── teardowns/
│   └── page.tsx                   # Teardown Detail Page (Static Export compatible via ?id=)
│       ├── <DetailHeader />       # Back link, logo, Share button
│       ├── <VideoPlayer />        # Video embed with poster + controls
│       ├── <PresentationViewer /> # Slide/document viewer
│       ├── <ArticleContent />     # Rendered Markdown or Substack embed
│       └── <FeedbackModule />     # Parsed feedback parameters display
│
├── admin/
│   ├── login/
│   │   └── page.tsx               # Admin Login (Client Component)
│   │       └── <LoginForm />      # Email, password, authenticate button
│   │
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard (Client Component, Auth-guarded)
│   │       ├── <AdminSidebar />   # Sidebar navigation
│   │       ├── <MetricsGrid />    # 4 metric cards
│   │       │   └── <MetricCard /> # Individual metric (label, value, color)
│   │       ├── <TeardownTable />  # Data table with status, name, date, edit
│   │       │   └── <StatusBadge /># Live (emerald) / Draft (slate) badge
│   │       └── <Pagination />     # Page controls
│   │
│   └── editor/
│       └── page.tsx               # Content Editor (Client Component, Auth-guarded)
│           ├── <EditorHeader />   # Save Draft + Publish to Live
│           ├── <NameInput />      # Teardown name field
│           ├── <DescriptionInput /> # Description textarea
│           ├── <ThumbnailUpload /># Drag-drop image upload → Cloud Storage
│           │   └── <FirebaseImage /> # Preview component for uploaded image
│           ├── <PresentationUpload /> # Drag-drop file upload → Cloud Storage
│           ├── <VideoUrlInput />  # YouTube URL text input
│           ├── <ContentSourceToggle /> # Substack Link ↔ Markdown Editor
│           │   ├── <SubstackFields /> # Article Name + Substack URL inputs
│           │   └── <MarkdownEditor /> # Textarea for raw Markdown
│           └── <FeedbackEditor /> # Markdown-supported textarea
│
├── privacy/
│   └── page.tsx                   # Privacy Policy page
├── terms/
│   └── page.tsx                   # Terms of Service page
└── contact/
    └── page.tsx                   # Contact page
```

### 4.2 Key Component Specifications

#### `<TeardownCard />`
Renders a single teardown in the public grid. Accepts `name`, `description`, `thumbnail_url`, `createdAt`, and `slug`. Uses Next.js `<Image>` for optimized thumbnail loading. Entire card is a clickable `<Link>` to `/teardowns/{slug}`.

#### `<FirebaseImage />`
A reusable component that resolves and renders an image from a Firebase Cloud Storage download URL. Handles loading states and error fallbacks. Used in both `<TeardownCard />` (public) and `<ThumbnailUpload />` (admin preview).

#### `<VideoPlayer />`
Wraps an `<iframe>` or HTML5 `<video>` element. If `video_url` contains a YouTube URL, it converts it to an embed URL (`https://www.youtube.com/embed/{videoId}`). Displays a poster image, play button overlay, and progress bar matching the Screen 2 design.

#### `<FeedbackModule />`
Parses the `feedback_parameters` Markdown string (a list of `- Item` entries) and renders structured evaluation criteria. Uses a lightweight Markdown parser (e.g., `marked` or `react-markdown`) to convert the raw string into an ordered list of criteria items.

#### `<ContentSourceToggle />`
*(Replaced by Content Links)* The original Substack/Markdown toggle has been replaced with a dynamic Content Links system. Content is now managed as an array of `{name, url}` pairs that can be added, edited, or removed in the editor.

#### `<AdminSidebar />`
Fixed-width (256px) sidebar navigation for the admin panel. Links: Dashboard, Teardowns, Analytics, Settings. Highlights the active route. Displays user avatar and version at the bottom.

---

## 5. Data Flow Diagrams

### 5.1 Publishing a Teardown

```
Admin (Client Component)
  │
  ├─1─▶ Upload thumbnail → Firebase Storage /thumbnails/{id}_{ts}.jpg
  │     ◀── downloadURL (thumbnail_url)
  │
  ├─2─▶ Upload presentation → Firebase Storage /presentations/{id}_{ts}.pdf
  │     ◀── downloadURL (presentation_url)
  │
  ├─3─▶ Write document → Firestore /COLLECTION_NAME/{id}
         {
           name, description,
           thumbnail_url, presentation_url,
           status: 'published',
           video_url, content_source_type,
           article_name, substack_url, article_markdown,
           feedback_parameters,
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
         }
```

### 5.2 Public Teardown Listing Query

```typescript
// Server Component: app/page.tsx
const q = query(
  collection(db, COLLECTION_NAME),
  where('status', '==', 'published'),
  orderBy('createdAt', 'desc'),
  limit(pageSize)
);
const snapshot = await getDocs(q);
```

---

## 6. Technology Stack Reference

| Layer             | Technology                                     |
| :---------------- | :--------------------------------------------- |
| **Framework**     | Next.js 14+ (App Router)                       |
| **Language**      | TypeScript                                     |
| **Styling**       | Tailwind CSS                                   |
| **UI Framework**  | React 18+ (Server + Client Components)         |
| **Authentication**| Firebase Authentication (Email/Password)        |
| **Database**      | Cloud Firestore (NoSQL)                        |
| **File Storage**  | Firebase Cloud Storage                         |
| **Hosting**       | Firebase Hosting                               |
| **Fonts**         | Inter (display), JetBrains Mono / Roboto Mono  |
| **Icons**         | Material Symbols Outlined (Google Fonts)        |

---

*This document defines the technical architecture for the AI Teardowns platform. All implementation work must conform to the schemas, rules, and component structure specified herein.*
