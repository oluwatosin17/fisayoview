/**
 * Unified data layer — tries Supabase first, falls back to local filesystem.
 * Import from this module instead of lib/projects or lib/images directly
 * once migration is complete.
 */

import { projects as localProjects } from "./projects";
import { getCoverUrl, getProjectImages, imageUrl, WEBSITE_ROOT } from "./images";

// ─── Types (cloud-agnostic) ───────────────────────────────────────────────────

export interface CollectionSummary {
  id: number;
  name: string;
  slug: string;
  category: string;
  coverUrl: string;
  labelBgUrl?: string;
  handle?: string;
  caption?: string;
  displayOrder: number;
}

export interface CollectionDetail extends CollectionSummary {
  images: { url: string; filename: string; isCover: boolean }[];
}

// ─── Supabase helpers (only runs when env vars are set) ──────────────────────

async function supabaseAvailable(): Promise<boolean> {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function fromSupabase_collections(): Promise<CollectionSummary[] | null> {
  if (!(await supabaseAvailable())) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await sb
      .from("collections")
      .select("id,name,slug,category,cover_url,label_bg_url,handle,caption,display_order")
      .order("display_order");
    if (error || !data) return null;
    return data.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      coverUrl: r.cover_url ?? "",
      labelBgUrl: r.label_bg_url ?? undefined,
      handle: r.handle ?? undefined,
      caption: r.caption ?? undefined,
      displayOrder: r.display_order,
    }));
  } catch {
    return null;
  }
}

async function fromSupabase_images(collectionId: number): Promise<{ url: string; filename: string; isCover: boolean }[] | null> {
  if (!(await supabaseAvailable())) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await sb
      .from("images")
      .select("url,filename,is_cover")
      .eq("collection_id", collectionId)
      .order("sort_order");
    if (error || !data) return null;
    return data.map((r) => ({ url: r.url, filename: r.filename, isCover: r.is_cover }));
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** All collections with cover images — for the homepage gallery */
export async function getAllCollections(): Promise<CollectionSummary[]> {
  const cloud = await fromSupabase_collections();
  if (cloud) return cloud;

  // Local fallback
  return localProjects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    coverUrl: getCoverUrl(p) ?? p.image,
    labelBgUrl: p.labelBgImage ? (getCoverUrl(p) ?? p.image) : undefined,
    handle: p.handle,
    caption: p.caption,
    displayOrder: p.id,
  }));
}

/** Single collection with all images — for the detail page */
export async function getCollectionDetail(id: number): Promise<CollectionDetail | null> {
  const project = localProjects.find((p) => p.id === id);
  if (!project) return null;

  const cloudImages = await fromSupabase_images(id);
  if (cloudImages) {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      category: project.category,
      coverUrl: cloudImages.find((i) => i.isCover)?.url ?? cloudImages[0]?.url ?? "",
      handle: project.handle,
      caption: project.caption,
      displayOrder: project.id,
      images: cloudImages,
    };
  }

  // Local fallback
  const files = getProjectImages(project.folderName, project.coverFile);
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    category: project.category,
    coverUrl: getCoverUrl(project) ?? project.image,
    handle: project.handle,
    caption: project.caption,
    displayOrder: project.id,
    images: files.map((f, i) => ({
      url: imageUrl(project.folderName, f),
      filename: f,
      isCover: i === 0,
    })),
  };
}
