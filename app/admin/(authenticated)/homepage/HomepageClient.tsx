"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/admin/Toast";

const CATEGORY_COLORS: Record<string, string> = {
  BIRTHDAY: "#f59e0b", WEDDING: "#ec4899", GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6", ESSENCE: "#14b8a6", LAW: "#6366f1",
};

interface Collection {
  id: number;
  name: string;
  slug: string;
  category: string;
  cover_url: string | null;
  display_order: number;
  featured: boolean;
}

function SortableRow({ col, onToggleFeatured }: { col: Collection; onToggleFeatured: (id: number, val: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.id });
  const color = CATEGORY_COLORS[col.category] ?? "#666";

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 24px",
        borderBottom: "1px solid #111",
      }}
    >
      {/* Drag handle */}
      <button type="button" {...attributes} {...listeners}
        style={{ color: "#2a2a2a", fontSize: "18px", lineHeight: 1, padding: "4px 6px", border: "none", background: "none", cursor: "grab", flexShrink: 0 }}
        aria-label="Drag">⠿</button>

      {/* Thumbnail */}
      <div style={{ width: 48, height: 48, borderRadius: "8px", overflow: "hidden", background: "#1a1a1a", flexShrink: 0 }}>
        {col.cover_url
          ? <Image src={col.cover_url} alt={col.name} width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}>◫</div>
        }
      </div>

      {/* Name + category */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.3 }}>{col.name}</p>
        <span style={{ fontSize: "11px", color, marginTop: "2px", display: "block" }}>{col.category}</span>
      </div>

      {/* Order */}
      <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#333", width: "28px", textAlign: "right", flexShrink: 0 }}>{col.display_order}</span>

      {/* Featured toggle */}
      <button type="button" onClick={() => onToggleFeatured(col.id, !col.featured)}
        style={{
          padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", flexShrink: 0,
          background: col.featured ? "#ffffff12" : "transparent",
          color: col.featured ? "#fff" : "#383838",
          border: `1px solid ${col.featured ? "#2a2a2a" : "#1a1a1a"}`,
          minWidth: "96px", textAlign: "center",
        }}>
        {col.featured ? "★ Featured" : "☆ Hidden"}
      </button>
    </div>
  );
}

export default function HomepageClient({ initialCollections }: { initialCollections: Collection[] }) {
  const toast = useToast();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const featuredCount = collections.filter((c) => c.featured).length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = collections.findIndex((c) => c.id === active.id);
    const newIdx = collections.findIndex((c) => c.id === over.id);
    setCollections(arrayMove(collections, oldIdx, newIdx));
  }

  const handleToggleFeatured = useCallback((id: number, val: boolean) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, featured: val } : c)));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/collections/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: collections.map((c, idx) => ({ id: c.id, display_order: idx + 1 })) }),
      });
      await Promise.all(
        collections.map((c, idx) =>
          fetch(`/api/admin/collections/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ featured: c.featured, display_order: idx + 1 }),
          })
        )
      );
      setCollections((prev) => prev.map((c, idx) => ({ ...c, display_order: idx + 1 })));
      toast.success("Homepage saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Stats + save */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px",
        padding: "20px 28px", marginBottom: "24px", gap: "16px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: "40px" }}>
          {[
            { label: "Total", value: collections.length, color: "#fff" },
            { label: "Featured", value: featuredCount, color: "#f59e0b" },
            { label: "Hidden", value: collections.length - featuredCount, color: "#444" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", margin: "0 0 6px" }}>{label}</p>
              <p style={{ fontSize: "28px", fontWeight: 600, color, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleSave} disabled={saving}
          style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", border: "none", background: saving ? "#222" : "#fff", color: saving ? "#555" : "#000", minWidth: "120px" }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Hint */}
      <p style={{ fontSize: "12px", color: "#383838", marginBottom: "16px" }}>
        Drag to reorder · Toggle ★ Featured to control homepage visibility · Save when done
      </p>

      {/* List */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "12px 24px", borderBottom: "1px solid #111", background: "#080808", display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#383838" }}>All collections — drag to reorder</span>
        </div>

        {mounted ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={collections.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {collections.map((col) => (
                <SortableRow key={col.id} col={col} onToggleFeatured={handleToggleFeatured} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          collections.map((col) => <SortableRow key={col.id} col={col} onToggleFeatured={handleToggleFeatured} />)
        )}
      </div>
    </div>
  );
}
