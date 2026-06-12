import { supabaseAdmin } from "@/lib/supabase";
import { AboutForm } from "./AboutForm";

async function getSiteSettings() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").limit(1).single();
  return data;
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div style={{ padding: "48px 56px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
          About
        </h1>
        <p className="text-sm" style={{ color: "#555" }}>
          Edit your biography, portrait gallery, and contact details
        </p>
      </div>
      <AboutForm initialData={settings} />
    </div>
  );
}
