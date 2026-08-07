import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { Ban, CheckCircle2, Clock3, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanningRouteStatus } from '../_types/planning-route'

const config: Record<
  PlanningRouteStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  planlandi: {
    label: 'Planlandı',
    className: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    icon: Clock3,
  },
  aktif: {
    label: 'Aktif',
    className: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    icon: Truck,
  },
  tamamlandi: {
    label: 'Tamamlandı',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    icon: CheckCircle2,
  },
  iptal: {
    label: 'İptal',
    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    icon: Ban,
  },
}

export function RouteStatusBadge({ status }: { status: PlanningRouteStatus }) {
  const item = config[status]
  const Icon = item.icon
  return (
    <Badge variant='outline' className={cn('whitespace-nowrap', item.className)}>
      <Icon className='mr-1.5 size-3' />
      {item.label}
    </Badge>
  )
}

export const routeStatusFilterOptions = (
  Object.entries(config) as [PlanningRouteStatus, (typeof config)[PlanningRouteStatus]][]
).map(([value, item]) => ({
  label: item.label,
  value,
}))
