function parseVolumeNumber(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input
  if (typeof input === 'string' && input.trim()) {
    const parsed = Number(input.replace(',', '.'))
    if (Number.isFinite(parsed)) return parsed
  }
  return NaN
}

export function formatOrderHacim(value: number): string {
  return value.toLocaleString('tr-TR', {
    maximumFractionDigits: 3,
  })
}

/** BE `volume` / legacy volume alanlarından hacim okur. */
export function resolveVolumeValue(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = parseVolumeNumber(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export function resolveVolumeValueOrZero(...values: unknown[]): number {
  return resolveVolumeValue(...values) ?? 0
}
