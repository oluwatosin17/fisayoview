import { supabaseAdmin } from "@/lib/supabase";
import HomepageClient from "./HomepageClient";

async function getCollections() {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("collections")
    .select("id, name, slug, category, cover_url, display_order, featured")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export default async function HomepagePage() {
  const collections = await getCollections();
  return (
    <div style={{ padding: "48px 56px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
          Homepage Builder
        </h1>
        <p className="text-sm" style={{ color: "#555" }}>
          Toggle featured collections and drag to reorder them on the homepage.
        </p>
      </div>
      <HomepageClient initialCollections={collections} />
    </div>
  );
}
