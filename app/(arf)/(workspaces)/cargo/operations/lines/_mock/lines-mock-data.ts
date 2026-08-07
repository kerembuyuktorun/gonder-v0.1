// TODO: Remove when API is ready

import type { LineListKpi, LineRecord, LocationOption } from "../_types"

export const mockLineLocations: LocationOption[] = [
  { id: "tm-diyarbakir", name: "Diyarbakır TM", type: "transfer_center" },
  { id: "tm-anadolu", name: "Anadolu TM", type: "transfer_center" },
  { id: "tm-gaziantep", name: "Gaziantep TM", type: "transfer_center" },
  { id: "tm-adana", name: "Adana TM", type: "transfer_center" },
  { id: "sube-baglar", name: "Bağlar Şubesi", type: "branch" },
  { id: "sube-yenisehir", name: "Yenişehir Şubesi", type: "branch" },
  { id: "sube-seyhan", name: "Seyhan Şubesi", type: "branch" },
  { id: "sube-cukurova", name: "Çukurova Şubesi", type: "branch" },
]

export const mockLines: LineRecord[] = [
  {
    id: "line-main-1",
    name: "Diyarbakır TM - Anadolu TM Hattı",
    type: "main",
    status: "active",
    createdAt: "2026-03-10T08:30:00.000Z",
    updatedAt: "2026-03-12T09:40:00.000Z",
    schedule: { workDays: ["mon", "tue", "wed", "thu", "fri", "sat"], plannedDepartureTime: "08:00", plannedArrivalTime: "14:30" },
    stops: [
      { id: "s-1", order: 1, locationId: "tm-diyarbakir", locationName: "Diyarbakır TM", locationType: "transfer_center", operationType: "pickup_only" },
      { id: "s-2", order: 2, locationId: "tm-gaziantep", locationName: "Gaziantep TM", locationType: "transfer_center", operationType: "pickup_dropoff" },
      { id: "s-3", order: 3, locationId: "tm-anadolu", locationName: "Anadolu TM", locationType: "transfer_center", operationType: "dropoff_only" },
    ],
  },
  {
    id: "line-hub-1",
    name: "Adana TM - Çukurova Şubesi Hattı",
    type: "hub",
    status: "active",
    createdAt: "2026-02-18T11:15:00.000Z",
    updatedAt: "2026-03-01T16:10:00.000Z",
    schedule: { workDays: ["mon", "wed", "fri"], plannedDepartureTime: "09:15", plannedArrivalTime: "12:20" },
    stops: [
      { id: "s-4", order: 1, locationId: "tm-adana", locationName: "Adana TM", locationType: "transfer_center", operationType: "pickup_only" },
      { id: "s-5", order: 2, locationId: "sube-seyhan", locationName: "Seyhan Şubesi", locationType: "branch", operationType: "pickup_dropoff" },
      { id: "s-6", order: 3, locationId: "sube-cukurova", locationName: "Çukurova Şubesi", locationType: "branch", operationType: "dropoff_only" },
    ],
  },
  {
    id: "line-feeder-1",
    name: "Bağlar Şubesi - Diyarbakır TM Hattı",
    type: "feeder",
    status: "passive",
    createdAt: "2026-01-22T07:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
    schedule: { workDays: ["tue", "thu", "sat"], plannedDepartureTime: "06:45", plannedArrivalTime: "08:00" },
    stops: [
      { id: "s-7", order: 1, locationId: "sube-baglar", locationName: "Bağlar Şubesi", locationType: "branch", operationType: "pickup_only" },
      { id: "s-8", order: 2, locationId: "sube-yenisehir", locationName: "Yenişehir Şubesi", locationType: "branch", operationType: "pickup_dropoff" },
      { id: "s-9", order: 3, locationId: "tm-diyarbakir", locationName: "Diyarbakır TM", locationType: "transfer_center", operationType: "dropoff_only" },
    ],
  },
]

export const mockLinesKpi: LineListKpi = {
  totalMain: 12,
  totalHub: 45,
  totalFeeder: 38,
}
