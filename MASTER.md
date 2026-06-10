# FISAYOVIEW — Master Handoff Document

> Session memory dump. Use this to resume work in a new chat without context loss.

---

## 1. Project Overview

**FISAYOVIEW** is a photography portfolio website for a photographer named Fisayo.

| Property | Value |
|---|---|
| Local project path | `/Users/oluwatosinobalana/claude/fisayoview` |
| GitHub | `github.com/oluwatosin17/fisayoview` |
| Production URL | `https://fisayoview.vercel.app` |
| Supabase project | `jiozqlwcaohekmxhksky` — `https://jiozqlwcaohekmxhksky.supabase.co` |
| Cloudinary account | Cloud name: `oluwatosin17` |
| Figma file | `tLYkXZSDDlEiPIkNbkw9n8` |
| Framework | Next.js 15.5.19, TypeScript, Tailwind v4, Framer Motion |

---

## 2. Tech Stack

```
GitHub          → application source code
Supabase        → collection metadata + image metadata + Cloudinary URLs
Cloudinary      → image storage, optimization, CDN delivery (auto WebP/AVIF)
Vercel          → deployment (auto-deploys from GitHub main branch)
```

**Runtime image data flow:**
```
lib/data.ts → checks if SUPABASE env vars are set
  → YES: query Supabase (collections/images tables) → render Cloudinary URLs
  → NO:  fall back to local filesystem /Volumes/FV 1/WEBSITE via /api/serve/
```

---

## 3. Credentials (stored in `.env.local` — NOT committed to git)

All secrets are in `.env.local` (gitignored) and mirrored as Vercel environment variables.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `oluwatosin17` |
| `CLOUDINARY_API_KEY` | Cloudinary Console → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Console → Settings → API Keys |
| `WEBSITE_ROOT` | `/Volumes/FV 1/WEBSITE` (local dev only) |

> **Supabase project ref:** `jiozqlwcaohekmxhksky`
> **Cloudinary cloud name:** `oluwatosin17`

---

## 4. File Structure (key files)

```
fisayoview/
├── app/
│   ├── page.tsx                  # Server component — fetches all collection covers
│   ├── HomeClient.tsx            # Client component — category filter + scroll state
│   ├── globals.css
│   ├── layout.tsx
│   ├── projects/
│   │   └── [id]/
│   │       ├── page.tsx          # Server component — fetches single collection detail
│   │       └── ProjectDetail.tsx # Client component — photo viewer + thumbnails
│   └── api/
│       └── serve/
│           └── [...path]/
│               └── route.ts     # Streams images from /Volumes/FV 1/WEBSITE (local fallback)
├── components/
│   ├── Navbar.tsx                # Fixed nav, scroll-hide, hover-dim (Framer Motion)
│   └── GalleryGrid.tsx           # 3-col grid, infinite/looping scroll
├── lib/
│   ├── projects.ts               # Static project definitions (45 collections)
│   ├── images.ts                 # Local filesystem helpers (getCoverUrl, getProjectImages)
│   ├── data.ts                   # Unified data layer (Supabase → local fallback)
│   ├── supabase.ts               # Supabase client + TypeScript types
│   └── cloudinary.ts             # Cloudinary config + cdnUrl() helper
├── scripts/
│   ├── migrate.ts                # Upload all images to Cloudinary + seed Supabase
│   └── build.mjs                 # (legacy — no longer needed with Next.js 15)
├── supabase/
│   └── schema.sql                # Run once in Supabase SQL editor to create tables
├── .env.local                    # NOT in git
├── vercel.json                   # framework: nextjs only
└── MASTER.md                     # this file
```

---

## 5. Supabase Schema

Two tables in the `public` schema with Row Level Security (public read):

**`collections`** — one row per photo shoot
```
id, name, slug, category, folder_name,
cover_cloudinary_id, cover_url,
label_bg_url, instagram_url, handle, caption,
display_order, created_at
```

**`images`** — one row per photo
```
id, collection_id (FK), cloudinary_public_id, url,
filename, width, height, sort_order, is_cover, created_at
```

Cloudinary public_id format: `fisayoview/{slug}/{filename-without-ext}`
Delivery URL format: `https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/{public_id}`

---

## 6. All 45 Collections — Complete Mapping

