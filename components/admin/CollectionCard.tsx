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
}

const CATEGORY_COLORS: Record<string, string> = {
  BIRTHDAY:   "#f59e0b",
  WEDDING:    "#ec4899",
  GRADUATION: "#8b5cf6",
  STUDIO:     "#3b82f6",
  ESSENCE:    "#14b8a6",
  LAW:        "#6366f1",
};

export function CollectionCard({ collection }: CollectionCardProps) {
  const coverSrc = collection.cover_cloudinary_id
    ? cdnUrl(collection.cover_cloudinary_id, { maxW: 400 })
    : collection.cover_url;

  const catColor = CATEGORY_COLORS[collection.category] ?? "#888";

  return (
    <div style={{
      background: "#0d0d0d",
      border: "1px solid #1e1e1e",
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Cover image */}
      <div style={{ position: "relative", width: "100%", height: "210px", background: "#111", flexShrink: 0 }}>
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "40px", color: "#222" }}>
            ◫
          </div>
        )}
        {collection.featured && (
          <span style={{
            position: "absolute", top: "12px", right: "12px",
            padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44",
          }}>
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        {/* Name + category */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            {collection.name}
          </h3>
          <span style={{
            padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {collection.category}
          </span>
        </div>

        {/* Image count */}
        <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
          {collection.image_count} image{collection.image_count !== 1 ? "s" : ""}
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          <Link href={`/admin/collections/${collection.id}`}
            style={{
              flex: 1, textAlign: "center", padding: "9px 0",
              borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              background: "#1a1a1a", color: "#fff", border: "1px solid #2a2a2a",
              textDecoration: "none", transition: "background 0.15s",
            }}>
            Edit
          </Link>
          <Link href={`/admin/collections/${collection.id}/images`}
            style={{
              flex: 1, textAlign: "center", padding: "9px 0",
              borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              background: "#1a1a1a", color: "#888", border: "1px solid #1e1e1e",
              textDecoration: "none",
            }}>
            Images
          </Link>
          <a href={`/projects/${collection.id}`} target="_blank" rel="noopener noreferrer"
            style={{
              padding: "9px 14px",
              borderRadius: "8px", fontSize: "14px",
              background: "#1a1a1a", color: "#666", border: "1px solid #1e1e1e",
              textDecoration: "none", lineHeight: 1,
            }}
            title="View on site">
            ↗
          </a>
        </div>
      </div>
    </div>
  );
}
