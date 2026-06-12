import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ImagesClient } from "./ImagesClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ImagesPage({ params }: Props) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const [{ data: collection, error: colError }, { data: images }, { data: allCollections }] =
    await Promise.all([
      admin.from("collections").select("*").eq("id", Number(id)).single(),
      admin.from("images").select("*").eq("collection_id", Number(id)).order("sort_order", { ascending: true }),
      admin.from("collections").select("id, name").order("display_order"),
    ]);

  if (colError || !collection) notFound();

  return (
    <div style={{ padding: "48px 56px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "#555" }}>
          <a href="/admin/collections" style={{ color: "#555", textDecoration: "none" }}>Collections</a>
          <span style={{ color: "#333" }}>/</span>
          <a href={`/admin/collections/${id}`} style={{ color: "#555", textDecoration: "none" }}>{collection.name}</a>
          <span style={{ color: "#333" }}>/</span>
          <span style={{ color: "#fff" }}>Images</span>
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
          {collection.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#444" }}>
          {(images ?? []).length} image{(images ?? []).length !== 1 ? "s" : ""} · {collection.category}
        </p>
      </div>
      <ImagesClient
        collectionId={Number(id)}
        collectionName={collection.name}
        initialImages={images ?? []}
        coverCloudinaryId={collection.cover_cloudinary_id ?? null}
        collectionSlug={collection.slug}
        allCollections={allCollections ?? []}
      />
    </div>
  );
}
