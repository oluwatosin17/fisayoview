import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import type { DbCollection } from "@/lib/supabase";

interface CollectionWithCount extends DbCollection {
  image_count: number;
  description: string | null;
  featured: boolean;
}

const CAT_COLORS: Record<string, string> = {
  BIRTHDAY: "#f59e0b", WEDDING: "#ec4899", GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6", ESSENCE: "#14b8a6", LAW: "#6366f1",
};

const CONTACT_STATUS_COLORS: Record<string, string> = {
  NEW: "#60a5fa", CONTACTED: "#fbbf24", IN_PROGRESS: "#c4b5fd", BOOKED: "#4ade80", CLOSED: "#9ca3af",
};

async function getStats() {
  const admin = supabaseAdmin();
  const [colRes, imgRes, recentRes, featuredRes, settingsRes, contactsRes] = await Promise.all([
    admin.from("collections").select("id, category"),
    admin.from("images").select("id", { count: "exact", head: true }),
    admin.from("collections").select("*, images(count)").order("id", { ascending: false }).limit(8),
    admin.from("collections").select("id,name,cover_url,category").eq("featured", true).order("display_order").limit(6),
    admin.from("site_settings").select("id,about_portraits").limit(1).single(),
    admin.from("contact_submissions").select("id,name,email,status,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const collections = colRes.data ?? [];
  const totalImages = imgRes.count ?? 0;
  const catBreakdown: Record<string, number> = {};
  for (const col of collections) {
    const cat = col.category ?? "OTHER";
    catBreakdown[cat] = (catBreakdown[cat] ?? 0) + 1;
  }

  const recent: CollectionWithCount[] = (recentRes.data ?? []).map((c) => ({
    ...c,
    image_count: Array.isArray(c.images) ? (c.images[0] as { count: number })?.count ?? 0 : 0,
    description: c.description ?? null,
    featured: c.featured ?? false,
  }));

  const portraits = settingsRes.data?.about_portraits ?? [];
  const contacts = contactsRes.data ?? [];

  return {
    totalCollections: collections.length,
    totalImages,
    catBreakdown,
    totalCats: Object.keys(catBreakdown).length,
    recentCollections: recent,
    featuredCollections: featuredRes.data ?? [],
    portraitCount: Array.isArray(portraits) ? portraits.length : 0,
    recentContacts: contacts,
    newContacts: contacts.filter((c: { status: string }) => c.status === "NEW").length,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const maxCat = Math.max(...Object.values(stats.catBreakdown), 1);

  return (
    <div style={{ padding: "48px 48px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Dashboard</h1>
        <p style={{ fontSize: "14px", color: "#555", margin: "8px 0 0" }}>FISAYOVIEW portfolio overview</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
        <StatCard label="Collections" value={stats.totalCollections} icon="◫" accent="#fff" />
        <StatCard label="Images" value={stats.totalImages} icon="⬡" accent="#a78bfa" />
        <StatCard label="Categories" value={stats.totalCats} icon="⊞" accent="#f59e0b" />
        <StatCard label="Portraits" value={stats.portraitCount} icon="◉" accent="#14b8a6" />
      </div>

      {/* Two-column main content */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", marginBottom: "32px" }}>

        {/* Categories breakdown */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: "0 0 16px" }}>
            By Category
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(stats.catBreakdown).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
              const color = CAT_COLORS[cat] ?? "#666";
              const pct = Math.round((count / maxCat) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color }}>{cat}</span>
                    <span style={{ fontSize: "12px", color: "#444" }}>{count}</span>
                  </div>
                  <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent collections */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #111" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: 0 }}>Recent Collections</p>
            <Link href="/admin/collections" style={{ fontSize: "12px", color: "#444", textDecoration: "none" }}>View all →</Link>
          </div>
          <div>
            {stats.recentCollections.map((col, i) => {
              const color = CAT_COLORS[col.category] ?? "#666";
              return (
                <Link key={col.id} href={`/admin/collections/${col.id}/images`}
                  className="hover:bg-[#111] transition-colors" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: i < stats.recentCollections.length - 1 ? "1px solid #111" : "none", textDecoration: "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "6px", overflow: "hidden", background: "#1a1a1a", flexShrink: 0 }}>
                    {col.cover_url
                      ? <Image src={col.cover_url} alt={col.name} width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 12 }}>◫</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.name}</p>
                      {col.featured && <span style={{ fontSize: "10px", color: "#555", background: "#1a1a1a", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>FEATURED</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: "#444", margin: "2px 0 0" }}>{col.image_count} images</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "5px", background: `${color}18`, color, flexShrink: 0 }}>{col.category}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured collections strip */}
      {stats.featuredCollections.length > 0 && (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: 0 }}>Featured on Homepage</p>
            <Link href="/admin/homepage" style={{ fontSize: "12px", color: "#444", textDecoration: "none", padding: "6px 12px", border: "1px solid #1a1a1a", borderRadius: "8px" }}>Manage →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
            {stats.featuredCollections.map((col) => (
              <Link key={col.id} href={`/admin/collections/${col.id}/images`} style={{ textDecoration: "none" }}>
                <div style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "1", background: "#1a1a1a" }}>
                  {col.cover_url
                    ? <Image src={col.cover_url} alt={col.name} width={120} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}>◫</div>
                  }
                </div>
                <p style={{ fontSize: "11px", color: "#555", marginTop: "8px", marginBottom: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent enquiries */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #111" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: 0 }}>Recent Enquiries</p>
            {stats.newContacts > 0 && (
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "#3b82f618", color: "#60a5fa" }}>
                {stats.newContacts} new
              </span>
            )}
          </div>
          <Link href="/admin/contacts" style={{ fontSize: "12px", color: "#444", textDecoration: "none" }}>View all →</Link>
        </div>
        {stats.recentContacts.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "#383838", fontSize: "13px" }}>No enquiries yet</div>
        ) : (
          stats.recentContacts.map((c: { id: number; name: string; email: string; status: string; created_at: string }, i: number) => {
            const color = CONTACT_STATUS_COLORS[c.status] ?? "#60a5fa";
            return (
              <Link key={c.id} href={`/admin/contacts/${c.id}`}
                className="hover:bg-[#111] transition-colors" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: i < stats.recentContacts.length - 1 ? "1px solid #111" : "none", textDecoration: "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: "12px", color: "#444", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</p>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "5px", background: `${color}18`, color, flexShrink: 0 }}>
                  {c.status.replace("_", " ")}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link href="/admin/collections/new" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          + New Collection
        </Link>
        <Link href="/admin/homepage" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#111", color: "#fff", border: "1px solid #222", textDecoration: "none" }}>
          Homepage Builder
        </Link>
        <Link href="/admin/contacts" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#111", color: "#fff", border: "1px solid #222", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          Contacts
          {stats.newContacts > 0 && <span style={{ fontSize: "11px", fontWeight: 600, background: "#3b82f630", color: "#60a5fa", padding: "1px 7px", borderRadius: "999px" }}>{stats.newContacts}</span>}
        </Link>
        <Link href="/admin/about" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#111", color: "#fff", border: "1px solid #222", textDecoration: "none" }}>
          Edit About
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#111", color: "#666", border: "1px solid #1a1a1a", textDecoration: "none" }}>
          View Site ↗
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent: string }) {
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: 0 }}>{label}</p>
        <span style={{ fontSize: "15px", color: accent, opacity: 0.6 }}>{icon}</span>
      </div>
      <p style={{ fontSize: "36px", fontWeight: 600, color: accent, letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
