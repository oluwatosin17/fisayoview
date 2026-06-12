export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import AboutPageClient from "./AboutPageClient";
import { BASE_URL } from "@/app/layout";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Fisayo Obalana — the photographer behind FISAYOVIEW. A Lagos-based professional photographer specialising in birthdays, weddings, graduations, studio portraits, and editorial photography across Nigeria.",
  keywords: [
    "about FISAYOVIEW", "Fisayo Obalana photographer", "Lagos photographer about",
    "Nigerian photographer biography", "professional photographer Lagos",
  ],
  openGraph: {
    title: "About Fisayo Obalana — FISAYOVIEW",
    description:
      "Meet the photographer behind FISAYOVIEW. Lagos-based, detail-obsessed, capturing life's most meaningful moments.",
    url: `${BASE_URL}/about`,
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

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
