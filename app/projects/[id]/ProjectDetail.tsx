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

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ProjectDetail({ project, images, initialIndex }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const hasLocal = images.length > 0;
  const mainImage = hasLocal
    ? (images[activeIndex] ?? images[0])
    : project.fallbackImage ?? "";

  const backLabel = project.name.toLowerCase().replace(/\s+/g, ".");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      style={{ background: "#000", minHeight: "100vh", paddingTop: "64px" }}
    >
      <Navbar
        activeCategory={"ALL" as Category}
        onCategoryChange={() => {}}
        allMuted
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 120px",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Back link — arrow slides left on hover */}
          <motion.div whileHover="hover" style={{ display: "inline-flex" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <motion.svg
                variants={{ hover: { x: -3 } }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="#808080"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              <motion.span
                variants={{ hover: { color: "#fff" } }}
                transition={{ duration: 0.2 }}
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
              </motion.span>
            </Link>
          </motion.div>

          {/* Photo viewer + thumbnails */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              alignItems: "center",
            }}
          >
            {/* Main image — cross-fade on change */}
            <AnimatePresence mode="wait">
              <motion.img
                key={mainImage}
                src={mainImage}
                alt={project.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{
                  display: "block",
                  maxWidth: "500px",
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </AnimatePresence>

            {/* Thumbnail strip */}
            {hasLocal && images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
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
                    <motion.button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
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
                      {/* Inactive dim overlay — animates in/out */}
                      <motion.div
                        animate={{ opacity: isActive ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(255,255,255,0.5)",
                          borderRadius: "1.6px",
                          pointerEvents: "none",
                        }}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {project.caption && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
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
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
