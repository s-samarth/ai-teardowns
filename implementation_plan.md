# AI Teardowns — Implementation Plan

> **Version:** 1.1  
> **Classification:** Internal — Execution Playbook  
> **Last Updated:** 2026-03-07

---

## Phase 1: Environment & Firebase Setup

**Objective:** Initialize the Next.js repository, configure the design system, create the Firebase project, and wire all credentials.

### 1.1 Initialize Next.js Project

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 1.2 Install Dependencies

```bash
# Firebase SDKs
npm install firebase firebase-admin

# Markdown rendering (for feedback parameters & article content)
npm install react-markdown

# Utility
npm install clsx
```

### 1.3 Configure Tailwind Design System

Update `tailwind.config.ts` to mirror the screen designs:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#135bec',
        'background-light': '#f6f6f8',
        'background-dark': '#050505',
        'background-admin': '#101622',
        'neutral-dark': '#1c1f27',
        'border-dark': '#333333',
        'text-muted': '#A1A1AA',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
```

**Dark Mode**: Apply `class="dark"` on the root `<html>` element. All pages default to dark mode (`bg-background-admin` / `#101622`).

### 1.4 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project: **ai-teardowns**.
3. Enable **Authentication** → **Email/Password** provider.
4. Create a single admin user in the Authentication console (e.g., `admin@aiteardowns.ai`).
5. Create a **Cloud Firestore** database in production mode.
6. Create a **Cloud Storage** bucket (default bucket).

### 1.5 Configure Environment Variables

Create `.env.local` at the project root:

```env
# ─── Firebase Client SDK (Public) ────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ─── Firebase Admin SDK (Server-only, NEVER expose) ─────────
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 1.6 Initialize Firebase SDK Modules

Create the following utility files to initialize Firebase:

- `src/lib/firebase/client.ts` — Initializes the **Firebase Client SDK** (Auth, Firestore, Storage).
- `src/lib/firebase/admin.ts` — Initializes the **Firebase Admin SDK** (for server-side token verification).

### 1.7 Set Up Project Directory Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing Page
│   ├── teardowns/
│   │   └── [slug]/
│   │       └── page.tsx            # Detail Page
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── editor/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           ├── login/route.ts
│           └── logout/route.ts
├── components/
│   ├── public/
│   │   ├── HeroSection.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TeardownGrid.tsx
│   │   ├── TeardownCard.tsx
│   │   ├── LoadMoreButton.tsx
│   │   ├── DetailHeader.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── PresentationViewer.tsx
│   │   ├── ArticleContent.tsx
│   │   ├── FeedbackModule.tsx
│   │   └── Footer.tsx
│   └── admin/
│       ├── LoginForm.tsx
│       ├── AdminSidebar.tsx
│       ├── MetricsGrid.tsx
│       ├── MetricCard.tsx
│       ├── TeardownTable.tsx
│       ├── StatusBadge.tsx
│       ├── Pagination.tsx
│       ├── EditorHeader.tsx
│       ├── ThumbnailUpload.tsx
│       ├── PresentationUpload.tsx
│       ├── VideoUrlInput.tsx
│       ├── ContentSourceToggle.tsx
│       ├── SubstackFields.tsx
│       ├── MarkdownEditor.tsx
│       └── FeedbackEditor.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   └── admin.ts
│   ├── types.ts                    # TeardownDocument interface
│   └── utils.ts                    # Slug generation, date formatting
└── middleware.ts                    # Auth guard for /admin/*
```

---

## Phase 2: Public UI & Read Operations

**Objective:** Build the viewer-facing pages. All public data fetching happens server-side via the Firebase Admin SDK or Client SDK in Server Components.

### 2.1 Root Layout (`app/layout.tsx`)

- Set `<html lang="en" className="dark">`.
- Import Inter and JetBrains Mono via `next/font/google`.
- Apply `bg-background-dark text-slate-100 font-display min-h-screen` to `<body>`.

### 2.2 Landing Page (`app/page.tsx`) — Server Component

1. **Query Firestore** for all teardowns where `status == 'published'`, ordered by `createdAt DESC`, with a `limit(12)`.
2. Render `<HeroSection />` — heading "AI Teardowns" + tagline.
3. Render `<SearchBar />` — client-side filtering (interactive, uses `'use client'`).
4. Render `<TeardownGrid />` passing the fetched teardowns as props.
5. Each `<TeardownCard />` displays: `thumbnail_url` as background image, `name` in mono uppercase, `description` clamped to 3 lines, `createdAt` formatted as `MM.DD.YYYY`.
6. Render `<LoadMoreButton />` — triggers a client-side fetch for the next page of results.
7. Render `<Footer />` — includes the discreet `ADMIN LOGIN` link pointing to `/admin/login`.

### 2.3 Teardown Detail Page (`app/teardowns/[slug]/page.tsx`) — Server Component

