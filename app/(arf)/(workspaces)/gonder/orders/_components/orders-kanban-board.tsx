'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Eye, GripVertical, PackagePlus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { ChannelBadge } from '../../_components/channel-logo'
import { RowQuickActions, type RowQuickAction } from '../../_components/data-workspace'
import { getOrderChannelById } from '../../_data/order-channels'
import {
  ORDER_KANBAN_COLUMNS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABELS,
  type GonderOrder,
  type OrderStatus,
} from '../../_types/orders'

type Props = {
  items: GonderOrder[]
  isLoading?: boolean
  onUpdateStatus: (id: string, status: OrderStatus, message: string) => void
  onInspect: (order: GonderOrder) => void
  onCreateShipment: (order: GonderOrder) => void
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function OrdersKanbanBoard({
  items,
  isLoading,
  onUpdateStatus,
  onInspect,
  onCreateShipment,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<OrderStatus | null>(null)

  const columns = useMemo(() => {
    const map = Object.fromEntries(
      ORDER_KANBAN_COLUMNS.map((status) => [status, [] as GonderOrder[]])
    ) as Record<OrderStatus, GonderOrder[]>

    for (const item of items) {
      if (map[item.status]) map[item.status].push(item)
    }
    return map
  }, [items])

  function handleDrop(status: OrderStatus) {
    if (!draggingId) return
    const item = items.find((row) => row.id === draggingId)
    setDraggingId(null)
    setOverColumn(null)
    if (!item || item.status === status) return
    onUpdateStatus(item.id, status, `Durum: ${ORDER_STATUS_LABELS[status]}`)
  }

  if (isLoading) {
    return (
      <div className='rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground'>
        Kanban yükleniyor…
      </div>
    )
  }

  return (
    <ScrollArea className='w-full whitespace-nowrap'>
      <div className='flex min-h-[min(420px,70vh)] gap-3 pb-3'>
        {ORDER_KANBAN_COLUMNS.map((status) => {
          const columnItems = columns[status] ?? []
          const isOver = overColumn === status
          return (
            <div
              key={status}
              className={cn(
                'flex w-[min(280px,82vw)] min-w-[240px] shrink-0 flex-col rounded-xl border bg-muted/20',
                isOver && 'border-primary/50 bg-primary/5'
              )}
              onDragOver={(event) => {
                event.preventDefault()
                setOverColumn(status)
              }}
              onDragLeave={() => {
                setOverColumn((prev) => (prev === status ? null : prev))
              }}
              onDrop={() => handleDrop(status)}
            >
              <div className='flex items-center justify-between gap-2 border-b px-3 py-2.5'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{ORDER_STATUS_LABELS[status]}</p>
                  <p className='text-xs text-muted-foreground'>{columnItems.length} sipariş</p>
                </div>
                <Badge variant='secondary' className='shrink-0 tabular-nums'>
                  {columnItems.length}
                </Badge>
              </div>

              <div className='flex flex-1 flex-col gap-2 overflow-x-hidden p-2'>
                {columnItems.length === 0 ? (
                  <div className='rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground'>
                    Kart yok
                  </div>
                ) : (
                  columnItems.map((item) => (
                    <KanbanCard
                      key={item.id}
                      order={item}
                      dragging={draggingId === item.id}
                      onDragStart={() => setDraggingId(item.id)}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setOverColumn(null)
                      }}
                      onInspect={() => onInspect(item)}
                      onApprove={() =>
                        onUpdateStatus(item.id, 'approved', 'Sipariş onaylandı')
                      }
                      onReject={() =>
                        onUpdateStatus(item.id, 'rejected', 'Sipariş reddedildi')
                      }
                      onCreateShipment={() => onCreateShipment(item)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  )
}

function KanbanCard({
  order,
  dragging,
  onDragStart,
  onDragEnd,
  onInspect,
  onApprove,
  onReject,
  onCreateShipment,
}: {
  order: GonderOrder
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onInspect: () => void
  onApprove: () => void
  onReject: () => void
  onCreateShipment: () => void
}) {
  const connection = getOrderChannelById(order.channelId)
  const canApprove = order.status === 'pending_review'
  const canShip =
    order.status === 'approved' ||
    order.status === 'ready_for_shipment' ||
    order.status === 'payment_pending'

  const actions: RowQuickAction[] = [
    ...(canApprove
      ? [
          {
            id: 'approve',
            labelKey: 'orders.approve',
            icon: Check,
            priority: 'primary' as const,
            variant: 'primary' as const,
            onClick: onApprove,
          },
          {
            id: 'reject',
            labelKey: 'orders.reject',
            icon: X,
            priority: 'overflow' as const,
            variant: 'destructive' as const,
            requiresConfirmation: true,
            confirmation: {
              titleKey: 'orders.rejectConfirmTitle',
              descriptionKey: 'orders.rejectConfirmDescription',
              confirmLabelKey: 'orders.rejectConfirmAction',
            },
            onClick: onReject,
          },
        ]
      : []),
    ...(canShip
      ? [
          {
            id: 'ship',
            labelKey: 'orders.createShipment',
            icon: PackagePlus,
            priority: 'primary' as const,
            variant: 'primary' as const,
            onClick: onCreateShipment,
          },
        ]
      : []),
    {
      id: 'view',
      labelKey: 'orders.inspect',
      icon: Eye,
      priority: canApprove || canShip ? ('secondary' as const) : ('primary' as const),
      variant: 'secondary' as const,
      onClick: onInspect,
    },
  ]

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', order.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'whitespace-normal rounded-lg border bg-background p-3 shadow-sm transition-opacity',
        dragging && 'opacity-50'
      )}
    >
      <div className='mb-2 flex items-start gap-2'>
        <GripVertical className='mt-0.5 size-3.5 shrink-0 text-muted-foreground' />
        <div className='min-w-0 flex-1'>
          <Link
            href={ARF_ROUTES.gonder.orders.detail(order.id)}
            className='block truncate text-sm font-medium hover:underline'
            onClick={(event) => event.stopPropagation()}
          >
            {order.orderNumber}
          </Link>
          <p className='truncate text-xs text-muted-foreground'>{order.customerName}</p>
        </div>
      </div>

      <div className='mb-2 flex flex-wrap items-center gap-1.5'>
        <ChannelBadge
          type={order.channel}
          connection={connection}
          className='max-w-full text-[10px]'
        />
        <Badge variant='outline' className={cn('text-[10px]', ORDER_STATUS_BADGE[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <p className='mb-2 text-xs text-muted-foreground'>
        {order.originCity} → {order.destinationCity}
      </p>

      <div className='flex min-w-0 items-center justify-between gap-2'>
        <span className='min-w-0 truncate text-sm font-medium tabular-nums'>
          {formatMoney(order.amountTry)}
        </span>
        <div
          className='shrink-0'
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RowQuickActions actions={actions} maxVisible={1} />
        </div>
      </div>
    </div>
  )
}
