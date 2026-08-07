import {
  fetchIntegrationDetail,
  fetchIntegrationLogs,
  fetchParameterMappings,
  fetchSyncSettings,
} from "../../_api/integrations-api"
import type { IntegrationLogEntry, IntegrationRecord, ParameterMapping, SyncSettingsRecord } from "../../_types"

export async function fetchIntegrationDetailById(integrationId: string): Promise<IntegrationRecord | undefined> {
  return fetchIntegrationDetail(integrationId)
}

export async function fetchIntegrationSyncSettings(integrationId: string): Promise<SyncSettingsRecord> {
  return fetchSyncSettings(integrationId)
}

export async function fetchIntegrationParameterMappings(integrationId: string): Promise<ParameterMapping[]> {
  return fetchParameterMappings(integrationId)
}

export async function fetchIntegrationAuditLogs(integrationId: string): Promise<IntegrationLogEntry[]> {
  return fetchIntegrationLogs(integrationId)
}
