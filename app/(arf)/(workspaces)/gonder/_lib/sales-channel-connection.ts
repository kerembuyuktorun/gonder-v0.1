import type { SalesChannelCatalogItem, SalesChannelConnection } from '../_types/sales-channels'
import { EMPTY_SALES_CHANNEL_CONNECTION } from '../_types/sales-channels'

const FAIL_TOKEN = /fail|hata|invalid/i
const URL_PATTERN = /^https?:\/\/.+/i

export function emptyConnection(): SalesChannelConnection {
  return {
    ...EMPTY_SALES_CHANNEL_CONNECTION,
    credentials: {},
  }
}

export function normalizeConnection(
  value?: Partial<SalesChannelConnection> | null
): SalesChannelConnection {
  const base = emptyConnection()
  if (!value) return base
  const status =
    value.status === 'connected' || value.status === 'error' || value.status === 'disconnected'
      ? value.status
      : 'disconnected'
  return {
    status,
    credentials:
      value.credentials && typeof value.credentials === 'object' ? { ...value.credentials } : {},
    connectedAt: typeof value.connectedAt === 'string' ? value.connectedAt : null,
    lastSyncAt: typeof value.lastSyncAt === 'string' ? value.lastSyncAt : null,
    lastTestAt: typeof value.lastTestAt === 'string' ? value.lastTestAt : null,
    lastError: typeof value.lastError === 'string' ? value.lastError : null,
  }
}

export function missingRequiredFields(
  channel: SalesChannelCatalogItem,
  credentials: Record<string, string>
): string[] {
  return channel.fields
    .filter((field) => field.required)
    .filter((field) => !(credentials[field.key] ?? '').trim())
    .map((field) => field.label)
}

export function validateSalesChannelCredentials(
  channel: SalesChannelCatalogItem,
  credentials: Record<string, string>
): { ok: true } | { ok: false; message: string } {
  const missing = missingRequiredFields(channel, credentials)
  if (missing.length > 0) {
    return { ok: false, message: `Zorunlu alanları doldurun: ${missing.join(', ')}.` }
  }

  for (const field of channel.fields) {
    const value = (credentials[field.key] ?? '').trim()
    if (!value) continue
    if ((field.type === 'url' || field.key.toLowerCase().includes('url')) && !URL_PATTERN.test(value)) {
      return {
        ok: false,
        message: `${field.label} https:// ile başlamalı.`,
      }
    }
    if (FAIL_TOKEN.test(value)) {
      return {
        ok: false,
        message: `${channel.name} kimlik bilgileri doğrulanamadı. Değerleri kontrol edip tekrar deneyin.`,
      }
    }
  }

  return { ok: true }
}

export async function mockTestSalesChannelConnection(
  channel: SalesChannelCatalogItem,
  credentials: Record<string, string>
): Promise<{ ok: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const result = validateSalesChannelCredentials(channel, credentials)
  if (!result.ok) return result
  return { ok: true, message: `${channel.name} bağlantısı doğrulandı.` }
}

export function formatRelativeTr(iso: string | null | undefined): string {
  if (!iso) return 'Henüz senkron yok'
  const then = new Date(iso).valueOf()
  if (Number.isNaN(then)) return 'Henüz senkron yok'
  const diffMin = Math.max(0, Math.floor((Date.now() - then) / 60_000))
  if (diffMin < 1) return 'Az önce'
  if (diffMin < 60) return `${diffMin} dk önce`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} saat önce`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} gün önce`
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDateTimeTr(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function maskSecret(value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  if (trimmed.length <= 4) return '••••'
  return `${trimmed.slice(0, 4)}••••`
}
