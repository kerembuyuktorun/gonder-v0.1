import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { Layers, RefreshCw, Route, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlanningRouteType } from '../_types/planning-route'

const config: Record<
  PlanningRouteType,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  Karışık: {
    label: 'Karışık',
    className: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    icon: Layers,
  },
  'Standart Rota': {
    label: 'Standart Rota',
    className: 'bg-slate-500/10 text-slate-700 border-slate-400/30',
    icon: Route,
  },
  'Ekspres Teslimat': {
    label: 'Ekspres Teslimat',
    className: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: Zap,
  },
  'Toplama Ringi': {
    label: 'Toplama Ringi',
    className: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    icon: RefreshCw,
  },
}

export function PlanningRouteTypeBadge({ type }: { type: PlanningRouteType }) {
  const item = config[type]
  const Icon = item.icon
  return (
    <Badge variant='outline' className={cn('whitespace-nowrap', item.className)}>
      <Icon className='mr-1.5 size-3' />
      {item.label}
    </Badge>
  )
}

export const planningRouteTypeFilterOptions = (
  Object.entries(config) as [PlanningRouteType, (typeof config)[PlanningRouteType]][]
).map(([value, item]) => ({
  label: item.label,
  value,
}))
