/**
 * Shared plumbing for the commerce route handlers.
 *
 * `handle` gives every route the same error contract: a `NotAuthorizedError`
 * becomes 401/403, a `CheckoutError` or a Zod failure becomes a 400 whose
 * message is safe to show the shopper, and anything else becomes a 500 with a
 * generic message — the real one goes to the server log, not to the client.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NotAuthorizedError } from "./auth";
import { CheckoutError } from "./checkout";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handle<T>(
  work: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await work();
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof NotAuthorizedError) {
      return fail(error.message, error.status);
    }
    if (error instanceof CheckoutError) {
      return fail(error.message, 400);
    }
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return fail(
        first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input.",
        400
      );
    }
    // Mongo's duplicate-key error is the one 500 that is really a 409.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: number }).code === 11000
    ) {
      return fail("That slug is already taken.", 409);
    }

    console.error("[commerce] unhandled route error", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
