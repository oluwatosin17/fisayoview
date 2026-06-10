"use client";
// Sound removed — provider is a passthrough, all functions are no-ops
import { createContext, useContext } from "react";

interface SoundCtx {
  shutter: () => void;
  tick: () => void;
  whoosh: () => void;
  soundOn: boolean;
  toggleSound: () => void;
}

const noop = () => {};
const Ctx = createContext<SoundCtx>({ shutter: noop, tick: noop, whoosh: noop, soundOn: false, toggleSound: noop });

export function SoundProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={{ shutter: noop, tick: noop, whoosh: noop, soundOn: false, toggleSound: noop }}>{children}</Ctx.Provider>;
}

export const useSoundContext = () => useContext(Ctx);
