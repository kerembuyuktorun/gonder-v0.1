export * from "./distance-definition"

import type { DistanceDefinitionStatus, DistanceSlaTarget } from "./distance-definition"

export const DISTANCE_STATUS_LABELS: Record<DistanceDefinitionStatus, string> = {
  active: "Aktif",
  passive: "Pasif",
}

export const DISTANCE_SLA_LABELS: Record<DistanceSlaTarget, string> = {
  "24h": "24 Saat",
  "48h": "48 Saat",
  "72h": "72 Saat",
}
