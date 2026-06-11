"use client";

import { useCallback, useRef, useState } from "react";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  result?: { public_id: string; secure_url: string; width: number; height: number };
}

interface UploadDropzoneProps {
  folder: string;
  onUploaded: (result: {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }) => void;
}

export function UploadDropzone({ folder, onUploaded }: UploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const imageFiles = incoming.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const newEntries: UploadFile[] = imageFiles.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
        status: "pending",
      }));

      setFiles((prev) => [...prev, ...newEntries]);

      // Upload each sequentially
      for (const entry of newEntries) {
        setFiles((prev) =>
          prev.map((u) => (u.id === entry.id ? { ...u, status: "uploading", progress: 10 } : u))
        );

        try {
          const fd = new FormData();
          fd.append("file", entry.file);
          fd.append("folder", folder);

          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });

          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();

          setFiles((prev) =>
            prev.map((u) =>
              u.id === entry.id
                ? { ...u, status: "done", progress: 100, result: data }
                : u
            )
          );

          onUploaded(data);
        } catch {
          setFiles((prev) =>
            prev.map((u) => (u.id === entry.id ? { ...u, status: "error", progress: 0 } : u))
          );
        }
      }
    },
    [folder, onUploaded]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    addFiles(selected);
    e.target.value = "";
  }

  function clearDone() {
    setFiles((prev) => prev.filter((f) => f.status !== "done"));
  }

  const hasDone = files.some((f) => f.status === "done");

  return (
    <div className="flex flex-col gap-4">
      {/* Drop area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-colors select-none"
        style={{
          border: `2px dashed ${dragging ? "#fff" : "#333"}`,
          background: dragging ? "#1a1a1a" : "#0a0a0a",
        }}
      >
        <span className="text-3xl" style={{ color: "#333" }}>↑</span>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "#fff" }}>
            Drop images here
          </p>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>
            or click to browse — multiple files supported
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Progress list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: "#808080" }}>
              {files.filter((f) => f.status === "done").length}/{files.length} uploaded
            </p>
            {hasDone && (
              <button
                onClick={clearDone}
                className="text-xs cursor-pointer"
                style={{ color: "#808080" }}
              >
                Clear done
              </button>
            )}
          </div>
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.preview}
                alt=""
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate mb-1.5" style={{ color: "#fff" }}>
                  {f.file.name}
                </p>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "#1a1a1a" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${f.progress}%`,
                      background:
                        f.status === "error"
                          ? "#ef4444"
                          : f.status === "done"
                          ? "#22c55e"
                          : "#fff",
                    }}
                  />
                </div>
              </div>
              <span
                className="text-xs flex-shrink-0"
                style={{
                  color:
                    f.status === "done"
                      ? "#22c55e"
                      : f.status === "error"
                      ? "#ef4444"
                      : "#808080",
                }}
              >
                {f.status === "done"
                  ? "✓"
                  : f.status === "error"
                  ? "✕"
                  : f.status === "uploading"
                  ? "…"
                  : "–"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
