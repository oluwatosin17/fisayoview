"use client";

/**
 * FISAYOVIEW Preloader
 *
 * Phase 1  (0 → 0.4s)    "FV" centred, static
 * Phase 2  (0.4 → 1.4s)  F stays → "ISAYO" expands right of F
 *                         V stays → "IEW"   expands right of V
 *                         Result: FISAYOVIEW
 * Phase 3  (1.4 → 2.0s)  Bubbles burst outward from the word
 * Phase 4  (2.0 → 2.5s)  Overlay fades out → page appears
 */

import { useEffect, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";

interface Props { onComplete: () => void }

type Phase = "init" | "expand" | "bubbles" | "exit";

const EASE: [number, number, number, number] = [0.25, 0.8, 0.25, 1];

const letter: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), Geist, sans-serif",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  color: "#fff",
  textTransform: "uppercase",
  lineHeight: 1,
  userSelect: "none",
  whiteSpace: "nowrap",
  display: "inline-block",
};

const FONT = "clamp(28px, 5vw, 38px)";

/* ── Bubble particle ── */
function Bubble({ angle, delay, size }: { angle: number; delay: number; size: number }) {
  const rad = (angle * Math.PI) / 180;
  const dist = 55 + Math.random() * 30;
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, scale: 1, opacity: 0 }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        marginLeft: -(size / 2),
        marginTop: -(size / 2),
        borderRadius: "50%",
        background: "#fff",
        pointerEvents: "none",
      }}
    />
  );
}

const BUBBLES = [
  { angle: 0,   delay: 0,     size: 5 },
  { angle: 40,  delay: 0.04,  size: 4 },
  { angle: 80,  delay: 0.02,  size: 6 },
  { angle: 120, delay: 0.06,  size: 4 },
  { angle: 160, delay: 0.01,  size: 5 },
  { angle: 200, delay: 0.05,  size: 4 },
  { angle: 240, delay: 0.03,  size: 6 },
  { angle: 280, delay: 0.07,  size: 4 },
  { angle: 320, delay: 0.02,  size: 5 },
  { angle: 355, delay: 0.06,  size: 4 },
];

export default function Preloader({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [done,  setDone]  = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("expand"),  400);
    const t2 = setTimeout(() => setPhase("bubbles"), 400 + 1000);
    const t3 = setTimeout(() => setPhase("exit"),    400 + 1000 + 600);
    const t4 = setTimeout(() => { setDone(true); onComplete(); }, 400 + 1000 + 600 + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  const isExpanding = phase === "expand" || phase === "bubbles" || phase === "exit";

  return (
    <motion.div
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
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
      {/* ── Bubbles layer ── */}
      {phase === "bubbles" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            {BUBBLES.map((b, i) => (
              <Bubble key={i} {...b} />
            ))}
          </div>
        </div>
      )}

      {/* ── Word ── */}
      <LayoutGroup>
        <div style={{ display: "flex", alignItems: "center", fontSize: FONT }}>

          {/* F — stays, layout-animates rightward as ISAYO expands */}
          <motion.span layout style={letter}>F</motion.span>

          {/* ISAYO — expands right of F */}
          <motion.span
            initial={{ maxWidth: 0 }}
            animate={{ maxWidth: isExpanding ? 400 : 0 }}
            transition={{ duration: 1.0, ease: EASE }}
            style={{ overflow: "hidden", display: "inline-block", verticalAlign: "bottom" }}
          >
            <span style={letter}>ISAYO</span>
          </motion.span>

          {/* V — stays, layout-animates rightward as ISAYO expands */}
          <motion.span layout style={letter}>V</motion.span>

          {/* IEW — expands right of V */}
          <motion.span
            initial={{ maxWidth: 0 }}
            animate={{ maxWidth: isExpanding ? 400 : 0 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.05 }}
            style={{ overflow: "hidden", display: "inline-block", verticalAlign: "bottom" }}
          >
            <span style={letter}>IEW</span>
          </motion.span>

        </div>
      </LayoutGroup>
    </motion.div>
  );
}
