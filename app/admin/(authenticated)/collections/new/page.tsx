import { CollectionForm } from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div style={{ padding: "48px 56px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#fff" }}>
          New Collection
        </h1>
        <p className="text-sm" style={{ color: "#808080" }}>
          Create a new photography collection
        </p>
      </div>
      <CollectionForm mode="create" />
    </div>
  );
}
