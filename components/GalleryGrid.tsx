"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CollectionSummary } from "@/lib/data";

interface GalleryGridProps {
  collections: CollectionSummary[];
  onLoadMore: () => void;
  hasMore: boolean;
}

// Extract filename from /api/serve/ URL; returns null for Cloudinary or other URLs
function localFilename(url: string): string | null {
  if (!url.startsWith("/api/serve/")) return null;
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1]);
}

function CollectionCard({
  collection,
  isLast,
}: {
  collection: CollectionSummary;
  isLast: boolean;
}) {
  const filename = localFilename(collection.coverUrl);
  const href = filename
    ? `/projects/${collection.id}?img=${encodeURIComponent(filename)}`
    : `/projects/${collection.id}`;

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flex: "1 0 0",
        minWidth: 0,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        height: "567px",
        padding: "100px",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
        borderRight: isLast ? "none" : "1px solid #1a1a1a",
        textDecoration: "none",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "80px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "303px",
          height: "367px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.coverUrl}
          alt={collection.name}
          style={{
            maxWidth: "303px",
            maxHeight: "367px",
            width: "auto",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
          loading="lazy"
        />
      </motion.div>

      {/* Label */}
      {collection.labelBgUrl ? (
        <p
          style={{
            position: "absolute",
            top: "523.5px",
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
          }}
        >
          {collection.name}
        </p>
      ) : (
        <p
          style={{
            position: "absolute",
            top: "523.5px",
            left: "16px",
            fontSize: "12px",
            fontFamily: "var(--font-geist-sans)",
            lineHeight: "normal",
            color: "#808080",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {collection.name}
        </p>
      )}
    </Link>
  );
}

export default function GalleryGrid({
  collections,
  onLoadMore,
  hasMore,
}: GalleryGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loops, setLoops] = useState(0);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          if (hasMore) {
            onLoadMore();
          } else {
            // All loaded — loop gallery seamlessly
            setLoops((n) => n + 1);
          }
        },
        { rootMargin: "300px" }
      );
      observerRef.current.observe(node);
    },
    [hasMore, onLoadMore]
  );

  // Expand with loop repeats for endless scroll
  const display = [
    ...collections,
    ...Array.from({ length: loops }).flatMap(() => collections),
  ];

  const rows: CollectionSummary[][] = [];
  for (let i = 0; i < display.length; i += 3) {
    rows.push(display.slice(i, i + 3));
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", width: "100%" }}>
          {row.map((collection, colIndex) => (
            <CollectionCard
              key={`${rowIndex}-${collection.id}`}
              collection={collection}
              isLast={colIndex === row.length - 1}
            />
          ))}
          {row.length < 3 &&
            Array.from({ length: 3 - row.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  flex: "1 0 0",
                  minWidth: 0,
                  height: "567px",
                  borderTop: "1px solid #1a1a1a",
                  borderBottom: "1px solid #1a1a1a",
                  borderRight:
                    i < 3 - row.length - 1 ? "1px solid #1a1a1a" : "none",
                }}
              />
            ))}
        </div>
      ))}
      {/* Always-present sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: "1px" }} />
    </div>
  );
}
