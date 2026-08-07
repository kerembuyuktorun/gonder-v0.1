// TODO: Remove when API is ready

import type {
  IntegrationRecord,
  SyncSettingsRecord,
  ParameterMapping,
} from "../_types"

const now = new Date().toISOString()

const syncSettingsStore: Record<string, SyncSettingsRecord> = {
  "int-1": {
    integrationId: "int-1",
    syncRules: [
      { id: "r-1", trigger: "shipment_status_delivered", targetSystem: "parasut", action: "create_invoice", enabled: true, syncInterval: 1 },
      { id: "r-2", trigger: "shipment_status_returned", targetSystem: "parasut", action: "create_refund_invoice", enabled: true, syncInterval: 5 },
      { id: "r-3", trigger: "new_customer", targetSystem: "parasut", action: "create_current_account", enabled: true, syncInterval: 15 },
    ],
  },
  "int-2": {
    integrationId: "int-2",
    syncRules: [
      { id: "r-4", trigger: "new_order", targetSystem: "trendyol", action: "import_order", enabled: true, syncInterval: 1 },
      { id: "r-5", trigger: "inventory_changed", targetSystem: "trendyol", action: "update_inventory", enabled: false, syncInterval: 60 },
    ],
  },
}

const mappingStore: Record<string, ParameterMapping[]> = {
  "int-1": [
    { id: "m-1", integrationId: "int-1", localField: "tax_rate_20", externalField: "TAX_20", mappingType: "direct" },
    { id: "m-2", integrationId: "int-1", localField: "customer_type_retail", externalField: "RETAIL", mappingType: "direct" },
    { id: "m-3", integrationId: "int-1", localField: "account_code_7100", externalField: "7100", mappingType: "lookup", mappingValues: { "7100": "7100" } },
  ],
}

const privateCredentialStore: Record<string, Record<string, string>> = {}

let integrationStore: IntegrationRecord[] = [
  {
    id: "int-1",
    platformId: "parasut",
    status: "connected",
    connected: true,
    syncErrorCount: 1,
    lastSyncAt: "2026-03-24T15:45:00.000Z",
    createdAt: "2026-03-12T09:00:00.000Z",
    updatedAt: now,
    createdBy: "user-admin",
  },
  {
    id: "int-2",
    platformId: "trendyol",
    status: "error",
    connected: true,
    syncErrorCount: 4,
    lastSyncAt: "2026-03-24T15:30:00.000Z",
    createdAt: "2026-03-10T11:00:00.000Z",
    updatedAt: now,
    createdBy: "user-admin",
  },
  {
    id: "int-3",
    platformId: "twilio",
    status: "pending_setup",
    connected: false,
    syncErrorCount: 0,
    createdAt: "2026-03-20T13:00:00.000Z",
    updatedAt: now,
    createdBy: "user-admin",
  },
]

export function getIntegrationsStore(): IntegrationRecord[] {
  return [...integrationStore]
}

export function insertIntegration(item: IntegrationRecord, credentials: Record<string, string>): IntegrationRecord {
  integrationStore = [item, ...integrationStore]
  privateCredentialStore[item.id] = credentials
  return item
}

export function updateIntegrationInStore(id: string, patch: Partial<IntegrationRecord>): IntegrationRecord | undefined {
  const idx = integrationStore.findIndex((row) => row.id === id)
  if (idx < 0) return undefined
  const next = { ...integrationStore[idx], ...patch, updatedAt: new Date().toISOString() }
  integrationStore[idx] = next
  return next
}

export function deleteIntegrationInStore(id: string): void {
  integrationStore = integrationStore.filter((row) => row.id !== id)
  delete privateCredentialStore[id]
  delete syncSettingsStore[id]
  delete mappingStore[id]
}

export function getSyncSettings(id: string): SyncSettingsRecord {
  return syncSettingsStore[id] ?? { integrationId: id, syncRules: [] }
}

export function setSyncSettings(id: string, settings: SyncSettingsRecord): SyncSettingsRecord {
  syncSettingsStore[id] = settings
  return settings
}

export function getParameterMappings(id: string): ParameterMapping[] {
  return mappingStore[id] ? [...mappingStore[id]] : []
}

export function setParameterMappings(id: string, mappings: ParameterMapping[]): ParameterMapping[] {
  mappingStore[id] = mappings
  return mappings
}

export function hasStoredCredentials(id: string): boolean {
  return Boolean(privateCredentialStore[id])
}
