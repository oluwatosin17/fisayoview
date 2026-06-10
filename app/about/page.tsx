"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import type { Category } from "@/lib/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const ABOUT_IMAGES = [
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy" },
];

const BIO = `I'm Obalana Fisayo — the lead photographer, creative and the mind behind fisayoview.

What you see on this page isn't just photography.
Its intention, It's detail, It's understanding people beyond the surface. Every frame I create is built on one thing and that's making you feel seen not just photographed.

From portraits to events, I focus on capturing moments in a way that actually means something because anyone can take a picture but not everyone can tell your story properly.

If you're new here, you're in the right place. Let's create something timeless.`;

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [[swipeIndex, dir], setSwipe] = useState<[number, number]>([0, 0]);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const navHeight = isMobile ? "96px" : "64px";

  function navigate(i: number) {
    if (i < 0 || i >= ABOUT_IMAGES.length) return;
    setSwipe([i, i > swipeIndex ? 1 : -1]);
    setActiveIndex(i);
  }

  /* ── Thumbnail strip (shared desktop + mobile) ── */
  function Thumbs() {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
        {ABOUT_IMAGES.map((img, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.button
              key={i}
              onClick={() => navigate(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`View photo ${i + 1}`}
              style={{ position: "relative", width: "40px", height: "40px", padding: 0, border: "none", background: "none", cursor: "pointer", borderRadius: "1.6px", overflow: "hidden", flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "1.6px" }} />
              <motion.div
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", borderRadius: "1.6px", pointerEvents: "none" }}
              />
            </motion.button>
          );
        })}
      </div>
    );
  }

  /* ── Shared bio text + contact ── */
  function Bio({ maxWidth }: { maxWidth?: string }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "56px", maxWidth }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: isMobile ? "24px" : "34px", fontFamily: "var(--font-geist-sans)", fontWeight: 400, color: "#fff", lineHeight: "normal" }}>
            FISAYOVIEW
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <a href="https://wa.me/2348136404224" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#b3b3b3", lineHeight: "18px", textDecoration: "none" }}>
              08136404224
            </a>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#b3b3b3", flexShrink: 0 }} />
            <a href="mailto:bookfisayoview@gmail.com"
              style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#b3b3b3", lineHeight: "18px", textDecoration: "none" }}>
              bookfisayoview@gmail.com
            </a>
          </div>
        </div>
        <p style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#fff", lineHeight: "18px", whiteSpace: "pre-wrap" }}>
          {BIO}
        </p>
      </div>
    );
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "40%" : "-40%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-40%" : "40%", opacity: 0 }),
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", paddingTop: navHeight }}>
      <Navbar activeCategory={"ALL" as Category} onCategoryChange={() => {}} allMuted={false} />

      {/* ── Mobile layout ── */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* Swipeable portrait — full width */}
          <div style={{ position: "relative", width: "100%", height: "420px", overflow: "hidden" }}>
            <AnimatePresence custom={dir} mode="wait">
              <motion.img
                key={swipeIndex}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: EASE_OUT }}
                src={ABOUT_IMAGES[activeIndex].url}
                alt="Fisayo"
                draggable={false}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) navigate(activeIndex + 1);
                  else if (info.offset.x > 50) navigate(activeIndex - 1);
                }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", touchAction: "pan-y", userSelect: "none" }}
              />
            </AnimatePresence>
          </div>

          {/* Bio + thumbs */}
          <div style={{ padding: "32px 16px 48px", display: "flex", flexDirection: "column", gap: "32px" }}>
            <Bio />
            <Thumbs />
          </div>
        </motion.div>
      )}

      {/* ── Tablet layout ── */}
      {isTablet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          style={{ padding: "48px 40px", display: "flex", gap: "24px", alignItems: "flex-start" }}
        >
          {/* Portrait */}
          <div style={{ flex: "0 0 320px", height: "520px", position: "relative", overflow: "hidden", borderRadius: "2px" }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={ABOUT_IMAGES[activeIndex].url}
                alt="Fisayo"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AnimatePresence>
          </div>
          {/* Right */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignSelf: "stretch" }}>
            <Bio />
            <div style={{ marginTop: "32px" }}><Thumbs /></div>
          </div>
        </motion.div>
      )}

      {/* ── Desktop layout ── */}
      {!isMobile && !isTablet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 120px" }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {/* Portrait — 516×700 */}
            <div style={{ width: "516px", height: "700px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={ABOUT_IMAGES[activeIndex].url}
                  alt="Fisayo"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </AnimatePresence>
            </div>
            {/* Right — 400px */}
            <div style={{ width: "400px", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", alignSelf: "stretch" }}>
              <Bio maxWidth="400px" />
              <Thumbs />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
