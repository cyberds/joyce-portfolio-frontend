"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/commerce/uploadClient";
import { PlusIcon, TrashIcon, SpinnerIcon } from "@/components/shop/icons";
import type { ProductImage } from "@/types/commerce";

/**
 * Product images.
 *
 * The first image is the one the grid and the emails use, so the list order is
 * meaningful and there is an explicit "make cover" action rather than
 * drag-to-reorder — a drag target this small is fiddly, and there are rarely
 * more than four images.
 */
export function ImageUploader({
  images,
  onChange,
  max = 8,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);

    const room = max - images.length;
    const chosen = Array.from(files).slice(0, room);
    const uploaded: ProductImage[] = [];

    try {
      for (const file of chosen) {
        setProgress(0);
        const asset = await uploadToCloudinary(file, "product-image", setProgress);
        uploaded.push({
          publicId: asset.publicId,
          url: asset.url,
          alt: "",
        });
      }
      onChange([...images, ...uploaded]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
      // Anything that did upload before the failure is still kept — losing a
      // successful 40MB upload because the next one failed would be rude.
      if (uploaded.length) onChange([...images, ...uploaded]);
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const makeCover = (index: number) => {
    const next = [...images];
    const [moved] = next.splice(index, 1);
    onChange([moved, ...next]);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.publicId}
            className="group relative aspect-square overflow-hidden rounded-[var(--r-sm)] border border-hairline bg-canvas-deep"
          >
            <Image
              src={image.url}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />

            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-[var(--r-pill)] bg-ink px-2 py-0.5 text-[0.65rem] text-surface">
                Cover
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  className="rounded-[var(--r-pill)] bg-white/90 px-2 py-1 text-[0.65rem] text-ink"
                >
                  Make cover
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() =>
                  onChange(images.filter((_, position) => position !== index))
                }
                aria-label="Remove image"
                className="rounded-full bg-white/90 p-1.5 text-ink hover:text-accent"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}

        {images.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[var(--r-sm)] border border-dashed border-hairline text-ink-faint transition-colors hover:border-ink-faint hover:text-ink disabled:opacity-60"
          >
            {busy ? <SpinnerIcon /> : <PlusIcon />}
            <span className="text-[0.72rem]">
              {busy ? `${progress}%` : "Add image"}
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {error ? (
        <p className="mt-3 text-[0.8rem] text-accent">{error}</p>
      ) : (
        <p className="mt-3 text-[0.76rem] text-ink-faint">
          JPG, PNG or WebP. The first image is used on the shop grid and in
          emails.
        </p>
      )}
    </div>
  );
}
