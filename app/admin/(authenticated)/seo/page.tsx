import { supabaseAdmin } from "@/lib/supabase";
import { SeoForm } from "./SeoForm";

async function getSiteSettings() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").limit(1).single();
  return data;
}

export default async function SeoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>SEO</h1>
        <p className="text-sm" style={{ color: "#808080" }}>
          Manage metadata and Open Graph settings
        </p>
      </div>
      <SeoForm initialData={settings} />
    </div>
  );
}
