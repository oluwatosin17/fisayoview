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
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-6"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <div
          className="flex items-center justify-center rounded"
          style={{ background: "#fff", width: 32, height: 32, flexShrink: 0 }}
        >
          <Image
            src="/logo-black.png"
            alt="FV"
            width={22}
            height={22}
            style={{ objectFit: "contain" }}
          />
        </div>
        <span
          className="font-semibold tracking-widest text-xs"
          style={{ color: "#fff", letterSpacing: "0.15em" }}
        >
          FISAYOVIEW
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-3">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors"
                  style={{
                    background: active ? "#1a1a1a" : "transparent",
                    color: active ? "#fff" : "#808080",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: "15px", opacity: 0.8 }}>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid #1a1a1a" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer"
          style={{ color: "#808080", background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            (e.currentTarget as HTMLButtonElement).style.background = "#1a0a0a";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#808080";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <span style={{ fontSize: "15px" }}>↩</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
