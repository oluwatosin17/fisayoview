"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useToast } from "@/components/admin/Toast";

interface SiteSettings {
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image?: string | null;
}

export function SeoForm({ initialData }: { initialData: SiteSettings | null }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.seo_title ?? "");
  const [description, setDescription] = useState(initialData?.seo_description ?? "");
  const [keywords, setKeywords] = useState(initialData?.seo_keywords ?? "");
  const [ogImage, setOgImage] = useState(initialData?.og_image ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleOgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "og");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setOgImage(data.secure_url);
      toast.success("OG image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seo_title: title, seo_description: description, seo_keywords: keywords, og_image: ogImage }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("SEO settings saved");
      } catch {
        toast.error("Failed to save");
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
  const labelStyle = { color: "#808080", fontSize: "12px", fontWeight: 500 as const };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>SEO Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Fisayoview Photography" />
        <p className="text-xs" style={{ color: "#808080" }}>{title.length}/60 chars</p>
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Meta Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Short description for search engines…" />
        <p className="text-xs" style={{ color: "#808080" }}>{description.length}/160 chars</p>
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Keywords (comma-separated)</label>
        <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="photography, wedding, portrait…" />
      </div>

      {/* OG Image */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Open Graph Image (1200×630)</label>
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
          {ogImage ? (
            <div className="relative w-32 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={ogImage} alt="OG" fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div className="w-32 h-16 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "#1a1a1a", color: "#333" }}>1200×630</div>
          )}
          <label htmlFor="og-upload" className="inline-block rounded-lg px-4 py-2 text-sm font-medium cursor-pointer" style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}>
            {uploading ? "Uploading…" : "Upload image"}
          </label>
          <input id="og-upload" type="file" accept="image/*" className="hidden" onChange={handleOgUpload} disabled={uploading} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer self-start" style={{ background: "#fff", color: "#000", opacity: isPending ? 0.7 : 1 }}>
        {isPending ? "Saving…" : "Save SEO"}
      </button>
    </form>
  );
}
