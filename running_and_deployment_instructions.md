# AI Teardowns — Running & Deployment Instructions

This document provides comprehensive, step-by-step instructions for setting up the local development environment, troubleshooting common issues, and deploying the application to production on the Firebase Free (Spark) tier.

---

## 🏗️ 1. Architecture Context

Before running the application, it is important to understand how the environments are structured:

1. **Static Export**: The Next.js application is strictly a Client/Static application (`output: 'export'`). It relies entirely on the Firebase Client SDK for Authentication, Database, and Storage (there is no Node.js backend).
2. **Database Segregation**: To ensure your production data remains pristine, the application uses a dynamic collection reference based on the environment:
   - `npm run dev` → reads/writes to the **`dev_teardowns`** Firestore collection.
   - `npm run build` (production) → reads/writes to the **`prod_teardowns`** Firestore collection.

---

## 💻 2. Local Setup & Running (Development)

### Prerequisites
- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase Project with Auth (Email/Pass), Firestore, and Storage enabled.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.local` file in the root of the project. This file is ignored by Git to protect your credentials.

```env
# Exposed to the browser (Client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```
*Note: You do not need an Admin SDK private key because there is no server-side Next.js code.*

### Step 3: Run the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`. 
Because you are running in the `development` environment, any teardowns you create via the Admin Panel will be saved to the **`dev_teardowns`** collection in Firestore.

---

## 🚀 3. Deploying to Production

Deploying the application compiles the React code into static HTML/JS/CSS files and pushes them to Firebase Hosting. The deployed code will automatically switch to using the **`prod_teardowns`** Firestore collection.

### Step 1: Verify Firebase Login
Ensure you are authenticated with the Firebase CLI:
```bash
firebase login
```

### Step 2: Build the Application
This generates the static export in the `out/` directory:
```bash
npm run build
```
*Ensure there are no TypeScript or ESLint errors during the build.*

### Step 3: Deploy to Firebase
Deploy the static hosting files, as well as the Firestore security rules:
```bash
firebase deploy --only hosting,firestore:rules
```
*Your application is now live on `https://<your-project-id>.web.app`.*

---

## 🔧 4. Troubleshooting Guide

### Issue: Admin Panel displays a white screen or crashes on load
**Cause:** React "Rules of Hooks" violation or Hydration mismatch.
**Fix:** 
1. Ensure `useAuth()` is called at the absolute top level of the component.
2. Do not place `if (authLoading) return ...` *above* any `useState` or `useEffect` hooks. State and effect hooks must be declared first.
3. Ensure the `<body suppressHydrationWarning>` tag exists in `src/app/layout.tsx` to handle browser extensions that inject HTML.

### Issue: 404 Error when clicking a Top Card
**Cause:** Next.js Static Export does not support dynamically generated URL paths (e.g., `/teardowns/[slug]`) unless all possible slugs are generated at build time.
**Fix:** The application uses query parameters for dynamic pages. Ensure links map to `/teardowns?id=your-slug` instead of `/teardowns/your-slug`.

### Issue: "Missing or Insufficient Permissions" in Firebase
**Cause:** The Firebase Security Rules are blocking your read/write request.
**Fix:**
1. Ensure you have deployed the latest security rules (`firebase deploy --only firestore:rules`).
2. Verify that the rules cover both the `dev_teardowns` and `prod_teardowns` collections.
3. For public viewing, the teardown's `status` field must be exactly `'published'`.

### Issue: Changes made in Localhost don't appear in Production
**Cause:** Database Segregation is working as intended.
**Fix:** This is a feature, not a bug. Your local environment writes to `dev_teardowns`. Production reads from `prod_teardowns`. To see data in production, you must log into the live production site's admin panel (`https://<your-project>.web.app/admin/login`) and create the content there.

### Issue: Images from Google Drive aren't loading
**Cause:** Incorrect Google Drive URL format or missing sharing permissions.
**Fix:**
1. Ensure the Google Drive image is shared to "Anyone with the link".
2. The URL must contain the file ID (e.g., `https://drive.google.com/file/d/THIS_IS_THE_ID/view`). The `getDriveImageEmbedUrl` utility automatically extracts this ID and formats it as a direct thumbnail link.
