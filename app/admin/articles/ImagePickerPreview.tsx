"use client";

import { useEffect, useRef, useState } from "react";
import { ARTICLE_FORM_CLEAR_EVENT } from "@/app/admin/articles/ArticleFormEnhancements";

export default function ImagePickerPreview({
  initialImageSrc,
  formId,
}: {
  initialImageSrc?: string | null;
  formId?: string;
}) {
  const initialLink = initialImageSrc?.trim() || "";
  const [previewUrl, setPreviewUrl] = useState<string>(initialLink);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [fileObjectUrl]);

  useEffect(() => {
    const handleFormClear = (event: Event) => {
      const customEvent = event as CustomEvent<{ formId?: string }>;

      if (formId && customEvent.detail?.formId !== formId) {
        return;
      }

      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }

      setFileObjectUrl(null);
      setPreviewUrl("");
      setRemoveImage(false);
    };

    document.addEventListener(ARTICLE_FORM_CLEAR_EVENT, handleFormClear as EventListener);

    return () => {
      document.removeEventListener(ARTICLE_FORM_CLEAR_EVENT, handleFormClear as EventListener);
    };
  }, [fileObjectUrl, formId]);

  const hasPreview = Boolean(previewUrl);

  const handleRemove = () => {
    if (fileObjectUrl) {
      URL.revokeObjectURL(fileObjectUrl);
      setFileObjectUrl(null);
    }
    setPreviewUrl("");
    setRemoveImage(true);
    // Clear the file input so the form doesn't re-upload anything
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const helperText = fileObjectUrl
    ? "Previewing uploaded file."
    : previewUrl
      ? "Previewing current cover image."
      : "No cover image selected.";

  return (
    <section className="grid min-w-0 gap-4 overflow-x-hidden rounded-2xl border border-slate-200 bg-[var(--surface)] p-4">
      <input type="hidden" name="removeImage" value={removeImage ? "1" : "0"} />
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
          ref={fileInputRef}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            setRemoveImage(false);

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
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Image preview</p>
          {hasPreview && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <span aria-hidden="true" className="text-[10px] font-bold">✕</span>
              Remove image
            </button>
          )}
        </div>
        {hasPreview ? (
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
