"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
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

function SortablePortrait({
  portrait,
  onDelete,
}: {
  portrait: Portrait;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: portrait.cloudinary_public_id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        flexShrink: 0,
      }}
      className="group"
    >
      <div
        {...attributes}
        {...listeners}
        className="rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ width: 100, height: 130, background: "#1a1a1a" }}
      >
        <Image
          src={portrait.url}
          alt="Portrait"
          width={100}
          height={130}
          style={{ objectFit: "cover", width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(portrait.cloudinary_public_id)}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "#ef4444", color: "#fff", border: "none" }}
      >
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
        const newPortrait: Portrait = {
          cloudinary_public_id: data.public_id,
          url: data.secure_url,
          sort_order: portraits.length,
        };
        setPortraits((prev) => [...prev, newPortrait]);
      }
      toast.success("Portrait uploaded");
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [portraits.length, toast]);

  function deletePortrait(id: string) {
    setPortraits((prev) => prev.filter((p) => p.cloudinary_public_id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const normalizedPortraits = portraits.map((p, i) => ({ ...p, sort_order: i }));
        const res = await fetch("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            about_heading: heading,
            about_text: text,
            instagram_url: instagram,
            whatsapp,
            email,
            about_portraits: normalizedPortraits,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("About page saved");
      } catch {
        toast.error("Failed to save");
      }
    });
  }

  const inputStyle = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = { color: "#555", fontSize: "11px", fontWeight: 600 as const, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">

      {/* Portrait gallery */}
      <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label style={labelStyle}>Portrait Gallery</label>
            <p className="text-xs mt-0.5" style={{ color: "#444" }}>Drag to reorder · {portraits.length} photo{portraits.length !== 1 ? "s" : ""}</p>
          </div>
          <label
            htmlFor="portrait-upload"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
            style={{ background: "#fff", color: "#000", opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? "Uploading…" : "+ Add Photo"}
          </label>
          <input
            id="portrait-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePortraitUpload}
            disabled={uploading}
          />
        </div>

        {portraits.length === 0 ? (
          <div className="rounded-xl flex items-center justify-center py-10 text-center" style={{ background: "#0a0a0a", border: "1px dashed #222" }}>
            <p className="text-xs" style={{ color: "#444" }}>No portraits yet — upload to get started</p>
          </div>
        ) : !mounted ? (
          <div className="flex gap-3 flex-wrap">
            {portraits.map((p) => (
              <div key={p.cloudinary_public_id} className="rounded-xl overflow-hidden" style={{ width: 100, height: 130, background: "#1a1a1a", flexShrink: 0 }}>
                <Image src={p.url} alt="Portrait" width={100} height={130} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={portraits.map((p) => p.cloudinary_public_id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-3 flex-wrap">
                {portraits.map((p) => (
                  <SortablePortrait key={p.cloudinary_public_id} portrait={p} onDelete={deletePortrait} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Bio fields */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Heading</label>
          <input value={heading} onChange={(e) => setHeading(e.target.value)} style={inputStyle} placeholder="FISAYOVIEW" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={labelStyle}>Biography</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            placeholder="Tell your story…"
          />
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1a1a1a" }} />

      {/* Contact fields */}
      <div className="flex flex-col gap-5">
        <p style={labelStyle}>Contact Details</p>
        <div className="flex flex-col gap-2">
          <label style={{ ...labelStyle, textTransform: "none" as const, letterSpacing: 0 }}>Instagram URL</label>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={inputStyle} placeholder="https://instagram.com/fisayoview" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={{ ...labelStyle, textTransform: "none" as const, letterSpacing: 0 }}>WhatsApp Number</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inputStyle} placeholder="+2348000000000" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={{ ...labelStyle, textTransform: "none" as const, letterSpacing: 0 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="bookfisayoview@gmail.com" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || uploading}
        className="rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer self-start"
        style={{ background: "#fff", color: "#000", opacity: (isPending || uploading) ? 0.7 : 1 }}
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