| id | name | slug | folderName (local disk) | category | coverFile |
|---|---|---|---|---|---|
| 1 | SEYI | seyi | SEYI | BIRTHDAY | — |
| 2 | BELLO | bello | BELLO | WEDDING | IMG_1455.jpg |
| 3 | TEMILADE | temilade | TEMILADE | GRADUATION | — |
| 4 | GABRIEL OGHOSA | gabriel-oghosa | GABRIEL OGHOSA | BIRTHDAY | — |
| 5 | KEVWE | kevwe | KEVWE | BIRTHDAY | — |
| 6 | PRECIOUS TRAD | precious-trad | PRECIOUS TRAD _(trailing space)_ | WEDDING | — |
| 7 | ABIODUN | abiodun | ARI ABIODUN | GRADUATION | — |
| 8 | STARR | starr | STARR | BIRTHDAY | — |
| 9 | TOMI | tomi | TOMI | GRADUATION | — |
| 10 | BLOSSOM | blossom | BLOSSOM CALL TO BAR | LAW | — |
| 11 | DEMOLA | demola | DEMOLA | BIRTHDAY | — |
| 12 | PROSPER | prosper | PROSPER'S PRE WEDDING/2 | WEDDING | — |
| 13 | MIDEY | midey | MIDEY | BIRTHDAY | IMG_2295 copy.jpg |
| 14 | TIANA | tiana | TIANA | GRADUATION | — |
| 15 | SEYI CONVO | seyi-convo | SEYI CONVOCATION | GRADUATION | — |
| 16 | PRECIOUS | precious | PRECIOUS | BIRTHDAY | IMG_8564.jpg |
| 17 | PECULIAR TRAD | peculiar-trad | PECULIAR WEDDING/TRAD WEDDING | WEDDING | — |
| 18 | OYERONKE | oyeronke | OYERONKE | GRADUATION | IMG_9856.jpg |
| 19 | OLABANJI | olabanji | OLABANJI | WEDDING | — |
| 20 | OMOLOLA PRE | omolola-pre | OMOLOLA PRE WEDDING/PRE | WEDDING | — |
| 21 | CHRISTMAS | christmas | CHRISTMAS | BIRTHDAY | — |
| 22 | NIMI BL | nimi | NIMI/BL | BIRTHDAY | S_PX1442.jpg |
| 23 | PROSPER TRAD | prosper-trad | PROSPER'S PRE WEDDING/TRAD | WEDDING | — |
| 24 | ARAMIDE | aramide | ARAMIDE | GRADUATION | IMG_7496 copy.jpg |
| 25 | DAMILOLA | damilola | DAMILOLA | BIRTHDAY | — |
| 26 | FAVOUR | favour | FAVOUR | WEDDING | — |
| 27 | ELIJAH | elijah | ELIJAH CONVOCATION | LAW | — |
| 28 | EZEKIEL | ezekiel | EZEKIEL CALL TO BAR | LAW | — |
| 29 | FEHIN | fehin | FEHIN | WEDDING | — |
| 30 | IBIFUBARA | ibifubara | IBIFUBARA | BIRTHDAY | — |
| 31 | JULIET | juliet | JULIET IBRAHIM | WEDDING | — |
| 32 | KINDESS | kindess | KINDNNESS CONVOCATION | GRADUATION | — |
| 33 | MAYOWA | mayowa | MAYOWA | BIRTHDAY | — |
| 34 | MIDE | mide | MIDE _(trailing space)_ | WEDDING | — |
| 35 | MINAT | minat | MINAT | BIRTHDAY | — |
| 36 | MOYIN 01 | moyin-01 | MOYIN PRE WEDDING/1 | LAW | — |
| 37 | NIMI | nimi-2 | NIMI/2 | BIRTHDAY | S_PX1605.jpg |
| 38 | PECULIAR WHITE | peculiar-white | PECULIAR WEDDING/WHITE WEDDING | WEDDING | — |
| 39 | MRS AKODU | mrs-akodu | MRS AKODU _(trailing space)_ | BIRTHDAY | — |
| 40 | AMANI | amani | AMANI'S BBRIDAL BRUNCH _(trailing space)_ | LAW | IMG_5660.jpg |
| 41 | MRS OSEZUA | mrs-osezua | MRS OSEZUA | WEDDING | — |
| 42 | FISAYO | fisayo | FISAYO | BIRTHDAY | — |
| 43 | MOYIN YOR | moyin-yor | MOYIN PRE WEDDING/YOR | GRADUATION | — |
| 44 | OMOLOLA 02 | omolola-02 | OMOLOLA PRE WEDDING/2 | LAW | — |
| 45 | DOYIN | doyin | DOYIN | WEDDING | — |

