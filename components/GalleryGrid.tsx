"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CollectionSummary } from "@/lib/data";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface GalleryGridProps {
  collections: CollectionSummary[];
  onLoadMore: () => void;
  hasMore: boolean;
}

function localFilename(url: string): string | null {
  if (!url.startsWith("/api/serve/")) return null;
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1]);
}

function getHref(collection: CollectionSummary) {
  const filename = localFilename(collection.coverUrl);
  return filename
    ? `/projects/${collection.id}?img=${encodeURIComponent(filename)}`
    : `/projects/${collection.id}`;
}

/** Per-breakpoint card dimensions — mobile: Instagram grid (separate component) */
const CARD_SIZES = {
  desktop: { height: 567, paddingX: 100, paddingY: 100, imgW: 303, imgH: 367 },
  tablet:  { height: 460, paddingX: 60,  paddingY: 60,  imgW: 240, imgH: 290 },
};

/* ─────────────────────────────────────────────
   Desktop / Tablet card
───────────────────────────────────────────── */
function DesktopCard({
  collection,
  col,
  totalInRow,
  index,
  bp,
}: {
  collection: CollectionSummary;
  col: number;
  totalInRow: number;
  index: number;
  bp: "desktop" | "tablet";
}) {
  const [hovered, setHovered] = useState(false);
  const { height, paddingX, paddingY, imgW, imgH } = CARD_SIZES[bp];
  const isLastInRow = col === totalInRow - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (index % Math.max(totalInRow, 1)) * 0.08 }}
      style={{ flex: "1 0 0", minWidth: 0 }}
    >
      <Link
        href={getHref(collection)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          flex: "1 0 0",
          minWidth: 0,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          height: `${height}px`,
          padding: `${paddingY}px ${paddingX}px`,
          borderTop: "1px solid #1a1a1a",
          borderBottom: "1px solid #1a1a1a",
          borderRight: isLastInRow ? "none" : "1px solid #1a1a1a",
          textDecoration: "none",
          cursor: "crosshair",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1, y: hovered ? -4 : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: `${imgW}px`, maxWidth: "100%", height: `${imgH}px`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={collection.coverUrl} alt={collection.name}
            style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block", objectFit: "contain" }}
            loading="lazy"
          />
        </motion.div>

        {collection.labelBgUrl ? (
          <p style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "12px", fontFamily: "var(--font-geist-sans)", lineHeight: "normal", whiteSpace: "nowrap", textTransform: "uppercase", backgroundImage: `url("${collection.labelBgUrl}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", zIndex: 2 }}>
            {collection.name}
          </p>
        ) : (
          <motion.p
            animate={{ color: hovered ? "#ffffff" : "#808080" }}
            transition={{ duration: 0.22 }}
            style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "12px", fontFamily: "var(--font-geist-sans)", lineHeight: "normal", whiteSpace: "nowrap", textTransform: "uppercase", zIndex: 2 }}
          >
            {collection.name}
          </motion.p>
        )}
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Mobile Instagram-style 3-column grid cell
───────────────────────────────────────────── */
function MobileCell({ collection, index }: { collection: CollectionSummary; index: number }) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3, delay: (index % 3) * 0.04 }}
    >
      <Link
        href={getHref(collection)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{ display: "block", textDecoration: "none" }}
      >
        <motion.div
          animate={{ opacity: pressed ? 0.7 : 1 }}
          transition={{ duration: 0.1 }}
          style={{ position: "relative", width: "100%", paddingBottom: "100%", overflow: "hidden", background: "#111" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.coverUrl}
            alt={collection.name}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export default function GalleryGrid({ collections, onLoadMore, hasMore }: GalleryGridProps) {
  const bp = useBreakpoint();
  const [loops, setLoops] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          if (hasMore) onLoadMore();
          else setLoops((n) => n + 1);
        },
        { rootMargin: "300px" }
      );
      observerRef.current.observe(node);
    },
    [hasMore, onLoadMore]
  );

  const display = [
    ...collections,
    ...Array.from({ length: loops }).flatMap(() => collections),
  ];

  /* ── Mobile: Instagram 3-column square grid ── */
  if (bp === "mobile") {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", background: "#000" }}>
          {display.map((collection, i) => (
            <MobileCell key={`${i}-${collection.id}`} collection={collection} index={i} />
          ))}
        </div>
        <div ref={sentinelRef} style={{ height: "1px" }} />
      </div>
    );
  }

  /* ── Desktop / Tablet: card grid ── */
  const cols = bp === "tablet" ? 2 : 3;
  const rows: CollectionSummary[][] = [];
  for (let i = 0; i < display.length; i += cols) {
    rows.push(display.slice(i, i + cols));
  }
  const { height: cardH } = CARD_SIZES[bp];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", width: "100%" }}>
          {row.map((collection, colIndex) => (
            <DesktopCard
              key={`${rowIndex}-${collection.id}`}
              collection={collection}
              col={colIndex}
              totalInRow={row.length}
              index={colIndex}
              bp={bp}
            />
          ))}
          {row.length < cols &&
            Array.from({ length: cols - row.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{ flex: "1 0 0", minWidth: 0, height: `${cardH}px`, borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", background: "#000" }} />
            ))}
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: "1px" }} />
    </div>
  );
}
