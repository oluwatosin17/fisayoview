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
    return collections.filter(
      (c) => c.category === (activeCategory as string)
    );
  }, [activeCategory, collections]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Restore scroll position after content mounts
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const savedY = sessionStorage.getItem(SCROLL_KEY);
    if (savedY) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedY, 10), behavior: "instant" });
        sessionStorage.removeItem(SCROLL_KEY);
      });
    }
  }, []);

  // Persist scroll position continuously
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
