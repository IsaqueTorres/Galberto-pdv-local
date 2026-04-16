export function nowIso(): string {
  return new Date().toISOString();
}

export function serializeJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  return JSON.parse(value) as T;
}

export function booleanToInt(value: boolean | undefined): number {
  return value ? 1 : 0;
}

