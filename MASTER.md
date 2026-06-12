# FISAYOVIEW — Master Handoff Document

> Complete session memory dump. Resume any new chat with full context.
> Last updated: June 2026

---

## 1. Project Overview

**FISAYOVIEW** is a photography portfolio website for Fisayo Obalana — a Nigerian photographer.

| Property | Value |
|---|---|
| Local path | `/Users/oluwatosinobalana/claude/fisayoview` |
| GitHub | `github.com/oluwatosin17/fisayoview` |
| Production URL | `https://fisayoview.vercel.app` |
| Admin URL | `https://fisayoview.vercel.app/admin` |
| Supabase project | `jiozqlwcaohekmxhksky` |
| Cloudinary | `oluwatosin17` |
| Figma file | `tLYkXZSDDlEiPIkNbkw9n8` |
| Framework | Next.js 15.5.19, TypeScript, Tailwind v4, Framer Motion |

---

## 2. Tech Stack

```
GitHub      → source code
Supabase    → DB (collections + images + site_settings) + Auth (magic link)
Cloudinary  → image storage + CDN (auto WebP/AVIF)
Vercel      → deployment (manual: vercel --prod)
Resend      → email delivery for admin magic links (add RESEND_API_KEY)
```

---

## 3. Environment Variables

### `.env.local` (never committed)

| Variable | Value / Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `oluwatosin17` |
| `CLOUDINARY_API_KEY` | Cloudinary Console → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Console → Settings → API Keys |
| `WEBSITE_ROOT` | `/Volumes/FV 1/WEBSITE` (local dev fallback) |
| `RESEND_API_KEY` | resend.com → API Keys (add to get inbox email delivery) |

All production variables are also set in Vercel project settings.

---

## 4. File Structure

