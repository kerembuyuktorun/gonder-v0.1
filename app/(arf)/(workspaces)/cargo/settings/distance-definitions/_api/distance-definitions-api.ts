import type {
  DistanceDefinitionRecord,
  DistanceDefinitionStatus,
  DistanceSlaTarget,
  RangeCollision,
  RangeValidationResult,
} from "../_types"
import {
  deleteDistanceDefinitionInStore,
  getDistanceDefinitionsStore,
  insertDistanceDefinition,
  setDistanceDefinitionStatusInStore,
  updateDistanceDefinitionInStore,
} from "../_mock/distance-definitions-mock-data"

const latency = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export interface FetchDistanceDefinitionsFilters {
  q?: string
  status?: DistanceDefinitionStatus | "all"
  sla?: DistanceSlaTarget | "all"
}

export interface UpsertDistanceDefinitionPayload {
  name: string
  description?: string
  minKm: number
  maxKm: number | null
  hasUpperLimit: boolean
  slaTarget: DistanceSlaTarget
  status: DistanceDefinitionStatus
}

function upperBound(row: Pick<DistanceDefinitionRecord, "maxKm" | "hasUpperLimit">): number {
  return row.hasUpperLimit && row.maxKm !== null ? row.maxKm : Number.POSITIVE_INFINITY
}

function intersects(
  leftMin: number,
  leftMax: number,
  rightMin: number,
  rightMax: number,
): boolean {
  return leftMin <= rightMax && rightMin <= leftMax
}

function buildGapWarnings(rows: DistanceDefinitionRecord[]): string[] {
  const sorted = [...rows]
    .filter((item) => item.status === "active")
    .sort((a, b) => a.minKm - b.minKm)

  const warnings: string[] = []
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i]
    const next = sorted[i + 1]
    const currentMax = upperBound(current)

    if (!Number.isFinite(currentMax)) continue

    const expectedNextMin = Number((currentMax + 0.01).toFixed(2))
    if (next.minKm > expectedNextMin) {
      const gapEnd = Number((next.minKm - 0.01).toFixed(2))
      warnings.push(
        `${current.name} ve ${next.name} arasında boşluk var: ${expectedNextMin} KM - ${gapEnd} KM`,
      )
    }
  }

  return warnings
}

export async function fetchDistanceDefinitions(
  filters: FetchDistanceDefinitionsFilters = {},
): Promise<DistanceDefinitionRecord[]> {
  await latency()
  const q = (filters.q ?? "").trim().toLocaleLowerCase("tr-TR")

  return getDistanceDefinitionsStore()
    .filter((row) => {
      if (filters.status && filters.status !== "all" && row.status !== filters.status) return false
      if (filters.sla && filters.sla !== "all" && row.slaTarget !== filters.sla) return false
      if (!q) return true
      return `${row.name} ${row.description ?? ""}`.toLocaleLowerCase("tr-TR").includes(q)
    })
    .sort((a, b) => a.minKm - b.minKm)
}

export async function validateDistanceRange(
  payload: Pick<UpsertDistanceDefinitionPayload, "minKm" | "maxKm" | "hasUpperLimit" | "status">,
  ignoreId?: string,
): Promise<RangeValidationResult> {
  await latency(60)

  if (payload.minKm < 0) {
    return {
      isValid: false,
      collisions: [],
      gapWarnings: ["Min Km değeri 0'dan küçük olamaz."],
    }
  }

  if (payload.hasUpperLimit && payload.maxKm !== null && payload.maxKm < payload.minKm) {
    return {
      isValid: false,
      collisions: [],
      gapWarnings: ["Max Km değeri Min Km değerinden küçük olamaz."],
    }
  }

  if (payload.status !== "active") {
    return { isValid: true, collisions: [], gapWarnings: [] }
  }

  const candidateMin = Number(payload.minKm.toFixed(2))
  const candidateMax = payload.hasUpperLimit && payload.maxKm !== null
    ? Number(payload.maxKm.toFixed(2))
    : Number.POSITIVE_INFINITY

  const rows = getDistanceDefinitionsStore().filter((row) => row.status === "active" && row.id !== ignoreId)

  const collisions: RangeCollision[] = rows
    .filter((row) => intersects(candidateMin, candidateMax, row.minKm, upperBound(row)))
    .map((row) => ({
      currentId: ignoreId,
      conflictingId: row.id,
      conflictingName: row.name,
    }))

  const gapWarnings = buildGapWarnings([
    ...rows,
    {
      id: ignoreId ?? "candidate",
      name: "Yeni Tanım",
      minKm: candidateMin,
      maxKm: Number.isFinite(candidateMax) ? candidateMax : null,
      hasUpperLimit: Number.isFinite(candidateMax),
      slaTarget: "24h",
      status: "active",
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      createdByName: "",
    },
  ])

  return {
    isValid: collisions.length === 0,
    collisions,
    gapWarnings,
  }
}

export async function createDistanceDefinition(
  payload: UpsertDistanceDefinitionPayload,
): Promise<DistanceDefinitionRecord> {
  const validation = await validateDistanceRange(payload)
  if (!validation.isValid) {
    const first = validation.collisions[0]
    throw new Error(`Dikkat! girdiğiniz değerler '${first?.conflictingName ?? "bir tanım"}' ile çakışmaktadır.`)
  }

  await latency(150)
  return insertDistanceDefinition(payload)
}

export async function updateDistanceDefinition(
  id: string,
  payload: UpsertDistanceDefinitionPayload,
): Promise<DistanceDefinitionRecord | undefined> {
  const validation = await validateDistanceRange(payload, id)
  if (!validation.isValid) {
    const first = validation.collisions[0]
    throw new Error(`Dikkat! girdiğiniz değerler '${first?.conflictingName ?? "bir tanım"}' ile çakışmaktadır.`)
  }

  await latency(150)
  return updateDistanceDefinitionInStore(id, payload)
}

export async function deleteDistanceDefinition(id: string): Promise<void> {
  await latency(100)
  deleteDistanceDefinitionInStore(id)
}

export async function setDistanceDefinitionStatus(
  id: string,
  status: DistanceDefinitionStatus,
): Promise<DistanceDefinitionRecord | undefined> {
  await latency(120)
  const current = getDistanceDefinitionsStore().find((row) => row.id === id)
  if (!current) return undefined

  if (status === "active") {
    const validation = await validateDistanceRange({
      minKm: current.minKm,
      maxKm: current.maxKm,
      hasUpperLimit: current.hasUpperLimit,
      status: "active",
    }, id)

    if (!validation.isValid) {
      const first = validation.collisions[0]
      throw new Error(`Dikkat! girdiğiniz değerler '${first?.conflictingName ?? "bir tanım"}' ile çakışmaktadır.`)
    }
  }

  return setDistanceDefinitionStatusInStore(id, status)
}
