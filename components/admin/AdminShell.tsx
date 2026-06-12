"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>

      {/* ── Mobile overlay ─────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* ── Right side ──────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Mobile top bar — hidden on desktop via CSS */}
        <div className="md:hidden" style={{
          position: "sticky", top: 0, zIndex: 30,
          height: "52px", background: "#070707",
          borderBottom: "1px solid #141414",
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: "12px",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            style={{
              background: "none", border: "none", color: "#888",
              cursor: "pointer", padding: "6px",
              borderRadius: "6px", fontSize: "18px", lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {/* Hamburger icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6"  x2="17" y2="6"  />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 26, height: 26, background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Image src="/logo-black.png" alt="FV" width={17} height={17} style={{ objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#fff" }}>FISAYOVIEW</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
