// TODO: Remove when API is ready

import type { IntegrationLogEntry } from "../_types"

let logStore: IntegrationLogEntry[] = [
  {
    id: "log-1",
    integrationId: "int-1",
    platformName: "Arf",
    action: "invoice_creation",
    resourceType: "invoice",
    resourceId: "TRF-1002",
    status: "failed",
    statusMessage: "VKN numarası eksik",
    errorDetails: "Cari kart için zorunlu alan VKN null geldi.",
    requestData: { shipmentId: "TRF-1002", total: 1490 },
    responseData: { status: 422, message: "tax_number is required" },
    timestamp: "2026-03-24T16:05:00.000Z",
    retryCount: 1,
  },
  {
    id: "log-2",
    integrationId: "int-1",
    platformName: "Arf",
    action: "inventory_update",
    resourceType: "inventory",
    resourceId: "INV-500",
    status: "success",
    statusMessage: "OK",
    timestamp: "2026-03-24T15:45:00.000Z",
  },
  {
    id: "log-3",
    integrationId: "int-2",
    platformName: "Trendyol",
    action: "order_import",
    resourceType: "order",
    resourceId: "TRY-923",
    status: "pending",
    statusMessage: "Kuyrukta bekliyor",
    timestamp: "2026-03-24T15:30:00.000Z",
    retryCount: 0,
  },
]

export function getIntegrationLogsStore(): IntegrationLogEntry[] {
  return [...logStore].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function setIntegrationLogsStore(next: IntegrationLogEntry[]): void {
  logStore = next
}

export function updateLogInStore(id: string, patch: Partial<IntegrationLogEntry>): IntegrationLogEntry | undefined {
  const idx = logStore.findIndex((log) => log.id === id)
  if (idx < 0) return undefined
  const updated = { ...logStore[idx], ...patch }
  logStore[idx] = updated
  return updated
}
