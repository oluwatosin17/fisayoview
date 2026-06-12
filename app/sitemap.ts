import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

const BASE_URL = "https://fisayoview.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch all live collections from Supabase
  const admin = supabaseAdmin();
  const { data: collections } = await admin
    .from("collections")
    .select("id, updated_at")
    .order("display_order", { ascending: true });

  const projectUrls: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${BASE_URL}/projects/${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL,             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/about`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...projectUrls,
  ];
}
