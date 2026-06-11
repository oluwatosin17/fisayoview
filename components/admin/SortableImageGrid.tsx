"use client";

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
}

function SortableImage({
  image,
  selected,
  isCover,
  onToggleSelect,
  onDelete,
  onSetCover,
}: {
  image: DbImage;
  selected: boolean;
  isCover: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onSetCover: (image: DbImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const src = cdnUrl(image.cloudinary_public_id, { maxW: 400 });

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle / image */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          aspectRatio: "1",
          border: selected ? "2px solid #fff" : isCover ? "2px solid #22c55e" : "2px solid transparent",
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
          sizes="200px"
          style={{ objectFit: "cover", pointerEvents: "none" }}
        />

        {isCover && (
          <span
            className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: "#22c55e", color: "#000" }}
          >
            Cover
          </span>
        )}
      </div>

      {/* Select checkbox */}
      <button
        type="button"
        onClick={() => onToggleSelect(image.id)}
        className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center transition-opacity cursor-pointer"
        style={{
          background: selected ? "#fff" : "#00000099",
          border: "1.5px solid #fff",
          opacity: selected ? 1 : 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = selected ? "1" : "0"; }}
      >
        {selected && <span className="text-black text-xs font-bold">✓</span>}
      </button>

      {/* Hover actions */}
      <div
        className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(to top, #000c, transparent)" }}
      >
        <button
          type="button"
          onClick={() => onSetCover(image)}
          className="flex-1 rounded py-1 text-xs font-medium cursor-pointer"
          style={{ background: "#ffffff22", color: "#fff" }}
        >
          Cover
        </button>
        <button
          type="button"
          onClick={() => onDelete(image.id)}
          className="rounded px-2 py-1 text-xs cursor-pointer"
          style={{ background: "#ef444422", color: "#ef4444" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function SortableImageGrid({
  images,
  selectedIds,
  coverId,
  onReorder,
  onToggleSelect,
  onDelete,
  onSetCover,
}: SortableImageGridProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(images, oldIdx, newIdx));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              selected={selectedIds.has(image.id)}
              isCover={image.cloudinary_public_id === coverId}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onSetCover={onSetCover}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
