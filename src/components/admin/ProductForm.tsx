"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { SpinnerIcon, TrashIcon, DownloadIcon } from "@/components/shop/icons";
import { minorToMajorString } from "@/lib/commerce/money";
import { uploadToCloudinary, formatBytes } from "@/lib/commerce/uploadClient";
import type { DigitalAsset, Product, ProductImage } from "@/types/commerce";

/**
 * Create and edit, in one component.
 *
 * The two differ only in the HTTP verb and the URL, and keeping them together
 * is what stops the edit form quietly drifting out of step with the create
 * form — the usual way a field ends up saveable on one and not the other.
 *
 * Prices are held as major-unit strings while typing, because a controlled
 * number input that reformats mid-keystroke is unusable. The server converts
 * once, on save.
 */

type FormState = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  kind: "physical" | "digital";
  status: "draft" | "active" | "archived";
  featured: boolean;
  price: string;
  compareAt: string;
  category: string;
  tags: string;
  stock: string;
  weightGrams: string;
  images: ProductImage[];
  digital: DigitalAsset | null;
};

function initialState(product?: Product): FormState {
  if (!product) {
    return {
      title: "",
      slug: "",
      summary: "",
      description: "",
      kind: "digital",
      status: "draft",
      featured: false,
      price: "",
      compareAt: "",
      category: "",
      tags: "",
      stock: "",
      weightGrams: "",
      images: [],
      digital: null,
    };
  }

  return {
    title: product.title,
    slug: product.slug,
    summary: product.summary,
    description: product.description,
    kind: product.kind,
    status: product.status,
    featured: product.featured,
    price: minorToMajorString(product.priceMinor, product.currency),
    compareAt:
      product.compareAtMinor === null
        ? ""
        : minorToMajorString(product.compareAtMinor, product.currency),
    category: product.category,
    tags: product.tags.join(", "),
    stock: product.stock === null ? "" : String(product.stock),
    weightGrams: product.weightGrams === null ? "" : String(product.weightGrams),
    images: product.images,
    digital: product.digital,
  };
}

