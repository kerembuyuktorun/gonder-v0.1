export interface IntegrationLogEntry {
  id: string
  integrationId: string
  platformName: string
  action: string
  resourceType: string
  resourceId?: string
  status: "success" | "failed" | "pending"
  statusMessage?: string
  requestData?: Record<string, unknown>
  responseData?: Record<string, unknown>
  errorDetails?: string
  timestamp: string
  retryCount?: number
  nextRetryAt?: string
}
