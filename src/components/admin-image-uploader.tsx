"use client";

import { useMemo, useRef, useState } from "react";

type Props = {
  initialUrls?: string[];
  inputName?: string;
};

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function AdminImageUploader({
  initialUrls = [],
  inputName = "image_urls_json"
}: Props) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  const serialized = useMemo(() => JSON.stringify(urls), [urls]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!list.length) return;

    const body = new FormData();
    list.forEach((file) => body.append("images", file));

    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload-images", {
        method: "POST",
        body
      });
      const data = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok || !data.urls) throw new Error(data.error || "Upload failed");
      setUrls((prev) => [...prev, ...data.urls!]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <input type="hidden" name={inputName} value={serialized} />

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-4 text-sm text-muted transition ${
          dragOver ? "border-accent/60 bg-accent/10 text-headline" : "border-white/20 bg-surface/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
        {uploading ? "Uploading images..." : "Drag and drop images or click to upload"}
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() => {
              dragIndexRef.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndexRef.current === null || dragIndexRef.current === index) return;
              setUrls((prev) => reorder(prev, dragIndexRef.current!, index));
              dragIndexRef.current = null;
            }}
            className="space-y-2 rounded-lg border border-white/10 bg-surface/80 p-2"
          >
            <img
              src={url}
              alt="Product upload"
              className="h-24 w-full rounded-md object-cover"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-white/10 bg-surface-elevated px-2 py-1 text-xs text-muted hover:text-headline"
                onClick={() =>
                  setUrls((prev) =>
                    index > 0 ? reorder(prev, index, index - 1) : prev
                  )
                }
              >
                Up
              </button>
              <button
                type="button"
                className="rounded border border-white/10 bg-surface-elevated px-2 py-1 text-xs text-muted hover:text-headline"
                onClick={() =>
                  setUrls((prev) =>
                    index < prev.length - 1 ? reorder(prev, index, index + 1) : prev
                  )
                }
              >
                Down
              </button>
              <button
                type="button"
                className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                onClick={() => setUrls((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
