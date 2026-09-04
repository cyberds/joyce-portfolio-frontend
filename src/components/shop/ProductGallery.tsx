"use client";

import { useState } from "react";
import Image from "next/image";
import { DownloadIcon, BoxIcon } from "./icons";
import type { ProductImage, ProductKind } from "@/types/commerce";

/** Main image plus thumbnails. Falls back to a kind glyph when there is no art. */
export function ProductGallery({
  images,
  title,
  kind,
}: {
  images: ProductImage[];
  title: string;
  kind: ProductKind;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-canvas-deep">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            {kind === "digital" ? (
              <DownloadIcon className="size-12" />
            ) : (
              <BoxIcon className="size-12" />
            )}
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={`relative size-20 shrink-0 overflow-hidden rounded-[var(--r-sm)] border transition-colors ${
                index === active ? "border-accent" : "border-hairline hover:border-ink-faint"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
