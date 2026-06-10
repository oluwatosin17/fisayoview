"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import GalleryGrid from "@/components/GalleryGrid";
import type { CollectionSummary } from "@/lib/data";
import type { Category } from "@/lib/projects";

const PAGE_SIZE = 15;
const SCROLL_KEY = "fisayoview_scrollY";
const COUNT_KEY = "fisayoview_visibleCount";

interface Props {
  coverImages: Record<number, string>;
  collections: CollectionSummary[];
}

export default function HomeClient({ coverImages, collections }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [visibleCount, setVisibleCount] = useState(() => {
    if (typeof window === "undefined") return PAGE_SIZE;
    const saved = sessionStorage.getItem(COUNT_KEY);
    return saved ? Math.max(PAGE_SIZE, parseInt(saved, 10)) : PAGE_SIZE;
  });
  const restoredRef = useRef(false);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return collections;
    return collections.filter((c) => c.category === (activeCategory as string));
  }, [activeCategory, collections]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Restore scroll position when navigating back.
  // Uses a retry loop because the page needs height before it can scroll.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const savedY = sessionStorage.getItem(SCROLL_KEY);
    if (!savedY) return;
    sessionStorage.removeItem(SCROLL_KEY);

    const targetY = parseInt(savedY, 10);
    if (targetY <= 0) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 30; // ~600ms total

    function tryScroll() {
      // Stop if we've reached the target (±5px) or run out of attempts
      if (attempts >= MAX_ATTEMPTS) return;
      attempts++;

      const pageHeight = document.documentElement.scrollHeight;
      if (pageHeight > targetY + window.innerHeight) {
        // Page has enough height — scroll now
        window.scrollTo({ top: targetY, behavior: "instant" });
        // Verify we got there (content can shift during lazy load)
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - targetY) > 20) {
            window.scrollTo({ top: targetY, behavior: "instant" });
          }
        });
      } else {
        // Not enough height yet — wait a tick and retry
        requestAnimationFrame(tryScroll);
      }
    }

    requestAnimationFrame(tryScroll);
  }, []); // run once on mount

  // Persist scroll position + visibleCount on every scroll
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
      sessionStorage.setItem(COUNT_KEY, String(visibleCount));
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [visibleCount]);

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    sessionStorage.removeItem(SCROLL_KEY);
    sessionStorage.removeItem(COUNT_KEY);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className="bg-black min-h-screen" style={{ paddingTop: "64px" }}>
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <GalleryGrid
        collections={visible}
        onLoadMore={() => setVisibleCount((n) => n + PAGE_SIZE)}
        hasMore={hasMore}
      />
    </div>
  );
}
