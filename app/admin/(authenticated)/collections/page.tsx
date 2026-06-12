import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { CollectionCard } from "@/components/admin/CollectionCard";
import type { DbCollection } from "@/lib/supabase";

type CollectionWithCount = DbCollection & {
  image_count: number;
  description: string | null;
  featured: boolean;
};

async function getCollections(): Promise<CollectionWithCount[]> {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("collections")
    .select("*, images(count)")
    .order("display_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((c) => ({
    ...c,
    image_count: Array.isArray(c.images)
      ? (c.images[0] as { count: number })?.count ?? 0
      : 0,
    description: c.description ?? null,
    featured: c.featured ?? false,
  }));
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div style={{ padding: "48px 56px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>
            Collections
          </h1>
          <p className="text-sm" style={{ color: "#808080" }}>
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{ background: "#fff", color: "#000" }}
        >
          + New Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: "#111", border: "1px solid #1a1a1a" }}
        >
          <p className="text-4xl mb-4">◫</p>
          <p className="font-medium mb-2" style={{ color: "#fff" }}>
            No collections yet
          </p>
          <p className="text-sm mb-6" style={{ color: "#808080" }}>
            Create your first collection to get started
          </p>
          <Link
            href="/admin/collections/new"
            className="rounded-lg px-4 py-2.5 text-sm font-medium"
            style={{ background: "#fff", color: "#000" }}
          >
            + New Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
