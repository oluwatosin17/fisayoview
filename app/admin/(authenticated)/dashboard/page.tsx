import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import type { DbCollection } from "@/lib/supabase";

interface CollectionWithCount extends DbCollection {
  image_count: number;
  description: string | null;
  featured: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  BIRTHDAY: "#f59e0b",
  WEDDING: "#ec4899",
  GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6",
  ESSENCE: "#14b8a6",
  LAW: "#6366f1",
};

async function getStats() {
  const admin = supabaseAdmin();

  const [collectionsRes, imagesRes, recentRes, featuredRes, settingsRes] = await Promise.all([
    admin.from("collections").select("id, category"),
    admin.from("images").select("id", { count: "exact", head: true }),
    admin.from("collections").select("*, images(count)").order("id", { ascending: false }).limit(8),
    admin.from("collections").select("id,name,cover_url,category").eq("featured", true).order("display_order").limit(6),
    admin.from("site_settings").select("id,about_heading,about_text,instagram_url,email,about_portraits").limit(1).single(),
  ]);

  const collections = collectionsRes.data ?? [];
  const totalImages = imagesRes.count ?? 0;

  const categoryBreakdown: Record<string, number> = {};
  for (const col of collections) {
    const cat = col.category ?? "UNKNOWN";
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
  }

  const recent: CollectionWithCount[] = (recentRes.data ?? []).map((c) => ({
    ...c,
    image_count: Array.isArray(c.images) ? (c.images[0] as { count: number })?.count ?? 0 : 0,
    description: c.description ?? null,
    featured: c.featured ?? false,
  }));

  const portraits = settingsRes.data?.about_portraits ?? [];

  return {
    totalCollections: collections.length,
    totalImages,
    categoryBreakdown,
    recentCollections: recent,
    featuredCollections: featuredRes.data ?? [],
    cmsConfigured: !!(settingsRes.data?.about_text),
    portraitCount: Array.isArray(portraits) ? portraits.length : 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const totalCats = Object.keys(stats.categoryBreakdown).length;
  const maxCatCount = Math.max(...Object.values(stats.categoryBreakdown), 1);

  return (
    <div style={{ padding: "48px 56px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#555" }}>
          FISAYOVIEW portfolio management
        </p>
      </div>

      {/* Hero stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="Collections" value={stats.totalCollections} suffix="" icon="◫" accent="#fff" />
        <StatCard label="Total Images" value={stats.totalImages} suffix="" icon="⬡" accent="#a78bfa" />
        <StatCard label="Categories" value={totalCats} suffix="" icon="⊞" accent="#f59e0b" />
        <StatCard label="About Portraits" value={stats.portraitCount} suffix="" icon="◉" accent="#14b8a6" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Category breakdown — 1 col */}
        <div className="rounded-2xl p-6 lg:col-span-1" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#555" }}>By Category</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(stats.categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const color = CATEGORY_COLORS[cat] ?? "#666";
                const pct = Math.round((count / maxCatCount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color }}>{cat}</span>
                      <span className="text-xs" style={{ color: "#555" }}>{count}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "#1a1a1a" }}>
                      <div className="rounded-full h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent collections — 2 col */}
        <div className="rounded-2xl lg:col-span-2" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Recent Collections</h2>
            <Link href="/admin/collections" className="text-xs" style={{ color: "#555" }}>View all →</Link>
          </div>
          <ul>
            {stats.recentCollections.map((col, i) => {
              const color = CATEGORY_COLORS[col.category] ?? "#666";
              return (
                <li key={col.id} style={{ borderBottom: i < stats.recentCollections.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <Link href={`/admin/collections/${col.id}/images`} className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-[#161616]" style={{ textDecoration: "none" }}>
                    {/* Thumbnail */}
                    <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 36, height: 36, background: "#1a1a1a" }}>
                      {col.cover_url ? (
                        <Image src={col.cover_url} alt={col.name} width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: "#333", fontSize: 12 }}>◫</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: "#fff" }}>{col.name}</span>
                        {col.featured && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#ffffff11", color: "#888", fontSize: "10px" }}>FEATURED</span>}
                      </div>
                      <span className="text-xs" style={{ color: "#444" }}>{col.image_count} images</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ background: `${color}18`, color }}>{col.category}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Featured collections */}
      {stats.featuredCollections.length > 0 && (
        <div className="rounded-2xl mt-6 p-6" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Featured on Homepage</h2>
            <Link href="/admin/homepage" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#1a1a1a", color: "#888", border: "1px solid #222" }}>
              Manage →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {stats.featuredCollections.map((col) => (
              <Link key={col.id} href={`/admin/collections/${col.id}/images`} style={{ textDecoration: "none" }}>
                <div className="rounded-xl overflow-hidden aspect-square" style={{ background: "#1a1a1a" }}>
                  {col.cover_url ? (
                    <Image src={col.cover_url} alt={col.name} width={120} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: "#333" }}>◫</div>
                  )}
                </div>
                <p className="text-xs mt-1.5 truncate" style={{ color: "#555" }}>{col.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/admin/collections/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          style={{ background: "#fff", color: "#000" }}>
          + New Collection
        </Link>
        <Link href="/admin/homepage"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #252525" }}>
          Homepage Builder
        </Link>
        <Link href="/admin/about"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #252525" }}>
          Edit About
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #252525" }}>
          View Site ↗
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; suffix: string; icon: string; accent: string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#555" }}>{label}</p>
        <span style={{ fontSize: "16px", color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <p className="text-3xl font-semibold tracking-tight" style={{ color: accent, letterSpacing: "-0.03em" }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
