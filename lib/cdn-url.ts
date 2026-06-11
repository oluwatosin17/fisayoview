/**
 * Browser-safe Cloudinary URL builder — no Node.js SDK required.
 * Use this in client components; use lib/cloudinary.ts only in server/API routes.
 */
export function cdnUrl(
  publicId: string,
  opts: { maxW?: number; quality?: string | number } = {}
): string {
  const { maxW = 1200, quality = "auto" } = opts;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "oluwatosin17";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${quality},w_${maxW}/${publicId}`;
}
