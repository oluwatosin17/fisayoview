import { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const BASE_URL = "https://fisayoview.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/projects/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL,              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...projectUrls,
  ];
}