1. **Fetch single document** from Firestore by slug/ID where `status == 'published'`.
2. Render `<DetailHeader />` — "Back to Archive" link, logo, Share button.
3. Render `<VideoPlayer />` — if `video_url` exists, embed the video. Convert YouTube watch URLs to embed URLs.
4. Render `<PresentationViewer />` — display the presentation asset from `presentation_url`.
5. Render `<ArticleContent />`:
   - If `content_source_type === 'substack'`: render a styled link to `substack_url` with `article_name` as label.
   - If `content_source_type === 'markdown'`: render `article_markdown` using `react-markdown`.
6. Render `<FeedbackModule />` — parse `feedback_parameters` Markdown and render as a list.

---

## Phase 3: Auth & Admin UI

**Objective:** Implement Firebase Authentication for admin routes and build the Intelligence Command dashboard.

### 3.1 Auth Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;

  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Server-side token verification happens in the page/layout
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 3.2 Login Route Handler (`app/api/auth/login/route.ts`)

- Accepts `POST` with `{ idToken }` in the body.
- Uses Firebase Admin SDK to verify the token: `admin.auth().verifyIdToken(idToken)`.
- Sets an HTTP-only session cookie: `__session`.
- Returns `200 OK` on success.

### 3.3 Logout Route Handler (`app/api/auth/logout/route.ts`)

- Accepts `POST`.
- Clears the `__session` cookie.
- Returns `200 OK`.

### 3.4 Admin Login Page (`app/admin/login/page.tsx`) — Client Component

- Renders `<LoginForm />` matching Screen 3 design: dark background, brutalist borders, email field, password field, "Authenticate" button.
- On submit: calls `signInWithEmailAndPassword(auth, email, password)` → gets `idToken` → `POST /api/auth/login` → redirect to `/admin/dashboard`.

### 3.5 Admin Dashboard (`app/admin/dashboard/page.tsx`) — Client Component

1. **Layout**: `<AdminSidebar />` (fixed 256px) + main content area.
2. **Header**: "Intelligence Command" title + "**+ New Teardown**" button (links to `/admin/editor`).
3. **Metrics Grid** (`<MetricsGrid />`):
   - Query Firestore: total count, count where `status == 'published'`, count where `status == 'draft'`.
   - Monthly Growth: computed from `createdAt` timestamps in the current vs. previous month.
   - Render 4 `<MetricCard />` components with appropriate colors (primary, emerald, amber, white).
4. **Teardown Table** (`<TeardownTable />`):
   - Query all teardowns ordered by `createdAt DESC`.
   - Columns: Status (`<StatusBadge />`), Name (title + subtitle), Date Uploaded (formatted date), Action (Edit link → `/admin/editor?id={teardownId}`).
5. **Pagination** (`<Pagination />`):
   - "Showing X to Y of Z teardowns" with page buttons.
   - Uses Firestore cursor-based pagination (`startAfter`).

---

## Phase 4: The Ingestion Engine & Storage

**Objective:** Build the Content Ingestion Editor — the most complex page. Handle file uploads to Cloud Storage, URL management, and Firestore document writes.

### 4.1 Content Editor Page (`app/admin/editor/page.tsx`) — Client Component

**State Management**: Use React `useState` / `useReducer` to manage the entire form state matching the `TeardownDocument` interface.

### 4.2 Thumbnail Upload (`<ThumbnailUpload />`)

1. Drag-and-drop zone matching Screen 5 design.
2. On file drop:
   - Validate: `image/png` or `image/jpeg`, max 5MB.
   - Generate filename: `{teardownId}_{Date.now()}.{ext}`.
   - Upload via `uploadBytesResumable(storageRef, file)` to `/thumbnails/{filename}`.
   - On completion: `getDownloadURL(storageRef)` → store in form state as `thumbnail_url`.
   - Display preview using `<FirebaseImage />`.

### 4.3 Presentation Upload (`<PresentationUpload />`)

1. Drag-and-drop zone matching Screen 5 design.
2. On file drop:
   - Validate: PDF/PPTX/Keynote, max 50MB.
   - Generate filename: `{teardownId}_{Date.now()}.{ext}`.
   - Upload via `uploadBytesResumable(storageRef, file)` to `/presentations/{filename}`.
   - On completion: `getDownloadURL(storageRef)` → store in form state as `presentation_url`.
   - Show upload progress bar during transfer.

### 4.4 Video URL Input (`<VideoUrlInput />`)

- Simple text input with `link` icon prefix.
- No file upload; stores the raw URL string as `video_url`.

### 4.5 Content Links

- Dynamic list of content name+URL pairs.
- Users can add, edit, or remove multiple content links.
- Stored as `content_links: ContentLink[]` where `ContentLink = { name: string, url: string }`.
- Empty links are filtered out on save.

### 4.6 Feedback Parameters (`<FeedbackEditor />`)

- Textarea with Markdown support indicator.
- Placeholder: `- Architecture Clarity / - Technical Depth / - Implementation Feasibility`.
- Stored as raw Markdown string in `feedback_parameters`.

