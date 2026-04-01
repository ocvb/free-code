/**
 * Task summary stubs for BG_SESSIONS background session management.
 * Provides periodic task summary generation for `claude ps`.
 */

export function shouldGenerateTaskSummary(): boolean {
  return false
}

export async function maybeGenerateTaskSummary(_opts: Record<string, unknown>): Promise<void> {
  // No-op stub — background session summary generation not available in this snapshot.
}
