/**
 * Commerce environment.
 *
 * Every integration in the shop (Mongo, Stripe, Clerk, Cloudinary, ZeptoMail)
 * needs credentials that only exist in `.env.local`. Rather than let the app
 * explode with a stack trace when one is missing, the whole commerce module
 * reads its config through here: `commerceEnv` reports what is present, and
 * `missingCommerceEnv()` returns a human-readable list the UI can render as a
 * setup checklist. The portfolio site keeps working either way.
 */

export const commerceEnv = {
  mongodbUri: process.env.MONGODB_URI ?? "",
  mongodbDb: process.env.MONGODB_DB ?? "joyce_shop",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",

  zeptoToken: process.env.ZEPTOMAIL_TOKEN ?? "",
  zeptoHost: process.env.ZEPTOMAIL_HOST ?? "api.zeptomail.eu",
  zeptoFromAddress: process.env.ZEPTOMAIL_FROM_ADDRESS ?? "",
  zeptoFromName: process.env.ZEPTOMAIL_FROM_NAME ?? "Joyce Wadawasina",

  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),

  currency: (process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "GBP").toUpperCase(),
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, ""),

  supportEmail: process.env.SUPPORT_EMAIL ?? "hello@joycewadawasina.com",
} as const;

/** Required for the storefront to render products at all. */
const CATALOGUE_KEYS = [
  ["MONGODB_URI", commerceEnv.mongodbUri],
] as const;

/** Required to take money. */
const CHECKOUT_KEYS = [
  ["STRIPE_SECRET_KEY", commerceEnv.stripeSecretKey],
  ["STRIPE_WEBHOOK_SECRET", commerceEnv.stripeWebhookSecret],
] as const;

/** Required for sign-in, the account area and the admin dashboard. */
const AUTH_KEYS = [
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", commerceEnv.clerkPublishableKey],
  ["CLERK_SECRET_KEY", commerceEnv.clerkSecretKey],
] as const;

/** Required to upload product images and digital files. */
const MEDIA_KEYS = [
  ["CLOUDINARY_CLOUD_NAME", commerceEnv.cloudinaryCloudName],
  ["CLOUDINARY_API_KEY", commerceEnv.cloudinaryApiKey],
  ["CLOUDINARY_API_SECRET", commerceEnv.cloudinaryApiSecret],
] as const;

/** Required to send receipts and download links. */
const EMAIL_KEYS = [
  ["ZEPTOMAIL_TOKEN", commerceEnv.zeptoToken],
  ["ZEPTOMAIL_FROM_ADDRESS", commerceEnv.zeptoFromAddress],
] as const;

type Group = "catalogue" | "checkout" | "auth" | "media" | "email";

const GROUPS: Record<Group, readonly (readonly [string, string])[]> = {
  catalogue: CATALOGUE_KEYS,
  checkout: CHECKOUT_KEYS,
  auth: AUTH_KEYS,
  media: MEDIA_KEYS,
  email: EMAIL_KEYS,
};

/** Names of the env vars in `groups` that have no value yet. */
export function missingCommerceEnv(...groups: Group[]): string[] {
  const wanted = groups.length
    ? groups
    : (Object.keys(GROUPS) as Group[]);
  return wanted.flatMap((group) =>
    GROUPS[group].filter(([, value]) => !value).map(([name]) => name)
  );
}

export const hasDatabase = () => Boolean(commerceEnv.mongodbUri);
export const hasStripe = () => Boolean(commerceEnv.stripeSecretKey);
export const hasClerk = () =>
  Boolean(commerceEnv.clerkPublishableKey && commerceEnv.clerkSecretKey);
export const hasCloudinary = () =>
  Boolean(
    commerceEnv.cloudinaryCloudName &&
      commerceEnv.cloudinaryApiKey &&
      commerceEnv.cloudinaryApiSecret
  );
export const hasEmail = () =>
  Boolean(commerceEnv.zeptoToken && commerceEnv.zeptoFromAddress);
