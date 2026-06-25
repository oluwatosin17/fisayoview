import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavigationRestorer from "./NavigationRestorer";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const BASE_URL = "https://fisayoview.com";
const OG_IMAGE = "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto,w_1200/fisayoview/seyi/IMG_9296";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "FISAYOVIEW — Photographer in Lagos, Nigeria",
    template: "%s | FISAYOVIEW",
  },
  description:
    "FISAYOVIEW is Fisayo Obalana — a professional photographer in Lagos, Nigeria. Specialising in birthdays, weddings, graduations, studio portraits and editorial photography across Lekki, Victoria Island, Ikoyi, Ikeja and all of Lagos. Book now.",
  keywords: [
    // Brand
    "fisayoview", "Fisayo Obalana", "FISAYOVIEW photography",
    // Core service keywords
    "photographer in Lagos", "Lagos photographer",
    "best photographer in Lagos", "top photographer in Lagos",
    "professional photographer Lagos Nigeria",
    // Wedding
    "wedding photographer Lagos", "best wedding photographer Lagos",
    "wedding photography Nigeria", "wedding photographer Victoria Island",
    "wedding photographer Lekki", "wedding photographer Ikoyi",
    // Birthday
    "birthday photographer Lagos", "birthday photography Lagos",
    "birthday photographer Nigeria", "birthday photoshoot Lagos",
    // Graduation
    "graduation photographer Lagos", "graduation photography Nigeria",
    "graduation photoshoot Lagos",
    // Portrait / Studio
    "portrait photographer Lagos", "studio photographer Lagos",
    "studio photography Lagos", "portrait photography Nigeria",
    "professional headshots Lagos",
    // Local areas
    "photographer Lekki", "photographer Victoria Island",
    "photographer Ikoyi", "photographer Ikeja",
    "photographer Yaba", "photographer Surulere",
    // General
    "Nigerian photographer", "photography Nigeria",
    "event photographer Lagos", "book photographer Lagos",
  ],
  authors: [{ name: "Fisayo Obalana", url: BASE_URL }],
  creator: "Fisayo Obalana",
  publisher: "FISAYOVIEW",

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "FISAYOVIEW",
    title: "FISAYOVIEW — Photographer in Lagos, Nigeria",
    description:
      "Professional photographer in Lagos specialising in birthdays, weddings, graduations, studio portraits and editorial photography. Serving Lekki, Victoria Island, Ikoyi, Ikeja and all of Lagos.",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "FISAYOVIEW — Photography by Fisayo Obalana, Lagos Nigeria" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "FISAYOVIEW — Photographer in Lagos, Nigeria",
    description: "Birthday, wedding, graduation & portrait photography in Lagos, Nigeria. Book Fisayo Obalana.",
    images: [OG_IMAGE],
    creator: "@fisayoview",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: { canonical: BASE_URL },

  icons: {
    icon: [
      { url: "/favicon-32.png",  sizes: "32x32",   type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192",  type: "image/png" },
      { url: "/favicon.png",     sizes: "any",      type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },

  manifest: "/manifest.json",

  verification: {
    google: "5J2pJjyfn-2s1wMrk_hh4TqUG8fJNlj-zelGLcywXBU",
  },
};

/** Comprehensive structured data for Google + AI search engines */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // WebSite with search action
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "FISAYOVIEW",
      description: "Photography portfolio and booking for Fisayo Obalana — professional photographer in Lagos, Nigeria.",
      publisher: { "@id": `${BASE_URL}/#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },

    // Person
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Fisayo Obalana",
      jobTitle: "Professional Photographer",
      url: BASE_URL,
      image: OG_IMAGE,
      email: "bookfisayoview@gmail.com",
      telephone: "+2348136404224",
      sameAs: [
        "https://www.instagram.com/fisayoview/",
        BASE_URL,
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lagos",
        addressRegion: "Lagos State",
        addressCountry: "NG",
      },
      knowsAbout: [
        "Portrait Photography", "Birthday Photography", "Wedding Photography",
        "Graduation Photography", "Studio Photography", "Editorial Photography",
        "Event Photography",
      ],
    },

    // LocalBusiness / ProfessionalService
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${BASE_URL}/#business`,
      name: "FISAYOVIEW",
      alternateName: "Fisayo Obalana Photography",
      description:
        "FISAYOVIEW is a professional photography studio in Lagos, Nigeria run by Fisayo Obalana. We specialise in birthday photography, wedding photography, graduation photography, studio portraits, and editorial shoots across Lagos — including Lekki, Victoria Island, Ikoyi, Ikeja, Yaba, and Surulere.",
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.png`,
      image: OG_IMAGE,
      email: "bookfisayoview@gmail.com",
      telephone: "+2348136404224",
      priceRange: "₦₦",
      currenciesAccepted: "NGN",
      paymentAccepted: "Bank Transfer, Cash",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lagos",
        addressRegion: "Lagos State",
        addressCountry: "NG",
      },
      areaServed: [
        { "@type": "City", name: "Lagos", "@id": "https://www.wikidata.org/wiki/Q8673" },
        { "@type": "Place", name: "Lekki, Lagos" },
        { "@type": "Place", name: "Victoria Island, Lagos" },
        { "@type": "Place", name: "Ikoyi, Lagos" },
        { "@type": "Place", name: "Ikeja, Lagos" },
        { "@type": "Place", name: "Yaba, Lagos" },
        { "@type": "Place", name: "Surulere, Lagos" },
        { "@type": "Country", name: "Nigeria" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Photography Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Birthday Photography", description: "Professional birthday photoshoots in Lagos" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wedding Photography", description: "Wedding and pre-wedding photography in Lagos" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Graduation Photography", description: "Graduation photoshoots in Lagos" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Studio Photography", description: "Professional studio portrait sessions in Lagos" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Portrait Photography", description: "Individual and group portrait photography in Lagos" } },
        ],
      },
      sameAs: [
        "https://www.instagram.com/fisayoview/",
      ],
    },

    // FAQPage — helps AI assistants surface direct answers
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is FISAYOVIEW?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FISAYOVIEW is the photography brand of Fisayo Obalana, a professional photographer based in Lagos, Nigeria. Fisayo specialises in birthday photography, wedding photography, graduation photography, studio portraits, and editorial shoots.",
          },
        },
        {
          "@type": "Question",
          name: "Where is FISAYOVIEW based?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FISAYOVIEW is based in Lagos, Nigeria and serves clients across Lekki, Victoria Island, Ikoyi, Ikeja, Yaba, Surulere, and surrounding areas. Travel to other cities in Nigeria is available on request.",
          },
        },
        {
          "@type": "Question",
          name: "What photography services does FISAYOVIEW offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FISAYOVIEW offers birthday photography, wedding photography, graduation photography, studio portrait sessions, and editorial photography. Every session is approached with intention, creativity, and attention to detail.",
          },
        },
        {
          "@type": "Question",
          name: "How do I book FISAYOVIEW for a photoshoot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can book FISAYOVIEW by sending a message via WhatsApp at +2348136404224 or emailing bookfisayoview@gmail.com. You can also fill in the contact form on the website.",
          },
        },
        {
          "@type": "Question",
          name: "Is FISAYOVIEW the best photographer in Lagos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FISAYOVIEW — Fisayo Obalana — is widely regarded as one of Lagos's leading portrait and event photographers, known for a signature style that combines natural light, rich tones, and authentic storytelling. Browse the portfolio at fisayoview.com to see the work.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className={`${geistSans.variable} antialiased`}>
      <head>
        {/* Extra favicon/PWA links not covered by Next.js metadata */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-black text-white min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <NavigationRestorer />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
