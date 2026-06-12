import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { CollectionCard } from "@/components/admin/CollectionCard";
import { PageHeader } from "@/components/admin/PageHeader";
import type { DbCollection } from "@/lib/supabase";

type CollectionWithCount = DbCollection & { image_count: number; description: string | null; featured: boolean };

async function getCollections(): Promise<CollectionWithCount[]> {
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("collections").select("*, images(count)").order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    image_count: Array.isArray(c.images) ? (c.images[0] as { count: number })?.count ?? 0 : 0,
    description: c.description ?? null,
    featured: c.featured ?? false,
  }));
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <div className="admin-page" style={{ maxWidth: "1400px" }}>
      <PageHeader
        title="Collections"
        description={`${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/admin/collections/new"
            style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", textDecoration: "none" }}>
            + New Collection
          </Link>
        }
      />
      {collections.length === 0 ? (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", color: "#1a1a1a", margin: "0 0 16px" }}>◫</p>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "#555", margin: "0 0 24px" }}>No collections yet</p>
          <Link href="/admin/collections/new" style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", textDecoration: "none" }}>
            + New Collection
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
          {collections.map((col) => <CollectionCard key={col.id} collection={col} />)}
        </div>
      )}
    </div>
  );
}
