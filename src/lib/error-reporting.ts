/**
 * Generic client-side error reporting.
 * Replace this with your own error tracking (e.g. Sentry) as needed.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[Error Boundary]", error, context);
}
