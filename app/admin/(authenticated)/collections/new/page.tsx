import { CollectionForm } from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div style={{ padding: "48px 48px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          New Collection
        </h1>
        <p style={{ fontSize: "14px", color: "#555", margin: "8px 0 0" }}>
          Create a new photography collection
        </p>
      </div>
      <CollectionForm mode="create" />
    </div>
  );
}
