"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerIcon } from "@/components/shop/icons";
import type { Order } from "@/types/commerce";

/**
 * The controls on a single order: fulfilment, tracking, notes, and the two
 * email re-sends.
 *
 * Moving to "shipped" emails the customer, so the button says so — an action
 * that quietly contacts someone on your behalf should never be a surprise.
 */
export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState(order.fulfillmentStatus);
  const [carrier, setCarrier] = useState(order.trackingCarrier);
  const [tracking, setTracking] = useState(order.trackingNumber);
  const [notes, setNotes] = useState(order.notes);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; bad?: boolean } | null>(
    null
  );

  const hasDigital = order.items.some((item) => item.kind === "digital");
  const isDigitalOnly = order.items.every((item) => item.kind === "digital");

  const send = async (
    body: Record<string, unknown>,
    action: string,
    success: string
  ) => {
    setBusy(action);
    setMessage(null);
    try {
      const response = await fetch(`/api/commerce/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save.");
      setMessage({ text: success });
      router.refresh();
    } catch (caught) {
      setMessage({
        text: caught instanceof Error ? caught.message : "Could not save.",
        bad: true,
      });
    } finally {
      setBusy(null);
    }
  };

  const willEmailShipping =
    order.fulfillmentStatus !== "shipped" && fulfillment === "shipped";

  return (
    <div className="grid gap-6">
      <section className="rounded-[var(--r-md)] border border-hairline bg-surface p-5">
        <h2 className="text-[0.95rem] font-medium">Fulfilment</h2>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-[0.8rem] font-medium">Status</span>
            <select
              value={fulfillment}
              onChange={(event) =>
                setFulfillment(event.target.value as Order["fulfillmentStatus"])
              }
              className={inputClass}
            >
              {isDigitalOnly ? (
                <option value="not_required">Digital — nothing to ship</option>
              ) : null}
              <option value="unfulfilled">To pack</option>
              <option value="fulfilled">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>

          {!isDigitalOnly ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[0.8rem] font-medium">Carrier</span>
                <input
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  placeholder="Royal Mail"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[0.8rem] font-medium">
                  Tracking number
                </span>
                <input
                  value={tracking}
                  onChange={(event) => setTracking(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              void send(
                {
                  fulfillmentStatus: fulfillment,
                  trackingCarrier: carrier,
                  trackingNumber: tracking,
                },
                "fulfil",
                willEmailShipping
                  ? "Saved, and the customer has been emailed."
                  : "Saved."
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-pill)] bg-ink px-5 py-3 text-[0.86rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          >
            {busy === "fulfil" ? <SpinnerIcon /> : null}
            {willEmailShipping ? "Save & email the customer" : "Save fulfilment"}
          </button>
        </div>
      </section>

      <section className="rounded-[var(--r-md)] border border-hairline bg-surface p-5">
        <h2 className="text-[0.95rem] font-medium">Internal notes</h2>
        <p className="mt-1.5 text-[0.78rem] text-ink-faint">
          Only ever visible here.
        </p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className={`${inputClass} mt-4 resize-y`}
        />
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void send({ notes }, "notes", "Notes saved.")}
          className="mt-3 rounded-[var(--r-pill)] border border-hairline px-5 py-2.5 text-[0.84rem] transition-colors hover:bg-canvas-deep disabled:opacity-60"
        >
          {busy === "notes" ? "Saving…" : "Save notes"}
        </button>
      </section>

      {order.status === "paid" ? (
        <section className="rounded-[var(--r-md)] border border-hairline bg-surface p-5">
          <h2 className="text-[0.95rem] font-medium">Email</h2>
          <div className="mt-4 grid gap-2.5">
            <button
              type="button"
              disabled={busy !== null || !order.email}
              onClick={() =>
                void send({ resendReceipt: true }, "receipt", "Receipt re-sent.")
              }
              className="rounded-[var(--r-sm)] border border-hairline px-4 py-2.5 text-[0.83rem] transition-colors hover:bg-canvas-deep disabled:opacity-50"
            >
              {busy === "receipt" ? "Sending…" : "Re-send the receipt"}
            </button>

            {hasDigital ? (
              <button
                type="button"
                disabled={busy !== null || !order.email}
                onClick={() => {
                  if (
                    !window.confirm(
                      "Issue fresh download links? The customer's current links will stop working."
                    )
                  )
                    return;
                  void send(
                    { reissueDownloads: true },
                    "reissue",
                    "New download links issued and emailed."
                  );
                }}
                className="rounded-[var(--r-sm)] border border-accent/40 px-4 py-2.5 text-[0.83rem] text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
              >
                {busy === "reissue" ? "Issuing…" : "Issue fresh download links"}
              </button>
            ) : null}

            {!order.email ? (
              <p className="text-[0.76rem] text-ink-faint">
                This order has no email address on it.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {message ? (
        <p
          className={`rounded-[var(--r-sm)] px-4 py-3 text-[0.84rem] ${
            message.bad ? "bg-accent-soft text-ink" : "bg-apple/25 text-ink"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-[0.87rem] outline-none transition-colors placeholder:text-ink-faint focus:border-ink-faint";
