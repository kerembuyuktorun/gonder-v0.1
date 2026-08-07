export function calculateKdv(amount: number, kdvRate: number): number {
  return amount * (kdvRate / 100)
}
