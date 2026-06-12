/**
 * Unified data layer — Supabase primary, local filesystem fallback.
 */

import { projects as localProjects } from "./projects";
import { getCoverUrl, getProjectImages, imageUrl } from "./images";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  featured?: boolean;
}

export interface CollectionDetail extends CollectionSummary {
  description?: string | null;
  images: { url: string; filename: string; isCover: boolean }[];
}

export interface Portrait {
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
}

export interface SiteSettings {
  id?: number;
  about_heading?: string | null;
  about_text?: string | null;
  about_portraits?: Portrait[];
  instagram_url?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image?: string | null;
}

// ─── Supabase client (lazy) ──────────────────────────────────────────────────

function supabaseAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** All collections for the homepage gallery */
export async function getAllCollections(): Promise<CollectionSummary[]> {
  if (!supabaseAvailable()) return localFallback();

  try {
    const sb = getClient();
    const { data, error } = await sb
      .from("collections")
      .select("id,name,slug,category,cover_url,label_bg_url,handle,caption,display_order,featured")
      .order("display_order");
    if (error || !data) return localFallback();
    return data.map((r: Record<string, unknown>) => ({
      id: r.id as number,
      name: r.name as string,
      slug: r.slug as string,
      category: r.category as string,
      coverUrl: (r.cover_url as string) ?? "",
      labelBgUrl: (r.label_bg_url as string) ?? undefined,
      handle: (r.handle as string) ?? undefined,
      caption: (r.caption as string) ?? undefined,
      displayOrder: r.display_order as number,
      featured: (r.featured as boolean) ?? false,
    }));
  } catch {
    return localFallback();
  }
}

/** Single collection with all images — for detail page */
export async function getCollectionDetail(id: number): Promise<CollectionDetail | null> {
  if (!supabaseAvailable()) return localDetailFallback(id);

  try {
    const sb = getClient();
    const [colRes, imgRes] = await Promise.all([
      sb.from("collections")
        .select("id,name,slug,category,cover_url,label_bg_url,handle,caption,display_order,featured,description")
        .eq("id", id)
        .single(),
      sb.from("images")
        .select("url,filename,is_cover,cloudinary_public_id")
        .eq("collection_id", id)
        .order("sort_order"),
    ]);

    if (colRes.error || !colRes.data) return localDetailFallback(id);

    const col = colRes.data;
    const imgs = (imgRes.data ?? []) as Array<{
      url: string; filename: string; is_cover: boolean; cloudinary_public_id: string;
    }>;

    return {
      id: col.id,
      name: col.name,
      slug: col.slug,
      category: col.category,
      coverUrl: col.cover_url ?? imgs[0]?.url ?? "",
      labelBgUrl: col.label_bg_url ?? undefined,
      handle: col.handle ?? undefined,
      caption: col.caption ?? undefined,
      displayOrder: col.display_order,
      featured: col.featured ?? false,
      description: col.description ?? null,
      images: imgs.map((r) => ({ url: r.url, filename: r.filename, isCover: r.is_cover })),
    };
  } catch {
    return localDetailFallback(id);
  }
}

/** Site settings for about page, SEO, contact modal */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!supabaseAvailable()) return null;
  try {
    const sb = getClient();
    const { data } = await sb.from("site_settings").select("*").limit(1).single();
    return data ?? null;
  } catch {
    return null;
  }
}

// ─── Local fallbacks ─────────────────────────────────────────────────────────

function localFallback(): CollectionSummary[] {
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
    featured: false,
  }));
}

async function localDetailFallback(id: number): Promise<CollectionDetail | null> {
  const project = localProjects.find((p) => p.id === id);
  if (!project) return null;
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
