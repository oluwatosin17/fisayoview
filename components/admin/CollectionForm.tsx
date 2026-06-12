"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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

const BUILT_IN_CATEGORIES = ["BIRTHDAY", "WEDDING", "GRADUATION", "STUDIO", "ESSENCE", "LAW"];

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
  const [category, setCategory] = useState(initialData?.category ?? "BIRTHDAY");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);
  const [coverCloudinaryId, setCoverCloudinaryId] = useState(initialData?.cover_cloudinary_id ?? "");
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>(BUILT_IN_CATEGORIES);

  // Load all categories currently in use from collections
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((cats: string[]) => {
        const merged = Array.from(new Set([...BUILT_IN_CATEGORIES, ...cats])).sort();
        setExistingCategories(merged);
        // If editing and the current category isn't in built-ins, it's custom
        if (initialData?.category && !BUILT_IN_CATEGORIES.includes(initialData.category)) {
          setIsCustom(true);
          setCustomCategory(initialData.category);
        }
      })
      .catch(() => {});
  }, [initialData?.category]);

  const activeCategory = isCustom ? customCategory.toUpperCase().trim() : category;

  function handleNameChange(val: string) {
    setName(val);
    if (!initialData?.slug) setSlug(slugify(val));
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
    if (!activeCategory) { toast.error("Please enter a category"); return; }

    const payload = {
      name,
      slug,
      category: activeCategory,
      description,
      featured,
      display_order: displayOrder,
      cover_cloudinary_id: coverCloudinaryId || null,
      cover_url: coverUrl || null,
    };

    startTransition(async () => {
      try {
        const url = mode === "create" ? "/api/admin/collections" : `/api/admin/collections/${collectionId}`;
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
        const res = await fetch(`/api/admin/collections/${collectionId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Collection deleted");
        router.push("/admin/collections");
        router.refresh();
      } catch {
        toast.error("Failed to delete collection");
      }
    });
  }

  const inp: React.CSSProperties = {
    background: "#0d0d0d",
    border: "1px solid #222",
    color: "#fff",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    lineHeight: "1.5",
  };
  const lbl: React.CSSProperties = { color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "640px" }}>

      {/* Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Collection Name *</label>
        <input required value={name} onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. SARAH BIRTHDAY 2025" style={inp} />
      </div>

      {/* Slug */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>URL Slug *</label>
        <input required value={slug} onChange={(e) => setSlug(e.target.value)}
          placeholder="sarah-birthday-2025" style={inp} />
        <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>Auto-generated from name. Used in the URL: /projects/{slug || "…"}</p>
      </div>

      {/* Category */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Category *</label>

        {/* Toggle: pick existing or create new */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
          <button type="button" onClick={() => setIsCustom(false)}
            style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: 600,
              background: !isCustom ? "#fff" : "#0d0d0d", color: !isCustom ? "#000" : "#666",
              border: `1px solid ${!isCustom ? "#fff" : "#222"}` }}>
            Existing
          </button>
          <button type="button" onClick={() => setIsCustom(true)}
            style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: 600,
              background: isCustom ? "#fff" : "#0d0d0d", color: isCustom ? "#000" : "#666",
              border: `1px solid ${isCustom ? "#fff" : "#222"}` }}>
            + New Category
          </button>
        </div>

        {isCustom ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. PORTRAIT, MATERNITY, CORPORATE…" style={inp}
              autoFocus />
            <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>Will be saved as: {customCategory.toUpperCase().trim() || "…"}</p>
          </div>
        ) : (
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ ...inp, appearance: "auto" as const }}>
            {existingCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Description <span style={{ color: "#333", fontWeight: 400 }}>(optional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} placeholder="A short description of this collection…"
          style={{ ...inp, resize: "vertical" }} />
      </div>

      {/* Sort order + Featured in a row */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={lbl}>Sort Order</label>
          <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))}
            style={{ ...inp, width: "100px" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "4px" }}>
          <button type="button" role="switch" aria-checked={featured} onClick={() => setFeatured((v) => !v)}
            style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px",
              borderRadius: "999px", background: featured ? "#22c55e" : "#2a2a2a", border: "none", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: "3px", left: featured ? "21px" : "3px",
              width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </button>
          <span style={{ fontSize: "14px", color: "#fff" }}>Featured on homepage</span>
        </div>
      </div>

      {/* Cover image */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Cover Image</label>
        <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: "12px",
          padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
          {coverUrl ? (
            <div style={{ width: 80, height: 80, borderRadius: "8px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
              <Image src={coverUrl} alt="Cover" fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "8px", background: "#1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "24px", color: "#333" }}>◫</div>
          )}
          <div>
            <label htmlFor="cover-upload" style={{ display: "inline-block", padding: "8px 16px",
              borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
              background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}>
              {uploading ? "Uploading…" : coverUrl ? "Change cover" : "Upload cover"}
            </label>
            <input id="cover-upload" type="file" accept="image/*" style={{ display: "none" }}
              onChange={handleCoverUpload} disabled={uploading} />
            {coverUrl && <p style={{ fontSize: "12px", color: "#555", marginTop: "6px" }}>Cover set ✓</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "8px" }}>
        <button type="submit" disabled={isPending || uploading}
          style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
            background: "#fff", color: "#000", border: "none", cursor: "pointer",
            opacity: (isPending || uploading) ? 0.7 : 1 }}>
          {isPending ? "Saving…" : mode === "create" ? "Create Collection" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()}
          style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px",
            background: "#111", color: "#666", border: "1px solid #222", cursor: "pointer" }}>
          Cancel
        </button>

        {mode === "edit" && (
          <div style={{ marginLeft: "auto" }}>
            {showDeleteConfirm ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#666" }}>Are you sure?</span>
                <button type="button" onClick={handleDelete} disabled={isPending}
                  style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                  Yes, delete
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px",
                    background: "#111", color: "#555", border: "1px solid #222", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "13px",
                  background: "transparent", color: "#ef4444", border: "none", cursor: "pointer" }}>
                Delete collection
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
