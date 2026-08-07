import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { Route, RefreshCw, Zap } from 'lucide-react'
import type { RouteType } from '../_types/order'
import { cn } from '@/lib/utils'

const routeTypeConfig: Record<
  RouteType,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  'Standart Rota': {
    label: 'Standart Rota',
    className: 'bg-slate-500/10 text-slate-700 border-slate-400/30',
    icon: Route,
  },
  'Ekspres Rota': {
    label: 'Ekspres Rota',
    className: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: Zap,
  },
  'Toplama Ringi': {
    label: 'Toplama Ringi',
    className: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    icon: RefreshCw,
  },
}

export function getRouteTypeVisual(type: RouteType) {
  return routeTypeConfig[type]
}

export function RouteTypeBadge({ type }: { type: RouteType }) {
  const config = routeTypeConfig[type]
  const Icon = config.icon

  return (
    <Badge variant='outline' className={cn('whitespace-nowrap', config.className)}>
      <Icon className='mr-1.5 size-3' />
      {config.label}
    </Badge>
  )
}

export const routeTypeFilterOptions = (
  Object.entries(routeTypeConfig) as [RouteType, (typeof routeTypeConfig)[RouteType]][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
