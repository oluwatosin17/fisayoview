import { supabaseAdmin } from "@/lib/supabase";
import HomepageClient from "./HomepageClient";
import { PageHeader } from "@/components/admin/PageHeader";

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
    <div style={{ padding: "48px 48px", maxWidth: "900px", margin: "0 auto" }}>
      <PageHeader title="Homepage Builder" description="Toggle featured collections and drag to reorder them on the homepage." />
      <HomepageClient initialCollections={collections} />
    </div>
  );
}
