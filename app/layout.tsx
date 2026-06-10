import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavigationRestorer from "./NavigationRestorer";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://fisayoview.vercel.app";
const OG_IMAGE = "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto,w_1200/fisayoview/seyi/IMG_9296";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "FISAYOVIEW — Photography by Fisayo Obalana",
    template: "%s | FISAYOVIEW",
  },
  description:
    "FISAYOVIEW is the photography portfolio of Fisayo Obalana — capturing birthdays, weddings, graduations, studio sessions and portraits across Nigeria with intention and detail.",
  keywords: [
    "fisayoview", "Fisayo Obalana", "photographer Nigeria", "portrait photographer Lagos",
    "birthday photographer Nigeria", "wedding photographer Lagos", "graduation photographer",
    "studio photography Nigeria", "Nigerian photographer", "fisayo photography",
  ],
  authors: [{ name: "Fisayo Obalana", url: BASE_URL }],
  creator: "Fisayo Obalana",
  publisher: "FISAYOVIEW",

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "FISAYOVIEW",
    title: "FISAYOVIEW — Photography by Fisayo Obalana",
    description:
      "Portrait, birthday, wedding & graduation photography across Nigeria. Every frame tells a story.",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "FISAYOVIEW — Photography by Fisayo Obalana" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "FISAYOVIEW — Photography by Fisayo Obalana",
    description: "Portrait, birthday, wedding & graduation photography across Nigeria.",
    images: [OG_IMAGE],
    creator: "@fisayoview",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },

  alternates: { canonical: BASE_URL },

  icons: {
    icon: [
      { url: "/logo-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo-white.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/logo-black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="bg-black text-white min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: "FISAYOVIEW",
                  description: "Photography portfolio by Fisayo Obalana",
                  publisher: { "@id": `${BASE_URL}/#person` },
                },
                {
                  "@type": ["Person", "ProfessionalService"],
                  "@id": `${BASE_URL}/#person`,
                  name: "Fisayo Obalana",
                  jobTitle: "Photographer",
                  url: BASE_URL,
                  email: "bookfisayoview@gmail.com",
                  telephone: "+2348136404224",
                  sameAs: ["https://www.instagram.com/fisayoview/"],
                  address: { "@type": "PostalAddress", addressCountry: "NG" },
                  knowsAbout: ["Portrait Photography", "Birthday Photography", "Wedding Photography", "Graduation Photography"],
                },
              ],
            }),
          }}
        />
        <NavigationRestorer />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
