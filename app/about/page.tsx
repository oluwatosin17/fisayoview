export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import AboutPageClient from "./AboutPageClient";
import { BASE_URL } from "@/app/layout";

const OG_IMAGE = "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto,w_1200/fisayoview/about/IMG_9296";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "Fisayo Obalana — photographer behind FISAYOVIEW, Lagos Nigeria" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Fisayo Obalana — FISAYOVIEW",
    description: "Meet the photographer behind FISAYOVIEW. Lagos-based, detail-obsessed, capturing life's most meaningful moments.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "FISAYOVIEW", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "About", item: `${BASE_URL}/about` },
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": `${BASE_URL}/about/#profilepage`,
      url: `${BASE_URL}/about`,
      name: "About Fisayo Obalana — FISAYOVIEW",
      description:
        "Meet Fisayo Obalana, the professional photographer behind FISAYOVIEW, based in Lagos, Nigeria. Specialising in birthday, wedding, graduation, portrait, and editorial photography.",
      mainEntity: {
        "@type": "Person",
        "@id": `${BASE_URL}/#person`,
        name: "Fisayo Obalana",
        alternateName: "FISAYOVIEW",
        jobTitle: "Professional Photographer",
        description:
          "Fisayo Obalana is the lead photographer and creative director behind FISAYOVIEW. Based in Lagos, Nigeria, Fisayo specialises in birthday photography, wedding photography, graduation photography, studio portraits, and editorial photography. Every frame is built on making subjects feel truly seen — not just photographed.",
        url: BASE_URL,
        image: OG_IMAGE,
        email: "bookfisayoview@gmail.com",
        telephone: "+2348136404224",
        sameAs: ["https://www.instagram.com/fisayoview/", BASE_URL],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lagos",
          addressRegion: "Lagos State",
          addressCountry: "NG",
        },
        knowsAbout: [
          "Portrait Photography",
          "Birthday Photography",
          "Wedding Photography",
          "Graduation Photography",
          "Studio Photography",
          "Editorial Photography",
          "Event Photography",
        ],
      },
    },
  ],
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutPageClient
        heading={settings?.about_heading}
        bio={settings?.about_text}
        portraits={settings?.about_portraits}
        whatsapp={settings?.whatsapp}
        email={settings?.email}
      />
    </>
  );
}
