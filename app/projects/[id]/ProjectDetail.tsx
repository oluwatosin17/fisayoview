"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Category } from "@/lib/projects";

interface ClientProject {
  id: number;
  name: string;
  caption?: string;
  fallbackImage?: string;
}

interface Props {
  project: ClientProject;
  images: string[];
  initialIndex: number;
}

export default function ProjectDetail({ project, images, initialIndex }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Use local images if available, else fall back to the Figma CDN cover
  const hasLocal = images.length > 0;
  const mainImage = hasLocal
    ? (images[activeIndex] ?? images[0])
    : project.fallbackImage ?? "";

  // Always show the project name as back label (not the Instagram handle)
  const backLabel = project.name.toLowerCase().replace(/\s+/g, ".");

  return (
    <div style={{ background: "#000", minHeight: "100vh", paddingTop: "64px" }}>
      <Navbar
        activeCategory={"ALL" as Category}
        onCategoryChange={() => {}}
        allMuted
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 120px",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Back link */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="#808080"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-geist-sans)",
                color: "#808080",
                textTransform: "uppercase",
                letterSpacing: 0,
                lineHeight: "normal",
                whiteSpace: "nowrap",
              }}
            >
              {backLabel}
            </span>
          </Link>

          {/* Photo viewer + thumbnails */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              alignItems: "center",
            }}
          >
            {/* Main image — natural aspect ratio, NO cropping */}
            <AnimatePresence mode="wait">
              <motion.img
                key={mainImage}
                src={mainImage}
                alt={project.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{
                  display: "block",
                  maxWidth: "500px",
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </AnimatePresence>

            {/* Thumbnail strip — only when local images available */}
            {hasLocal && images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  maxWidth: "500px",
                }}
              >
                {images.map((src, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`View photo ${i + 1}`}
                      style={{
                        position: "relative",
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        borderRadius: "1.6px",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "1.6px",
                        }}
                      />
                      {!isActive && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(255,255,255,0.5)",
                            borderRadius: "1.6px",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {project.caption && (
          <p
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-geist-sans)",
              color: "#fff",
              textAlign: "center",
              lineHeight: "normal",
              width: "455px",
              padding: "8px 0",
            }}
          >
            {project.caption}
          </p>
        )}
      </div>
    </div>
  );
}
