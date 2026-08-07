'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  CirclePlus,
  Clock3,
  Filter,
  Info,
  MapPin,
  Package,
  PackageOpen,
  Search,
  Store,
  Warehouse,
  X,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { DatePickerButton } from '../../../orders/new/_components/time-window-field'
import { MetaChip } from '../../../orders/_components/meta-chip'
import { OrderStatusBadge } from '../../../orders/_components/order-status-badge'
import { getOrderTypeVisual, orderTypeFilterOptions } from '../../../orders/_components/order-type-badge'
import { getRouteTypeVisual } from '../../../orders/_components/route-type-badge'
import {
  formatOrderCardPackageSummary,
  formatPriority,
  formatTaskDuration,
  getOrderRouteEndpointKinds,
  type OrderRouteEndpointKind,
} from '../../../orders/_lib/query-orders'
import type { OrderType, RouteType } from '../../../orders/_types/order'
import type { OrchestratorOrder } from '../_types/orchestrator'

const ROUTE_TYPES: RouteType[] = ['Standart Rota', 'Ekspres Rota', 'Toplama Ringi']

function formatCompactMetric(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function OrderCardMetaLine({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('flex items-center gap-1.5 text-[11px] text-slate-500', className)}>
      <Icon className='size-3.5 shrink-0 text-slate-400' aria-hidden />
      <span className='min-w-0'>{children}</span>
    </p>
  )
}

function OrderCardTimeWindow({
  kind,
  value,
}: {
  kind: 'alim' | 'teslim'
  value: string
}) {
  const Icon = kind === 'alim' ? PackageOpen : Clock3
  const label = kind === 'alim' ? 'Alım' : 'Teslim'

  return (
    <p className='flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500'>
      <Icon className='size-3.5 shrink-0 text-slate-400' aria-hidden />
      <span className='shrink-0 font-medium text-slate-400'>{label}</span>
      <span className='min-w-0 truncate tabular-nums' title={value}>
        {value}
      </span>
    </p>
  )
}

type Props = {
  orders: OrchestratorOrder[]
  filteredOrders: OrchestratorOrder[]
  /** Sipariş id listesi — harita seçimi ile senkron */
  selectedIds: readonly string[]
  search: string
  orderType: OrderType | 'all'
  routeType: RouteType | 'all'
  customerFilter: string
  operationDate: string
  onSearchChange: (value: string) => void
  onToggleOrder: (id: string) => void
  onSelectAllVisible: () => void
  onClearSelection: () => void
  onOrderTypeChange: (value: OrderType | 'all') => void
  onRouteTypeChange: (value: RouteType | 'all') => void
  onCustomerFilterChange: (value: string) => void
  onOperationDateChange: (value: string) => void
}

type FilterOption = {
  value: string
  label: string
  count: number
}

function FilterPicker({
  label,
  searchPlaceholder,
  value,
  options,
  onChange,
}: {
  label: string
  searchPlaceholder: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn(
            'h-8 min-w-0 flex-1 justify-start rounded-full border-dashed px-2 text-xs',
            selected && 'border-lime-400 bg-lime-50 text-lime-900'
          )}
        >
          <CirclePlus className='size-3.5 shrink-0' />
          <span className='truncate'>{selected?.label ?? label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={6}
        className='w-52 overflow-hidden rounded-lg p-0 shadow-lg'
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className='h-8 py-2 text-xs'
          />
          <CommandList className='max-h-56 p-1.5'>
            <CommandEmpty>Sonuç bulunamadı</CommandEmpty>
            {options.map((option) => {
              const active = option.value === value
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(active ? 'all' : option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'mb-0.5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5',
                    active && 'bg-emerald-50 text-emerald-800'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-lime-300',
                      active && 'border-lime-400'
                    )}
                  >
                    {active ? <span className='size-2 rounded-full bg-lime-400' /> : null}
                  </span>
                  <span className='min-w-0 flex-1 truncate text-xs'>{option.label}</span>
                  <span className='text-[11px] tabular-nums text-muted-foreground'>
                    {option.count}
                  </span>
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function OrderCardCustomer({ name }: { name: string }) {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <span className='shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
        Müşteri
      </span>
      <span className='h-3 w-px shrink-0 bg-slate-200' aria-hidden />
      <span className='truncate text-sm font-semibold text-slate-900' title={name}>
        {name}
      </span>
    </div>
  )
}

function OrderCardRouteEndpoint({
  kind,
  text,
}: {
  kind: OrderRouteEndpointKind
  text: string
}) {
  const Icon = kind === 'tesis' ? Warehouse : kind === 'gel_al' ? Store : MapPin

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-[46%] items-center gap-1 truncate text-xs font-medium',
        kind === 'tesis' ? 'text-sky-800' : 'text-slate-700'
      )}
      title={text}
    >
      <Icon className='size-3 shrink-0 opacity-75' aria-hidden />
      <span className='truncate'>{text}</span>
    </span>
  )
}

