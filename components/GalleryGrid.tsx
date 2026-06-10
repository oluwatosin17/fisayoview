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

/** Per-breakpoint card dimensions — mobile matches Figma 541:952: px-100 py-60 */
const CARD_SIZES = {
  desktop: { height: 567, paddingX: 100, paddingY: 100, imgW: 303, imgH: 367 },
  tablet:  { height: 460, paddingX: 60,  paddingY: 60,  imgW: 240, imgH: 290 },
  mobile:  { height: 487, paddingX: 100, paddingY: 60,  imgW: 303, imgH: 367 },
};

/** Number of columns per breakpoint */
const COLS = { desktop: 3, tablet: 2, mobile: 1 };

function CollectionCard({
  collection,
  col,
  totalInRow,
  index,
}: {
  collection: CollectionSummary;
  col: number;
  totalInRow: number;
  index: number;
}) {
  const bp = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const { height, paddingX, paddingY, imgW, imgH } = CARD_SIZES[bp];
  const isLastInRow = col === totalInRow - 1;

  const filename = localFilename(collection.coverUrl);
  const href = filename
    ? `/projects/${collection.id}?img=${encodeURIComponent(filename)}`
    : `/projects/${collection.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: (index % Math.max(totalInRow, 1)) * 0.08,
      }}
      style={{ flex: "1 0 0", minWidth: 0 }}
    >
      <Link
        href={href}
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
        {/* Image — scales + lifts on hover, no bg change */}
        <motion.div
          animate={{
            scale: hovered ? 1.06 : 1,
            y: hovered ? -4 : 0,
          }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: `${imgW}px`,
            maxWidth: "100%",
            height: `${imgH}px`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.coverUrl}
            alt={collection.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
            loading="lazy"
          />
        </motion.div>

        {/* Label — text white on hover, background unchanged */}
        {collection.labelBgUrl ? (
          <p
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              fontSize: "12px",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "normal",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              backgroundImage: `url("${collection.labelBgUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              zIndex: 2,
            }}
          >
            {collection.name}
          </p>
        ) : (
          <motion.p
            animate={{ color: hovered ? "#ffffff" : "#808080" }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              fontSize: "12px",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "normal",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            {collection.name}
          </motion.p>
        )}
      </Link>
    </motion.div>
  );
}

export default function GalleryGrid({
  collections,
  onLoadMore,
  hasMore,
}: GalleryGridProps) {
  const bp = useBreakpoint();
  const cols = COLS[bp];
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loops, setLoops] = useState(0);

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

  const rows: CollectionSummary[][] = [];
  for (let i = 0; i < display.length; i += cols) {
    rows.push(display.slice(i, i + cols));
  }

  const { height: cardH } = CARD_SIZES[bp]; // used for empty-cell height

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", width: "100%" }}>
          {row.map((collection, colIndex) => (
            <CollectionCard
              key={`${rowIndex}-${collection.id}`}
              collection={collection}
              col={colIndex}
              totalInRow={row.length}
              index={colIndex}
            />
          ))}
          {/* Fill empty cells in the last row */}
          {row.length < cols &&
            Array.from({ length: cols - row.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  flex: "1 0 0",
                  minWidth: 0,
                  height: `${cardH}px`,
                  borderTop: "1px solid #1a1a1a",
                  borderBottom: "1px solid #1a1a1a",
                  borderRight: i < cols - row.length - 1 ? "1px solid #1a1a1a" : "none",
                  background: "#000",
                }}
              />
            ))}
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: "1px" }} />
    </div>
  );
}
