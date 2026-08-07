/**
 * Desi hesabı — Gönder formülü: max(kg, cm³/3000).
 * Hacim m³ veya cm³ gelebilir; `volumeUnit` ile ayırt edilir.
 */
export function calculateDesi(params: {
  weightKg: number
  volume?: number
  volumeUnit?: 'm3' | 'cm3'
}): number {
  const weight = Math.max(0, params.weightKg || 0)
  const volume = Math.max(0, params.volume || 0)
  const cm3 = params.volumeUnit === 'cm3' ? volume : volume * 1_000_000
  const volumetric = cm3 > 0 ? cm3 / 3000 : 0
  return Math.max(weight, volumetric)
}

export function sumPackageDesi(
  packages: Array<{ agirlik_kg: string | number; hacim?: string | number; desi?: string | number }>
): number {
  return packages.reduce((sum, pkg) => {
    const explicit = Number(pkg.desi)
    if (Number.isFinite(explicit) && explicit > 0) return sum + explicit

    const weight = Number(pkg.agirlik_kg) || 0
    const volume = Number(pkg.hacim) || 0
    // Last Mile hacim alanı genelde m³; küçük sayılar için m³ varsay
    return sum + calculateDesi({ weightKg: weight, volume, volumeUnit: 'm3' })
  }, 0)
}
