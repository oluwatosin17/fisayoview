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
const lbl: React.CSSProperties = {
  color: "#555",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "640px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>SEO Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} placeholder="FISAYOVIEW — Photography by Fisayo Obalana" />
        <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>{title.length}/60 characters</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Meta Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
          style={{ ...inp, resize: "vertical" }} placeholder="Short description for search engines…" />
        <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>{description.length}/160 characters</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Keywords <span style={{ color: "#333", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
        <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3}
          style={{ ...inp, resize: "vertical" }} placeholder="photography, wedding, portrait, Lagos…" />
      </div>

      {/* OG Image */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Open Graph Image <span style={{ color: "#333", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>1200 × 630</span></label>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", background: "#0d0d0d", border: "1px solid #222" }}>
          {ogImage ? (
            <div style={{ position: "relative", width: "140px", height: "74px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
              <Image src={ogImage} alt="OG" fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ width: "140px", height: "74px", borderRadius: "8px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#333", flexShrink: 0 }}>
              1200 × 630
            </div>
          )}
          <label htmlFor="og-upload"
            style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: "#1a1a1a", color: "#fff", border: "1px solid #2a2a2a", display: "inline-block" }}>
            {uploading ? "Uploading…" : "Upload image"}
          </label>
          <input id="og-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleOgUpload} disabled={uploading} />
        </div>
      </div>

      <button type="submit" disabled={isPending}
        style={{ padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer", opacity: isPending ? 0.7 : 1, alignSelf: "flex-start" }}>
        {isPending ? "Saving…" : "Save SEO"}
      </button>
    </form>
  );
}
