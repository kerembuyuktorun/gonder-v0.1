import type { LineType, StopLocationType, StopOperationType } from "./line-types"

export interface LineStopFormRow {
  id: string
  locationId: string
  locationName: string
  locationType: StopLocationType
  operationType: StopOperationType | ""
}

export interface LineFormState {
  id?: string
  type: LineType
  name: string
  workDays: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">
  plannedDepartureTime: string
  plannedArrivalTime: string
  stops: LineStopFormRow[]
}

export interface LocationOption {
  id: string
  name: string
  type: StopLocationType
}

export interface LineRuleError {
  path: string
  message: string
}
