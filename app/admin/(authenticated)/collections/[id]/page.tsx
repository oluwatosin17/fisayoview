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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>
          Edit Collection
        </h1>
        <p className="text-sm" style={{ color: "#808080" }}>
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
