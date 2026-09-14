/** Structured context attached to a reported error (breadcrumbs, tags, etc.). */
export interface ErrorContext {
  /** Where the error originated, e.g. 'mockClient.readStore'. */
  source: string
  [key: string]: unknown
}

/**
 * Central error sink. Every `catch` / rejected-promise handler in the app funnels
 * through here instead of calling `console.error` directly, so error reporting is
 * configured in one place.
 *
 * TODO: wire this to a real error monitoring service (e.g. Sentry) —
 *   `Sentry.captureException(error, { extra: context })`.
 * For now it logs to the console in dev and is a no-op in production builds.
 */
export function reportError(error: unknown, context: ErrorContext): void {
  if (import.meta.env.DEV) {
    console.error(`[${context.source}]`, error, context)
  }
}
