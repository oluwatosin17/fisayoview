# FISAYOVIEW — Master Handoff Document

> Session memory dump. Use this to resume work in a new chat without context loss.
> Last updated: June 2026

---

## 1. Project Overview

**FISAYOVIEW** is a photography portfolio website for a photographer named Fisayo Obalana.

| Property | Value |
|---|---|
| Local project path | `/Users/oluwatosinobalana/claude/fisayoview` |
| GitHub | `github.com/oluwatosin17/fisayoview` |
| Production URL | `https://fisayoview.vercel.app` |
| Supabase project | `jiozqlwcaohekmxhksky` |
| Cloudinary account | `oluwatosin17` |
| Figma file | `tLYkXZSDDlEiPIkNbkw9n8` |
| Framework | Next.js 15.5.19, TypeScript, Tailwind v4, Framer Motion |

---

## 2. Tech Stack

```
GitHub     → source code
Supabase   → collection + image metadata + Cloudinary URLs
Cloudinary → image storage, CDN delivery (auto WebP/AVIF)
Vercel     → deployment (manual: vercel --prod)
```

---

## 3. Credentials (.env.local — NOT in git)

| Variable | Where |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Project Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → Project Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Project Settings → API |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | oluwatosin17 |
| CLOUDINARY_API_KEY | Cloudinary Console → Settings → API Keys |
| CLOUDINARY_API_SECRET | Cloudinary Console → Settings → API Keys |
| WEBSITE_ROOT | /Volumes/FV 1/WEBSITE (local dev only) |

---

## 4. Key File Map

```
app/
  layout.tsx              Global metadata, JSON-LD, favicon, AppShell
  page.tsx                Home server component (fetches covers)
  HomeClient.tsx          Category filter, scroll restore, responsive paddingTop
  globals.css             Tailwind v4 + motion CSS tokens
  sitemap.ts              Auto /sitemap.xml (47 URLs)
  robots.ts               Auto /robots.txt
  about/page.tsx          About page — responsive, swipeable portrait
  contact/page.tsx        Redirects to / (contact is a navbar modal)
  projects/[id]/
    page.tsx              generateMetadata + server fetch
    ProjectDetail.tsx     Swipe carousel, thumbnails, back link

components/
  AppShell.tsx            Runs preloader on every load + page fade-in
  GalleryGrid.tsx         Desktop 3-col / tablet 2-col / mobile 2-col Instagram grid
  Navbar.tsx              Scroll-hide nav, contact modal, fully responsive
  Preloader.tsx           Cinematic FV→FISAYOVIEW expand + bubbles + sound

hooks/
  useBreakpoint.ts        "mobile" | "tablet" | "desktop"
  useSound.ts             No-op (sound removed from main site)

context/
  SoundContext.tsx        No-op provider (kept for import compatibility)

public/
  logo-black.png          Black FV logo — favicon light + navbar icon
  logo-white.png          White FV logo — favicon dark
```

---

## 5. Responsive Breakpoints

| | Mobile <640px | Tablet 640-1023px | Desktop ≥1024px |
|---|---|---|---|
| Navbar height | 96px | 64px | 64px |
| Gallery layout | 2-col Instagram grid | 2-col card grid | 3-col card grid |
| Card height | square (aspect-ratio 1:1) | 460px | 567px |
| Card padding | cover-cropped | 60px | 100px |

---

## 6. Navbar Spec

**Desktop/Tablet:**
- Logo: `left:60px, top:50%` — FV icon (14×14 white box, border-radius 0.84px) + "FISAYOVIEW"
- Categories: centered, gap 11px, active=white / inactive=#808080
- Links: `right:60px` — ABOUT · CONTACT · INSTAGRAM
- Scroll-hide: hides down >80px, reappears on scroll up

**Mobile (Figma 541:952):**
- Top bar 45px: FV icon + FISAYOVIEW left · ABOUT CONTACT INSTAGRAM right, 11px, padding 16px
- Category strip at top:64px: 11px font, gap 22px, padding-left 16px, horizontal scroll
- Total height: 96px

---

## 7. Gallery Grid

**Desktop/Tablet card:**
- Hover: image scale(1.06) + translateY(-4px), label #808080→#fff, background unchanged
- Cursor: crosshair
- Label: absolute bottom:16px left:16px, 12px gray

**Mobile Instagram grid:**
- display:grid, 2 columns, 2px gap, black background
- Cells: aspect-ratio 1:1, object-fit:cover
- Collection name below each cell: 11px #808080

