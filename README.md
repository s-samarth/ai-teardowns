# AI Teardowns

> **Technical & UX Due Diligence as a Service**

AI Teardowns is a boutique intelligence platform that delivers structured, deep-dive analyses of AI-native products, architectures, and interface patterns. Built for VCs, PEs, founders, and elite operators who need institutional-grade research to inform investment theses, competitive strategy, and product decisions.

Each teardown is a multi-format intelligence artifact: a curated combination of video analysis, presentation slides, content reference links, and structured feedback parameters.

---

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Library**: [React 18+](https://react.dev/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **File Storage**: [Firebase Cloud Storage](https://firebase.google.com/docs/storage)
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting) (Static Export)
- **Fonts**: Inter, JetBrains Mono, Roboto Mono (Google Fonts)
- **Icons**: [Material Symbols Outlined](https://fonts.google.com/icons) (Google Fonts)

---

## Local Setup Guide

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A **Firebase project** with Authentication, Firestore, and Cloud Storage enabled

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ai-teardowns.git
cd ai-teardowns
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase Credentials

Create a `.env.local` file in the project root:

```env
# ─── Firebase Client SDK (Public, exposed to browser) ───────
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

> **Where to find these values:**
> - **Client SDK**: Firebase Console → Project Settings → General → Your Apps → Web App → Config.
> - **Admin SDK**: Firebase Console → Project Settings → Service Accounts → Generate New Private Key (download JSON, extract the fields above).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Public pages**: `http://localhost:3000/` (Landing), `http://localhost:3000/teardowns?id={slug}` (Detail), `/privacy`, `/terms`, `/contact`
- **Admin pages**: `http://localhost:3000/admin/login` → `http://localhost:3000/admin/dashboard` → `http://localhost:3000/admin/editor`

> **Note on Database Segregation:** Local development (`npm run dev`) automatically writes to a `dev_teardowns` Firestore collection. This ensures your local testing data never leaks into the production `prod_teardowns` collection.

---

## Firebase Deployment

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Hosting

```bash
firebase experiments:enable webframeworks
firebase init hosting
```

- Select **Use an existing project** → choose your ai-teardowns project.
- When prompted for framework, select **Next.js**.

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy

```bash
firebase deploy
```

Your application will be live at: `https://your-project-id.web.app`

---

## Folder Structure

```
ai-teardowns/
├── public/                          # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (dark mode, fonts)
│   │   ├── globals.css              # Global CSS design system & variables
│   │   ├── page.tsx                 # Public landing page
│   │   ├── privacy/
│   │   │   └── page.tsx             # Privacy Policy page
│   │   ├── terms/
│   │   │   └── page.tsx             # Terms of Service page
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact page
│   │   ├── teardowns/
│   │   │   └── page.tsx             # Public teardown detail page (uses ?id=)
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Admin login
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Intelligence Command dashboard
│   │   │   └── editor/
│   │   │       └── page.tsx         # Content Ingestion Editor
│   ├── components/
│   │   ├── public/                  # Public page components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TeardownGrid.tsx
│   │   │   ├── TeardownCard.tsx
│   │   │   ├── DetailHeader.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── PresentationViewer.tsx
│   │   │   ├── ArticleContent.tsx
│   │   │   ├── FeedbackModule.tsx
│   │   │   ├── LoadMoreButton.tsx
│   │   │   └── Footer.tsx
│   │   └── admin/                   # Admin page components
│   │       ├── LoginForm.tsx
│   │       ├── AdminSidebar.tsx
│   │       ├── MetricsGrid.tsx
│   │       ├── MetricCard.tsx
│   │       ├── TeardownTable.tsx
│   │       ├── StatusBadge.tsx
│   │       └── Pagination.tsx
│   ├── lib/
│   │   ├── firebase/
│   │   └── utils.ts                 # Helper functions
├── .env.local                       # Firebase credentials (git-ignored)
├── .gitignore
├── firestore.rules                  # Firestore security rules
├── storage.rules                    # Cloud Storage security rules
├── firebase.json                    # Firebase project config
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
├── product_overview.md              # Product Requirements Document
├── system_design.md                 # System Design Document
├── implementation_plan.md           # Implementation Playbook
├── running_and_deployment_instructions.md  # Detailed setup, troubleshooting, and deployment guide
└── README.md                        # This file
```

---

## Documentation

| Document                                               | Purpose                                          |
| :----------------------------------------------------- | :----------------------------------------------- |
| [`product_overview.md`](./product_overview.md)         | Product Requirements Document (PRD)              |
| [`system_design.md`](./system_design.md)               | Technical architecture & Firebase schema          |
| [`implementation_plan.md`](./implementation_plan.md)   | Step-by-step development playbook                 |
| [`running_and_deployment_instructions.md`](./running_and_deployment_instructions.md) | Step-by-step setup, deployment, and troubleshooting guide |

---

## Security

- **Authentication Guard**: Client-side hook (`useAuth.ts`) intercepts `/admin/*` routes to check for valid Firebase ID Tokens before rendering.
- **Image Handling**: Direct Google Drive thumbnail fetching to avoid requiring a server-side image proxy.
- **Firestore Rules**: Public read restricted to `status == 'published'`; all writes require authentication.
- **Storage Rules**: Size limits and content-type validation enforced; writes require authentication.
- **Secrets**: `.env.local` is git-ignored. `README.md` only shows placeholder values.

---

## License

Proprietary — All rights reserved.

---

*Built with precision for those who operate at the frontier.*
