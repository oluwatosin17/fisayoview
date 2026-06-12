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
  BIRTHDAY: "#f59e0b",
  WEDDING: "#ec4899",
  GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6",
  ESSENCE: "#14b8a6",
  LAW: "#6366f1",
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

function SortableRow({
  col,
  onToggleFeatured,
}: {
  col: Collection;
  onToggleFeatured: (id: number, val: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const color = CATEGORY_COLORS[col.category] ?? "#666";

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderBottom: "1px solid #1a1a1a" }}
      className="flex items-center gap-4 px-5 py-3"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
        style={{ color: "#333", fontSize: "16px", lineHeight: 1, padding: "4px", border: "none", background: "none" }}
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      {/* Cover */}
      <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 44, height: 44, background: "#1a1a1a" }}>
        {col.cover_url ? (
          <Image src={col.cover_url} alt={col.name} width={44} height={44} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "#333", fontSize: 12 }}>◫</div>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>{col.name}</p>
        <span className="text-xs" style={{ color }}>{col.category}</span>
      </div>

      {/* Order badge */}
      <span className="text-xs font-mono w-6 text-right" style={{ color: "#444" }}>
        {col.display_order}
      </span>

      {/* Featured toggle */}
      <button
        type="button"
        onClick={() => onToggleFeatured(col.id, !col.featured)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
        style={{
          background: col.featured ? "#ffffff15" : "#0a0a0a",
          color: col.featured ? "#fff" : "#444",
          border: `1px solid ${col.featured ? "#333" : "#1a1a1a"}`,
        }}
      >
        <span style={{ fontSize: "10px" }}>{col.featured ? "★" : "☆"}</span>
        {col.featured ? "Featured" : "Hidden"}
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
      // Save display_order for all collections
      const reorderRes = await fetch("/api/admin/collections/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: collections.map((c, idx) => ({ id: c.id, display_order: idx + 1 })),
        }),
      });
      if (!reorderRes.ok) throw new Error("Reorder failed");

      // Save featured status for each changed collection
      await Promise.all(
        collections.map((c, idx) =>
          fetch(`/api/admin/collections/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ featured: c.featured, display_order: idx + 1 }),
          })
        )
      );

      // Update local display_order
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
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
        <div className="flex gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#555" }}>Total</p>
            <p className="text-xl font-semibold" style={{ color: "#fff" }}>{collections.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#555" }}>Featured</p>
            <p className="text-xl font-semibold" style={{ color: "#f59e0b" }}>{featuredCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#555" }}>Hidden</p>
            <p className="text-xl font-semibold" style={{ color: "#555" }}>{collections.length - featuredCount}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer"
          style={{ background: saving ? "#333" : "#fff", color: saving ? "#888" : "#000" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Info */}
      <p className="text-xs mb-4" style={{ color: "#444" }}>
        Drag rows to reorder. Toggle ★ Featured to show/hide on homepage. Click Save when done.
      </p>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
        {/* Featured section header */}
        <div className="px-5 py-2.5" style={{ borderBottom: "1px solid #1a1a1a", background: "#0d0d0d" }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555" }}>
            All Collections — drag to reorder
          </span>
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
          collections.map((col) => (
            <SortableRow key={col.id} col={col} onToggleFeatured={handleToggleFeatured} />
          ))
        )}
      </div>
    </div>
  );
}
