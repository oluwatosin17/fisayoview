import { notFound } from "next/navigation";
import { getCollectionDetail } from "@/lib/data";
import ProjectDetail from "./ProjectDetail";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ img?: string }>;
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { img } = await searchParams;

  const detail = await getCollectionDetail(Number(id));
  if (!detail) notFound();

  const imageUrls = detail.images.map((i) => i.url);
  const imageFilenames = detail.images.map((i) => i.filename);

  // Find the index of the clicked image by filename
  const initialIndex =
    img && imageFilenames.length > 0
      ? Math.max(0, imageFilenames.indexOf(decodeURIComponent(img)))
      : 0;

  const clientProject = {
    id: detail.id,
    name: detail.name,
    // handle intentionally omitted — back label always uses name
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
