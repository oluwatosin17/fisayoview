"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbImage } from "@/lib/supabase";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { SortableImageGrid } from "@/components/admin/SortableImageGrid";
import { useToast } from "@/components/admin/Toast";

interface ImagesClientProps {
  collectionId: number;
  initialImages: DbImage[];
  coverCloudinaryId: string | null;
  collectionSlug: string;
}

export function ImagesClient({
  collectionId,
  initialImages,
  coverCloudinaryId: initialCoverId,
  collectionSlug,
}: ImagesClientProps) {
  const toast = useToast();
  const router = useRouter();
  const [images, setImages] = useState<DbImage[]>(initialImages);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [coverId, setCoverId] = useState<string | null>(initialCoverId);
  const [saving, setSaving] = useState(false);

  const handleUploaded = useCallback(
    async (result: { public_id: string; secure_url: string; width: number; height: number }) => {
      const res = await fetch(`/api/admin/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: collectionId,
          cloudinary_public_id: result.public_id,
          url: result.secure_url,
          filename: result.public_id.split("/").pop() ?? result.public_id,
          width: result.width,
          height: result.height,
          sort_order: images.length,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to save image record");
        return;
      }

      const newImage: DbImage = await res.json();
      setImages((prev) => [...prev, newImage]);
      toast.success("Image added");
    },
    [collectionId, images.length, toast]
  );

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete image");
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("Image deleted");
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/images/${id}`, { method: "DELETE" })));
      setImages((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} images deleted`);
    } catch {
      toast.error("Some deletes failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetCover(image: DbImage) {
    const res = await fetch(`/api/admin/collections/${collectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cover_cloudinary_id: image.cloudinary_public_id,
        cover_url: image.url,
      }),
    });
    if (!res.ok) {
      toast.error("Failed to set cover");
      return;
    }
    setCoverId(image.cloudinary_public_id);
    toast.success("Cover updated");
    router.refresh();
  }

  async function handleReorder(newImages: DbImage[]) {
    setImages(newImages);
    setSaving(true);
    try {
      await fetch(`/api/admin/images/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newImages.map((img, idx) => ({ id: img.id, sort_order: idx })),
        }),
      });
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  const allSelected = images.length > 0 && selectedIds.size === images.length;

  return (
    <div className="flex flex-col gap-8">
      {/* Upload */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111", border: "1px solid #1a1a1a" }}
      >
        <h2 className="text-sm font-medium mb-4" style={{ color: "#fff" }}>
          Upload Images
        </h2>
        <UploadDropzone folder={collectionSlug} onUploaded={handleUploaded} />
      </div>

      {/* Images grid */}
      <div>
        {/* Toolbar */}
        {images.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() =>
                setSelectedIds(allSelected ? new Set() : new Set(images.map((i) => i.id)))
              }
              className="text-xs cursor-pointer"
              style={{ color: "#808080" }}
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={saving}
                className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
                style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}
              >
                Delete {selectedIds.size} selected
              </button>
            )}
            <span className="ml-auto text-xs" style={{ color: "#808080" }}>
              {images.length} image{images.length !== 1 ? "s" : ""}
              {saving && " · Saving…"}
            </span>
          </div>
        )}

        {images.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-20 text-center"
            style={{ background: "#111", border: "1px solid #1a1a1a" }}
          >
            <p className="text-4xl mb-4" style={{ color: "#333" }}>◫</p>
            <p className="text-sm" style={{ color: "#808080" }}>
              No images yet. Upload some above.
            </p>
          </div>
        ) : (
          <SortableImageGrid
            images={images}
            selectedIds={selectedIds}
            coverId={coverId}
            onReorder={handleReorder}
            onToggleSelect={toggleSelect}
            onDelete={handleDelete}
            onSetCover={handleSetCover}
          />
        )}
      </div>
    </div>
  );
}
