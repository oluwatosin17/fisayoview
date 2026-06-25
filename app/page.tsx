export const dynamic = "force-dynamic";

import { getAllCollections } from "@/lib/data";
import type { CollectionSummary } from "@/lib/data";
import HomeClient from "./HomeClient";

export default async function Home() {
  const collections = await getAllCollections();

  const coverImages: Record<number, string> = {};
  for (const c of collections) {
    if (c.coverUrl) coverImages[c.id] = c.coverUrl;
  }

  return (
    <>
      {/* Visually hidden h1 for SEO — the visual logo/brand serves as the heading */}
      <h1 className="sr-only">FISAYOVIEW — Photographer in Lagos, Nigeria</h1>
      <HomeClient coverImages={coverImages} collections={collections} />
    </>
  );
}
