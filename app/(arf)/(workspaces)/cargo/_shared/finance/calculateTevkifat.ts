export function calculateTevkifat(amount: number, tevkifat: string): number {
  if (tevkifat === "yok") {
    return 0
  }

  const [numerator = 0, denominator = 1] = tevkifat.split("/").map(Number)
  if (!denominator) {
    return 0
  }

  return amount * (numerator / denominator)
}
