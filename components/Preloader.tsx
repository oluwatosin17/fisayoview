"use client";

/**
 * FISAYOVIEW Preloader
 *
 * Phase 1  (0 → 0.4s)   "FV" centred, static hold
 * Phase 2  (0.4 → 1.6s) "FV" fades out; clip-mask expands LEFT→RIGHT revealing "FISAYOVIEW"
 * Phase 3  (1.6 → 2.2s) "FISAYOVIEW" fully visible, held still
 * Phase 4  (2.2 → 2.6s) Entire overlay fades to black → page appears
 *
 * Typography: Geist, weight 600, letter-spacing -0.03em — no counters, no bars, no icons
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void }

type Phase = "init" | "reveal" | "hold" | "exit";

const REVEAL_EASE: [number, number, number, number] = [0.25, 0.8, 0.25, 1];

const baseText: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), Geist, sans-serif",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  color: "#fff",
  textTransform: "uppercase",
  lineHeight: 1,
  userSelect: "none",
  whiteSpace: "nowrap",
};

const FONT_SIZE = "clamp(28px, 5vw, 38px)";

export default function Preloader({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [done, setDone]   = useState(false);

  useEffect(() => {
    // Phase 1 → 2: hold "FV" 400ms, then start reveal
    const t1 = setTimeout(() => setPhase("reveal"), 400);
    // Phase 2 → 3: clip reveal runs 1 200ms
    const t2 = setTimeout(() => setPhase("hold"),   400 + 1200);
    // Phase 3 → 4: hold 600ms, then exit
    const t3 = setTimeout(() => setPhase("exit"),   400 + 1200 + 600);
    // Phase 4: fade is 420ms, then unmount + notify parent
    const t4 = setTimeout(() => { setDone(true); onComplete(); }, 400 + 1200 + 600 + 480);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <motion.div
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Phase 1 — "FV" initials, static */}
      <AnimatePresence>
        {phase === "init" && (
          <motion.span
            key="initials"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ ...baseText, fontSize: FONT_SIZE, position: "absolute" }}
          >
            FV
          </motion.span>
        )}
      </AnimatePresence>

      {/* Phase 2–4 — "FISAYOVIEW" revealed by a left→right clip mask */}
      {phase !== "init" && (
        <motion.span
          key="fullname"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, ease: REVEAL_EASE }}
          style={{ ...baseText, fontSize: FONT_SIZE }}
        >
          FISAYOVIEW
        </motion.span>
      )}
    </motion.div>
  );
}
