import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ImagesClient } from "./ImagesClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ImagesPage({ params }: Props) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const [{ data: collection, error: colError }, { data: images, error: imgError }] =
    await Promise.all([
      admin.from("collections").select("*").eq("id", Number(id)).single(),
      admin
        .from("images")
        .select("*")
        .eq("collection_id", Number(id))
        .order("sort_order", { ascending: true }),
    ]);

  if (colError || !collection) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "#808080" }}>
          <a href="/admin/collections" style={{ color: "#808080" }}>Collections</a>
          <span>/</span>
          <a href={`/admin/collections/${id}`} style={{ color: "#808080" }}>{collection.name}</a>
          <span>/</span>
          <span style={{ color: "#fff" }}>Images</span>
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "#fff" }}>
          Images
        </h1>
      </div>
      <ImagesClient
        collectionId={Number(id)}
        initialImages={images ?? []}
        coverCloudinaryId={collection.cover_cloudinary_id ?? null}
        collectionSlug={collection.slug}
      />
    </div>
  );
}
