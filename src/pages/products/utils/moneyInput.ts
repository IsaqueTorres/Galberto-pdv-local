export function moneyInput(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return Number(value).toFixed(2).replace(".", ",");
}