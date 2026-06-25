"use client";

/**
 * Layout-level scroll + state restorer AND auth-token rescue.
 *
 * Runs on EVERY pathname change — this fires whether Next.js served the home
 * page from the router cache (no remount, no HomeClient useEffect) OR did a
 * fresh render. Placing it in the root layout ensures it is always mounted.
 *
 * Auth rescue: If Supabase magic-link redirects to the Site URL (homepage)
 * instead of /auth/callback — which happens when /auth/callback is not yet
 * in the Supabase Redirect URL allowlist — the tokens land in window.location.hash
 * on the homepage. We detect them here and immediately forward to /auth/callback
 * so the existing callback handler can finish the sign-in.
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const SCROLL_KEY = "fisayoview_scrollY";

export default function NavigationRestorer() {
  const pathname  = usePathname();
  const router    = useRouter();
  const prevPathname = useRef<string | null>(null);

  // ── Auth token rescue ──────────────────────────────────────────────────────
  // Runs once on mount (client only). If Supabase drops auth tokens on any
  // page that isn't /auth/callback, redirect to the callback page with the
  // hash preserved so the callback handler can exchange them.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash   = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const type   = params.get("type");
    const token  = params.get("access_token");

    // Only act if this looks like a Supabase auth callback fragment
    if ((type === "magiclink" || type === "recovery" || type === "signup" || token) &&
        pathname !== "/auth/callback") {
      // Preserve the full hash so /auth/callback can process the tokens
      router.replace(`/auth/callback${window.location.hash}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  // ── Scroll restoration ────────────────────────────────────────────────────
  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    // Only restore when arriving at the home page from another route
    if (pathname !== "/" || prev === "/" || prev === null) return;

    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;

    const targetY = parseInt(raw, 10);
    if (targetY <= 0) {
      sessionStorage.removeItem(SCROLL_KEY);
      return;
    }

    let attempts = 0;
    const MAX = 80; // ~1.3 s at 60 fps

    function tryScroll() {
      if (attempts++ >= MAX) {
        sessionStorage.removeItem(SCROLL_KEY);
        return;
      }
      const pageH = document.documentElement.scrollHeight;
      if (pageH > targetY + window.innerHeight) {
        window.scrollTo({ top: targetY, behavior: "instant" });
        requestAnimationFrame(() => {
          // One correction frame in case content shifted during image load
          if (Math.abs(window.scrollY - targetY) > 20) {
            window.scrollTo({ top: targetY, behavior: "instant" });
          }
          sessionStorage.removeItem(SCROLL_KEY);
        });
      } else {
        requestAnimationFrame(tryScroll);
      }
    }

    // Disable browser's own scroll restoration so it doesn't fight us
    if (typeof history !== "undefined") {
      history.scrollRestoration = "manual";
    }

    requestAnimationFrame(tryScroll);
  }, [pathname]);

  return null;
}
