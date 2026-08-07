import type { LucideIcon } from 'lucide-react'
import { Code2, FileSpreadsheet, PenLine, Store } from 'lucide-react'
import {
  ORDER_CHANNEL_LABELS,
  type OrderChannelConnection,
  type OrderChannelType,
} from '../_types/orders'

export type ChannelLogoResolved = {
  type: OrderChannelType
  label: string
  /** Display name (connection name or type label) */
  name: string
  /** Store / connection subtitle when available */
  subtitle: string | null
  initials: string
  /** Prefer connection.logoUrl, then static asset path when present */
  src: string | null
  /** Tailwind classes for colored letter / icon fallback */
  accentClass: string
  /** Lucide fallback for non-marketplace channels when no image */
  FallbackIcon: LucideIcon
}

const CHANNEL_ASSET_PATH: Record<OrderChannelType, string> = {
  shopify: '/gonder/channels/shopify.svg',
  woocommerce: '/gonder/channels/woocommerce.svg',
  trendyol: '/gonder/channels/trendyol.svg',
  hepsiburada: '/gonder/channels/hepsiburada.svg',
  amazon: '/gonder/channels/amazon.svg',
  api: '/gonder/channels/api.svg',
  excel: '/gonder/channels/excel.svg',
  manual: '/gonder/channels/manual.svg',
}

const CHANNEL_ACCENT: Record<OrderChannelType, string> = {
  shopify: 'bg-[#95BF47]/15 text-[#5E8E3E]',
  woocommerce: 'bg-[#96588A]/15 text-[#96588A]',
  trendyol: 'bg-[#F27A1A]/15 text-[#F27A1A]',
  hepsiburada: 'bg-[#FF6000]/15 text-[#FF6000]',
  amazon: 'bg-[#FF9900]/15 text-[#E47911]',
  api: 'bg-slate-500/15 text-slate-600',
  excel: 'bg-[#217346]/15 text-[#217346]',
  manual: 'bg-muted text-muted-foreground',
}

const CHANNEL_FALLBACK_ICON: Record<OrderChannelType, LucideIcon> = {
  shopify: Store,
  woocommerce: Store,
  trendyol: Store,
  hepsiburada: Store,
  amazon: Store,
  api: Code2,
  excel: FileSpreadsheet,
  manual: PenLine,
}

const CHANNEL_INITIALS: Record<OrderChannelType, string> = {
  shopify: 'S',
  woocommerce: 'W',
  trendyol: 'T',
  hepsiburada: 'H',
  amazon: 'A',
  api: 'API',
  excel: 'XL',
  manual: 'M',
}

export type ResolveChannelLogoInput = {
  type: OrderChannelType
  connection?: OrderChannelConnection | null
  /** Explicit override (e.g. API-provided logo) */
  logoUrl?: string | null
  /** Prefer static asset path even without connection.logoUrl (default true) */
  preferAsset?: boolean
}

export function resolveChannelLogo(input: ResolveChannelLogoInput): ChannelLogoResolved {
  const { type, connection = null, logoUrl = null, preferAsset = true } = input
  const label = ORDER_CHANNEL_LABELS[type] ?? type
  const name = connection?.name?.trim() || label
  const subtitle = connection?.storeName?.trim() || null

  const explicit = logoUrl?.trim() || connection?.logoUrl?.trim() || null
  const asset = preferAsset ? CHANNEL_ASSET_PATH[type] : null
  const src = explicit || asset || null

  return {
    type,
    label,
    name,
    subtitle,
    initials: CHANNEL_INITIALS[type] ?? initialsFromLabel(label),
    src,
    accentClass: CHANNEL_ACCENT[type] ?? 'bg-muted text-muted-foreground',
    FallbackIcon: CHANNEL_FALLBACK_ICON[type] ?? Store,
  }
}

function initialsFromLabel(label: string): string {
  const parts = label.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return (label.slice(0, 2) || '?').toUpperCase()
}
