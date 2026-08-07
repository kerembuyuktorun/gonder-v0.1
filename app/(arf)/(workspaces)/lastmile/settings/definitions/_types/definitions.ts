/**
 * Last Mile — Tanımlamalar (tenant ayar kataloğu)
 */

export type DefinitionsSectionId =
  | 'order_types'
  | 'tags'
  | 'skills'
  | 'pod'
  | 'reasons'
  | 'templates'

export type OrderTypeDefinition = {
  id: string
  code: string
  label: string
  description: string
  enabled: boolean
  system: boolean
}

export type TagUsage = 'order' | 'customer' | 'courier'

export type OperationalTag = {
  id: string
  name: string
  color: string
  textColor: string
  icon?: string
  usages: TagUsage[]
  active: boolean
}

export type RoutingSkill = {
  id: string
  name: string
  description: string
  vroomSkillId: number
  appliesTo: Array<'order' | 'vehicle' | 'courier'>
  active: boolean
}

export type PodRuleMode = 'required' | 'optional' | 'off'

export type PodProofKind = 'photo' | 'tc_last4' | 'signature' | 'otp'

export type PodRule = {
  kind: PodProofKind
  label: string
  description: string
  /** Varsayılan kural */
  defaultMode: PodRuleMode
  /** Sipariş tipine özel override; yoksa defaultMode */
  byOrderType: Partial<Record<string, PodRuleMode>>
}

export type ReasonKind = 'undelivered' | 'cancel'

export type ReasonCode = {
  id: string
  kind: ReasonKind
  label: string
  active: boolean
  sortOrder: number
}

export type NotificationChannel = 'sms' | 'email'

export type NotificationTemplate = {
  id: string
  eventKey: string
  eventLabel: string
  channel: NotificationChannel
  body: string
  active: boolean
}

export type DefinitionsState = {
  orderTypes: OrderTypeDefinition[]
  tags: OperationalTag[]
  skills: RoutingSkill[]
  podRules: PodRule[]
  reasons: ReasonCode[]
  templates: NotificationTemplate[]
  updatedAt: string | null
  updatedBy: string | null
}

export const TAG_USAGE_LABELS: Record<TagUsage, string> = {
  order: 'Sipariş',
  customer: 'Müşteri',
  courier: 'Kurye',
}

export const POD_MODE_LABELS: Record<PodRuleMode, string> = {
  required: 'Zorunlu',
  optional: 'Opsiyonel',
  off: 'Kapalı',
}

export const REASON_KIND_LABELS: Record<ReasonKind, string> = {
  undelivered: 'Teslim Edilemedi',
  cancel: 'İptal',
}
