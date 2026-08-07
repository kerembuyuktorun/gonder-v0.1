// TODO: Remove when API is ready

import type {
  DistanceDefinitionRecord,
  DistanceDefinitionStatus,
  DistanceSlaTarget,
} from "../_types"

const now = new Date()
const daysAgo = (n: number) => new Date(now.valueOf() - n * 86_400_000).toISOString()

let store: DistanceDefinitionRecord[] = [
  {
    id: "dist_city_inner",
    name: "Sehir Ici",
    description: "Ayni sehir icindeki dagitimlar",
    minKm: 0,
    maxKm: 50,
    hasUpperLimit: true,
    slaTarget: "24h",
    status: "active",
    createdAt: daysAgo(140),
    updatedAt: daysAgo(4),
    createdBy: "system",
    createdByName: "Sistem",
  },
  {
    id: "dist_near",
    name: "Yakin",
    description: "Kisa hat sevkiyatlari",
    minKm: 50.01,
    maxKm: 200,
    hasUpperLimit: true,
    slaTarget: "48h",
    status: "active",
    createdAt: daysAgo(140),
    updatedAt: daysAgo(3),
    createdBy: "system",
    createdByName: "Sistem",
  },
  {
    id: "dist_mid",
    name: "Orta",
    description: "Bolgeler arasi orta mesafe",
    minKm: 200.01,
    maxKm: 1000,
    hasUpperLimit: true,
    slaTarget: "48h",
    status: "active",
    createdAt: daysAgo(140),
    updatedAt: daysAgo(2),
    createdBy: "system",
    createdByName: "Sistem",
  },
  {
    id: "dist_far",
    name: "Uzak",
    description: "Uzun hat ve limit yok",
    minKm: 1000.01,
    maxKm: null,
    hasUpperLimit: false,
    slaTarget: "72h",
    status: "active",
    createdAt: daysAgo(140),
    updatedAt: daysAgo(1),
    createdBy: "system",
    createdByName: "Sistem",
  },
]

function normalizeNumber(value: number): number {
  return Number(value.toFixed(2))
}

export function getDistanceDefinitionsStore(): DistanceDefinitionRecord[] {
  return [...store].sort((a, b) => a.minKm - b.minKm)
}

export function insertDistanceDefinition(input: {
  name: string
  description?: string
  minKm: number
  maxKm: number | null
  hasUpperLimit: boolean
  slaTarget: DistanceSlaTarget
  status?: DistanceDefinitionStatus
  createdBy?: string
  createdByName?: string
}): DistanceDefinitionRecord {
  const ts = new Date().toISOString()
  const created: DistanceDefinitionRecord = {
    id: `dist_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name,
    description: input.description,
    minKm: normalizeNumber(input.minKm),
    maxKm: input.hasUpperLimit && input.maxKm !== null ? normalizeNumber(input.maxKm) : null,
    hasUpperLimit: input.hasUpperLimit,
    slaTarget: input.slaTarget,
    status: input.status ?? "active",
    createdAt: ts,
    updatedAt: ts,
    createdBy: input.createdBy ?? "ui-operator",
    createdByName: input.createdByName ?? "UI Operator",
  }

  store = [created, ...store]
  return created
}

export function updateDistanceDefinitionInStore(
  id: string,
  payload: {
    name: string
    description?: string
    minKm: number
    maxKm: number | null
    hasUpperLimit: boolean
    slaTarget: DistanceSlaTarget
    status: DistanceDefinitionStatus
  },
): DistanceDefinitionRecord | undefined {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) return undefined

  const next: DistanceDefinitionRecord = {
    ...store[index],
    name: payload.name,
    description: payload.description,
    minKm: normalizeNumber(payload.minKm),
    maxKm: payload.hasUpperLimit && payload.maxKm !== null ? normalizeNumber(payload.maxKm) : null,
    hasUpperLimit: payload.hasUpperLimit,
    slaTarget: payload.slaTarget,
    status: payload.status,
    updatedAt: new Date().toISOString(),
  }

  store[index] = next
  return next
}

export function setDistanceDefinitionStatusInStore(
  id: string,
  status: DistanceDefinitionStatus,
): DistanceDefinitionRecord | undefined {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) return undefined
  const next = { ...store[index], status, updatedAt: new Date().toISOString() }
  store[index] = next
  return next
}

export function deleteDistanceDefinitionInStore(id: string): void {
  store = store.filter((item) => item.id !== id)
}