---

## 8. Contact Modal

**Desktop:** Centered dialog 500×620px, #202020 bg, 2-col fields
**Mobile (Figma 541:1017):** Full-screen bottom sheet from top:45px, single-col stacked fields
- Sends to WhatsApp (wa.me/2348136404224) + email (bookfisayoview@gmail.com)

---

## 9. Detail Page (Figma 397:10)

- Swipe carousel: drag="x", threshold 50px, direction-aware slide animation
- object-fit:contain, max-width: 500px desktop / 420px tablet / 100% mobile
- Mobile: dot indicator (no thumbnails)
- Desktop/tablet: 40×40 thumbnail strip (click to navigate)
- touchAction: pan-y preserves vertical scroll

---

## 10. About Page

- Desktop: 516×700 portrait left, 400px text right, padding 60px 120px
- Tablet: 320×520 portrait, text right, padding 48px 40px
- Mobile: 420px portrait top, bio + thumbs below, padding 32px 16px
- ALL breakpoints: portrait is swipeable (drag="x", direction-aware, 5 photos)

---

## 11. Preloader (every page load)

**Total: ~4.2 seconds**

| Phase | Duration | Visual | Sound |
|---|---|---|---|
| 1 — Hold | 0.8s | "FV" centred, static | Soft A3→E4 sine tone |
| 2 — Expand | 1.8s | ISAYO expands right of F, IEW right of V | Filtered noise sweep 800→3200Hz |
| 3 — Bubbles | 0.9s | 10 white circles burst outward | Tiny pop per bubble |
| 4 — Exit | 0.75s | Black overlay fades out | — |

- Font: Geist 600, letter-spacing -0.03em, white uppercase
- Mechanism: max-width 0→400px + overflow:hidden + LayoutGroup (F and V layout-animate apart)
- Sound: Web Audio API inline (no external files)
- Shows on every reload (sessionStorage gate removed)

---

## 12. SEO

- metadataBase, title template "%s | FISAYOVIEW", full description + keywords
- OpenGraph (en_NG locale, cover image), Twitter card summary_large_image
- JSON-LD: WebSite + Person/ProfessionalService schema
- generateMetadata per collection: title = collection name, OG = cover photo
- /sitemap.xml and /robots.txt auto-generated

---

## 13. Favicon & Logo

- public/logo-black.png → favicon light mode + navbar icon
- public/logo-white.png → favicon dark mode
- Navbar icon: 14×14 white box (border-radius 0.84px) + logo-black.png (10×10) + "FISAYOVIEW" text, gap 6px

---

## 14. All 45 Collections

See original MASTER.md section 6 for complete mapping table (unchanged).
Categories: BIRTHDAY (19), WEDDING (9), GRADUATION (5), STUDIO (6), ESSENCE (6)

---

## 15. Completed ✅

- [x] 45/45 collections, 380 images in Cloudinary + Supabase
- [x] Production serving Cloudinary URLs
- [x] Cinematic preloader: FV expand + bubbles + sound
- [x] Responsive (mobile / tablet / desktop) via useBreakpoint
- [x] Mobile navbar matches Figma 541:952
- [x] Mobile gallery: 2-col Instagram grid + collection names
- [x] Mobile contact: full-screen bottom sheet (Figma 541:1017)
- [x] Inner page swipe carousel + dot indicators mobile
- [x] About page responsive + swipeable portrait
- [x] Logo icon (FV) in navbar (Figma 543:223)
- [x] Favicon light/dark
- [x] Full SEO: metadata, OG, Twitter, JSON-LD, sitemap, robots
- [x] Sound removed from main site (no-op exports kept)
- [x] Preloader runs on every page load

## 16. Pending

- [ ] Custom domain in Vercel
- [ ] Real Instagram handle (currently /fisayoview)
- [ ] Captions for collections
- [ ] Upload real about page photos to Cloudinary (current URLs are placeholders)
- [ ] OG hero image (dedicated shot)
- [ ] Admin dashboard (Supabase RLS ready)

---

## 17. Run Locally

```bash
cd /Users/oluwatosinobalana/claude/fisayoview
npm run dev          # http://localhost:3001
npm run build        # production build check
npx tsx --env-file=.env.local scripts/migrate.ts   # re-run migration if needed
```

## 18. Deploy

```bash
git add -A && git commit -m "message" && git push origin main
vercel --prod
```

> Project: obalanatosin16-gmailcoms-projects/fisayoview
