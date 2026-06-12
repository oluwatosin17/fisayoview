export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionDetail } from "@/lib/data";
import ProjectDetail from "./ProjectDetail";
import { BASE_URL } from "@/app/layout";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ img?: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  BIRTHDAY:   "Birthday",
  WEDDING:    "Wedding",
  GRADUATION: "Graduation",
  STUDIO:     "Studio",
  ESSENCE:    "Portrait",
  LAW:        "Law Graduation",
};

function buildDescription(name: string, category: string, description?: string | null) {
  const catLabel = CATEGORY_LABELS[category] ?? category.charAt(0) + category.slice(1).toLowerCase();
  if (description?.trim()) {
    return `${description.trim()} — Photographed by Fisayo Obalana (FISAYOVIEW) in Lagos, Nigeria.`;
  }
  return `${name} — ${catLabel} photography session by Fisayo Obalana in Lagos, Nigeria. Discover the full gallery on FISAYOVIEW.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCollectionDetail(Number(id));
  if (!detail) return {};

  const title = detail.name;
  const category = (detail.category as string) ?? "PHOTOGRAPHY";
  const description = buildDescription(title, category, (detail as { description?: string | null }).description);
  const ogImage = detail.coverUrl ?? `https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto,w_1200/fisayoview/seyi/IMG_9296`;
  const catLabel = CATEGORY_LABELS[category] ?? category;
  const pageUrl = `${BASE_URL}/projects/${id}`;

  return {
    title,
    description,
    keywords: [
      detail.name,
      `${catLabel} photographer Lagos`,
      `${catLabel} photography Lagos`,
      `${catLabel} photographer Nigeria`,
      "FISAYOVIEW", "Fisayo Obalana", "photographer Lagos",
    ],
    openGraph: {
      title: `${title} | FISAYOVIEW`,
      description,
      url: pageUrl,
      images: [{ url: ogImage, width: 800, height: 1000, alt: `${detail.name} — ${catLabel} photography by Fisayo Obalana, Lagos` }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FISAYOVIEW`,
      description,
      images: [ogImage],
    },
    alternates: { canonical: pageUrl },
  };
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { img } = await searchParams;

  const detail = await getCollectionDetail(Number(id));
  if (!detail) notFound();

  const imageUrls = detail.images.map((i) => i.url);
  const imageFilenames = detail.images.map((i) => i.filename);

  const initialIndex =
    img && imageFilenames.length > 0
      ? Math.max(0, imageFilenames.indexOf(decodeURIComponent(img)))
      : 0;

  const clientProject = {
    id: detail.id,
    name: detail.name,
    caption: detail.caption,
    fallbackImage: detail.coverUrl,
  };

  const pageUrl = `${BASE_URL}/projects/${id}`;
  const category = (detail.category as string) ?? "PHOTOGRAPHY";
  const catLabel = CATEGORY_LABELS[category] ?? category;
  const description = buildDescription(detail.name, category, (detail as { description?: string | null }).description);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "FISAYOVIEW", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: catLabel, item: `${BASE_URL}/?category=${category}` },
          { "@type": "ListItem", position: 3, name: detail.name, item: pageUrl },
        ],
      },
      // ImageGallery
      {
        "@type": "ImageGallery",
        "@id": `${pageUrl}/#gallery`,
        name: `${detail.name} — ${catLabel} Photography by FISAYOVIEW`,
        description,
        url: pageUrl,
        author: { "@type": "Person", name: "Fisayo Obalana", url: BASE_URL },
        image: imageUrls.slice(0, 10).map((url, i) => ({
          "@type": "ImageObject",
          url,
          contentUrl: url,
          name: `${detail.name} — Photo ${i + 1} by Fisayo Obalana`,
          description: `${catLabel} photography by Fisayo Obalana (FISAYOVIEW) in Lagos, Nigeria`,
          creator: { "@type": "Person", name: "Fisayo Obalana" },
          copyrightHolder: { "@type": "Organization", name: "FISAYOVIEW" },
        })),
        locationCreated: {
          "@type": "Place",
          name: "Lagos, Nigeria",
          address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProjectDetail
        project={clientProject}
        images={imageUrls}
        initialIndex={initialIndex}
      />
    </>
  );
}
