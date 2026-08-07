export const LAST_MILE_SETTINGS_FIELDS = `
  planningObjective
  planningMaxRouteDurationMin
  planningMaxStopsPerRoute
  planningRespectCapacity
  planningRespectTimeWindows
  planningRespectSkills
  planningRespectShifts
  planningReturnToDepot
`

export const LAST_MILE_SETTINGS_QUERY = `
  query LastMileSettings($tenantId: ID) {
    lastMileSettings(tenantId: $tenantId) {
      ${LAST_MILE_SETTINGS_FIELDS}
    }
  }
`

export const UPSERT_LAST_MILE_SETTINGS_MUTATION = `
  mutation UpsertLastMileSettings($input: UpsertLastMileSettingsInput!) {
    upsertLastMileSettings(input: $input) {
      ${LAST_MILE_SETTINGS_FIELDS}
    }
  }
`

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export function tryUnwrapGraphqlData<T = Record<string, unknown>>(
  body: unknown
): { data: T | null; error: string | null } {
  const root = asRecord(body)
  const errors = root.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = asRecord(errors[0])
    const message =
      typeof first.message === 'string' ? first.message : 'GraphQL isteği başarısız.'
    return { data: null, error: message }
  }

  const data = asRecord(root.data)
  return {
    data: Object.keys(data).length > 0 ? (data as T) : null,
    error: null,
  }
}
