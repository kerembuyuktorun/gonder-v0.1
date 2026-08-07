import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftRight,
  ArrowRightLeft,
  Package,
  PackageOpen,
  RefreshCw,
  Store,
  Wrench,
} from 'lucide-react'
import type { OrderType } from '../_types/order'
import { cn } from '@/lib/utils'

const orderTypeConfig: Record<
  OrderType,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  dagitim: {
    label: 'Dağıtım',
    className: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    icon: Package,
  },
  toplama: {
    label: 'Toplama',
    className: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
    icon: PackageOpen,
  },
  iade: {
    label: 'İade',
    className: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: RefreshCw,
  },
  transfer: {
    label: 'Transfer',
    className: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    icon: ArrowRightLeft,
  },
  degisim: {
    label: 'Değişim',
    className: 'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20',
    icon: ArrowLeftRight,
  },
  gel_al: {
    label: 'Gel-Al',
    className: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    icon: Store,
  },
  kurulumlu_teslimat: {
    label: 'Kurulumlu',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    icon: Wrench,
  },
}

export function getOrderTypeVisual(type: OrderType) {
  return orderTypeConfig[type]
}

export function OrderTypeBadge({ type }: { type: OrderType }) {
  const config = getOrderTypeVisual(type)
  const Icon = config.icon

  return (
    <Badge variant='outline' className={cn('whitespace-nowrap', config.className)}>
      <Icon className='mr-1.5 size-3' />
      {config.label}
    </Badge>
  )
}

export const orderTypeFilterOptions = (
  Object.entries(orderTypeConfig) as [OrderType, (typeof orderTypeConfig)[OrderType]][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
