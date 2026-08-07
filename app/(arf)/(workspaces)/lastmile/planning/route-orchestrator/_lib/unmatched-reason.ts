import type { LucideIcon } from 'lucide-react'
import {
  Clock3,
  HelpCircle,
  Inbox,
  Map as MapIcon,
  MapPin,
  Package,
  Route,
  Truck,
  Wrench,
} from 'lucide-react'
import type { UnmatchedOrderInfo } from '../_types/orchestrator'

/** BE planning-unmatched-reason.classifier codes */
export type UnmatchedReasonCode =
  | 'NO_SKILL_MATCH'
  | 'CAPACITY_EXCEEDED'
  | 'CAPACITY_TIGHT'
  | 'TIME_WINDOW_UNREACHABLE'
  | 'MAX_STOPS_REACHED'
  | 'MISSING_COORDINATES'
  | 'NO_PLANNABLE_ITEMS'
  | 'NO_FEASIBLE_SLOT'
  | 'UNKNOWN'

export type UnmatchedReasonVariant =
  | 'warning'
  | 'destructive'
  | 'secondary'
  | 'muted'

export const UNMATCHED_REASON_UI: Record<
  UnmatchedReasonCode,
  { variant: UnmatchedReasonVariant; icon: LucideIcon; shortLabel: string }
> = {
  NO_SKILL_MATCH: { variant: 'warning', icon: Wrench, shortLabel: 'yetenek' },
  CAPACITY_EXCEEDED: {
    variant: 'destructive',
    icon: Truck,
    shortLabel: 'kapasite',
  },
  CAPACITY_TIGHT: { variant: 'warning', icon: Package, shortLabel: 'yük' },
  TIME_WINDOW_UNREACHABLE: {
    variant: 'warning',
    icon: Clock3,
    shortLabel: 'zaman',
  },
  MAX_STOPS_REACHED: {
    variant: 'secondary',
    icon: MapPin,
    shortLabel: 'durak limiti',
  },
  MISSING_COORDINATES: {
    variant: 'destructive',
    icon: MapIcon,
    shortLabel: 'koordinat',
  },
  NO_PLANNABLE_ITEMS: {
    variant: 'secondary',
    icon: Inbox,
    shortLabel: 'kalem yok',
  },
  NO_FEASIBLE_SLOT: { variant: 'muted', icon: Route, shortLabel: 'uygun slot' },
  UNKNOWN: { variant: 'muted', icon: HelpCircle, shortLabel: 'diğer' },
}

const KNOWN_CODES = new Set<string>(Object.keys(UNMATCHED_REASON_UI))

export function normalizeUnmatchedReasonCode(
  raw: unknown
): UnmatchedReasonCode {
  const code = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  if (code && KNOWN_CODES.has(code)) return code as UnmatchedReasonCode
  return 'UNKNOWN'
}

export function unmatchedReasonUi(code: string | null | undefined) {
  return UNMATCHED_REASON_UI[normalizeUnmatchedReasonCode(code)]
}

const VARIANT_BADGE_CLASS: Record<UnmatchedReasonVariant, string> = {
  warning: 'bg-amber-100 text-amber-900 ring-amber-200/80',
  destructive: 'bg-rose-100 text-rose-900 ring-rose-200/80',
  secondary: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  muted: 'bg-slate-50 text-slate-600 ring-slate-200/70',
}

export function unmatchedReasonBadgeClass(code: string | null | undefined) {
  return VARIANT_BADGE_CLASS[unmatchedReasonUi(code).variant]
}

/** Toolbar / alert özeti: "2 kapasite · 1 yetenek" */
export function summarizeUnmatchedReasons(
  unmatched: UnmatchedOrderInfo[]
): string {
  if (unmatched.length === 0) return ''

  const counts = new Map<string, number>()
  for (const item of unmatched) {
    const ui = unmatchedReasonUi(item.reasonCode)
    counts.set(ui.shortLabel, (counts.get(ui.shortLabel) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => `${count} ${label}`)
    .join(' · ')
}

/**
 * VROOM raw unassigned UUID satırları kullanıcıya gösterilmez;
 * geometri / FE uyarıları kalır.
 */
export function isUserFacingOptimizeWarning(warning: string): boolean {
  const folded = warning.trim().toLowerCase()
  if (!folded) return false
  if (folded.startsWith('unassigned delivery')) return false
  if (folded.startsWith('unassigned pickup')) return false
  if (folded.startsWith('unassigned job')) return false
  if (/^[0-9a-f-]{36}$/i.test(folded)) return false
  return true
}
