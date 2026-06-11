"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "./Toast";

export interface CollectionFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  featured: boolean;
  display_order: number;
  cover_cloudinary_id: string;
  cover_url: string;
}

interface CollectionFormProps {
  initialData?: Partial<CollectionFormData>;
  collectionId?: number;
  mode: "create" | "edit";
}

const CATEGORIES = ["BIRTHDAY", "WEDDING", "GRADUATION", "STUDIO", "ESSENCE"];

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CollectionForm({ initialData, collectionId, mode }: CollectionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "STUDIO");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);
  const [coverCloudinaryId, setCoverCloudinaryId] = useState(
    initialData?.cover_cloudinary_id ?? ""
  );
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!initialData?.slug) {
      setSlug(slugify(val));
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "covers");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCoverCloudinaryId(data.public_id);
      setCoverUrl(data.secure_url);
      toast.success("Cover uploaded");
    } catch {
      toast.error("Cover upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      slug,
      category,
      description,
      featured,
      display_order: displayOrder,
      cover_cloudinary_id: coverCloudinaryId || null,
      cover_url: coverUrl || null,
    };

    startTransition(async () => {
      try {
        const url =
          mode === "create"
            ? "/api/admin/collections"
            : `/api/admin/collections/${collectionId}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Request failed");
        }

        toast.success(mode === "create" ? "Collection created" : "Collection saved");
        router.push("/admin/collections");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/collections/${collectionId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Collection deleted");
        router.push("/admin/collections");
        router.refresh();
      } catch {
        toast.error("Failed to delete collection");
      }
    });
  }

  const inputStyle = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const labelStyle = { color: "#808080", fontSize: "12px", fontWeight: 500 };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Collection Name</label>
        <input
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Spring Wedding 2024"
          style={inputStyle}
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="spring-wedding-2024"
          style={inputStyle}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...inputStyle, appearance: "auto" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A short description of this collection…"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Sort order */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Sort Order</label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          style={{ ...inputStyle, width: "120px" }}
        />
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={featured}
          onClick={() => setFeatured((v) => !v)}
          className="relative inline-flex w-10 h-5 rounded-full transition-colors cursor-pointer"
          style={{ background: featured ? "#22c55e" : "#333", flexShrink: 0 }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            style={{ transform: featured ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
        <span className="text-sm" style={{ color: "#fff" }}>
          Featured collection
        </span>
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Cover Image</label>
        <div
          className="rounded-xl overflow-hidden flex items-center gap-4 p-4"
          style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
        >
          {coverUrl ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={coverUrl} alt="Cover" fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: "#1a1a1a", color: "#333" }}
            >
              ◫
            </div>
          )}
          <div>
            <label
              htmlFor="cover-upload"
              className="inline-block rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}
            >
              {uploading ? "Uploading…" : coverUrl ? "Change cover" : "Upload cover"}
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploading}
            />
            {coverUrl && (
              <p className="text-xs mt-1.5" style={{ color: "#808080" }}>
                Cover uploaded
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-opacity"
          style={{ background: "#fff", color: "#000", opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? "Saving…" : mode === "create" ? "Create Collection" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer"
          style={{ background: "#1a1a1a", color: "#808080", border: "1px solid #1a1a1a" }}
        >
          Cancel
        </button>
        {mode === "edit" && (
          <div className="ml-auto">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#808080" }}>
                  Are you sure?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                  style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg px-3 py-2 text-xs cursor-pointer"
                  style={{ background: "#1a1a1a", color: "#808080" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg px-4 py-2.5 text-sm cursor-pointer"
                style={{ color: "#ef4444", background: "transparent" }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
