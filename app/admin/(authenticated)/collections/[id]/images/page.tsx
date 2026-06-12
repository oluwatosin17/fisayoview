import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { ImagesClient } from "./ImagesClient";

interface Props { params: Promise<{ id: string }> }

export default async function ImagesPage({ params }: Props) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const [{ data: collection, error }, { data: images }, { data: allCollections }] = await Promise.all([
    admin.from("collections").select("*").eq("id", Number(id)).single(),
    admin.from("images").select("*").eq("collection_id", Number(id)).order("sort_order", { ascending: true }),
    admin.from("collections").select("id, name").order("display_order"),
  ]);

  if (error || !collection) notFound();

  return (
    <div className="admin-page" style={{ maxWidth: "1300px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px" }}>
        <Link href="/admin/collections" style={{ color: "#484848", textDecoration: "none" }}>Collections</Link>
        <span style={{ color: "#242424" }}>/</span>
        <Link href={`/admin/collections/${id}`} style={{ color: "#484848", textDecoration: "none" }}>{collection.name}</Link>
        <span style={{ color: "#242424" }}>/</span>
        <span style={{ color: "#fff" }}>Images</span>
      </div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{collection.name}</h1>
        <p style={{ fontSize: "14px", color: "#555", margin: "8px 0 0" }}>{(images ?? []).length} image{(images ?? []).length !== 1 ? "s" : ""} · {collection.category}</p>
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
