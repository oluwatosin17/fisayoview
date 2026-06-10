import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionDetail } from "@/lib/data";
import ProjectDetail from "./ProjectDetail";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ img?: string }>;
}

const BASE_URL = "https://fisayoview.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCollectionDetail(Number(id));
  if (!detail) return {};

  const title = detail.name;
  const category = (detail.category as string) || "Photography";
  const description = `${detail.name} — ${category.charAt(0) + category.slice(1).toLowerCase()} photography session by Fisayo Obalana. View the full gallery on FISAYOVIEW.`;
  const ogImage = detail.coverUrl || `https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto,w_1200/fisayoview/seyi/IMG_9296`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | FISAYOVIEW`,
      description,
      url: `${BASE_URL}/projects/${id}`,
      images: [{ url: ogImage, width: 800, height: 1000, alt: `${detail.name} by Fisayo Obalana` }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FISAYOVIEW`,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `${BASE_URL}/projects/${id}` },
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

  return (
    <ProjectDetail
      project={clientProject}
      images={imageUrls}
      initialIndex={initialIndex}
    />
  );
}
