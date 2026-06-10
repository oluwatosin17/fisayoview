"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Props { onComplete: () => void }

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const TOTAL_MS = 2800;

export default function Preloader({ onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;

    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / TOTAL_MS, 1);
      setCount(Math.floor(easeInOutQuad(p) * 100));

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);
        setTimeout(() => setExiting(true), 350);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <motion.div
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (exiting) { setDone(true); onComplete(); }
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Counter — bottom right, responsive position */}
      <span
        style={{
          position: "fixed",
          bottom: "clamp(24px, 4vh, 52px)",
          right: "clamp(16px, 4vw, 56px)",
          fontFamily: "var(--font-geist-sans)",
          fontSize: "clamp(11px, 2.5vw, 13px)",
          fontWeight: 300,
          color: "#fbfbfb",
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count} %
      </span>
    </motion.div>
  );
}
