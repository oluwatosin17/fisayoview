import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { DbCollection } from "@/lib/supabase";

interface CollectionWithCount extends DbCollection {
  image_count: number;
  description: string | null;
  featured: boolean;
}

async function getStats() {
  const admin = supabaseAdmin();

  const [collectionsRes, imagesRes, recentRes] = await Promise.all([
    admin.from("collections").select("id, category"),
    admin.from("images").select("id", { count: "exact", head: true }),
    admin
      .from("collections")
      .select("*, images(count)")
      .order("id", { ascending: false })
      .limit(5),
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
  }));

  return {
    totalCollections: collections.length,
    totalImages,
    categoryBreakdown,
    recentCollections: recent,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  BIRTHDAY: "#f59e0b",
  WEDDING: "#ec4899",
  GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6",
  ESSENCE: "#14b8a6",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#808080" }}>
          Overview of your photography portfolio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <StatCard label="Collections" value={stats.totalCollections} />
        <StatCard label="Total Images" value={stats.totalImages} />
        {Object.entries(stats.categoryBreakdown).slice(0, 2).map(([cat, count]) => (
          <StatCard key={cat} label={cat} value={count} color={CATEGORY_COLORS[cat]} />
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 2 && (
        <div
          className="rounded-xl p-5 mb-8"
          style={{ background: "#111", border: "1px solid #1a1a1a" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "#808080" }}>
            Collections by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <span
                key={cat}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: `${CATEGORY_COLORS[cat] ?? "#666"}22`,
                  color: CATEGORY_COLORS[cat] ?? "#666",
                  border: `1px solid ${CATEGORY_COLORS[cat] ?? "#666"}44`,
                }}
              >
                {cat} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent collections */}
      <div
        className="rounded-xl mb-8"
        style={{ background: "#111", border: "1px solid #1a1a1a" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <h2 className="text-sm font-medium" style={{ color: "#fff" }}>
            Recent Collections
          </h2>
          <Link
            href="/admin/collections"
            className="text-xs"
            style={{ color: "#808080" }}
          >
            View all →
          </Link>
        </div>
        <ul>
          {stats.recentCollections.map((col, i) => (
            <li
              key={col.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
              style={{
                borderBottom:
                  i < stats.recentCollections.length - 1 ? "1px solid #1a1a1a" : "none",
              }}
            >
              <div>
                <span style={{ color: "#fff" }}>{col.name}</span>
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${CATEGORY_COLORS[col.category] ?? "#666"}22`,
                    color: CATEGORY_COLORS[col.category] ?? "#666",
                  }}
                >
                  {col.category}
                </span>
              </div>
              <span style={{ color: "#808080" }}>{col.image_count} images</span>
            </li>
          ))}
          {stats.recentCollections.length === 0 && (
            <li className="px-5 py-6 text-center text-sm" style={{ color: "#808080" }}>
              No collections yet.
            </li>
          )}
        </ul>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity"
          style={{ background: "#fff", color: "#000" }}
        >
          + New Collection
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}
        >
          View Site ↗
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "#fff",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#111", border: "1px solid #1a1a1a" }}
    >
      <p className="text-xs mb-2" style={{ color: "#808080" }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
