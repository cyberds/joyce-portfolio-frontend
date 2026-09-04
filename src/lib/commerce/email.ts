/**
 * Transactional email through ZeptoMail.
 *
 * ZeptoMail's Node SDK is a thin wrapper over one HTTP endpoint, so this uses
 * `fetch` directly — one fewer dependency, and it works unchanged on the Edge
 * runtime. The host differs by data centre (api.zeptomail.eu for EU accounts,
 * api.zeptomail.com for US), hence ZEPTOMAIL_HOST.
 *
 * Sending never throws into the caller: a receipt that fails to send must not
 * roll back a payment Stripe has already taken. Failures are logged, and show
 * up in the admin order view as a missing `receiptSentAt`.
 */

import { commerceEnv, hasEmail } from "./env";
import { formatMoney } from "./money";
import type { Order } from "@/types/commerce";

type SendResult = { ok: boolean; error?: string };

export async function sendEmail(options: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!hasEmail()) {
    console.warn(
      `[zeptomail] skipped "${options.subject}" — ZEPTOMAIL_TOKEN / ZEPTOMAIL_FROM_ADDRESS not set.`
    );
    return { ok: false, error: "not_configured" };
  }

  try {
    const response = await fetch(`https://${commerceEnv.zeptoHost}/v1.1/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // ZeptoMail expects the literal "Zoho-enczapikey " prefix on the token.
        Authorization: commerceEnv.zeptoToken.startsWith("Zoho-enczapikey")
          ? commerceEnv.zeptoToken
          : `Zoho-enczapikey ${commerceEnv.zeptoToken}`,
      },
      body: JSON.stringify({
        from: {
          address: commerceEnv.zeptoFromAddress,
          name: commerceEnv.zeptoFromName,
        },
        to: [
          {
            email_address: {
              address: options.to,
              name: options.toName || options.to,
            },
          },
        ],
        ...(options.replyTo ? { reply_to: [{ address: options.replyTo }] } : {}),
        subject: options.subject,
        htmlbody: options.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[zeptomail] send failed", response.status, detail);
      return { ok: false, error: `${response.status} ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[zeptomail] send threw", error);
    return { ok: false, error: String(error) };
  }
}

/* ---- Templates ------------------------------------------------------- */

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);

/**
 * Email clients are a decade behind browsers: tables, inline styles, no custom
 * fonts. The palette still tracks src/design/tokens.ts, by hand.
 */
