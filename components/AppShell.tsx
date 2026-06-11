"use client";

/**
 * AppShell — wraps the entire app (mounted once in layout).
 * Manages:
 *   1. Preloader (once per session)
 *   2. SoundProvider context
 *   3. Page-content reveal after preloader exits
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Preloader from "./Preloader";
import { SoundProvider } from "@/context/SoundContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // 'loading'  → preloader running
  // 'revealed' → preloader done, page fades in
  const [state, setState] = useState<"loading" | "revealed">("loading");

  function handlePreloaderComplete() {
    setState("revealed");
  }

  return (
    <SoundProvider>
      {/* Preloader — only when not yet loaded this session */}
      {state === "loading" && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main content — fades in after preloader */}
      <motion.div
        initial={false}
        animate={state === "revealed" ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </SoundProvider>
  );
}
