/**
 * Fix Supabase data:
 * 1. Update category LIFESTYLE/PORTRAITS → ESSENCE for 6 collections
 * 2. Update is_cover + cover_url for MOYIN 01 and MOYIN YOR
 * 3. Upload MY PORTRAIT images to Cloudinary for the about page
 *
 * Run: npx tsx --env-file=.env.local scripts/fix-data.ts
 */

import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBSITE_ROOT = process.env.WEBSITE_ROOT ?? "/Volumes/FV 1/WEBSITE";

// ─── 1. Fix categories ────────────────────────────────────────────────────────

async function fixCategories() {
  console.log("\n── Step 1: Fix categories ──────────────────────────────");

  // Check what's currently in Supabase
  const { data: current } = await sb
    .from("collections")
    .select("id,name,category")
    .in("id", [4, 6, 13, 31, 34, 45]);

  console.log("Current categories for ESSENCE collections:");
  current?.forEach((c) => console.log(`  id=${c.id} ${c.name}: ${c.category}`));

  const { error } = await sb
    .from("collections")
    .update({ category: "ESSENCE" })
    .in("id", [4, 6, 13, 31, 34, 45]);

  if (error) {
    console.error("  ❌ Category update failed:", error.message);
  } else {
    console.log("  ✅ Updated 6 collections → ESSENCE");
  }
}

// ─── 2. Fix Moyin covers ─────────────────────────────────────────────────────

async function fixMoyinCovers() {
  console.log("\n── Step 2: Fix Moyin cover images ──────────────────────");

  // MOYIN 01 (id=36): coverFile = IMG_4593.jpg
  // MOYIN YOR (id=43): coverFile = IMG_4788 copy.jpg
  const covers = [
    { id: 36, slug: "moyin-01", coverFile: "IMG_4593.jpg" },
    { id: 43, slug: "moyin-yor", coverFile: "IMG_4788 copy.jpg" },
  ];

  for (const { id, slug, coverFile } of covers) {
    // Get all images for this collection
    const { data: images } = await sb
      .from("images")
      .select("id,filename,url,is_cover")
      .eq("collection_id", id);

    if (!images?.length) {
      console.log(`  ⚠️  No images found for collection id=${id} (${slug})`);
      continue;
    }

    // Find the target cover image
    const targetImg = images.find((img) => img.filename === coverFile);
    if (!targetImg) {
      console.log(`  ⚠️  Cover file "${coverFile}" not found in Supabase for id=${id}. Available:`);
      images.forEach((i) => console.log(`      ${i.filename} is_cover=${i.is_cover}`));
      continue;
    }

    // Clear all is_cover flags for this collection, then set the right one
    await sb.from("images").update({ is_cover: false }).eq("collection_id", id);
    const { error: e1 } = await sb
      .from("images")
      .update({ is_cover: true })
      .eq("id", targetImg.id);

    // Update cover_url on collections table
    const { error: e2 } = await sb
      .from("collections")
      .update({ cover_url: targetImg.url })
      .eq("id", id);

    if (e1 || e2) {
      console.error(`  ❌ Failed for ${slug}:`, e1?.message ?? e2?.message);
    } else {
      console.log(`  ✅ ${slug}: cover → ${coverFile} (${targetImg.url.slice(-40)})`);
    }
  }
}

// ─── 3. Upload about images to Cloudinary ────────────────────────────────────

async function uploadAboutImages() {
  console.log("\n── Step 3: Upload about images to Cloudinary ────────────");

  const PORTRAIT_DIR = path.join(WEBSITE_ROOT, "MY PORTRAIT");
  if (!fs.existsSync(PORTRAIT_DIR)) {
    console.error(`  ❌ Directory not found: ${PORTRAIT_DIR}`);
    return;
  }

  const files = fs
    .readdirSync(PORTRAIT_DIR)
    .filter((f) => !f.startsWith(".") && /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  console.log(`  Found ${files.length} images: ${files.join(", ")}`);

  for (const filename of files) {
    // Derive Cloudinary public_id: sanitize spaces + "copy" → underscores
    const publicId =
      "fisayoview/about/" +
      filename
        .replace(/\.[^.]+$/, "")       // remove extension
        .replace(/ /g, "_")            // spaces → underscores
        .replace(/\./g, "_");          // dots → underscores

    // Check if already uploaded
    try {
      await cloudinary.api.resource(publicId);
      console.log(`  ✓ already exists: ${publicId}`);
      continue;
    } catch {
      // not found — upload it
    }

    const localPath = path.join(PORTRAIT_DIR, filename);
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
      });
      console.log(`  ✅ Uploaded: ${publicId} (${result.width}×${result.height})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Failed: ${filename} — ${msg}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await fixCategories();
  await fixMoyinCovers();
  await uploadAboutImages();
  console.log("\n✅ Done.\n");
}

main().catch(console.error);
