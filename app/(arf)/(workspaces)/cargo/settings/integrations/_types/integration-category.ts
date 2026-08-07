export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending_setup"

export type IntegrationCategory =
  | "accounting_erp"
  | "ecommerce"
  | "communication"
  | "custom_webhook"

export interface CredentialField {
  key: string
  label: string
  type: "text" | "password" | "textarea"
  required: boolean
  masked?: boolean
  helpText?: string
}

export interface IntegrationCategoryOption {
  id: IntegrationCategory
  label: string
  description: string
  icon: string
}
