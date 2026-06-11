import Image from "next/image";
import Link from "next/link";
import type { DbCollection } from "@/lib/supabase";
import { cdnUrl } from "@/lib/cdn-url";

interface CollectionCardProps {
  collection: DbCollection & {
    image_count: number;
    description: string | null;
    featured: boolean;
  };
  onDelete?: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  BIRTHDAY: "#f59e0b",
  WEDDING: "#ec4899",
  GRADUATION: "#8b5cf6",
  STUDIO: "#3b82f6",
  ESSENCE: "#14b8a6",
};

export function CollectionCard({ collection }: CollectionCardProps) {
  const coverSrc = collection.cover_cloudinary_id
    ? cdnUrl(collection.cover_cloudinary_id, { maxW: 400 })
    : collection.cover_url;

  const catColor = CATEGORY_COLORS[collection.category] ?? "#666";

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#111", border: "1px solid #1a1a1a" }}
    >
      {/* Cover */}
      <div
        className="relative w-full"
        style={{ height: "180px", background: "#0a0a0a" }}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl" style={{ color: "#333" }}>
            ◫
          </div>
        )}
        {collection.featured && (
          <span
            className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}
          >
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight" style={{ color: "#fff" }}>
            {collection.name}
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
            style={{
              background: `${catColor}22`,
              color: catColor,
              border: `1px solid ${catColor}44`,
            }}
          >
            {collection.category}
          </span>
        </div>

        <p className="text-xs" style={{ color: "#808080" }}>
          {collection.image_count} image{collection.image_count !== 1 ? "s" : ""}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/admin/collections/${collection.id}`}
            className="flex-1 text-center rounded-md py-2 text-xs font-medium transition-colors"
            style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}
          >
            Edit
          </Link>
          <Link
            href={`/admin/collections/${collection.id}/images`}
            className="flex-1 text-center rounded-md py-2 text-xs font-medium transition-colors"
            style={{ background: "#1a1a1a", color: "#808080", border: "1px solid #1a1a1a" }}
          >
            Images
          </Link>
          <a
            href={`/projects/${collection.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-2 text-xs transition-colors"
            style={{ background: "#1a1a1a", color: "#808080", border: "1px solid #1a1a1a" }}
            title="View on site"
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  );
}
