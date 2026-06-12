"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DbImage } from "@/lib/supabase";
import { cdnUrl } from "@/lib/cdn-url";

interface Props {
  images: DbImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (idx: number) => void;
  coverId: string | null;
  onSetCover?: (image: DbImage) => void;
  onDelete?: (id: number) => void;
}

export function ImagePreviewModal({ images, activeIndex, onClose, onNavigate, coverId, onSetCover, onDelete }: Props) {
  const image = images[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && hasPrev) onNavigate(activeIndex - 1);
    if (e.key === "ArrowRight" && hasNext) onNavigate(activeIndex + 1);
  }, [onClose, onNavigate, activeIndex, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!image) return null;

  const src = cdnUrl(image.cloudinary_public_id, { maxW: 1600 });
  const isCover = image.cloudinary_public_id === coverId;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Image area */}
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative", maxWidth: "min(90vw, 1000px)", maxHeight: "80vh",
            display: "flex", flexDirection: "column", gap: "12px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={image.filename}
            style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: "4px", display: "block" }}
          />

          {/* Info bar */}
          <div className="flex items-center justify-between" style={{ gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>{image.filename}</p>
              <p className="text-xs" style={{ color: "#555" }}>
                {image.width && image.height ? `${image.width} × ${image.height}` : ""}
                {isCover ? " · Cover" : ""}
                <span style={{ marginLeft: 8, color: "#333" }}>
                  {activeIndex + 1} / {images.length}
                </span>
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {onSetCover && !isCover && (
                <button
                  type="button"
                  onClick={() => onSetCover(image)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}
                >
                  Set cover
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => { onDelete(image.id); onClose(); }}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Prev/Next arrows */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex - 1); }}
            style={{ position: "fixed", left: "20px", top: "50%", transform: "translateY(-50%)", background: "#ffffff18", border: "1px solid #333", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, zIndex: 10000 }}
          >←</button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex + 1); }}
            style={{ position: "fixed", right: "20px", top: "50%", transform: "translateY(-50%)", background: "#ffffff18", border: "1px solid #333", color: "#fff", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, zIndex: 10000 }}
          >→</button>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "fixed", top: "16px", right: "16px", background: "#ffffff18", border: "1px solid #333", color: "#fff", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, zIndex: 10000 }}
        >✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
