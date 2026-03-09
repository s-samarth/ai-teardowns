# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Teardowns is a technical due diligence platform delivering structured analyses of AI products. It's a **fully static Next.js app** (no server-side runtime) backed entirely by Firebase services (Auth, Firestore, Cloud Storage, Hosting).

## Commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Static export to `out/` directory
- `npm run lint` — Run ESLint
- `firebase deploy --only hosting,firestore:rules` — Deploy to production

## Architecture

### Static Export Constraint

The app uses `output: 'export'` in `next.config.ts`, meaning **no server-side code runs in production**. All data access goes through the Firebase Client SDK directly from the browser. This means:
- No API routes, no server actions, no middleware
- Dynamic pages use query params (`/teardowns?id=slug`) instead of dynamic route segments
- All admin pages are Client Components with client-side auth guards

### Environment-Based Database Segregation

`src/lib/firebase/client.ts` exports `COLLECTION_NAME` which resolves to:
- `dev_teardowns` in development (`npm run dev`)
- `prod_teardowns` in production (`npm run build`)

All Firestore queries must use this constant, never hardcode collection names.

### Key Source Layout

- `src/app/` — Next.js App Router pages
  - Public: `/` (landing), `/teardowns` (detail via `?id=`), `/privacy`, `/terms`, `/contact`
  - Admin (auth-guarded): `/admin/login`, `/admin/dashboard`, `/admin/editor`
- `src/components/public/` — Public-facing components
- `src/components/admin/` — Admin panel components
- `src/lib/firebase/client.ts` — Firebase SDK initialization, exports `auth`, `db`, `storage`, `COLLECTION_NAME`
- `src/lib/useAuth.ts` — Auth guard hook; redirects unauthenticated users from `/admin/*` to `/admin/login`
- `src/lib/types.ts` — `TeardownDocument`, `TeardownFormData`, `TeardownWithId`, `ContentLink` interfaces
- `src/lib/utils.ts` — Slug generation, date formatting, YouTube/Google Drive URL conversion, `cn()` class merger

### Auth Pattern

The `useAuth()` hook must be called at the top level of admin page components **before** any early returns. Placing conditional returns above `useState`/`useEffect` calls causes React hook violations.

### Data Model

Each teardown is a Firestore document with: `name`, `description`, `thumbnail_url`, `presentation_url`, `status` ('draft'|'published'), `createdAt`, `updatedAt`, and optional `video_url`, `content_links` (array of `{name, url}`), `feedback_parameters` (markdown string), `slug`.

Public queries filter on `status == 'published'` and require a composite index on `status` + `createdAt`.

### Styling

Tailwind CSS v4 with a dark-mode-first design. Global CSS variables and design tokens are in `src/app/globals.css`. Fonts: Inter (display), JetBrains Mono/Roboto Mono (monospace). Icons via Material Symbols Outlined (Google Fonts).

## Environment Variables

Required in `.env.local` (all `NEXT_PUBLIC_` prefixed for client-side access):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Reference Documentation

- `product_overview.md` — Product requirements
- `system_design.md` — Full technical architecture, Firestore schema, security rules, component tree
- `implementation_plan.md` — Development playbook
- `running_and_deployment_instructions.md` — Setup, deployment, and troubleshooting