**Special cases:**
- id=7 (ABIODUN): has `labelBgImage: true` — label text uses cover image as CSS `background-clip: text`
- id=5 (KEVWE): Instagram `r_i.nah`
- id=8 (STARR): Instagram `unusual_star_`
- Folders with nested subfolders: PROSPER'S PRE WEDDING, NIMI, OMOLOLA PRE WEDDING, PECULIAR WEDDING, MOYIN PRE WEDDING
- OMOLOLA WEDDING folder exists on disk but is EMPTY — do not use it

---

## 7. Navbar Categories

```
ALL PROJECT (40) | WEDDING (10) | BIRTHDAY (9) | GRADUATION (7) | LAW (7)
```

---

## 8. Design Specs (Figma node 391:227 + 397:10)

**Navbar** (64px height, `position: fixed`, `z-index: 50`):
- Logo: `left: 60px`, `top: 24px`, white
- Category filters: centered, `gap: 11px`, active=white / inactive=`#808080`
- Nav links: `right: 79px`, `gap: 11px`, color `#808080`
- Scroll-hide: hides on scroll down >80px, shows on scroll up (Framer Motion `y: -100%`)
- Hover-dim: hovered item stays `opacity: 1`, all others → `opacity: 0.3`, `transition: 0.2s`

**Gallery card** (567px tall, `padding: 100px`, border `1px solid #1a1a1a`):
- Photo container: 303×367px, `object-fit: contain` (NO cropping)
- Label: `position: absolute`, `top: 523.5px`, `left: 16px`, 12px Geist, `#808080`, uppercase
- 3-column grid, last card in row has no right border

**Detail page** (inner page, Figma node 397:10):
- Back arrow (16×16 SVG) + Instagram handle or derived label
- Main image: `max-width: 500px`, `height: auto`, `object-fit: contain` (NO cropping)
- Thumbnails: 40×40px, `border-radius: 1.6px`, inactive = 50% white overlay
- Caption: 455px wide, centered, 12px white Geist
- All padded `padding-top: 64px` for fixed navbar

---

## 9. Key Behavioral Rules

1. **Image source priority**: Cloudinary (via Supabase) → local `/api/serve/` → Figma CDN fallback
2. **No cropping**: `object-fit: contain` on all main images. Thumbnails may use `cover`.
3. **Cover file = first in detail page**: `coverFile` in `lib/projects.ts` moves that filename to index 0 in `getProjectImages()`. The `?img=` URL param passes the filename, and the detail page resolves it to an index.
4. **Scroll position**: saved to `sessionStorage` (`fisayoview_scrollY`, `fisayoview_visibleCount`) on every scroll. Restored on home page mount. Cleared on category change.
5. **Infinite scroll**: `IntersectionObserver` with `rootMargin: 300px`. After all 45 shown, loops gallery (increments `loops` counter, repeats projects array). Sentinel is ALWAYS rendered (not conditional on `hasMore`).
6. **ABIODUN label effect**: CSS `background-clip: text` with `background-image: url(coverImage)` — label text is filled with the cover photo.

---

## 10. Local Image Serving (`/api/serve/[...path]`)

- Reads from `WEBSITE_ROOT` env var (default: `/Volumes/FV 1/WEBSITE`)
- Serves image bytes with correct MIME type + `Cache-Control: immutable`
- Path traversal protection: rejects paths that escape WEBSITE_ROOT
- Only active when Supabase is not configured or as fallback

---

## 11. Migration Script (`scripts/migrate.ts`)

Run: `npx tsx --env-file=.env.local scripts/migrate.ts`

- Idempotent: checks Cloudinary for existing asset before uploading
- Pre-compresses images >9.5MB using `sips` (macOS) to stay under Cloudinary's 10MB free tier limit: `-Z 3000 --setProperty formatOptions 82`, fallback `-Z 2000 quality 70`
- Upserts `collections` table first, then uploads images, then upserts `images` table
- Sets `cover_url` on collection when `is_cover = true` image is processed

**Status at session end**: Migration was running in background, ~17/45 collections completed. Re-run the script — it is idempotent (skips already-uploaded assets via `cloudinary.api.resource()` check).

---

## 12. Known Issues & Risks

