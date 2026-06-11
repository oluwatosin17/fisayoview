import { supabaseAdmin } from "@/lib/supabase";
import { SettingsForm } from "./SettingsForm";

async function getSiteSettings() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").limit(1).single();
  return data;
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>Settings</h1>
        <p className="text-sm" style={{ color: "#808080" }}>Site-wide configuration</p>
      </div>
      <SettingsForm initialData={settings} />
    </div>
  );
}
