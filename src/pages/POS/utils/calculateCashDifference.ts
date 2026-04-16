
export function calculateCashDifference(
  closingAmount: number,
  expectedAmount: number
) {
  return Number(closingAmount || 0) - Number(expectedAmount || 0);
}