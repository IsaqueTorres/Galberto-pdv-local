export function centsFromMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) return NaN;
  return Math.round(number * 100);
}