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

  return <HomeClient coverImages={coverImages} collections={collections} />;
}