```
fisayoview/
├── app/
│   ├── layout.tsx                    Global metadata, JSON-LD, favicon, AppShell
│   ├── page.tsx                      Home server component (fetches covers)
│   ├── HomeClient.tsx                Category filter, scroll restore, responsive paddingTop
│   ├── globals.css                   Tailwind v4 + motion tokens + reduced-motion
│   ├── sitemap.ts                    /sitemap.xml — 47 URLs (/, /about, 45 collections)
│   ├── robots.ts                     /robots.txt — allow all + sitemap pointer
│   ├── about/page.tsx                Responsive about page — swipeable portrait
│   ├── contact/page.tsx              Redirects to / (contact is a navbar modal)
│   ├── auth/
│   │   └── callback/page.tsx         ⭐ Client component — reads #access_token hash,
│   │                                    calls setSession(), redirects to /admin/dashboard
│   ├── admin/
│   │   ├── layout.tsx                ToastProvider wrapper (no auth check here)
│   │   ├── login/
│   │   │   ├── page.tsx              Suspense wrapper
│   │   │   └── LoginForm.tsx         Magic link form — shows email sent state
│   │   └── (authenticated)/          Route group — session-guarded
│   │       ├── layout.tsx            Checks getUser(), renders Sidebar + main
│   │       ├── dashboard/page.tsx    Stats: collections, images, categories, recent
│   │       ├── collections/
│   │       │   ├── page.tsx          Grid of all 45 collections
│   │       │   ├── new/page.tsx      Create collection form
│   │       │   └── [id]/
│   │       │       ├── page.tsx      Edit collection form
│   │       │       └── images/       Upload, @dnd-kit reorder, bulk delete, set cover
│   │       ├── about/page.tsx        Edit about text, heading, contact links
│   │       ├── seo/page.tsx          Edit seo_title, description, keywords, OG image
│   │       └── settings/page.tsx     Edit Instagram, WhatsApp, email
│   ├── projects/[id]/
│   │   ├── page.tsx                  generateMetadata + server fetch
│   │   └── ProjectDetail.tsx         Swipe carousel, thumbnails, back link
│   └── api/
│       ├── admin/
│       │   ├── auth/send-magic-link/ Whitelist check + signInWithOtp (Supabase email)
│       │   │                         or Resend (if RESEND_API_KEY set)
│       │   ├── upload/               Server-side Cloudinary upload (session-verified)
│       │   ├── collections/[id]/     PATCH + DELETE (session-verified)
│       │   ├── images/               POST (create image record)
│       │   ├── images/[id]/          DELETE
│       │   ├── images/reorder/       POST (update sort_order for drag-drop)
│       │   └── site-settings/        PATCH (upsert settings row)
│       └── serve/[...path]/          Streams local images (dev fallback)
├── components/
│   ├── AppShell.tsx                  Runs preloader every load + page fade-in
│   ├── GalleryGrid.tsx               Desktop 3-col / tablet 2-col / mobile 2-col grid
│   ├── Navbar.tsx                    Responsive nav + contact modal
│   ├── Preloader.tsx                 FV expand → FISAYOVIEW + bubbles + sound
│   └── admin/
│       ├── Sidebar.tsx               Admin nav with logout
│       ├── CollectionCard.tsx        Cover + category badge + actions
│       ├── CollectionForm.tsx        Create/edit form with cover upload
│       ├── UploadDropzone.tsx        Multi-file drag-drop + progress per file
│       ├── SortableImageGrid.tsx     @dnd-kit sortable grid
│       └── Toast.tsx                 Success/error toasts (Framer Motion)
├── hooks/
│   ├── useBreakpoint.ts              "mobile" | "tablet" | "desktop"
│   └── useSound.ts                   No-op (sound removed from main site)
├── context/
│   └── SoundContext.tsx              No-op provider (kept for import compat)
├── lib/
│   ├── projects.ts                   45 collection definitions
│   ├── images.ts                     Local filesystem helpers
│   ├── data.ts                       Unified data layer: Supabase → local fallback
│   ├── supabase.ts                   Supabase client + types + supabaseAdmin()
│   ├── cloudinary.ts                 Server-only Cloudinary SDK config
│   ├── cdn-url.ts                    Browser-safe Cloudinary URL builder (no Node deps)
│   └── admin/
│       ├── supabase-server.ts        @supabase/ssr createServerClient (cookies)
│       └── supabase-browser.ts       @supabase/ssr createBrowserClient (singleton)
├── middleware.ts                     Protects /admin/* — uses getUser() (not getSession)
├── public/
│   ├── logo-black.png               Black FV → favicon light + navbar icon
│   └── logo-white.png               White FV → favicon dark
├── supabase/
│   └── admin-schema.sql             Reference SQL (already executed via API)
└── MASTER.md                        This file
```

---

## 5. Database Schema

### `collections` (existing + extended)
```
id, name, slug, category, folder_name,
cover_cloudinary_id, cover_url,
label_bg_url, instagram_url, handle, caption,
display_order, created_at,
description TEXT,          ← added
featured BOOLEAN DEFAULT false  ← added
```

### `images` (existing)
```
id, collection_id (FK), cloudinary_public_id, url,
filename, width, height, sort_order, is_cover, created_at
```

### `site_settings` (new)
```
id, instagram_url, whatsapp, email,
about_text, about_heading,
seo_title, seo_description, seo_keywords, og_image,
created_at, updated_at
```

Cloudinary format: `fisayoview/{slug}/{filename-without-ext}`
CDN URL: `https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/{public_id}`

### RLS Policies (all 3 tables)
- **Public**: SELECT only
- **Admin** (email in whitelist): SELECT + INSERT + UPDATE + DELETE

---

## 6. Responsive Breakpoints

| | Mobile `<640px` | Tablet `640–1023px` | Desktop `≥1024px` |
|---|---|---|---|
| Navbar height | 96px | 64px | 64px |
| Gallery | 2-col Instagram grid | 2-col card grid | 3-col card grid |
| Card height | square (1:1 cover) | 460px | 567px |

Hook: `hooks/useBreakpoint.ts`

---

## 7. Navbar Spec

**Desktop/Tablet (64px):**
- Logo: `left:60px, top:50%` — 14×14 white box (border-radius 0.84px) + FV icon + "FISAYOVIEW"
- Categories: centered, gap 11px
- Links: `right:60px` — ABOUT · CONTACT · INSTAGRAM
- Scroll-hide: hides down >80px

