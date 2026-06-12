import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CollectionForm } from "@/components/admin/CollectionForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: collection, error } = await admin
    .from("collections")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !collection) notFound();

  return (
    <div className="admin-page" style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Edit Collection
        </h1>
        <p style={{ fontSize: "14px", color: "#555", margin: "8px 0 0" }}>
          {collection.name}
        </p>
      </div>
      <CollectionForm
        mode="edit"
        collectionId={collection.id}
        initialData={{
          name: collection.name,
          slug: collection.slug,
          category: collection.category,
          description: collection.description ?? "",
          featured: collection.featured ?? false,
          display_order: collection.display_order,
          cover_cloudinary_id: collection.cover_cloudinary_id ?? "",
          cover_url: collection.cover_url ?? "",
        }}
      />
    </div>
  );
}