function shell(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8f2;font-family:Helvetica,Arial,sans-serif;color:#241319;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #ecdde3;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 18px;border-bottom:1px solid #ecdde3;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#df0f57;vertical-align:middle;"></span>
          <span style="font-size:15px;letter-spacing:.02em;vertical-align:middle;padding-left:8px;">Joyce Workflow Automation</span>
        </td></tr>
        <tr><td style="padding:28px 32px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;line-height:1.25;">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f6ebdd;font-size:12px;color:#7c5a66;">
          Questions? Reply to this email or write to
          <a href="mailto:${commerceEnv.supportEmail}" style="color:#b00b45;">${commerceEnv.supportEmail}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemRows(order: Order) {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #ecdde3;font-size:14px;">
          ${escapeHtml(item.title)}
          <span style="color:#ac909b;">&times; ${item.quantity}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #ecdde3;font-size:14px;white-space:nowrap;">
          ${formatMoney(item.unitPriceMinor * item.quantity, order.currency)}
        </td>
      </tr>`
    )
    .join("");
}

function totalsRows(order: Order) {
  const row = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:6px 0;font-size:${bold ? "15px" : "13px"};color:${
        bold ? "#241319" : "#7c5a66"
      };${bold ? "font-weight:600;" : ""}">${label}</td>
      <td align="right" style="padding:6px 0;font-size:${
        bold ? "15px" : "13px"
      };${bold ? "font-weight:600;" : ""}white-space:nowrap;">${value}</td>
    </tr>`;

  return [
    row("Subtotal", formatMoney(order.subtotalMinor, order.currency)),
    order.shippingMinor > 0
      ? row("Shipping", formatMoney(order.shippingMinor, order.currency))
      : "",
    row("Total", formatMoney(order.totalMinor, order.currency), true),
  ].join("");
}

/** Receipt, plus download buttons when the order contains digital goods. */
export function orderConfirmationEmail(order: Order) {
  const firstGrant = order.downloads[0];

  const downloads = firstGrant
    ? `<div style="margin-top:24px;padding:18px;background:#fbd7e4;border-radius:12px;">
         <p style="margin:0 0 12px;font-size:14px;font-weight:600;">Your downloads</p>
         ${order.downloads
           .map(
             (grant) =>
               `<p style="margin:0 0 10px;">
                  <a href="${commerceEnv.siteUrl}/api/commerce/download/${grant.token}"
                     style="display:inline-block;background:#df0f57;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:13px;">
                    Download ${escapeHtml(grant.title)}
                  </a>
                </p>`
           )
           .join("")}
         <p style="margin:8px 0 0;font-size:12px;color:#7c5a66;line-height:1.6;">
           Links stay live until ${new Date(firstGrant.expiresAt).toLocaleDateString(
             "en-GB",
             { day: "numeric", month: "long", year: "numeric" }
           )}
           and allow up to ${firstGrant.maxDownloads} downloads each. They are always
           available from <a href="${commerceEnv.siteUrl}/account" style="color:#b00b45;">your account</a>.
         </p>
       </div>`
    : "";

  const shipping = order.shippingAddress
    ? `<div style="margin-top:24px;">
         <p style="margin:0 0 6px;font-size:13px;font-weight:600;">Shipping to</p>
         <p style="margin:0;font-size:13px;color:#7c5a66;line-height:1.6;">
           ${[
             order.shippingAddress.name,
             order.shippingAddress.line1,
             order.shippingAddress.line2,
             order.shippingAddress.city,
             order.shippingAddress.postalCode,
             order.shippingAddress.country,
           ]
             .filter(Boolean)
             .map(escapeHtml)
             .join("<br>")}
         </p>
       </div>`
    : "";

  return {
    subject: `Order ${order.orderNumber} confirmed`,
    html: shell(
      "Thank you — your order is confirmed",
      `<p style="margin:0 0 20px;font-size:14px;color:#7c5a66;line-height:1.7;">
         Hi ${escapeHtml(order.customerName || "there")}, your payment went through and order
         <strong style="color:#241319;">${escapeHtml(order.orderNumber)}</strong> is confirmed.
       </p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(
         order
       )}${totalsRows(order)}</table>
       ${downloads}
       ${shipping}`
    ),
  };
}

/** Sent when the admin marks a physical order shipped. */
export function shippingNotificationEmail(order: Order) {
  const tracking = order.trackingNumber
    ? `<p style="margin:0 0 20px;font-size:14px;">
         Tracking: <strong>${escapeHtml(order.trackingNumber)}</strong>${
           order.trackingCarrier ? ` (${escapeHtml(order.trackingCarrier)})` : ""
         }
       </p>`
    : "";

  return {
    subject: `Order ${order.orderNumber} is on its way`,
    html: shell(
      "Your order has shipped",
      `<p style="margin:0 0 20px;font-size:14px;color:#7c5a66;line-height:1.7;">
         Hi ${escapeHtml(order.customerName || "there")}, order
         <strong style="color:#241319;">${escapeHtml(order.orderNumber)}</strong> has left us.
       </p>
       ${tracking}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(
         order
       )}</table>`
    ),
  };
}

/** Heads-up to the shop owner. */
export function adminNewOrderEmail(order: Order) {
  return {
    subject: `New order ${order.orderNumber} — ${formatMoney(
      order.totalMinor,
      order.currency
    )}`,
    html: shell(
      `New order ${order.orderNumber}`,
      `<p style="margin:0 0 20px;font-size:14px;color:#7c5a66;line-height:1.7;">
         ${escapeHtml(order.customerName || order.email)} just paid
         ${formatMoney(order.totalMinor, order.currency)}.
       </p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(
         order
       )}</table>
       <p style="margin:24px 0 0;">
         <a href="${commerceEnv.siteUrl}/admin/orders/${order.id}"
            style="display:inline-block;background:#241319;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:999px;font-size:13px;">
           Open in dashboard
         </a>
       </p>`
    ),
  };
}
