"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void }

/**
 * 4-phase cinematic preloader
 *
 * Phase 1 (~1.8s)  — Black screen, counter 0→100% bottom-right, centre empty
 * Phase 2 (~0.6s)  — Counter locks at 100%, "F V" fades in (serif, tracked)
 * Phase 3 (~1.6s)  — "F V" fades out → "FISAYOVIEW" fades in
 * Phase 4 (~0.7s)  — Text fades out, black overlay fades out, reveals site
 */

type Phase = "counting" | "acronym" | "fullname" | "exiting";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const SERIF: React.CSSProperties = {
  fontFamily: "Georgia, Garamond, 'Times New Roman', serif",
  color: "#fff",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  lineHeight: 1,
  userSelect: "none",
};

export default function Preloader({ onComplete }: Props) {
  const [count, setCount]   = useState(0);
  const [phase, setPhase]   = useState<Phase>("counting");
  const [textOn, setTextOn] = useState(false);    // controls opacity of centre text
  const [label, setLabel]   = useState<"FV" | "FISAYOVIEW">("FV");
  const [gone, setGone]     = useState(false);    // unmount after overlay fades
  const rafRef  = useRef<number>(0);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t4 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t5 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const TOTAL_MS = 1800;
    let start: number | null = null;

    // Phase 1: count up
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / TOTAL_MS, 1);
      setCount(Math.floor(easeInOutQuad(p) * 100));

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);

        // Phase 2: fade in "F V"
        setPhase("acronym");
        setLabel("FV");
        setTextOn(true);

        // After holding "F V" for 800ms → swap to full name
        t1.current = setTimeout(() => {
          setTextOn(false); // fade out "F V"

          // After fade-out (350ms) → switch text + fade in
          t2.current = setTimeout(() => {
            setLabel("FISAYOVIEW");
            setPhase("fullname");
            setTextOn(true);

            // Hold full name for 1000ms, then fade out text
            t3.current = setTimeout(() => {
              setTextOn(false);

              // After text fades (350ms) → start overlay exit
              t4.current = setTimeout(() => {
                setPhase("exiting");

                // Overlay fade takes 700ms, then done
                t5.current = setTimeout(() => {
                  setGone(true);
                  onComplete();
                }, 750);
              }, 380);
            }, 1000);
          }, 380);
        }, 900);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      [t1, t2, t3, t4, t5].forEach(r => r.current && clearTimeout(r.current));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <motion.div
      animate={{ opacity: phase === "exiting" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        pointerEvents: phase === "exiting" ? "none" : "all",
      }}
    >
      {/* ── Centre brand text ── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <AnimatePresence mode="wait">
          {textOn && label === "FV" && (
            <motion.p
              key="fv"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                ...SERIF,
                fontSize: "clamp(36px, 8vw, 88px)",
                fontWeight: 400,
              }}
            >
              F &nbsp; V
            </motion.p>
          )}

          {textOn && label === "FISAYOVIEW" && (
            <motion.p
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                ...SERIF,
                fontSize: "clamp(16px, 3.5vw, 36px)",
                fontWeight: 400,
                letterSpacing: "0.22em",
              }}
            >
              FISAYOVIEW
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Counter bottom-right ── */}
      <span style={{
        position: "fixed",
        bottom: "clamp(24px, 4vh, 40px)",
        right: "clamp(16px, 3vw, 40px)",
        fontFamily: "var(--font-geist-sans), Inter, Helvetica, sans-serif",
        fontSize: "clamp(11px, 2vw, 14px)",
        fontWeight: 300,
        color: "#fff",
        letterSpacing: "0.04em",
        fontVariantNumeric: "tabular-nums",
      }}>
        {String(count).padStart(2, "0")} %
      </span>
    </motion.div>
  );
}
