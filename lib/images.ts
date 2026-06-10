import fs from "fs";
import path from "path";
import type { Project } from "./projects";

export const WEBSITE_ROOT = "/Volumes/FV 1/WEBSITE";

/**
 * Returns sorted image filenames for a project folder.
 * If the project has a `coverFile`, it is moved to the front of the list.
 */
export function getProjectImages(
  folderName: string,
  coverFile?: string
): string[] {
  const dir = path.join(WEBSITE_ROOT, folderName);
  try {
    const files = fs
      .readdirSync(dir)
      .filter(
        (f) =>
          !f.startsWith(".") &&
          /\.(jpg|jpeg|png|webp|avif)$/i.test(f)
      )
      .sort();

    if (coverFile && files.includes(coverFile)) {
      // Move cover to front
      return [coverFile, ...files.filter((f) => f !== coverFile)];
    }

    return files;
  } catch {
    return [];
  }
}

/** Returns the `/api/serve/` URL for a single image */
export function imageUrl(folderName: string, filename: string): string {
  return `/api/serve/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
}

/** Convenience: get the cover URL for a project (first after honoring coverFile) */
export function getCoverUrl(project: Project): string | null {
  const files = getProjectImages(project.folderName, project.coverFile);
  if (files.length === 0) return null;
  return imageUrl(project.folderName, files[0]);
}
