"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import type { Category } from "@/lib/projects";

// Cloudinary URLs for MY PORTRAIT images (uploaded via scripts/upload_portrait.ts)
const ABOUT_IMAGES = [
  {
    url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296",
    filename: "IMG_9296.jpg",
  },
  {
    url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy",
    filename: "IMG_9297 copy.jpg",
  },
  {
    url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309",
    filename: "IMG_9309.jpg",
  },
  {
    url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy",
    filename: "IMG_9322 copy.jpg",
  },
  {
    url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy",
    filename: "S_PX1005 copy.jpg",
  },
];

const BIO = `I'm Obalana Fisayo — the lead photographer, creative and the mind behind fisayoview.

What you see on this page isn't just photography.
Its intention, It's detail, It's understanding people beyond the surface. Every frame I create is built on one thing and that's making you feel seen not just photographed.

From portraits to events, I focus on capturing moments in a way that actually means something because anyone can take a picture but not everyone can tell your story properly.

If you're new here, you're in the right place. Let's create something timeless.`;

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div style={{ background: "#000", minHeight: "100vh", paddingTop: "64px" }}>
      <Navbar
        activeCategory={"ALL" as Category}
        onCategoryChange={() => {}}
        allMuted={false}
      />

      {/* Content — px: 120, py: 60 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 120px",
        }}
      >
        {/* Two-column layout — gap: 24px */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* LEFT — 516×700 main photo */}
          <div style={{ width: "516px", height: "700px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={ABOUT_IMAGES[activeIndex].url}
                alt="Fisayo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </AnimatePresence>
          </div>

          {/* RIGHT — 400px, space-between */}
          <div
            style={{
              width: "400px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignSelf: "stretch",
            }}
          >
            {/* TOP — name + contact + bio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>

              {/* Name + contact */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p
                  style={{
                    fontSize: "34px",
                    fontFamily: "var(--font-geist-sans)",
                    fontWeight: 400,
                    color: "#fff",
                    lineHeight: "normal",
                    width: "455px",
                  }}
                >
                  FISAYOVIEW
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-geist-sans)",
                      fontWeight: 200,
                      color: "#b3b3b3",
                      lineHeight: "18px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    08136404224
                  </span>
                  {/* Dot separator */}
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#b3b3b3", flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-geist-sans)",
                      fontWeight: 200,
                      color: "#b3b3b3",
                      lineHeight: "18px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    bookfisayoview@gmail.com
                  </span>
                </div>
              </div>

              {/* Bio text */}
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-geist-sans)",
                  fontWeight: 200,
                  color: "#fff",
                  lineHeight: "18px",
                  whiteSpace: "pre-wrap",
                  width: "100%",
                }}
              >
                {BIO}
              </p>
            </div>

            {/* BOTTOM — thumbnail strip */}
            <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
              {ABOUT_IMAGES.map((img, i) => {
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
                      src={img.url}
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
          </div>
        </div>
      </div>
    </div>
  );
}