| Issue | Status | Notes |
|---|---|---|
| Cloudinary free tier 10MB upload limit | Mitigated | `sips` pre-compression in migrate.ts |
| OMOLOLA WEDDING folder is empty on disk | Known | id=44 mapped to OMOLOLA PRE WEDDING/2 instead |
| macOS `._` resource fork files in folders | Fixed | Filtered with `!f.startsWith('.')` in getProjectImages |
| Some folder names have trailing spaces | Known | Exact strings preserved in `folderName` field |
| Local fallback needs `/Volumes/FV 1` mounted | Known | When Supabase is populated, local fallback not needed |
| Migration may have failed partway through | Pending | Re-run `scripts/migrate.ts` — idempotent |
| ESLint warning on Vercel build | Non-blocking | "Cannot find module eslint-config-next/core-web-vitals" — build succeeds despite warning |

---

## 13. Pending Tasks

- [ ] **Complete migration**: Re-run `npx tsx --env-file=.env.local scripts/migrate.ts` to ensure all 45 collections and all images are in Cloudinary + Supabase
- [ ] **Verify cloud mode**: Once migration complete, check that `lib/data.ts` is returning Cloudinary URLs (not local `/api/serve/` paths) in production
- [ ] **Custom domain**: Set up a custom domain in Vercel (currently `fisayoview.vercel.app`)
- [ ] **Contact page**: `/contact` route not yet built (just a nav link)
- [ ] **About page**: `/about` route not yet built
- [ ] **Instagram link**: Navbar links to `instagram.com` (generic) — update with real handle
- [ ] **Admin dashboard**: Future feature — not started. Architecture supports it (Supabase RLS can add write policies for authenticated admin users)
- [ ] **SEO**: Each collection should have `<head>` metadata (title, description, OG image). Currently using default Next.js metadata only
- [ ] **Captions**: `caption` field exists in schema and Project type but no captions have been written for collections
- [ ] **WhatsApp redirect**: Contact form should optionally redirect to WhatsApp after submission

---

## 14. Decisions Made

| Decision | Reason |
|---|---|
| Downgraded from `next@16.3.0-preview.0` to `next@15.5.19` | Preview had no SWC binary for linux/x64 on npm — Vercel builds failed |
| `lib/data.ts` unified data layer with fallback | Allows zero-downtime migration: local → cloud without code changes |
| `object-fit: contain` (not cover) for all display images | Explicit requirement: no cropping, preserve original composition |
| `coverFile` field in Project type | Allows specific non-first-alphabetical image as cover per collection |
| Scroll position + visibleCount saved to sessionStorage | User returns to exact position when navigating back from detail page |
| Infinite loop after all images shown | Endless scroll: after 45 collections, repeats from index 0 |
| Cloudinary public_id: `fisayoview/{slug}/{sanitized-filename}` | Namespaced, avoids collisions, human-readable |
| Next.js App Router server component for home page | Pre-fetches all cover images from disk/Supabase at request time (not client-side) |
| `position: fixed` navbar with Framer Motion translate | Standard pattern: scroll-aware nav without layout shift |

---

## 15. Assumptions Made

- Categories are fixed: `WEDDING`, `BIRTHDAY`, `GRADUATION`, `LAW`. Adding new categories requires updating the `Category` type in `lib/projects.ts` and the Supabase CHECK constraint.
- Display order = `id` (1–45). Matches Figma grid order.
- The external drive at `/Volumes/FV 1/WEBSITE` is the source of truth for images during local development and migration.
- "NIMI BL" and "NIMI" (id 22 + 37) are different sessions — `NIMI/BL` and `NIMI/2` subfolders respectively.
- id=37 replaced the duplicate MIDE entry — the second `MIDE ` folder session becomes `NIMI/2`.

---

## 16. How to Run Locally

```bash
cd /Users/oluwatosinobalana/claude/fisayoview

# Dev server (requires external drive mounted for images)
npm run dev
# → http://localhost:3000

# Build
npm run build

# Run migration (Cloudinary + Supabase)
npx tsx --env-file=.env.local scripts/migrate.ts
```

---

## 17. How to Deploy

```bash
# Push to GitHub triggers no automatic Vercel deploy (not linked to auto-deploy)
git push origin main

# Manual deploy to preview
vercel deploy

# Deploy to production
vercel --prod
```

> Vercel project: `obalanatosin16-gmailcoms-projects/fisayoview`
> All secrets are set as Vercel environment variables.
