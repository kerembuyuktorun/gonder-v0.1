import type { CredentialField, IntegrationCategory, IntegrationStatus } from "./integration-category"

export interface IntegrationPlatform {
  id: string
  name: string
  code: string
  category: IntegrationCategory
  logoUrl?: string
  description?: string
  docsUrl?: string
  requiredCredentials: CredentialField[]
}

export interface SyncRule {
  id: string
  trigger: string
  targetSystem: string
  action: string
  enabled: boolean
  syncInterval?: number
}

export interface SyncSettingsRecord {
  integrationId: string
  syncRules: SyncRule[]
}

export interface ParameterMapping {
  id: string
  integrationId: string
  localField: string
  externalField: string
  mappingType: "direct" | "lookup"
  mappingValues?: Record<string, string>
}

export interface IntegrationRecord {
  id: string
  platformId: string
  platform?: IntegrationPlatform
  status: IntegrationStatus
  connected: boolean
  syncSettings?: SyncSettingsRecord
  parameterMappings?: ParameterMapping[]
  lastSyncAt?: string
  syncErrorCount: number
  successfulSyncCount?: number
  lastErrorMessage?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CreateIntegrationPayload {
  platformId: string
  customWebhookEnabled: boolean
  credentials: Record<string, string>
}

export interface UpdateIntegrationPayload {
  status?: IntegrationStatus
  syncSettings?: SyncSettingsRecord
  parameterMappings?: ParameterMapping[]
}
