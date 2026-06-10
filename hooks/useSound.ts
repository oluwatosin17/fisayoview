"use client";
// Sound removed — all exports are no-ops kept for import compatibility
export function useSound() {
  const noop = () => {};
  return { shutter: noop, tick: noop, whoosh: noop, toggle: noop };
}