**Mobile (96px, Figma 541:952):**
- Top bar 45px: logo left · ABOUT CONTACT INSTAGRAM right, 11px, padding 16px
- Category strip at `top:64px`: 11px, gap 22px, padding-left 16px, scrollable

---

## 8. Gallery Grid

**Desktop/Tablet card:**
- Hover: scale(1.06) + y(-4px), label → white, no background change
- Cursor: crosshair, label: 12px bottom-left

**Mobile (2-col Instagram grid):**
- `display:grid, repeat(2,1fr), gap:2px`
- `aspect-ratio: 1/1, object-fit: cover`
- Collection name below each cell: 11px #808080

---

## 9. Contact Modal

**Desktop:** Centered dialog 500×620px, #202020, 2-col fields
**Mobile (Figma 541:1017):** Full-screen bottom sheet from `top:45px`, stacked fields
- WhatsApp: `wa.me/2348136404224`
- Email: `bookfisayoview@gmail.com`

---

## 10. Detail Page (Figma 397:10)

- Swipe carousel: `drag="x"`, threshold 50px, direction-aware slide animation
- `object-fit:contain`, max-width: 500px / 420px / 100% per breakpoint
- Mobile: dot indicator | Desktop/tablet: 40×40 thumbnail strip
- `touchAction: pan-y` preserves vertical scroll

---

## 11. About Page

- Desktop: 516×700 portrait left, 400px text right
- Tablet: 320×520 portrait, text right
- Mobile: portrait top, bio below
- ALL breakpoints: portrait swipeable (`drag="x"`, 5 photos)

---

## 12. Preloader (every page load, ~4.2s total)

| Phase | Duration | Visual | Sound |
|---|---|---|---|
| Hold | 0.8s | "FV" centred, static | Soft A3→E4 sine |
| Expand | 1.8s | ISAYO out from F, IEW out from V → FISAYOVIEW | Filtered noise sweep |
| Bubbles | 0.9s | 10 white particles burst outward | Tiny pop per bubble |
| Exit | 0.75s | Black overlay fades out | — |

- Font: Geist 600, letter-spacing -0.03em, white uppercase
- Mechanism: `max-width: 0→400px` + `overflow:hidden` + `LayoutGroup`
- Sound: Web Audio API (no external files, only in Preloader.tsx)
- Shows every page load (no sessionStorage gate)

---

## 13. Admin Dashboard

### Auth flow
1. `/admin` → middleware checks `getUser()` → redirect to `/admin/login` if not authenticated
2. User enters whitelisted email → POST `/api/admin/auth/send-magic-link`
3. Server checks whitelist → calls `admin.auth.signInWithOtp()` → Supabase sends email
4. User clicks email link → Supabase redirects to `/auth/callback#access_token=xxx&refresh_token=yyy`
5. Client page at `/auth/callback` parses hash → calls `supabase.auth.setSession()`
6. Session cookie set → redirect to `/admin/dashboard`

### ⚠ Email delivery note
Supabase free tier emails often land in **Gmail Spam or Promotions**.
- Check Spam folder, search `from:noreply@mail.supabase.io`
- Once found, click "Not spam" to whitelist
- **Permanent fix**: Add `RESEND_API_KEY` (from resend.com) to Vercel env vars
  → emails will arrive in inbox via Resend instead

### Admin whitelist
```
bookfisayoview@gmail.com
obalanatosin16@gmail.com
```
Enforced in: API route (`send-magic-link`) + middleware + RLS policies

### Admin pages
| Route | Description |
|---|---|
| `/admin/login` | Magic link form |
| `/admin/dashboard` | Stats + recent collections + quick actions |
| `/admin/collections` | All 45 collections with cover, category, image count |
| `/admin/collections/new` | Create: name, slug (auto), category, description, featured, sort, cover |
| `/admin/collections/[id]` | Edit + delete with confirm dialog |
| `/admin/collections/[id]/images` | Upload dropzone + drag-to-reorder + bulk delete + set cover |
| `/admin/about` | Edit biography, heading, contact links |
| `/admin/seo` | seo_title, description, keywords, OG image |
| `/admin/settings` | Instagram, WhatsApp, email |

