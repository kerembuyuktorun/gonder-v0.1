import { ROUTE_COLORS } from '../_types/orchestrator'

export { ROUTE_COLORS }

export type RouteColor = (typeof ROUTE_COLORS)[number]

export function normalizeRouteColor(color: string): string {
  return color.trim().toLowerCase()
}

/** Kullanılan renkler — except (mevcut rota rengi) hariç tutulabilir */
export function collectUsedRouteColors(
  colors: Iterable<string>,
  except?: string | null
): Set<string> {
  const used = new Set<string>()
  const exceptNorm = except ? normalizeRouteColor(except) : null
  for (const color of colors) {
    const normalized = normalizeRouteColor(color)
    if (exceptNorm && normalized === exceptNorm) continue
    used.add(normalized)
  }
  return used
}

export function isRouteColorTaken(
  color: string,
  usedColors: Iterable<string>,
  currentColor?: string | null
): boolean {
  const normalized = normalizeRouteColor(color)
  if (currentColor && normalized === normalizeRouteColor(currentColor)) {
    return false
  }
  return collectUsedRouteColors(usedColors).has(normalized)
}

/**
 * Aktif / kullanılan renklere göre sıradaki boş renkleri seçer.
 * Palet dolunca ROUTE_COLORS üzerinden döngüsel devam eder.
 */
export function pickNextRouteColors(
  count: number,
  usedColors: Iterable<string> = []
): string[] {
  if (count <= 0) return []

  const used = collectUsedRouteColors(usedColors)
  const available = ROUTE_COLORS.filter(
    (color) => !used.has(normalizeRouteColor(color))
  )
  const picked: string[] = []

  for (let i = 0; i < count; i += 1) {
    if (i < available.length) {
      picked.push(available[i])
      continue
    }
    // Palet tükendi — çakışmayı minimize etmek için tam paletten devam
    picked.push(ROUTE_COLORS[(used.size + i) % ROUTE_COLORS.length])
  }

  return picked
}

export function pickNextRouteColor(usedColors: Iterable<string> = []): string {
  return pickNextRouteColors(1, usedColors)[0] ?? ROUTE_COLORS[0]
}
