"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import GalleryGrid from "@/components/GalleryGrid";
import type { CollectionSummary } from "@/lib/data";
import type { Category } from "@/lib/projects";

const PAGE_SIZE = 15;
const SCROLL_KEY = "fisayoview_scrollY";
const COUNT_KEY = "fisayoview_visibleCount";
const CAT_KEY   = "fisayoview_category";

interface Props {
  coverImages: Record<number, string>;
  collections: CollectionSummary[];
}

export default function HomeClient({ coverImages, collections }: Props) {
  // Always start with defaults so server + client render identically (no hydration mismatch).
  // sessionStorage is read in useEffect (client-only) and applied after first paint.
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Restore persisted category + visibleCount from sessionStorage after hydration
  useEffect(() => {
    const savedCat = sessionStorage.getItem(CAT_KEY) as Category | null;
    const savedCount = sessionStorage.getItem(COUNT_KEY);
    if (savedCat) setActiveCategory(savedCat);
    if (savedCount) setVisibleCount(Math.max(PAGE_SIZE, parseInt(savedCount, 10)));
  }, []); // runs once on mount, client-only
  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return collections;
    return collections.filter((c) => c.category === (activeCategory as string));
  }, [activeCategory, collections]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Persist scroll position + visibleCount on every scroll
  // (Scroll RESTORATION is handled by NavigationRestorer in the root layout)
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
      sessionStorage.setItem(COUNT_KEY, String(visibleCount));
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [visibleCount]);

  // CAT_KEY is saved explicitly in handleCategoryChange (not via a reactive effect)
  // so the initial mount with activeCategory="ALL" never overwrites a saved WEDDING/BIRTHDAY etc.
  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    sessionStorage.setItem(CAT_KEY, cat);   // ← write only on explicit user action
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
