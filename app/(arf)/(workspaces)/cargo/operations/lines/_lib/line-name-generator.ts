import type { LineStopFormRow } from "../_types"

export function generateLineName(stops: LineStopFormRow[]): string {
  if (stops.length === 0) return ""
  const first = stops[0]?.locationName?.trim()
  const last = stops[stops.length - 1]?.locationName?.trim()
  if (!first || !last) return ""
  return `${first} - ${last} Hattı`
}
