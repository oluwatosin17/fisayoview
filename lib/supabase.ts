import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

// Server-only admin client (never sent to browser)
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbCollection {
  id: number;
  name: string;
  slug: string;
  category: string;
  folder_name: string;
  cover_cloudinary_id: string | null;
  cover_url: string | null;
  label_bg_url: string | null;
  instagram_url: string | null;
  handle: string | null;
  caption: string | null;
  display_order: number;
}

export interface DbImage {
  id: number;
  collection_id: number;
  cloudinary_public_id: string;
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}
