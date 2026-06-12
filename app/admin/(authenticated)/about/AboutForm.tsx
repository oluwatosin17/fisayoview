"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/admin/Toast";
import type { Portrait } from "@/lib/data";

interface SiteSettings {
  about_heading?: string | null;
  about_text?: string | null;
  about_portraits?: Portrait[] | null;
  instagram_url?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

// ── Shared style tokens ────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  background: "#080808", border: "1px solid #1e1e1e", color: "#fff",
  borderRadius: "10px", padding: "12px 16px", fontSize: "14px",
  width: "100%", outline: "none", lineHeight: "1.6",
};
const lbl: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#555",
};
const section: React.CSSProperties = {
  background: "#0d0d0d", border: "1px solid #1a1a1a",
  borderRadius: "16px", padding: "28px",
};

function SortablePortrait({ portrait, onDelete }: { portrait: Portrait; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: portrait.cloudinary_public_id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative", flexShrink: 0 }} className="group">
      <div {...attributes} {...listeners} style={{ width: 96, height: 124, borderRadius: "10px", overflow: "hidden", background: "#1a1a1a", cursor: "grab" }}>
        <Image src={portrait.url} alt="Portrait" width={96} height={124} style={{ objectFit: "cover", width: "100%", height: "100%", pointerEvents: "none" }} />
      </div>
      <button type="button" onClick={() => onDelete(portrait.cloudinary_public_id)}
        style={{ position: "absolute", top: "6px", right: "6px", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", cursor: "pointer", background: "#ef4444", color: "#fff", border: "none", opacity: 0, transition: "opacity 0.15s" }}
        className="group-hover:opacity-100"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0"; }}>
        ✕
      </button>
    </div>
  );
}

export function AboutForm({ initialData }: { initialData: SiteSettings | null }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [heading, setHeading] = useState(initialData?.about_heading ?? "");
  const [text, setText] = useState(initialData?.about_text ?? "");
  const [instagram, setInstagram] = useState(initialData?.instagram_url ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [portraits, setPortraits] = useState<Portrait[]>(
    (initialData?.about_portraits ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = portraits.findIndex((p) => p.cloudinary_public_id === active.id);
    const newIdx = portraits.findIndex((p) => p.cloudinary_public_id === over.id);
    setPortraits(arrayMove(portraits, oldIdx, newIdx));
  }

  const handlePortraitUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "about");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) { toast.error(`Upload failed: ${file.name}`); continue; }
        const data = await res.json();
        setPortraits((prev) => [...prev, { cloudinary_public_id: data.public_id, url: data.secure_url, sort_order: prev.length }]);
      }
      toast.success("Portrait uploaded");
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [toast]);

  function deletePortrait(id: string) {
    setPortraits((prev) => prev.filter((p) => p.cloudinary_public_id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            about_heading: heading, about_text: text,
            instagram_url: instagram, whatsapp, email,
            about_portraits: portraits.map((p, i) => ({ ...p, sort_order: i })),
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Saved");
      } catch {
        toast.error("Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>

      {/* Portrait gallery */}
      <div style={section}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ ...lbl, margin: "0 0 4px" }}>Portrait Gallery</p>
            <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>
              Drag to reorder · {portraits.length} photo{portraits.length !== 1 ? "s" : ""}
            </p>
          </div>
          <label htmlFor="portrait-upload"
            style={{ padding: "9px 18px", borderRadius: "9px", fontSize: "13px", fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", background: uploading ? "#222" : "#fff", color: uploading ? "#666" : "#000", display: "inline-block", flexShrink: 0 }}>
            {uploading ? "Uploading…" : "+ Add Photo"}
          </label>
          <input id="portrait-upload" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePortraitUpload} disabled={uploading} />
        </div>

        {portraits.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", background: "#080808", border: "1px dashed #1e1e1e", borderRadius: "10px" }}>
            <p style={{ fontSize: "13px", color: "#383838", margin: 0 }}>No portraits yet — click + Add Photo to upload</p>
          </div>
        ) : !mounted ? (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {portraits.map((p) => (
              <div key={p.cloudinary_public_id} style={{ width: 96, height: 124, borderRadius: "10px", overflow: "hidden", background: "#1a1a1a", flexShrink: 0 }}>
                <Image src={p.url} alt="Portrait" width={96} height={124} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={portraits.map((p) => p.cloudinary_public_id)} strategy={horizontalListSortingStrategy}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {portraits.map((p) => <SortablePortrait key={p.cloudinary_public_id} portrait={p} onDelete={deletePortrait} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Bio fields */}
      <div style={section}>
        <p style={{ ...lbl, margin: "0 0 20px" }}>Biography</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={lbl}>Heading</label>
            <input value={heading} onChange={(e) => setHeading(e.target.value)} style={inp} placeholder="FISAYOVIEW" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={lbl}>Biography Text</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} style={{ ...inp, resize: "vertical" }} placeholder="Tell your story…" />
          </div>
        </div>
      </div>

      {/* Contact details */}
      <div style={section}>
        <p style={{ ...lbl, margin: "0 0 20px" }}>Contact Details</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={lbl}>Instagram URL</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={inp} placeholder="https://instagram.com/fisayoview" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={lbl}>WhatsApp Number</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inp} placeholder="+2348000000000" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={lbl}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="bookfisayoview@gmail.com" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isPending || uploading}
        style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer", opacity: (isPending || uploading) ? 0.7 : 1, alignSelf: "flex-start" }}>
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
