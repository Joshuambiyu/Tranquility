"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_IMAGE = "/featured-reflection.svg";

function getDraftImageLink(storageKey?: string) {
  if (!storageKey || typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { fields?: Record<string, string> };
    const draftImageSrc = parsed?.fields?.imageSrc;

    if (typeof draftImageSrc === "string") {
      return draftImageSrc.trim();
    }

    return null;
  } catch {
    return null;
  }
}

export default function ImagePickerPreview({
  initialImageSrc,
  draftStorageKey,
  restoreDraft,
}: {
  initialImageSrc?: string | null;
  draftStorageKey?: string;
  restoreDraft?: boolean;
}) {
  const initialLink = initialImageSrc?.trim() || "";
  const [previewUrl, setPreviewUrl] = useState<string>(initialLink || DEFAULT_IMAGE);
  const [imageLink, setImageLink] = useState(initialLink);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!restoreDraft) {
      return;
    }

    const draftImageLink = getDraftImageLink(draftStorageKey);
    if (draftImageLink === null) {
      return;
    }

    setImageLink(draftImageLink);
    setPreviewUrl(draftImageLink || DEFAULT_IMAGE);
  }, [draftStorageKey, restoreDraft]);

  useEffect(() => {
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [fileObjectUrl]);

  const helperText = useMemo(() => {
    if (fileObjectUrl) {
      return "Previewing uploaded file.";
    }

    if (imageLink.trim().length > 0) {
      return "Previewing image link.";
    }

    return "Previewing default cover image.";
  }, [fileObjectUrl, imageLink]);

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Upload cover image (optional)
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-800"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] ?? null;

              if (file) {
                if (fileObjectUrl) {
                  URL.revokeObjectURL(fileObjectUrl);
                }

                const nextObjectUrl = URL.createObjectURL(file);
                setFileObjectUrl(nextObjectUrl);
                setPreviewUrl(nextObjectUrl);
                return;
              }

              if (fileObjectUrl) {
                URL.revokeObjectURL(fileObjectUrl);
                setFileObjectUrl(null);
              }

              setPreviewUrl(imageLink.trim() || DEFAULT_IMAGE);
            }}
          />
          <span className="text-xs font-normal text-slate-500">
            Choose an image from your device. Works on mobile and desktop.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Cover image link (optional)
          <input
            name="imageSrc"
            value={imageLink}
            onChange={(event) => {
              const nextLink = event.target.value;
              setImageLink(nextLink);

              if (fileObjectUrl) {
                return;
              }

              setPreviewUrl(nextLink.trim() || DEFAULT_IMAGE);
            }}
            placeholder="https://example.com/my-image.jpg"
            className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
          />
          <span className="text-xs font-normal text-slate-500">
            Use this only if you already have an image URL. If both are filled, uploaded file is used.
          </span>
        </label>
      </div>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Image preview</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Selected article cover preview" className="h-52 w-full object-cover" />
        </div>
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>
    </section>
  );
}
