"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useSound } from "@/hooks/useSound";

interface SoundCtx {
  shutter: () => void;
  tick: () => void;
  whoosh: () => void;
  soundOn: boolean;
  toggleSound: () => void;
}

const Ctx = createContext<SoundCtx>({
  shutter: () => {},
  tick: () => {},
  whoosh: () => {},
  soundOn: true,
  toggleSound: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(true);
  const { shutter, tick, whoosh, toggle } = useSound();

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      toggle(next);
      return next;
    });
  }, [toggle]);

  return (
    <Ctx.Provider value={{ shutter, tick, whoosh, soundOn, toggleSound }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSoundContext = () => useContext(Ctx);
