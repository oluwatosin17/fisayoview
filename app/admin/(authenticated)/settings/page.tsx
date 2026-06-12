import { supabaseAdmin } from "@/lib/supabase";
import { SettingsForm } from "./SettingsForm";
import { PageHeader } from "@/components/admin/PageHeader";

async function getSiteSettings() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").limit(1).single();
  return data;
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="admin-page" style={{ maxWidth: "800px" }}>
      <PageHeader title="Settings" description="Site-wide contact details and social links" />
      <SettingsForm initialData={settings} />
    </div>
  );
}
