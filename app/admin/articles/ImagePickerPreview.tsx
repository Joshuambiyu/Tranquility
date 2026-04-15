"use client";

import { useEffect, useState } from "react";

export default function ImagePickerPreview({
  initialImageSrc,
}: {
  initialImageSrc?: string | null;
}) {
  const initialLink = initialImageSrc?.trim() || "";
  const [previewUrl, setPreviewUrl] = useState<string>(initialLink);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [fileObjectUrl]);

  const helperText = fileObjectUrl
    ? "Previewing uploaded file."
    : initialLink
      ? "Previewing current cover image."
      : "No cover image selected.";

  return (
    <section className="grid min-w-0 gap-4 overflow-x-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-slate-800">Cover image (optional)</p>
        <p className="text-xs text-slate-500">Add a cover image if this article needs one. Leave empty to publish without a cover.</p>
      </div>

      <label className="grid min-w-0 gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm font-medium text-slate-700">
        Upload cover image
        <input
          type="file"
          name="imageFile"
          accept="image/*"
          className="w-full min-w-0 max-w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 file:mr-3 file:max-w-full file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-800"
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

            setPreviewUrl(initialLink);
          }}
        />
        <span className="text-xs font-normal text-slate-500">Choose an image from your device. Works on mobile and desktop.</span>
      </label>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Image preview</p>
        {previewUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected article cover preview" className="h-52 w-full object-cover" />
          </div>
        ) : (
          <div className="grid h-52 place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">
            No cover selected yet.
          </div>
        )}
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>
    </section>
  );
}
