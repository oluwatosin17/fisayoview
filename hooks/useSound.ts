"use client";

/**
 * Web Audio API sound synthesis — no external files.
 * All sounds are generated programmatically and kept subtle.
 *
 * Respects prefers-reduced-motion: if the user has requested reduced motion
 * we also skip the audio feedback (they opted out of sensory intensity).
 */

import { useCallback, useRef } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true); // can be toggled externally

  function ctx(): AudioContext | null {
    if (prefersReducedMotion() || !enabledRef.current) return null;
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }

  /** Camera shutter — hard click + white-noise burst */
  const shutter = useCallback(() => {
    const ac = ctx();
    if (!ac) return;
    const now = ac.currentTime;

    // Mechanical click — short sine burst
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    const gOsc = ac.createGain();
    gOsc.gain.setValueAtTime(0.35, now);
    gOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gOsc); gOsc.connect(ac.destination);
    osc.start(now); osc.stop(now + 0.07);

    // White-noise snap layer
    const len = Math.floor(ac.sampleRate * 0.09);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.25;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const hpf = ac.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 900;
    const gNoise = ac.createGain();
    gNoise.gain.setValueAtTime(0.6, now);
    gNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    src.connect(hpf); hpf.connect(gNoise); gNoise.connect(ac.destination);
    src.start(now); src.stop(now + 0.09);
  }, []);

  /** Film advance tick — very soft hover feedback */
  const tick = useCallback(() => {
    const ac = ctx();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 2400;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    osc.connect(g); g.connect(ac.destination);
    osc.start(now); osc.stop(now + 0.03);
  }, []);

  /** Soft cinematic whoosh — transition sound */
  const whoosh = useCallback(() => {
    const ac = ctx();
    if (!ac) return;
    const now = ac.currentTime;
    const dur = 0.38;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bpf = ac.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(2800, now);
    bpf.frequency.exponentialRampToValueAtTime(180, now + dur);
    bpf.Q.value = 2.5;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.06);
    g.gain.linearRampToValueAtTime(0, now + dur);
    src.connect(bpf); bpf.connect(g); g.connect(ac.destination);
    src.start(now); src.stop(now + dur);
  }, []);

  const toggle = useCallback((on: boolean) => {
    enabledRef.current = on;
  }, []);

  return { shutter, tick, whoosh, toggle };
}
