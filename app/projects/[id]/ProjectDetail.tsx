"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Category } from "@/lib/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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

/** Slide-in direction variants for the swipe carousel */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

export default function ProjectDetail({ project, images, initialIndex }: Props) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet  = bp === "tablet";
  const navHeight = isMobile ? "96px" : "64px";
  const sidePad   = isMobile ? "0px" : isTablet ? "60px" : "120px";
  const maxImgWidth = isMobile ? "100%" : isTablet ? "420px" : "500px";

  // [index, swipe direction] — direction: +1 = forward, -1 = backward
  const [[activeIndex, direction], setPage] = useState<[number, number]>([initialIndex, 0]);

  const hasLocal = images.length > 0;
  const mainImage = hasLocal ? (images[activeIndex] ?? images[0]) : project.fallbackImage ?? "";

  function navigate(newIndex: number) {
    if (newIndex < 0 || newIndex >= images.length) return;
    setPage([newIndex, newIndex > activeIndex ? 1 : -1]);
  }

  const backLabel = project.name.toLowerCase().replace(/\s+/g, ".");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      style={{ background: "#000", minHeight: "100vh", paddingTop: navHeight }}
    >
      <Navbar activeCategory={"ALL" as Category} onCategoryChange={() => {}} allMuted />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `32px ${sidePad}`,
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", alignItems: "center" }}>

          {/* Back link */}
          <div style={{ width: "100%", maxWidth: maxImgWidth, paddingLeft: isMobile ? "16px" : "0" }}>
            <motion.div whileHover="hover" style={{ display: "inline-flex" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <motion.svg variants={{ hover: { x: -3 } }} transition={{ duration: 0.2, ease: "easeOut" }}
                  width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#808080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
                <motion.span variants={{ hover: { color: "#fff" } }} transition={{ duration: 0.2 }}
                  style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", color: "#808080", textTransform: "uppercase", lineHeight: "normal", whiteSpace: "nowrap" }}>
                  {backLabel}
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* ── Image viewer ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", width: "100%" }}>

            {/* Swipe carousel — drag left/right to navigate */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: maxImgWidth,
                overflow: "hidden",
                cursor: images.length > 1 ? "grab" : "default",
              }}
            >
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50)       navigate(activeIndex + 1);
                    else if (info.offset.x > 50)   navigate(activeIndex - 1);
                  }}
                  style={{ touchAction: "pan-y", userSelect: "none" }}
                  whileDrag={{ cursor: "grabbing" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt={project.name}
                    draggable={false}
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: maxImgWidth,
                      height: "auto",
                      objectFit: "contain",
                      pointerEvents: "none",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Dot indicator — mobile only */}
              {isMobile && images.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "6px", paddingTop: "12px" }}>
                  {images.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: i === activeIndex ? 1 : 0.3, scale: i === activeIndex ? 1 : 0.75 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(i)}
                      style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff", cursor: "pointer", flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip — desktop/tablet only */}
            {!isMobile && hasLocal && images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
                style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: maxImgWidth }}
              >
                {images.map((src, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => navigate(i)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                      aria-label={`View photo ${i + 1}`}
                      style={{ position: "relative", width: "40px", height: "40px", padding: 0, border: "none", background: "none", cursor: "pointer", borderRadius: "1.6px", overflow: "hidden", flexShrink: 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "1.6px" }} />
                      <motion.div
                        animate={{ opacity: isActive ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", borderRadius: "1.6px", pointerEvents: "none" }}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {project.caption && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
            style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", color: "#fff", textAlign: "center", lineHeight: "normal", width: isMobile ? "100%" : "455px", padding: isMobile ? "0 16px 16px" : "8px 0" }}>
            {project.caption}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
