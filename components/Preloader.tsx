"use client";

/**
 * Preloader — GS Productions style
 *
 * Motion sequence:
 * 1. Counter ticks 00 → 100 over ~2.4s (ease-in-out quad)
 * 2. At ~60% of counter: "FV" initials slide up, then "ISAYO" and "IEW" expand horizontally
 * 3. Subtitle "Fisayoview" fades in
 * 4. At 100%: brief pause, then two black panels split (top → up, bottom → down)
 * 5. Underlying page content is revealed; onComplete fires
 *
 * Shows only once per session via sessionStorage['fv_loaded'].
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

// Smooth ease-in-out quad
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function Preloader({ onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [expanding, setExpanding] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const TOTAL = 2400; // ms
    let raf: number;
    let start: number | null = null;

    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / TOTAL, 1);
      const eased = easeInOutQuad(p);
      const current = Math.floor(eased * 100);
      setCount(current);

      if (p >= 0.58 && !expanding) setExpanding(true);

      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setCount(100);
        // Pause at 100 then exit
        setTimeout(() => {
          setExiting(true);
          // Remove from DOM after panels fully exit
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 800);
        }, 360);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "all",
        overflow: "hidden",
      }}
    >
      {/* ── Top exit panel ── */}
      <motion.div
        animate={exiting ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.72, ease: EXIT_EASE }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000",
          zIndex: 2,
        }}
      />

      {/* ── Bottom exit panel ── */}
      <motion.div
        animate={exiting ? { y: "100%" } : { y: 0 }}
        transition={{ duration: 0.72, ease: EXIT_EASE }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000",
          zIndex: 2,
        }}
      />

      {/* ── Content layer (above panels) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "56px 60px",
        }}
      >
        {/* Brand name — initials expand to full name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          {/* F — wrap in overflow:hidden to clip the upward slide */}
          <span style={{ overflow: "hidden", display: "inline-block", lineHeight: 1 }}>
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{
                fontSize: "clamp(36px, 6vw, 86px)",
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                display: "inline-block",
              }}
            >F</motion.span>
          </span>

          {/* ISAYO — clip + slide in from the left */}
          <span style={{ overflow: "hidden", display: "inline-block" }}>
            <motion.span
              initial={{ x: "-105%" }}
              animate={expanding ? { x: 0 } : { x: "-105%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(36px, 6vw, 86px)",
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >ISAYO</motion.span>
          </span>

          {/* V — wrap in overflow:hidden */}
          <span style={{ overflow: "hidden", display: "inline-block", lineHeight: 1 }}>
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
              style={{
                fontSize: "clamp(36px, 6vw, 86px)",
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                display: "inline-block",
              }}
            >V</motion.span>
          </span>

          {/* IEW — clip + slide in from the left, slight delay */}
          <span style={{ overflow: "hidden", display: "inline-block" }}>
            <motion.span
              initial={{ x: "-105%" }}
              animate={expanding ? { x: 0 } : { x: "-105%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{
                fontSize: "clamp(36px, 6vw, 86px)",
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >IEW</motion.span>
          </span>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-geist-sans)",
            fontWeight: 200,
            color: "#555",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          Photography
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "clamp(52px, 10vw, 128px)",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(count).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: "clamp(14px, 2vw, 22px)",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 300,
              color: "#444",
              letterSpacing: "0",
            }}
          >
            %
          </span>
        </motion.div>

        {/* Progress line */}
        <div
          style={{
            marginTop: "20px",
            height: "1px",
            background: "#1a1a1a",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ scaleX: count / 100 }}
            transition={{ duration: 0, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#333",
              transformOrigin: "left center",
            }}
          />
        </div>
      </div>
    </div>
  );
}
