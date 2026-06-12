"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/admin/supabase-browser";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/admin/collections", label: "Collections", icon: "◫" },
  { href: "/admin/homepage", label: "Homepage", icon: "⬡" },
  { href: "/admin/about", label: "About", icon: "◉" },
  { href: "/admin/seo", label: "SEO", icon: "⌖" },
  { href: "/admin/contacts", label: "Contacts", icon: "✉" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col h-screen sticky top-0"
      style={{ width: "240px", minWidth: "240px", background: "#080808", borderRight: "1px solid #161616" }}>

      {/* Logo */}
      <div className="flex items-center gap-3" style={{ padding: "24px 20px 20px", borderBottom: "1px solid #161616" }}>
        <div className="flex items-center justify-center rounded-lg" style={{ background: "#fff", width: 34, height: 34, flexShrink: 0 }}>
          <Image src="/logo-black.png" alt="FV" width={22} height={22} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <p className="font-semibold tracking-widest" style={{ color: "#fff", fontSize: "11px", letterSpacing: "0.18em" }}>FISAYOVIEW</p>
          <p style={{ color: "#444", fontSize: "10px", marginTop: "1px" }}>Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "12px 12px" }}>
        <ul style={{ display: "flex", flexDirection: "column", gap: "2px", listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link href={href} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px",
                  background: active ? "#151515" : "transparent",
                  color: active ? "#fff" : "#555",
                  textDecoration: "none", fontSize: "13px", fontWeight: active ? 500 : 400,
                  transition: "color 0.15s, background 0.15s",
                }}>
                  <span style={{ fontSize: "14px", opacity: active ? 1 : 0.7, width: "16px", textAlign: "center" }}>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid #161616" }}>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "10px", width: "100%",
          padding: "10px 12px", borderRadius: "8px", background: "transparent",
          color: "#444", border: "none", cursor: "pointer", fontSize: "13px",
          transition: "color 0.15s, background 0.15s",
        }}
          onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = "#ef4444"; b.style.background = "#1a0a0a"; }}
          onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "#444"; b.style.background = "transparent"; }}>
          <span style={{ fontSize: "14px", width: "16px", textAlign: "center" }}>↩</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
