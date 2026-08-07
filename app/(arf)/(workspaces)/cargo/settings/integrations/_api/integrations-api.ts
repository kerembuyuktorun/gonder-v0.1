import {
  deleteIntegrationInStore,
  getIntegrationsStore,
  getParameterMappings,
  getSyncSettings,
  insertIntegration,
  setParameterMappings,
  setSyncSettings,
  updateIntegrationInStore,
} from "../_mock/integrations-mock-data"
import { mockIntegrationCategories } from "../_mock/integration-categories-mock-data"
import { getIntegrationLogsStore, updateLogInStore } from "../_mock/integration-logs-mock-data"
import { mockIntegrationPlatforms } from "../_mock/integration-platforms-mock-data"
import type {
  CreateIntegrationPayload,
  IntegrationCategoryOption,
  IntegrationLogEntry,
  IntegrationPlatform,
  IntegrationRecord,
  ParameterMapping,
  SyncSettingsRecord,
  UpdateIntegrationPayload,
  IntegrationCategory,
  IntegrationStatus,
} from "../_types"

const latency = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms))

export interface IntegrationFilters {
  category?: IntegrationCategory | "all"
  status?: IntegrationStatus | "all"
  q?: string
}

function sortIntegrations(rows: IntegrationRecord[]): IntegrationRecord[] {
  const rank: Record<IntegrationStatus, number> = {
    connected: 4,
    error: 3,
    pending_setup: 2,
    disconnected: 1,
  }

  return [...rows].sort((a, b) => {
    const statusDelta = rank[b.status] - rank[a.status]
    if (statusDelta !== 0) return statusDelta
    return b.createdAt.localeCompare(a.createdAt)
  })
}

function withPlatform(row: IntegrationRecord): IntegrationRecord {
  const platform = mockIntegrationPlatforms.find((item) => item.id === row.platformId)
  const logs = getIntegrationLogsStore().filter((log) => log.integrationId === row.id)
  const successfulSyncCount = logs.filter((log) => log.status === "success").length
  const lastErrorMessage = logs.find((log) => log.status === "failed")?.statusMessage

  return {
    ...row,
    platform,
    successfulSyncCount,
    lastErrorMessage,
  }
}

export async function fetchAvailablePlatforms(): Promise<IntegrationPlatform[]> {
  await latency(60)
  return mockIntegrationPlatforms
}

export async function fetchIntegrationCategories(): Promise<IntegrationCategoryOption[]> {
  await latency(60)
  return mockIntegrationCategories
}

export async function fetchIntegrations(filters: IntegrationFilters = {}): Promise<IntegrationRecord[]> {
  await latency()
  const q = (filters.q ?? "").trim().toLocaleLowerCase("tr-TR")

  const filtered = getIntegrationsStore()
    .map(withPlatform)
    .filter((row) => {
      if (filters.category && filters.category !== "all" && row.platform?.category !== filters.category) return false
      if (filters.status && filters.status !== "all" && row.status !== filters.status) return false
      if (!q) return true
      const haystack = `${row.platform?.name ?? ""} ${row.platform?.code ?? ""}`.toLocaleLowerCase("tr-TR")
      return haystack.includes(q)
    })

  return sortIntegrations(filtered)
}

export async function fetchIntegrationDetail(id: string): Promise<IntegrationRecord | undefined> {
  await latency(80)
  const found = getIntegrationsStore().find((item) => item.id === id)
  if (!found) return undefined
  return withPlatform(found)
}

export async function createIntegration(payload: CreateIntegrationPayload): Promise<IntegrationRecord> {
  await latency(150)
  const now = new Date().toISOString()
  const platformId = payload.customWebhookEnabled ? "custom-webhook" : payload.platformId
  const created: IntegrationRecord = {
    id: `int-${Date.now()}`,
    platformId,
    status: "connected",
    connected: true,
    syncErrorCount: 0,
    successfulSyncCount: 0,
    lastErrorMessage: undefined,
    lastSyncAt: now,
    createdAt: now,
    updatedAt: now,
    createdBy: "ui-user",
  }

  const inserted = insertIntegration(created, payload.credentials)
  return withPlatform(inserted)
}

export async function updateIntegration(id: string, payload: UpdateIntegrationPayload): Promise<IntegrationRecord | undefined> {
  await latency(120)
  const updated = updateIntegrationInStore(id, payload)
  return updated ? withPlatform(updated) : undefined
}

export async function deleteIntegration(id: string): Promise<void> {
  await latency(100)
  deleteIntegrationInStore(id)
}

export async function testIntegrationConnection(payload: CreateIntegrationPayload): Promise<{ success: boolean; message: string }> {
  await latency(260)
  const platformId = payload.customWebhookEnabled ? "custom-webhook" : payload.platformId

  if (!platformId) {
    return { success: false, message: "Platform seçimi zorunludur." }
  }

  const hasEmpty = Object.values(payload.credentials).some((value) => value.trim().length === 0)
  if (hasEmpty) {
    return { success: false, message: "Zorunlu kimlik alanları eksik." }
  }

  if (payload.credentials.apiKey?.toLowerCase() === "invalid") {
    return { success: false, message: "API Anahtarı geçersiz." }
  }

  return { success: true, message: "Bağlantı başarılı." }
}

export async function updateSyncSettings(integrationId: string, settings: SyncSettingsRecord): Promise<SyncSettingsRecord> {
  await latency(100)
  return setSyncSettings(integrationId, settings)
}

export async function updateParameterMappings(integrationId: string, mappings: ParameterMapping[]): Promise<ParameterMapping[]> {
  await latency(100)
  return setParameterMappings(integrationId, mappings)
}

export async function fetchSyncSettings(integrationId: string): Promise<SyncSettingsRecord> {
  await latency(80)
  return getSyncSettings(integrationId)
}

export async function fetchParameterMappings(integrationId: string): Promise<ParameterMapping[]> {
  await latency(80)
  return getParameterMappings(integrationId)
}

export async function fetchIntegrationLogs(integrationId: string, limit = 50, offset = 0): Promise<IntegrationLogEntry[]> {
  await latency(90)
  return getIntegrationLogsStore()
    .filter((log) => log.integrationId === integrationId)
    .slice(offset, offset + limit)
}

export async function retryIntegrationLog(logId: string): Promise<IntegrationLogEntry | undefined> {
  await latency(120)
  return updateLogInStore(logId, {
    status: "pending",
    statusMessage: "Yeniden deneme kuyruğa alındı",
    retryCount: 1,
    nextRetryAt: new Date(Date.now() + 60_000).toISOString(),
  })
}
