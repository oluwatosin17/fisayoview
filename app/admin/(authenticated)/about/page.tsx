import { supabaseAdmin } from "@/lib/supabase";
import { AboutForm } from "./AboutForm";
import { PageHeader } from "@/components/admin/PageHeader";

async function getSiteSettings() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").limit(1).single();
  return data;
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <div style={{ padding: "48px 48px", maxWidth: "800px", margin: "0 auto" }}>
      <PageHeader title="About" description="Edit your biography, portrait gallery, and contact details" />
      <AboutForm initialData={settings} />
    </div>
  );
}
