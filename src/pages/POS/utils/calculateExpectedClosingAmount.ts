
export function calculateExpectedClosingAmount(
  openingAmount: number,
  cashSalesAmount = 0,
  withdrawalsAmount = 0
) {
  return (
    Number(openingAmount || 0) +
    Number(cashSalesAmount || 0) -
    Number(withdrawalsAmount || 0)
  );
}
