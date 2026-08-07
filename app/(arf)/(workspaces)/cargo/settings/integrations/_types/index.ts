export type {
  IntegrationCategory,
  IntegrationStatus,
  CredentialField,
  IntegrationCategoryOption,
} from "./integration-category"

export type {
  IntegrationPlatform,
  IntegrationRecord,
  CreateIntegrationPayload,
  UpdateIntegrationPayload,
  SyncRule,
  SyncSettingsRecord,
  ParameterMapping,
} from "./integration"

export type { IntegrationLogEntry } from "./integration-log"

import type { IntegrationStatus } from "./integration-category"

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  connected: "Bağlı ve Aktif",
  disconnected: "Bağlantı Koptu",
  error: "Hata Var",
  pending_setup: "Kurulum Bekliyor",
}