### 4.7 Save & Publish Actions (`<EditorHeader />`)

- **Save Draft**: Writes/updates the Firestore document with `status: 'draft'`.
- **Publish to Live**: Writes/updates the Firestore document with `status: 'published'`.
- Both actions:
  1. Validate required fields (`name`, `description`, `thumbnail_url`, `presentation_url`).
  2. Call `setDoc(doc(db, 'teardowns', teardownId), documentData, { merge: true })`.
  3. Set `createdAt: serverTimestamp()` on create, `updatedAt: serverTimestamp()` on every save.
  4. Redirect to `/admin/dashboard` on success.

### 4.8 Edit Existing Teardown

- If URL contains `?id={teardownId}`, fetch the existing document from Firestore and pre-populate all form fields.
- Upload components show existing file previews.

---

## Phase 5: Testing & Deployment

**Objective:** Validate security, verify production build, and deploy to Firebase Hosting.

### 5.1 Test Firestore Security Rules Locally

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize emulators
firebase init emulators
# Enable: Authentication, Firestore, Storage

# Start emulators
firebase emulators:start

# Run security rules tests
npm run test:rules
```

Write unit tests for security rules:
- ✅ Unauthenticated user can read a teardown with `status == 'published'`.
- ❌ Unauthenticated user cannot read a teardown with `status == 'draft'`.
- ❌ Unauthenticated user cannot write to `teardowns`.
- ✅ Authenticated user can read any teardown (draft or published).
- ✅ Authenticated user can create a teardown with required fields.
- ✅ Authenticated user can update a teardown.
- ❌ Unauthenticated user cannot upload to Storage.
- ✅ Authenticated user can upload valid files to Storage.
- ❌ Authenticated user cannot upload files exceeding size limits.

### 5.2 Verify Production Build

```bash
# Build the Next.js application
npm run build

# Preview the production build locally
npm run start
```

**Checklist:**
- [ ] Landing page loads and displays published teardowns.
- [ ] Search bar filters cards dynamically.
- [ ] Teardown detail page renders video, presentation, and article content.
- [ ] Share button copies the URL.
- [ ] Admin login authenticates and redirects.
- [ ] Dashboard displays correct metrics and table data.
- [ ] Content editor creates new teardowns with uploads.
- [ ] Save Draft and Publish to Live work correctly.
- [ ] Published teardowns appear on the public landing page.
- [ ] Draft teardowns do NOT appear on the public landing page.

### 5.3 Deploy to Firebase Hosting

```bash
# Login to Firebase CLI
firebase login

# Initialize Firebase Hosting for a Next.js project
firebase init hosting
# Select "Use an existing project" → ai-teardowns
# Public directory: out (or configure for SSR with Cloud Functions / Cloud Run)
# Single-page app: No (Next.js handles routing)

# For SSR deployment with Firebase:
firebase init hosting
firebase experiments:enable webframeworks
firebase init hosting  # Select Next.js framework

# Build the application
npm run build

# Deploy
firebase deploy
```

**Post-Deployment Verification:**
- [ ] Access the live URL from Firebase Hosting.
- [ ] Verify all pages load correctly.
- [ ] Test admin login on production.
- [ ] Upload a test teardown and verify it appears publicly.
- [ ] Verify Storage security rules block unauthorized uploads.

---

## Phase Summary

| Phase | Description                                   | Key Deliverables                                          |
| :---- | :-------------------------------------------- | :-------------------------------------------------------- |
| 1     | Environment & Firebase Setup                  | Initialized Next.js + Tailwind + Firebase project         |
| 2     | Public UI & Read Operations                   | Landing page, Detail page, server-side data fetching      |
| 3     | Auth & Admin UI                               | Login, session management, Dashboard with metrics & table |
| 4     | The Ingestion Engine & Storage                | Content editor, file uploads, Firestore writes            |
| 5     | Testing & Deployment                          | Security rules tested, production build verified, deployed|

---

*This implementation plan is the step-by-step execution playbook for building AI Teardowns. Each phase should be completed and verified before proceeding to the next.*

---

## Phase 6: Security Hardening (Post-Build)

### 6.1 SSRF-Harden Image Proxy

- Add hostname allowlist to `/api/image-proxy/route.ts`.
- Only allow Google domains (`drive.google.com`, `*.googleusercontent.com`, `firebasestorage.googleapis.com`).
- Reject all other hostnames with `403 Forbidden`.

### 6.2 Validate `.gitignore`

- Confirm `.env.local` is excluded from version control.
- Verify no `.key` or `.pem` files exist in the repository.
- Run `git log` to confirm no secrets were committed.

### 6.3 Review Session Security

- Confirm session cookies use `httpOnly`, `secure` (production), and `SameSite=Strict`.
- Confirm middleware redirects unauthenticated users from `/admin/*` routes.
