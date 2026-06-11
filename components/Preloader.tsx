"use client";

/**
 * FISAYOVIEW Preloader
 *
 * Phase 1  (0 → 0.8s)     "FV" centred, static hold  + soft init tone
 * Phase 2  (0.8 → 2.6s)   ISAYO expands right of F, IEW right of V  + shimmer sweep
 * Phase 3  (2.6 → 3.5s)   Bubbles burst from word  + tiny pop sounds
 * Phase 4  (3.5 → 4.2s)   Overlay fades to black → page appears
 *
 * Total ≈ 4.2 s
 */

import { useEffect, useState, useRef } from "react";
import { motion, LayoutGroup } from "framer-motion";

interface Props { onComplete: () => void }

type Phase = "init" | "expand" | "bubbles" | "exit";

const EASE: [number, number, number, number] = [0.25, 0.8, 0.25, 1];

/* ─────────────── typography ─────────────── */
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

/* ─────────────── Web Audio sounds ─────────────── */
function createCtx(): AudioContext | null {
  try { return new AudioContext(); } catch { return null; }
}

/** Soft cinematic low tone — plays when FV first appears */
function playInitTone(ac: AudioContext) {
  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, ac.currentTime);                    // A3
  osc.frequency.linearRampToValueAtTime(330, ac.currentTime + 1.2);     // gentle rise
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 1.0);
  gain.gain.linearRampToValueAtTime(0,    ac.currentTime + 1.6);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(ac.currentTime); osc.stop(ac.currentTime + 1.7);
}

/** Soft shimmer sweep — plays during letter expansion */
function playExpansionSweep(ac: AudioContext) {
  const len = Math.floor(ac.sampleRate * 1.8);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.018;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bpf  = ac.createBiquadFilter();
  bpf.type = "bandpass";
  bpf.frequency.setValueAtTime(800,  ac.currentTime);
  bpf.frequency.linearRampToValueAtTime(3200, ac.currentTime + 1.8);
  bpf.Q.value = 3;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0,    ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0,    ac.currentTime + 1.8);
  src.connect(bpf); bpf.connect(gain); gain.connect(ac.destination);
  src.start(ac.currentTime); src.stop(ac.currentTime + 1.9);
}

/** Tiny pop for each bubble particle */
function playBubblePop(ac: AudioContext, delay: number) {
  const t   = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1800 + Math.random() * 600, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.07);
  g.gain.setValueAtTime(0.04, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(g); g.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.09);
}

/* ─────────────── bubble particle ─────────────── */
function Bubble({ angle, delay, size }: { angle: number; delay: number; size: number }) {
  const rad  = (angle * Math.PI) / 180;
  const dist = 55 + Math.random() * 35;
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, scale: 1, opacity: 0 }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: size, height: size,
        marginLeft: -(size / 2), marginTop: -(size / 2),
        borderRadius: "50%",
        background: "#fff",
        pointerEvents: "none",
      }}
    />
  );
}

const BUBBLES = [
  { angle: 0,   delay: 0,    size: 5 },
  { angle: 36,  delay: 0.05, size: 4 },
  { angle: 72,  delay: 0.02, size: 6 },
  { angle: 108, delay: 0.07, size: 4 },
  { angle: 144, delay: 0.01, size: 5 },
  { angle: 180, delay: 0.06, size: 4 },
  { angle: 216, delay: 0.03, size: 6 },
  { angle: 252, delay: 0.08, size: 4 },
  { angle: 288, delay: 0.04, size: 5 },
  { angle: 324, delay: 0.02, size: 4 },
];

/* ─────────────── main component ─────────────── */
export default function Preloader({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("init");
  const [done,  setDone]  = useState(false);
  const acRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialise audio context on first user gesture or immediately on modern browsers
    acRef.current = createCtx();
    if (acRef.current?.state === "suspended") acRef.current.resume();
    if (acRef.current) playInitTone(acRef.current);

    // Phase 1 → 2  (0.8 s hold)
    const t1 = setTimeout(() => {
      setPhase("expand");
      if (acRef.current) playExpansionSweep(acRef.current);
    }, 800);

    // Phase 2 → 3  (1.8 s expand)
    const t2 = setTimeout(() => {
      setPhase("bubbles");
      if (acRef.current) {
        BUBBLES.forEach(b => playBubblePop(acRef.current!, b.delay));
      }
    }, 800 + 1800);

    // Phase 3 → 4  (0.9 s bubbles)
    const t3 = setTimeout(() => setPhase("exit"),  800 + 1800 + 900);

    // Done  (0.7 s exit fade)
    const t4 = setTimeout(() => { setDone(true); onComplete(); }, 800 + 1800 + 900 + 750);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      acRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  const isExpanding = phase !== "init";

  return (
    <motion.div
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
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
      {/* Bubble layer */}
      {phase === "bubbles" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            {BUBBLES.map((b, i) => <Bubble key={i} {...b} />)}
          </div>
        </div>
      )}

      {/* Word */}
      <LayoutGroup>
        <div style={{ display: "flex", alignItems: "center", fontSize: FONT }}>

          {/* F — layout-animates right as ISAYO fills in */}
          <motion.span layout transition={{ duration: 1.8, ease: EASE }} style={letter}>F</motion.span>

          {/* ISAYO — expands right of F */}
          <motion.span
            initial={{ maxWidth: 0 }}
            animate={{ maxWidth: isExpanding ? 400 : 0 }}
            transition={{ duration: 1.8, ease: EASE }}
            style={{ overflow: "hidden", display: "inline-block", verticalAlign: "bottom" }}
          >
            <span style={letter}>ISAYO</span>
          </motion.span>

          {/* V — layout-animates right as ISAYO fills in */}
          <motion.span layout transition={{ duration: 1.8, ease: EASE }} style={letter}>V</motion.span>

          {/* IEW — expands right of V */}
          <motion.span
            initial={{ maxWidth: 0 }}
            animate={{ maxWidth: isExpanding ? 400 : 0 }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.06 }}
            style={{ overflow: "hidden", display: "inline-block", verticalAlign: "bottom" }}
          >
            <span style={letter}>IEW</span>
          </motion.span>

        </div>
      </LayoutGroup>
    </motion.div>
  );
}
