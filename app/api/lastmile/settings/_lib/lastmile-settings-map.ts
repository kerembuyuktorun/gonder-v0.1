import type { OptimizeSettings } from '../../../../(arf)/(workspaces)/lastmile/planning/route-orchestrator/_types/orchestrator'
import { DEFAULT_OPTIMIZE_SETTINGS } from '../../../../(arf)/(workspaces)/lastmile/planning/route-orchestrator/_types/orchestrator'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
  }
  return undefined
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function toBackendObjective(objective: OptimizeSettings['objective']): string {
  if (objective === 'min_time') return 'min_duration'
  return objective
}

function fromBackendObjective(objective: string): OptimizeSettings['objective'] {
  if (objective === 'min_duration') return 'min_time'
  if (
    objective === 'balanced' ||
    objective === 'min_distance' ||
    objective === 'min_vehicles'
  ) {
    return objective
  }
  return DEFAULT_OPTIMIZE_SETTINGS.objective
}

export function normalizeLastMileSettingsPayload(raw: unknown): OptimizeSettings {
  const root = asRecord(raw)
  const row = asRecord(root.lastMileSettings ?? root.settings ?? root)

  const objective = pickString(
    row.planningObjective,
    row.planning_objective,
    row.objective
  )

  return {
    objective: fromBackendObjective(objective || DEFAULT_OPTIMIZE_SETTINGS.objective),
    maxRouteDurationMin: clampNumber(
      pickNumber(
        row.planningMaxRouteDurationMin,
        row.planning_max_route_duration_min,
        row.maxRouteDurationMin,
        row.max_route_duration_min
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.maxRouteDurationMin,
      30,
      1440,
      DEFAULT_OPTIMIZE_SETTINGS.maxRouteDurationMin
    ),
    maxStopsPerRoute: clampNumber(
      pickNumber(
        row.planningMaxStopsPerRoute,
        row.planning_max_stops_per_route,
        row.maxStopsPerRoute,
        row.max_stops_per_route
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.maxStopsPerRoute,
      1,
      200,
      DEFAULT_OPTIMIZE_SETTINGS.maxStopsPerRoute
    ),
    respectCapacity:
      pickBoolean(
        row.planningRespectCapacity,
        row.planning_respect_capacity,
        row.respectCapacity,
        row.respect_capacity
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.respectCapacity,
    respectTimeWindows:
      pickBoolean(
        row.planningRespectTimeWindows,
        row.planning_respect_time_windows,
        row.respectTimeWindows,
        row.respect_time_windows
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.respectTimeWindows,
    respectSkills:
      pickBoolean(
        row.planningRespectSkills,
        row.planning_respect_skills,
        row.respectSkills,
        row.respect_skills
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.respectSkills,
    respectShifts:
      pickBoolean(
        row.planningRespectShifts,
        row.planning_respect_shifts,
        row.respectShifts,
        row.respect_shifts
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.respectShifts,
    returnToDepot:
      pickBoolean(
        row.planningReturnToDepot,
        row.planning_return_to_depot,
        row.returnToDepot,
        row.return_to_depot
      ) ?? DEFAULT_OPTIMIZE_SETTINGS.returnToDepot,
  }
}

export function toTenantSettingsPayload(
  settings: OptimizeSettings,
  tenantId?: string | null
): Record<string, unknown> {
  return {
    ...(tenantId ? { tenantId } : {}),
    planningObjective: toBackendObjective(settings.objective),
    planningMaxRouteDurationMin: settings.maxRouteDurationMin,
    planningMaxStopsPerRoute: settings.maxStopsPerRoute,
    planningRespectCapacity: settings.respectCapacity,
    planningRespectTimeWindows: settings.respectTimeWindows,
    planningRespectSkills: settings.respectSkills,
    planningRespectShifts: settings.respectShifts,
    planningReturnToDepot: settings.returnToDepot,
  }
}
