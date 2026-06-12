"use client";

import { useState, useEffect } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import type { DbImage } from "@/lib/supabase";
import { cdnUrl } from "@/lib/cdn-url";

interface SortableImageGridProps {
  images: DbImage[];
  selectedIds: Set<number>;
  coverId: string | null;
  onReorder: (images: DbImage[]) => void;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onSetCover: (image: DbImage) => void;
  onPreview?: (index: number) => void;
}

function SortableImage({
  image,
  index,
  selected,
  isCover,
  onToggleSelect,
  onDelete,
  onSetCover,
  onPreview,
}: {
  image: DbImage;
  index: number;
  selected: boolean;
  isCover: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onSetCover: (image: DbImage) => void;
  onPreview?: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const src = cdnUrl(image.cloudinary_public_id, { maxW: 600 });

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          aspectRatio: "1",
          border: selected
            ? "2px solid #fff"
            : isCover
            ? "2px solid #22c55e"
            : "2px solid transparent",
          background: "#111",
          cursor: "grab",
        }}
        {...attributes}
        {...listeners}
      >
        <Image
          src={src}
          alt={image.filename}
          fill
          sizes="280px"
          style={{ objectFit: "cover", pointerEvents: "none" }}
        />

        {/* Cover badge */}
        {isCover && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-md font-semibold z-10"
            style={{ background: "#22c55e", color: "#000" }}>
            Cover
          </span>
        )}

        {/* Hover overlay with actions */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
          style={{ cursor: "zoom-in", background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.7) 100%)" }}
          onClick={(e) => { e.stopPropagation(); onPreview?.(index); }}
        >
          {/* Top row */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect(image.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer"
              style={{ background: selected ? "#fff" : "rgba(0,0,0,0.6)", border: "1.5px solid #ffffff88" }}
            >
              {selected && <span className="text-black font-bold" style={{ fontSize: "11px" }}>✓</span>}
            </button>
          </div>

          {/* Bottom row */}
          <div className="flex gap-1.5">
            {onPreview && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPreview(index); }}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}
              >
                Preview
              </button>
            )}
            {!isCover && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetCover(image); }}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer"
                style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e", backdropFilter: "blur(4px)" }}
              >
                Cover
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
              className="rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
              style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", backdropFilter: "blur(4px)" }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Filename below */}
      <div className="mt-1.5 px-0.5">
        <p className="text-xs truncate" style={{ color: "#444" }}>{image.filename}</p>
        {image.width && image.height && (
          <p className="text-xs" style={{ color: "#333" }}>{image.width}×{image.height}</p>
        )}
      </div>
    </div>
  );
}

const StaticGrid = ({ images, selectedIds, coverId, onToggleSelect, onDelete, onSetCover, onPreview }: Omit<SortableImageGridProps, "onReorder">) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
    {images.map((image, index) => (
      <SortableImage key={image.id} image={image} index={index} selected={selectedIds.has(image.id)}
        isCover={image.cloudinary_public_id === coverId} onToggleSelect={onToggleSelect}
        onDelete={onDelete} onSetCover={onSetCover} onPreview={onPreview} />
    ))}
  </div>
);

export function SortableImageGrid({
  images,
  selectedIds,
  coverId,
  onReorder,
  onToggleSelect,
  onDelete,
  onSetCover,
  onPreview,
}: SortableImageGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(images, oldIdx, newIdx));
  }

  if (!mounted) {
    return <StaticGrid images={images} selectedIds={selectedIds} coverId={coverId}
      onToggleSelect={onToggleSelect} onDelete={onDelete} onSetCover={onSetCover} onPreview={onPreview} />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {images.map((image, index) => (
            <SortableImage key={image.id} image={image} index={index} selected={selectedIds.has(image.id)}
              isCover={image.cloudinary_public_id === coverId} onToggleSelect={onToggleSelect}
              onDelete={onDelete} onSetCover={onSetCover} onPreview={onPreview} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