export function ProductForm({
  product,
  currencySymbol,
}: {
  product?: Product;
  currencySymbol: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim(),
      description: form.description,
      kind: form.kind,
      status: form.status,
      featured: form.featured,
      price: form.price,
      compareAt: form.compareAt.trim() === "" ? null : form.compareAt,
      images: form.images,
      category: form.category.trim(),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      stock: form.stock.trim() === "" ? null : Number(form.stock),
      weightGrams:
        form.weightGrams.trim() === "" ? null : Number(form.weightGrams),
      digital: form.digital,
    };

    try {
      const response = await fetch(
        product
          ? `/api/commerce/admin/products/${product.id}`
          : "/api/commerce/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save.");

      router.push("/admin/products");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
      setSaving(false);
    }
  };

  const remove = async (purge: boolean) => {
    if (!product) return;
    const message = purge
      ? "Delete this product permanently, along with its images and files? This cannot be undone."
      : "Archive this product? It disappears from the shop but keeps its order history.";
    if (!window.confirm(message)) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/commerce/admin/products/${product.id}${purge ? "?purge=1" : ""}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not delete.");
      if (result.reason) window.alert(result.reason);
      router.push("/admin/products");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[1.9rem]">
            {product ? "Edit product" : "New product"}
          </h1>
          {product ? (
            <Link
              href={`/shop/${product.slug}`}
              className="mt-1.5 inline-block text-[0.82rem] text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              View on the shop
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-[var(--r-pill)] border border-hairline px-5 py-3 text-[0.87rem] transition-colors hover:bg-canvas-deep"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-accent px-6 py-3 text-[0.87rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? <SpinnerIcon /> : null}
            {saving ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-[var(--r-sm)] border border-accent/30 bg-accent-soft px-5 py-3.5 text-[0.87rem]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-start">
        {/* ---- Main column ---- */}
        <div className="grid gap-6">
          <Panel title="Details">
            <Field label="Title" required>
              <input
                required
                value={form.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="The Ops Automation Playbook"
                className={inputClass}
              />
            </Field>

            <Field
              label="URL slug"
              hint={
                product
                  ? "Changing this breaks existing links to the product."
                  : "Left blank, one is generated from the title."
              }
            >
              <div className="flex items-center gap-0 rounded-[var(--r-sm)] border border-hairline bg-surface focus-within:border-ink-faint">
                <span className="pl-4 font-mono text-[0.8rem] text-ink-faint">
                  /shop/
                </span>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    set(
                      "slug",
                      event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  placeholder="ops-automation-playbook"
                  className="w-full bg-transparent py-3 pl-1 pr-4 font-mono text-[0.85rem] outline-none"
                />
              </div>
            </Field>

            <Field label="Short summary" hint="One line, shown on the shop grid.">
              <input
                value={form.summary}
                onChange={(event) => set("summary", event.target.value)}
                maxLength={300}
                placeholder="Twelve workflows you can run in an afternoon."
                className={inputClass}
              />
            </Field>

            <Field label="Full description" hint="Blank lines start a new paragraph.">
              <textarea
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                rows={9}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>
          </Panel>

          <Panel title="Images">
            <ImageUploader
              images={form.images}
              onChange={(images) => set("images", images)}
            />
          </Panel>

          {form.kind === "digital" ? (
            <Panel
              title="The file"
              hint="Stored privately on Cloudinary and only ever served through a paid download link."
            >
              <DigitalAssetField
                asset={form.digital}
                onChange={(digital) => set("digital", digital)}
              />
            </Panel>
          ) : (
            <Panel title="Shipping">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Stock" hint="Blank means stock is not tracked.">
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(event) => set("stock", event.target.value)}
                    placeholder="Untracked"
                    className={inputClass}
                  />
                </Field>
                <Field label="Weight (grams)" hint="For your own packing notes.">
                  <input
                    type="number"
                    min={0}
                    value={form.weightGrams}
                    onChange={(event) => set("weightGrams", event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Panel>
          )}
        </div>

        {/* ---- Sidebar ---- */}
        <div className="grid gap-6 lg:sticky lg:top-24">
          <Panel title="Type">
            <div className="grid gap-2">
              {(
                [
                  ["digital", "Download", "A file the customer gets instantly."],
                  ["physical", "Physical", "Something you pack and post."],
                ] as const
              ).map(([value, label, hint]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-[var(--r-sm)] border p-3.5 transition-colors ${
                    form.kind === value
                      ? "border-accent bg-accent-soft/40"
                      : "border-hairline hover:border-ink-faint"
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    checked={form.kind === value}
                    onChange={() => set("kind", value)}
                    className="mt-1 accent-[var(--c-accent)]"
                  />
                  <span>
                    <span className="block text-[0.88rem]">{label}</span>
                    <span className="mt-0.5 block text-[0.75rem] text-ink-faint">
                      {hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Panel>

          <Panel title="Pricing">
            <Field label={`Price (${currencySymbol})`} required>
              <input
                required
                inputMode="decimal"
                value={form.price}
                onChange={(event) => set("price", event.target.value)}
                placeholder="24.99"
                className={inputClass}
              />
            </Field>
            <Field
              label={`Compare-at price (${currencySymbol})`}
              hint="Optional. Shown struck through, to signal a saving."
            >
              <input
                inputMode="decimal"
                value={form.compareAt}
                onChange={(event) => set("compareAt", event.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </Field>
          </Panel>

          <Panel title="Visibility">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  set("status", event.target.value as FormState["status"])
                }
                className={inputClass}
              >
                <option value="draft">Draft — hidden from the shop</option>
                <option value="active">Live — on sale</option>
                <option value="archived">Archived — retired</option>
              </select>
            </Field>

            <label className="mt-1 flex cursor-pointer items-center gap-3 text-[0.87rem]">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => set("featured", event.target.checked)}
                className="size-4 accent-[var(--c-accent)]"
              />
              Feature this product
            </label>
          </Panel>

          <Panel title="Organisation">
            <Field label="Category" hint="Becomes a filter on the shop page.">
              <input
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                placeholder="Templates"
                className={inputClass}
              />
            </Field>
            <Field label="Tags" hint="Comma separated. Used by search.">
              <input
                value={form.tags}
                onChange={(event) => set("tags", event.target.value)}
                placeholder="automation, notion, ops"
                className={inputClass}
              />
            </Field>
          </Panel>

          {product ? (
            <Panel title="Danger zone">
              <div className="grid gap-2.5">
                <button
                  type="button"
                  onClick={() => void remove(false)}
                  disabled={deleting}
                  className="rounded-[var(--r-sm)] border border-hairline px-4 py-2.5 text-[0.83rem] transition-colors hover:bg-canvas-deep disabled:opacity-60"
                >
                  Archive product
                </button>
                <button
                  type="button"
                  onClick={() => void remove(true)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--r-sm)] border border-accent/40 px-4 py-2.5 text-[0.83rem] text-accent transition-colors hover:bg-accent-soft disabled:opacity-60"
                >
                  <TrashIcon />
                  Delete permanently
                </button>
                <p className="text-[0.73rem] leading-relaxed text-ink-faint">
                  A product that appears on an order is always archived rather
                  than deleted, so order history stays intact.
                </p>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </form>
  );
}

/* ---- Digital asset upload ---------------------------------------------- */

function DigitalAssetField({
  asset,
  onChange,
}: {
  asset: DigitalAsset | null;
  onChange: (asset: DigitalAsset | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const uploaded = await uploadToCloudinary(file, "digital-asset", setProgress);
      onChange({
        publicId: uploaded.publicId,
        fileName: file.name,
        format: uploaded.format,
        bytes: uploaded.bytes,
        resourceType: uploaded.resourceType,
        downloadLimit: asset?.downloadLimit ?? 5,
        expiryHours: asset?.expiryHours ?? 720,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-5">
      {asset ? (
        <div className="flex items-center gap-4 rounded-[var(--r-sm)] border border-hairline bg-canvas px-4 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <DownloadIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.87rem]">
              {asset.fileName || asset.publicId}
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-ink-faint">
              {formatBytes(asset.bytes)}
              {asset.format ? ` · ${asset.format.toUpperCase()}` : ""}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove file"
            className="shrink-0 rounded-full p-2 text-ink-faint transition-colors hover:text-accent"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center gap-2 rounded-[var(--r-sm)] border border-dashed border-hairline px-4 py-9 text-ink-faint transition-colors hover:border-ink-faint hover:text-ink disabled:opacity-60"
        >
          {busy ? <SpinnerIcon /> : <DownloadIcon />}
          <span className="text-[0.85rem]">
            {busy ? `Uploading… ${progress}%` : "Choose the file to sell"}
          </span>
          <span className="text-[0.73rem]">PDF, ZIP, video — anything.</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => void upload(event.target.files?.[0])}
      />

      {error ? <p className="text-[0.8rem] text-accent">{error}</p> : null}

      {asset ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Downloads allowed" hint="Per order.">
            <input
              type="number"
              min={1}
              max={100}
              value={asset.downloadLimit}
              onChange={(event) =>
                onChange({
                  ...asset,
                  downloadLimit: Number(event.target.value) || 1,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Link expires after (hours)" hint="720 hours is 30 days.">
            <input
              type="number"
              min={1}
              max={8760}
              value={asset.expiryHours}
              onChange={(event) =>
                onChange({
                  ...asset,
                  expiryHours: Number(event.target.value) || 1,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

/* ---- Small layout primitives -------------------------------------------- */

const inputClass =
  "w-full rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-[0.88rem] outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint";

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--r-md)] border border-hairline bg-surface p-5 sm:p-6">
      <h2 className="text-[0.95rem] font-medium">{title}</h2>
      {hint ? (
        <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-faint">{hint}</p>
      ) : null}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.8rem] font-medium">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[0.73rem] leading-relaxed text-ink-faint">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
