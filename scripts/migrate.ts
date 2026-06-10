/**
 * FISAYOVIEW Migration Script
 * ────────────────────────────
 * 1. Uploads all images from /Volumes/FV 1/WEBSITE to Cloudinary
 * 2. Seeds Supabase with collection + image metadata
 *
 * Run:
 *   npx tsx scripts/migrate.ts
 *
 * Requires .env.local to be populated with Cloudinary + Supabase credentials.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const MAX_UPLOAD_BYTES = 9_500_000; // 9.5 MB — stay under Cloudinary 10 MB limit

/**
 * If the file is larger than MAX_UPLOAD_BYTES, use `sips` (macOS) to
 * resize it to max 3000px on the long edge and write to a temp file.
 * Returns the path to upload (original or temp).
 */
function prepareForUpload(localPath: string): { uploadPath: string; isTmp: boolean } {
  const size = fs.statSync(localPath).size;
  if (size <= MAX_UPLOAD_BYTES) return { uploadPath: localPath, isTmp: false };

  const tmpPath = path.join(os.tmpdir(), `fv_${path.basename(localPath)}`);
  try {
    // sips -Z maxLongerEdge --setProperty formatOptions 82 input output
    execSync(
      `sips -Z 3000 --setProperty formatOptions 82 "${localPath}" --out "${tmpPath}" 2>/dev/null`,
      { stdio: "pipe" }
    );
    const newSize = fs.statSync(tmpPath).size;
    if (newSize <= MAX_UPLOAD_BYTES) {
      return { uploadPath: tmpPath, isTmp: true };
    }
    // Still too big — try harder (Z 2000, quality 70)
    execSync(
      `sips -Z 2000 --setProperty formatOptions 70 "${localPath}" --out "${tmpPath}" 2>/dev/null`,
      { stdio: "pipe" }
    );
    return { uploadPath: tmpPath, isTmp: true };
  } catch {
    return { uploadPath: localPath, isTmp: false }; // fallback — try anyway
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────

const WEBSITE_ROOT =
  process.env.WEBSITE_ROOT ?? "/Volumes/FV 1/WEBSITE";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Project definitions (matches lib/projects.ts) ───────────────────────────

const PROJECTS: {
  id: number;
  name: string;
  slug: string;
  folderName: string;
  category: string;
  coverFile?: string;
  labelBgImage?: boolean;
  instagramUrl?: string;
  handle?: string;
  caption?: string;
  displayOrder: number;
}[] = [
  { id: 1,  name: "SEYI",           slug: "seyi",           folderName: "SEYI",                            category: "BIRTHDAY",    displayOrder: 1  },
  { id: 2,  name: "BELLO",          slug: "bello",          folderName: "BELLO",                           category: "WEDDING",     displayOrder: 2,  coverFile: "IMG_1455.jpg" },
  { id: 3,  name: "TEMILADE",       slug: "temilade",       folderName: "TEMILADE",                        category: "GRADUATION",  displayOrder: 3  },
  { id: 4,  name: "GABRIEL OGHOSA", slug: "gabriel-oghosa", folderName: "GABRIEL OGHOSA",                  category: "BIRTHDAY",    displayOrder: 4  },
  { id: 5,  name: "KEVWE",          slug: "kevwe",          folderName: "KEVWE",                           category: "BIRTHDAY",    displayOrder: 5,  handle: "r_i.nah", instagramUrl: "https://www.instagram.com/r_i.nah/" },
  { id: 6,  name: "PRECIOUS TRAD",  slug: "precious-trad",  folderName: "PRECIOUS TRAD ",                  category: "WEDDING",     displayOrder: 6  },
  { id: 7,  name: "ABIODUN",        slug: "abiodun",        folderName: "ARI ABIODUN",                     category: "GRADUATION",  displayOrder: 7,  labelBgImage: true, handle: "ari.abiodun" },
  { id: 8,  name: "STARR",          slug: "starr",          folderName: "STARR",                           category: "BIRTHDAY",    displayOrder: 8,  handle: "unusual_star_", instagramUrl: "https://www.instagram.com/unusual_star_/" },
  { id: 9,  name: "TOMI",           slug: "tomi",           folderName: "TOMI",                            category: "GRADUATION",  displayOrder: 9  },
  { id: 10, name: "BLOSSOM",        slug: "blossom",        folderName: "BLOSSOM CALL TO BAR",             category: "LAW",         displayOrder: 10 },
  { id: 11, name: "DEMOLA",         slug: "demola",         folderName: "DEMOLA",                          category: "BIRTHDAY",    displayOrder: 11 },
  { id: 12, name: "PROSPER",        slug: "prosper",        folderName: "PROSPER'S PRE WEDDING/2",         category: "WEDDING",     displayOrder: 12 },
  { id: 13, name: "MIDEY",          slug: "midey",          folderName: "MIDEY",                           category: "BIRTHDAY",    displayOrder: 13, coverFile: "IMG_2295 copy.jpg" },
  { id: 14, name: "TIANA",          slug: "tiana",          folderName: "TIANA",                           category: "GRADUATION",  displayOrder: 14 },
  { id: 15, name: "SEYI CONVO",     slug: "seyi-convo",     folderName: "SEYI CONVOCATION",                category: "GRADUATION",  displayOrder: 15 },
  { id: 16, name: "PRECIOUS",       slug: "precious",       folderName: "PRECIOUS",                        category: "BIRTHDAY",    displayOrder: 16, coverFile: "IMG_8564.jpg" },
  { id: 17, name: "PECULIAR TRAD",  slug: "peculiar-trad",  folderName: "PECULIAR WEDDING/TRAD WEDDING",   category: "WEDDING",     displayOrder: 17 },
  { id: 18, name: "OYERONKE",       slug: "oyeronke",       folderName: "OYERONKE",                        category: "GRADUATION",  displayOrder: 18, coverFile: "IMG_9856.jpg" },
  { id: 19, name: "OLABANJI",       slug: "olabanji",       folderName: "OLABANJI",                        category: "WEDDING",     displayOrder: 19 },
  { id: 20, name: "OMOLOLA PRE",    slug: "omolola-pre",    folderName: "OMOLOLA PRE WEDDING/PRE",         category: "WEDDING",     displayOrder: 20 },
  { id: 21, name: "CHRISTMAS",      slug: "christmas",      folderName: "CHRISTMAS",                       category: "BIRTHDAY",    displayOrder: 21 },
  { id: 22, name: "NIMI BL",        slug: "nimi",           folderName: "NIMI/BL",                         category: "BIRTHDAY",    displayOrder: 22, coverFile: "S_PX1442.jpg" },
  { id: 23, name: "PROSPER TRAD",   slug: "prosper-trad",   folderName: "PROSPER'S PRE WEDDING/TRAD",      category: "WEDDING",     displayOrder: 23 },
  { id: 24, name: "ARAMIDE",        slug: "aramide",        folderName: "ARAMIDE",                         category: "GRADUATION",  displayOrder: 24, coverFile: "IMG_7496 copy.jpg" },
  { id: 25, name: "DAMILOLA",       slug: "damilola",       folderName: "DAMILOLA",                        category: "BIRTHDAY",    displayOrder: 25 },
  { id: 26, name: "FAVOUR",         slug: "favour",         folderName: "FAVOUR",                          category: "WEDDING",     displayOrder: 26 },
  { id: 27, name: "ELIJAH",         slug: "elijah",         folderName: "ELIJAH CONVOCATION",              category: "LAW",         displayOrder: 27 },
  { id: 28, name: "EZEKIEL",        slug: "ezekiel",        folderName: "EZEKIEL CALL TO BAR",             category: "LAW",         displayOrder: 28 },
  { id: 29, name: "FEHIN",          slug: "fehin",          folderName: "FEHIN",                           category: "WEDDING",     displayOrder: 29 },
  { id: 30, name: "IBIFUBARA",      slug: "ibifubara",      folderName: "IBIFUBARA",                       category: "BIRTHDAY",    displayOrder: 30 },
  { id: 31, name: "JULIET",         slug: "juliet",         folderName: "JULIET IBRAHIM",                  category: "WEDDING",     displayOrder: 31 },
  { id: 32, name: "KINDESS",        slug: "kindess",        folderName: "KINDNNESS CONVOCATION",           category: "GRADUATION",  displayOrder: 32 },
  { id: 33, name: "MAYOWA",         slug: "mayowa",         folderName: "MAYOWA",                          category: "BIRTHDAY",    displayOrder: 33 },
  { id: 34, name: "MIDE",           slug: "mide",           folderName: "MIDE ",                           category: "WEDDING",     displayOrder: 34 },
  { id: 35, name: "MINAT",          slug: "minat",          folderName: "MINAT",                           category: "BIRTHDAY",    displayOrder: 35 },
  { id: 36, name: "MOYIN 01",       slug: "moyin-01",       folderName: "MOYIN PRE WEDDING/1",             category: "LAW",         displayOrder: 36 },
  { id: 37, name: "NIMI",           slug: "nimi-2",         folderName: "NIMI/2",                          category: "BIRTHDAY",    displayOrder: 37, coverFile: "S_PX1605.jpg" },
  { id: 38, name: "PECULIAR WHITE", slug: "peculiar-white", folderName: "PECULIAR WEDDING/WHITE WEDDING",  category: "WEDDING",     displayOrder: 38 },
  { id: 39, name: "MRS AKODU",      slug: "mrs-akodu",      folderName: "MRS AKODU ",                      category: "BIRTHDAY",    displayOrder: 39 },
  { id: 40, name: "AMANI",          slug: "amani",          folderName: "AMANI'S BBRIDAL BRUNCH ",         category: "LAW",         displayOrder: 40, coverFile: "IMG_5660.jpg" },
  { id: 41, name: "MRS OSEZUA",     slug: "mrs-osezua",     folderName: "MRS OSEZUA",                      category: "WEDDING",     displayOrder: 41 },
  { id: 42, name: "FISAYO",         slug: "fisayo",         folderName: "FISAYO",                          category: "BIRTHDAY",    displayOrder: 42 },
  { id: 43, name: "MOYIN YOR",      slug: "moyin-yor",      folderName: "MOYIN PRE WEDDING/YOR",           category: "GRADUATION",  displayOrder: 43 },
  { id: 44, name: "OMOLOLA 02",     slug: "omolola-02",     folderName: "OMOLOLA PRE WEDDING/2",           category: "LAW",         displayOrder: 44 },
  { id: 45, name: "DOYIN",          slug: "doyin",          folderName: "DOYIN",                           category: "WEDDING",     displayOrder: 45 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function listImages(folderName: string, coverFile?: string): string[] {
  const dir = path.join(WEBSITE_ROOT, folderName);
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => !f.startsWith(".") && /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
    if (coverFile && files.includes(coverFile)) {
      return [coverFile, ...files.filter((f) => f !== coverFile)];
    }
    return files;
  } catch {
    console.warn(`  ⚠ Could not read ${dir}`);
    return [];
  }
}

async function uploadImage(
  localPath: string,
  publicId: string
): Promise<{ url: string; width: number; height: number } | null> {
  // Check if already uploaded (idempotent)
  try {
    const existing = await cloudinary.api.resource(publicId);
    return {
      url: existing.secure_url,
      width: existing.width,
      height: existing.height,
    };
  } catch {
    // Not uploaded yet — upload now
  }

  const { uploadPath, isTmp } = prepareForUpload(localPath);
  try {
    const result = await cloudinary.uploader.upload(uploadPath, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
    });
    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (e) {
    console.error(`  ✗ Upload failed: ${localPath}`, e);
    return null;
  } finally {
    if (isTmp && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 FISAYOVIEW Migration\n");

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const project of PROJECTS) {
    console.log(`\n📁 [${project.id}/45] ${project.name} (${project.folderName})`);

    const files = listImages(project.folderName, project.coverFile);
    if (files.length === 0) {
      console.log("  ⚠ No images found — skipping");
      continue;
    }

    // ── 1. Upsert collection into Supabase ──────────────────────────────────
    const { data: col, error: colErr } = await supabase
      .from("collections")
      .upsert(
        {
          id: project.id,
          name: project.name,
          slug: project.slug,
          category: project.category,
          folder_name: project.folderName,
          instagram_url: project.instagramUrl ?? null,
          handle: project.handle ?? null,
          caption: project.caption ?? null,
          display_order: project.displayOrder,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (colErr) {
      console.error("  ✗ Collection upsert failed:", colErr.message);
      continue;
    }

    // ── 2. Upload images to Cloudinary ──────────────────────────────────────
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const localPath = path.join(WEBSITE_ROOT, project.folderName, filename);
      // Cloudinary public_id: fisayoview/{slug}/{filename-without-ext}
      const baseName = path.basename(filename, path.extname(filename))
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const publicId = `fisayoview/${project.slug}/${baseName}`;
      const isCover = i === 0;

      process.stdout.write(
        `  ${i + 1}/${files.length} ${filename}... `
      );

      const result = await uploadImage(localPath, publicId);
      if (!result) {
        totalFailed++;
        console.log("✗ failed");
        continue;
      }

      const deliveryUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

      // ── 3. Upsert image record into Supabase ──────────────────────────────
      await supabase.from("images").upsert(
        {
          collection_id: col.id,
          cloudinary_public_id: publicId,
          url: deliveryUrl,
          filename,
          width: result.width,
          height: result.height,
          sort_order: i,
          is_cover: isCover,
        },
        { onConflict: "cloudinary_public_id" }
      );

      // Update collection cover if this is the cover image
      if (isCover) {
        await supabase
          .from("collections")
          .update({ cover_cloudinary_id: publicId, cover_url: deliveryUrl })
          .eq("id", col.id);
      }

      totalUploaded++;
      console.log("✓");
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ Uploaded: ${totalUploaded}`);
  console.log(`⏭ Skipped:  ${totalSkipped}`);
  console.log(`✗  Failed:  ${totalFailed}`);
  console.log("\nMigration complete. Update .env.local with credentials and re-run.");
}

main().catch(console.error);
