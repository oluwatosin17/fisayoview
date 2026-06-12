"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/admin/supabase-browser";

const NAV_LINKS = [
  { href: "/admin/dashboard",   label: "Dashboard",   icon: "⊞" },
  { href: "/admin/collections", label: "Collections", icon: "◫" },
  { href: "/admin/homepage",    label: "Homepage",    icon: "⬡" },
  { href: "/admin/about",       label: "About",       icon: "◉" },
  { href: "/admin/seo",         label: "SEO",         icon: "⌖" },
  { href: "/admin/contacts",    label: "Contacts",    icon: "✉" },
  { href: "/admin/settings",    label: "Settings",    icon: "⚙" },
] as const;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <aside
        className="hidden md:flex"
        style={{
          width: "232px", minWidth: "232px",
          background: "#070707",
          borderRight: "1px solid #141414",
          flexDirection: "column",
          height: "100vh", position: "sticky", top: 0,
        }}
      >
        <SidebarContent pathname={pathname} onLogout={handleLogout} onLinkClick={undefined} />
      </aside>

      {/* ── Mobile drawer (visible only below md) ── */}
      <aside
        className="md:hidden"
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0,
          width: "260px",
          background: "#070707",
          borderRight: "1px solid #1a1a1a",
          display: "flex", flexDirection: "column",
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
          overflowY: "auto",
        }}
      >
        {/* Close button inside drawer */}
        <div style={{ position: "absolute", top: "14px", right: "14px" }}>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: "#1a1a1a", border: "none", color: "#888",
              width: 28, height: 28, borderRadius: "6px",
              cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <SidebarContent pathname={pathname} onLogout={handleLogout} onLinkClick={onClose} />
      </aside>
    </>
  );
}

/** Shared inner content — used in both desktop and mobile variants */
function SidebarContent({
  pathname,
  onLogout,
  onLinkClick,
}: {
  pathname: string;
  onLogout: () => void;
  onLinkClick?: (() => void) | undefined;
}) {
  return (
    <>
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid #141414",
        display: "flex", alignItems: "center", gap: "12px",
        flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, background: "#fff", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Image src="/logo-black.png" alt="FV" width={22} height={22} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: "#fff", margin: 0, lineHeight: 1.3 }}>FISAYOVIEW</p>
          <p style={{ fontSize: "10px", color: "#383838", margin: 0, lineHeight: 1.3, marginTop: "2px" }}>Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onLinkClick}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "8px",
                    background: active ? "#141414" : "transparent",
                    color: active ? "#fff" : "#484848",
                    textDecoration: "none", fontSize: "13px",
                    fontWeight: active ? 500 : 400,
                    transition: "color 0.12s, background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#888"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#484848"; }}
                >
                  <span style={{ fontSize: "13px", opacity: active ? 1 : 0.5, width: "16px", textAlign: "center", flexShrink: 0 }}>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 8px 20px", borderTop: "1px solid #141414", flexShrink: 0 }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: "10px", width: "100%",
            padding: "10px 12px", borderRadius: "8px",
            background: "transparent", color: "#383838",
            border: "none", cursor: "pointer", fontSize: "13px",
            transition: "color 0.12s, background 0.12s",
          }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#ef4444"; b.style.background = "#1a0808"; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#383838"; b.style.background = "transparent"; }}
        >
          <span style={{ fontSize: "13px", width: "16px", textAlign: "center", flexShrink: 0 }}>↩</span>
          Logout
        </button>
      </div>
    </>
  );
}