### Key auth implementation details
- **Middleware**: uses `getUser()` NOT `getSession()` (verifies JWT with Supabase)
- **Callback**: client component, reads `window.location.hash`, calls `setSession()` directly
- **Layout**: double-checks `getUser()` server-side
- **Cloudinary uploads**: server-side via `/api/admin/upload` (session-verified)
- **Drag-drop**: `@dnd-kit/core` + `@dnd-kit/sortable`

---

## 14. SEO

- `metadataBase`, title template `%s | FISAYOVIEW`
- OG tags, Twitter card `summary_large_image`, `en_NG` locale
- JSON-LD: `WebSite` + `Person/ProfessionalService` schemas
- `generateMetadata` per collection: title + OG image = cover photo
- `/sitemap.xml` + `/robots.txt` auto-generated

---

## 15. Favicon & Logo

- `public/logo-black.png` → favicon light + navbar icon
- `public/logo-white.png` → favicon dark
- Navbar: 14×14 white box + logo-black.png (10×10) + "FISAYOVIEW", gap 6px

---

## 16. Completed ✅

- [x] 45/45 collections + 380 images in Cloudinary + Supabase
- [x] Responsive site: mobile / tablet / desktop
- [x] Mobile navbar matches Figma 541:952 exactly
- [x] Mobile gallery: 2-col Instagram grid + names
- [x] Mobile contact: bottom sheet (Figma 541:1017)
- [x] Inner page swipe carousel + dot indicators
- [x] About page responsive + swipeable portrait
- [x] Logo icon (FV) in navbar (Figma 543:223)
- [x] Favicon light/dark
- [x] Full SEO: metadata, OG, JSON-LD, sitemap, robots
- [x] Preloader: FV expand + bubbles + sound, every page load
- [x] Admin dashboard: full CMS
- [x] Admin auth: magic link, whitelist, working login flow
- [x] Auth callback: hash fragment → setSession() (correctly handles implicit flow)
- [x] Supabase schema: site_settings table + RLS policies (executed via Management API)
- [x] Supabase auth config: site_url + redirect URLs set

## 17. Pending

- [ ] **Resend API key** — add `RESEND_API_KEY` to Vercel for reliable inbox delivery
- [ ] **Custom domain** — set up in Vercel
- [ ] **Captions** — write for collections
- [ ] **About photos** — upload real about images to Cloudinary
- [ ] **Instagram handle** — update from `/fisayoview` to real handle if different
- [ ] **OG hero image** — dedicated shot for social sharing
- [ ] **Admin image management uses site_settings** — About/SEO pages save to Supabase ✅ but about page on the site still uses hardcoded Cloudinary URLs in `app/about/page.tsx` — wire them up

---

## 18. Run Locally

```bash
cd /Users/oluwatosinobalana/claude/fisayoview
npm run dev          # http://localhost:3001
npm run build        # production build check
npx tsx --env-file=.env.local scripts/migrate.ts   # re-run migration
```

## 19. Deploy

```bash
git add -A && git commit -m "message"
git push origin main
vercel --prod
```

> Vercel project: `obalanatosin16-gmailcoms-projects/fisayoview`

---

## 20. Key Decisions

| Decision | Reason |
|---|---|
| Auth callback as client page (not Route Handler) | Supabase implicit flow uses hash fragments (#) — server never sees them |
| `setSession()` directly from hash | Most reliable; `onAuthStateChange` timing is unpredictable with SSR client |
| `getUser()` in middleware + layout | Verifies JWT with Supabase; `getSession()` reads stale local cookie |
| Resend for email | Supabase free tier emails go to Gmail spam |
| `generateLink()` for browser fallback | Admin key, no rate limits, always works |
| `@dnd-kit` for drag-drop | Actively maintained, works with Next.js App Router |
| `lib/cdn-url.ts` separate from `lib/cloudinary.ts` | cloudinary SDK uses Node.js `fs` — can't import in client components |
| sound removed from main site | User feedback — too distracting |
| Preloader every page load | User request |
| Mobile gallery: 2-col (not 3) | User preference — bigger images |
