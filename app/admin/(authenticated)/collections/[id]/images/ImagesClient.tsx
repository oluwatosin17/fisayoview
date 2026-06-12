"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbImage } from "@/lib/supabase";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { SortableImageGrid } from "@/components/admin/SortableImageGrid";
import { ImagePreviewModal } from "@/components/admin/ImagePreviewModal";
import { useToast } from "@/components/admin/Toast";

interface Collection { id: number; name: string; }
interface AllCollection { id: number; name: string; }

interface ImagesClientProps {
  collectionId: number;
  collectionName: string;
  initialImages: DbImage[];
  coverCloudinaryId: string | null;
  collectionSlug: string;
  allCollections: AllCollection[];
}

export function ImagesClient({
  collectionId,
  collectionName,
  initialImages,
  coverCloudinaryId: initialCoverId,
  collectionSlug,
  allCollections,
}: ImagesClientProps) {
  const toast = useToast();
  const router = useRouter();
  const [images, setImages] = useState<DbImage[]>(initialImages);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [coverId, setCoverId] = useState<string | null>(initialCoverId);
  const [saving, setSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [moveTarget, setMoveTarget] = useState<number | null>(null);

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
      if (!res.ok) { toast.error("Failed to save image record"); return; }
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

  function selectAll() {
    setSelectedIds(new Set(images.map((i) => i.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete image"); return; }
    setImages((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("Image deleted");
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} image${selectedIds.size !== 1 ? "s" : ""}?`)) return;
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

  async function handleBulkMove() {
    if (!moveTarget || selectedIds.size === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/admin/images/${id}/move`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collection_id: moveTarget }),
          })
        )
      );
      setImages((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      setMoveTarget(null);
      toast.success(`Moved to collection`);
      router.refresh();
    } catch {
      toast.error("Move failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetCover(image: DbImage) {
    const res = await fetch(`/api/admin/collections/${collectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_cloudinary_id: image.cloudinary_public_id, cover_url: image.url }),
    });
    if (!res.ok) { toast.error("Failed to set cover"); return; }
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
        body: JSON.stringify({ items: newImages.map((img, idx) => ({ id: img.id, sort_order: idx })) }),
      });
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  const allSelected = images.length > 0 && selectedIds.size === images.length;
  const otherCollections = allCollections.filter((c) => c.id !== collectionId);

  return (
    <div className="flex flex-col gap-8">
      {/* Upload */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#555" }}>Upload Images</h2>
        <UploadDropzone folder={collectionSlug} onUploaded={handleUploaded} />
      </div>

      {/* Images */}
      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button type="button" onClick={allSelected ? deselectAll : selectAll}
            className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
            style={{ background: "#111", color: "#808080", border: "1px solid #1a1a1a" }}>
            {allSelected ? "Deselect all" : "Select all"}
          </button>

          {selectedIds.size > 0 && (
            <>
              <button type="button" onClick={handleBulkDelete} disabled={saving}
                className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
                style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                Delete {selectedIds.size}
              </button>

              {otherCollections.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={moveTarget ?? ""}
                    onChange={(e) => setMoveTarget(e.target.value ? Number(e.target.value) : null)}
                    className="text-xs rounded-lg px-2 py-1.5 cursor-pointer"
                    style={{ background: "#111", color: "#808080", border: "1px solid #1a1a1a", outline: "none" }}
                  >
                    <option value="">Move to…</option>
                    {otherCollections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {moveTarget && (
                    <button type="button" onClick={handleBulkMove} disabled={saving}
                      className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
                      style={{ background: "#3b82f622", color: "#3b82f6", border: "1px solid #3b82f644" }}>
                      Move {selectedIds.size}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <span className="ml-auto text-xs" style={{ color: "#444" }}>
            {images.length} image{images.length !== 1 ? "s" : ""}
            {saving && " · Saving…"}
          </span>
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl flex flex-col items-center justify-center py-24 text-center" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
            <p className="text-5xl mb-4" style={{ color: "#222" }}>◫</p>
            <p className="text-sm font-medium mb-1" style={{ color: "#555" }}>No images yet</p>
            <p className="text-xs" style={{ color: "#333" }}>Upload some above to get started</p>
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
            onPreview={(idx) => setPreviewIndex(idx)}
          />
        )}
      </div>

      {/* Preview modal */}
      {previewIndex !== null && (
        <ImagePreviewModal
          images={images}
          activeIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
          coverId={coverId}
          onSetCover={handleSetCover}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
