import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Build an optimised Cloudinary delivery URL.
 * Auto-format (WebP/AVIF), quality auto, width-capped at `maxW`.
 */
export function cdnUrl(
  publicId: string,
  opts: { maxW?: number; quality?: string | number } = {}
): string {
  const { maxW = 1200, quality = "auto" } = opts;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${quality},w_${maxW}/${publicId}`;
}
