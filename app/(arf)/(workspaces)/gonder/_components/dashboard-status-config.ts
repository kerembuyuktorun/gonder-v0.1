import type { GonderShipmentStatus } from '../_types/dashboard'

export const shipmentStatusConfig: Record<
  GonderShipmentStatus,
  { labelKey: string; className: string }
> = {
  pending: {
    labelKey: 'status.pending',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  },
  in_transit: {
    labelKey: 'status.in_transit',
    className: 'border-sky-500/20 bg-sky-500/10 text-sky-600',
  },
  delivered: {
    labelKey: 'status.delivered',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
  },
  issue: {
    labelKey: 'status.issue',
    className: 'border-red-500/20 bg-red-500/10 text-red-600',
  },
}
