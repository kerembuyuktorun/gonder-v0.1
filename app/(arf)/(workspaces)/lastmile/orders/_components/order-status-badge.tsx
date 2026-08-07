import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { Ban, CheckCircle2, Route, Truck, UserPlus } from 'lucide-react'
import type { OrderStatus } from '../_types/order'
import { cn } from '@/lib/utils'

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  atama_bekliyor: {
    label: 'Atama Bekliyor',
    className: 'bg-slate-500/10 text-slate-700 border-slate-400/30',
    icon: UserPlus,
  },
  planlandi: {
    label: 'Planlandı',
    className: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    icon: Route,
  },
  yolda: {
    label: 'Yolda',
    className: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    icon: Truck,
  },
  teslim_edildi: {
    label: 'Teslim Edildi',
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    icon: CheckCircle2,
  },
  iptal_edildi: {
    label: 'İptal Edildi',
    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    icon: Ban,
  },
}

export function OrderStatusBadge({
  status,
  label,
}: {
  status: OrderStatus
  /** BE aggregatedStatusLabel — varsa badge metni olarak kullanılır */
  label?: string | null
}) {
  const config = orderStatusConfig[status]
  const Icon = config.icon
  const text = label?.trim() || config.label

  return (
    <Badge variant='outline' className={cn('whitespace-nowrap', config.className)}>
      <Icon className='mr-1.5 size-3' />
      {text}
    </Badge>
  )
}

export const orderStatusFilterOptions = (
  Object.entries(orderStatusConfig) as [OrderStatus, (typeof orderStatusConfig)[OrderStatus]][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
