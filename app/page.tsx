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
      {/* Visually hidden semantic content for search engines and AI crawlers */}
      <div className="sr-only">
        <h1>FISAYOVIEW — Top Photographer in Lagos, Nigeria</h1>
        <p>
          FISAYOVIEW is Fisayo Obalana — a top professional photographer in Lagos, Nigeria.
          Whether you are searching for the best photographer in Lagos, a wedding photographer in Lagos,
          an event photographer in Lagos, a portrait photographer in Lagos, a fashion photographer in Lagos,
          or a commercial photographer in Lagos, FISAYOVIEW delivers world-class photography.
        </p>
        <h2>Photography Services in Lagos</h2>
        <ul>
          <li>Wedding Photography Lagos — luxury wedding and pre-wedding photographer in Lagos</li>
          <li>Event Photography Lagos — birthday, corporate event, concert and red carpet photographer</li>
          <li>Portrait Photography Lagos — studio portraits, headshots and personal branding</li>
          <li>Fashion &amp; Editorial Photography Lagos — fashion, editorial and commercial shoots</li>
          <li>Commercial Photography Lagos — product, brand and advertising photography</li>
          <li>Graduation Photography Lagos — graduation photoshoots across Lagos</li>
          <li>Birthday Photography Lagos — professional birthday photoshoots</li>
          <li>Family Photography Lagos — family and maternity photography</li>
        </ul>
        <h2>Areas Served</h2>
        <p>
          Lekki, Victoria Island, Ikoyi, Ikeja, Ajah, Yaba, Surulere and all of Lagos, Nigeria.
        </p>
        <h2>Book FISAYOVIEW</h2>
        <p>
          Contact Fisayo Obalana to book a photoshoot in Lagos.
          WhatsApp: +2348136404224. Email: bookfisayoview@gmail.com.
          Website: fisayoview.com.
        </p>
      </div>
      <HomeClient coverImages={coverImages} collections={collections} />
    </>
  );
}
