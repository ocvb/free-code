/**
 * Memory shape telemetry stubs. Telemetry is stripped in this fork.
 */

export function logMemoryWriteShape(
  _toolName: string,
  _toolInput: unknown,
  _filePath: string,
  _scope: string,
): void {
  // No-op: telemetry stripped
}

export function logMemoryRecallShape(
  _memories: readonly unknown[],
  _selected: readonly unknown[],
): void {
  // No-op: telemetry stripped
}