function OrderCardRouteLine({ order }: { order: OrchestratorOrder }) {
  const kinds = getOrderRouteEndpointKinds(order)

  return (
    <div className='flex min-w-0 items-center gap-1.5'>
      <OrderCardRouteEndpoint kind={kinds.from} text={order.alis_noktasi} />
      <span className='shrink-0 text-slate-400' aria-hidden>
        →
      </span>
      <OrderCardRouteEndpoint kind={kinds.to} text={order.varis_noktasi} />
    </div>
  )
}

function OrderCardTypeLine({ order }: { order: OrchestratorOrder }) {
  const orderType = getOrderTypeVisual(order.siparis_tipi)
  const routeType = getRouteTypeVisual(order.rota_tipi)
  const OrderIcon = orderType.icon
  const RouteIcon = routeType.icon

  return (
    <p className='flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500'>
      <span className='inline-flex items-center gap-1'>
        <OrderIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
        {orderType.label}
      </span>
      <span className='text-slate-300' aria-hidden>
        ·
      </span>
      <span className='inline-flex items-center gap-1'>
        <RouteIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
        {routeType.label}
      </span>
    </p>
  )
}

function OrderCard({
  order,
  selected,
  onToggle,
  cardRef,
}: {
  order: OrchestratorOrder
  selected: boolean
  onToggle: () => void
  cardRef?: (node: HTMLDivElement | null) => void
}) {
  const priorityScore = order.oncelik_puani
  const priorityClass =
    priorityScore >= 90
      ? 'font-semibold text-rose-600'
      : priorityScore >= 70
        ? 'font-medium text-amber-700'
        : 'font-medium text-slate-700'

  return (
    <div
      ref={cardRef}
      role='button'
      tabIndex={0}
      data-order-id={order.id}
      data-selected={selected ? 'true' : 'false'}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        'w-full cursor-pointer rounded-xl border p-3 text-left transition-colors',
        selected
          ? 'border-sky-300 bg-sky-50/70 shadow-sm'
          : 'border-border bg-card hover:border-slate-300 hover:bg-slate-50/60'
      )}
    >
      <div className='flex items-start gap-2.5'>
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
          className='mt-0.5'
          aria-label={`${order.takip_no} seç`}
        />
        <div className='min-w-0 flex-1 space-y-1.5'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <Link
              href={ARF_ROUTES.lastmile.orders.detail(order.id)}
              onClick={(e) => e.stopPropagation()}
              className='font-mono font-semibold tracking-tight text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
            >
              {order.takip_no}
            </Link>
            <OrderStatusBadge status={order.durum} />
          </div>

          <OrderCardTypeLine order={order} />

          <OrderCardCustomer name={order.musteri} />

          <OrderCardRouteLine order={order} />

          <OrderCardTimeWindow kind='alim' value={order.alim_zaman_penceresi} />
          <OrderCardTimeWindow kind='teslim' value={order.teslim_zaman_penceresi} />

          <OrderCardMetaLine icon={Info} className='tabular-nums'>
            <span className={priorityClass}>{formatPriority(priorityScore)}</span>
            {' · '}
            {formatTaskDuration(order.gorev_suresi_dk, order.siparis_tipi)}
            {' · '}
            {formatOrderCardPackageSummary(order)}
            {' · '}
            {formatCompactMetric(order.toplam_hacim)} hacim · {formatCompactMetric(order.agirlik_kg)}kg
          </OrderCardMetaLine>

          {order.gereksinimler.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {order.gereksinimler.map((item) => (
                <MetaChip key={item} variant='requirement'>
                  {item}
                </MetaChip>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function OrderPoolPanel({
  orders,
  filteredOrders,
  selectedIds,
  search,
  orderType,
  routeType,
  customerFilter,
  operationDate,
  onSearchChange,
  onToggleOrder,
  onSelectAllVisible,
  onClearSelection,
  onOrderTypeChange,
  onRouteTypeChange,
  onCustomerFilterChange,
  onOperationDateChange,
}: Props) {
  const [toolbarMode, setToolbarMode] = useState<'actions' | 'filters' | 'search'>(
    'actions'
  )
  const selectedCardNodes = useRef(new Map<string, HTMLDivElement>())
  const prevSelectedKeyRef = useRef('')

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const visibleOrders = useMemo(() => {
    if (selectedIds.length === 0) return filteredOrders
    const selected: OrchestratorOrder[] = []
    const rest: OrchestratorOrder[] = []
    for (const order of filteredOrders) {
      if (selectedIdSet.has(order.id)) selected.push(order)
      else rest.push(order)
    }
    return [...selected, ...rest]
  }, [filteredOrders, selectedIds, selectedIdSet])

  useEffect(() => {
    const key = selectedIds.join('|')
    if (key === prevSelectedKeyRef.current) return
    prevSelectedKeyRef.current = key
    if (selectedIds.length === 0) return

    const focusId = selectedIds[selectedIds.length - 1]!
    // Liste yeniden sıralandıktan sonra kaydır
    const frame = window.requestAnimationFrame(() => {
      const node = selectedCardNodes.current.get(focusId)
      node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedIds])

  const orderTypeOptions: FilterOption[] = orderTypeFilterOptions.map((option) => ({
    ...option,
    count: orders.filter((order) => order.siparis_tipi === option.value).length,
  }))
  const routeTypeOptions: FilterOption[] = ROUTE_TYPES.map((value) => ({
    value,
    label: value,
    count: orders.filter((order) => order.rota_tipi === value).length,
  }))
  const customerOptions: FilterOption[] = Array.from(
    orders.reduce((map, order) => {
      const key = order.musteri_id ?? order.musteri
      const existing = map.get(key)
      if (existing) existing.count += 1
      else map.set(key, { label: order.musteri, count: 1 })
      return map
    }, new Map<string, { label: string; count: number }>())
  )
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'))

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='shrink-0 space-y-3 border-b border-border p-3'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='flex items-center gap-2 text-sm font-semibold'>
            <Package className='size-4 text-sky-600' />
            Sipariş Havuzu
          </h2>
          <Badge variant='outline' className='tabular-nums'>
            {filteredOrders.length}
          </Badge>
        </div>

        {toolbarMode === 'actions' ? (
          <div className='flex items-center gap-1.5'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={() => setToolbarMode('filters')}
            >
              <Filter className='size-3.5' />
              Filtreler
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={() => setToolbarMode('search')}
            >
              <Search className='size-3.5' />
              Ara
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={onSelectAllVisible}
            >
              Görünenleri Seç
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={onClearSelection}
              disabled={selectedIds.length === 0}
            >
              Temizle
            </Button>
          </div>
        ) : null}

        {toolbarMode === 'filters' ? (
          <div className='flex flex-wrap items-center gap-1.5'>
            <DatePickerButton
              id='orchestrator-operation-date'
              value={operationDate}
              onChange={onOperationDateChange}
              className='h-8 w-auto min-w-[8.5rem] shrink-0 justify-between rounded-full border-dashed px-2.5 text-xs'
            />
            <FilterPicker
              label='Müşteri'
              searchPlaceholder='Müşteri ara'
              value={customerFilter}
              options={customerOptions}
              onChange={onCustomerFilterChange}
            />
            <FilterPicker
              label='Sipariş Tipi'
              searchPlaceholder='Sipariş tipi ara'
              value={orderType}
              options={orderTypeOptions}
              onChange={(value) => onOrderTypeChange(value as OrderType | 'all')}
            />
            <FilterPicker
              label='Rota Tipi'
              searchPlaceholder='Rota tipi ara'
              value={routeType}
              options={routeTypeOptions}
              onChange={(value) => onRouteTypeChange(value as RouteType | 'all')}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              onClick={() => setToolbarMode('actions')}
              aria-label='Filtreleri kapat'
              title='Filtreleri kapat'
            >
              <X className='size-4' />
            </Button>
          </div>
        ) : null}

        {toolbarMode === 'search' ? (
          <div className='flex items-center gap-1.5'>
            <div className='relative min-w-0 flex-1'>
              <Search className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder='Takip no, müşteri, bölge…'
                className='h-8 pl-8 text-xs'
                autoFocus
              />
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              onClick={() => {
                onSearchChange('')
                setToolbarMode('actions')
              }}
              aria-label='Aramayı kapat'
              title='Aramayı kapat'
            >
              <X className='size-4' />
            </Button>
          </div>
        ) : null}
      </div>

      <div className='min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3'>
        {visibleOrders.length === 0 ? (
          <p className='rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground'>
            Filtreye uyan sipariş yok
          </p>
        ) : (
          visibleOrders.map((order) => {
            const selected = selectedIdSet.has(order.id)
            return (
              <OrderCard
                key={order.id}
                order={order}
                selected={selected}
                onToggle={() => onToggleOrder(order.id)}
                cardRef={(node) => {
                  if (node) selectedCardNodes.current.set(order.id, node)
                  else selectedCardNodes.current.delete(order.id)
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
