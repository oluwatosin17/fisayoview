"use client";

/**
 * Layout-level scroll + state restorer.
 *
 * Runs on EVERY pathname change — this fires whether Next.js served the home
 * page from the router cache (no remount, no HomeClient useEffect) OR did a
 * fresh render. Placing it in the root layout ensures it is always mounted.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_KEY = "fisayoview_scrollY";

export default function NavigationRestorer() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

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
