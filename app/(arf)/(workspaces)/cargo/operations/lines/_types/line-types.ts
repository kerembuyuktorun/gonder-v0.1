export type LineType = "main" | "hub" | "feeder"
export type LineStatus = "active" | "passive"
export type StopLocationType = "transfer_center" | "branch"
export type StopOperationType = "pickup_only" | "dropoff_only" | "pickup_dropoff"

export interface LineStop {
  id: string
  order: number
  locationId: string
  locationName: string
  locationType: StopLocationType
  operationType: StopOperationType
}

export interface LineSchedule {
  workDays: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">
  plannedDepartureTime: string
  plannedArrivalTime: string
}

export interface LineRecord {
  id: string
  name: string
  type: LineType
  status: LineStatus
  createdAt: string
  updatedAt: string
  stops: LineStop[]
  schedule: LineSchedule
}

export interface LineListKpi {
  totalMain: number
  totalHub: number
  totalFeeder: number
}

export const LINE_TYPE_LABELS: Record<LineType, string> = {
  main: "Ana Hat",
  hub: "Merkez Hat",
  feeder: "Ara Hat",
}

export const STOP_OPERATION_LABELS: Record<StopOperationType, string> = {
  pickup_only: "Sadece Yükleme",
  dropoff_only: "Sadece İndirme",
  pickup_dropoff: "İndirme + Yükleme",
}

export const WORKDAY_LABELS: Record<LineSchedule["workDays"][number], string> = {
  mon: "Pzt",
  tue: "Sal",
  wed: "Çar",
  thu: "Per",
  fri: "Cum",
  sat: "Cmt",
  sun: "Paz",
}
