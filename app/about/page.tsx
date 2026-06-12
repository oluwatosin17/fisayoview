export const dynamic = "force-dynamic";

import { getSiteSettings } from "@/lib/data";
import AboutPageClient from "./AboutPageClient";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <AboutPageClient
      heading={settings?.about_heading}
      bio={settings?.about_text}
      portraits={settings?.about_portraits}
      whatsapp={settings?.whatsapp}
      email={settings?.email}
    />
  );
}
