'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  ArrowRightLeft,
  Ban,
  ChevronDown,
  Eye,
  MapPinned,
  Pencil,
} from 'lucide-react'
import { PlanningRouteTypeBadge } from '../_components/planning-route-type-badge'
import { RouteCapacity } from '../_components/route-capacity'
import { RouteDateChip } from '../_components/route-date-chip'
import { RouteStatusBadge } from '../_components/route-status-badge'
import {
  formatDistanceKm,
  formatDurationMin,
  parseRouteDate,
  parseRouteDateTime,
} from '../_lib/query-routes'
import type { PlanningRouteListItem } from '../_types/planning-route'

/**
 * Sütun genişliği — DataTableColumnHeader (filtre + başlık + sıralama)
 * ikonları sıkışmasın diye başlık uzunluğuna göre taban bırakır.
 */
function columnWidth(title: string, contentMin = 0) {
  const headerNeed = Math.ceil(title.length * 8) + 76
  return Math.max(headerNeed, contentMin)
}

function ProgressCell({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const safeTotal = Math.max(total, 0)
  const done = safeTotal > 0 && completed >= safeTotal
  const pct = safeTotal > 0 ? Math.min(100, Math.round((completed / safeTotal) * 100)) : 0

  return (
    <div className='flex w-[112px] flex-col gap-1'>
      <span
        className={
          done
            ? 'text-sm font-medium tabular-nums text-emerald-700'
            : 'text-sm tabular-nums text-foreground'
        }
      >
        {done ? `Tamamlandı · ${safeTotal} durak` : `${completed}/${safeTotal} durak`}
      </span>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100'>
        <div
          className={
            done
              ? 'h-full rounded-full bg-emerald-500 transition-[width]'
              : 'h-full rounded-full bg-sky-500 transition-[width]'
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

type ColumnOptions = {
  demoQuery?: string
}

export function createRouteColumns(options: ColumnOptions = {}): ColumnDef<PlanningRouteListItem>[] {
  const demoSuffix = options.demoQuery ?? ''

  const detailHref = (id: string) =>
    `${ARF_ROUTES.lastmile.planning.routeDetail(id)}${demoSuffix}`

  return [
    {
      accessorKey: 'label',
      enableHiding: false,
      size: columnWidth('Rota No'),
      minSize: columnWidth('Rota No'),
      meta: { label: 'Rota No' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rota No' />,
      cell: ({ row }) => (
        <Link
          href={detailHref(row.original.id)}
          className='font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.label}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      size: columnWidth('Durum', 124),
      minSize: columnWidth('Durum', 124),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => <RouteStatusBadge status={row.original.status} />,
      filterFn: (row, _id, value: string[]) =>
        !value?.length || value.includes(row.original.status),
    },
    {
      accessorKey: 'routeType',
      size: columnWidth('Rota Tipi', 24),
      minSize: columnWidth('Rota Tipi', 24),
      meta: { label: 'Rota Tipi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rota Tipi' />,
      cell: ({ row }) => <PlanningRouteTypeBadge type={row.original.routeType} />,
      filterFn: (row, _id, value: string[]) =>
        !value?.length || value.includes(row.original.routeType),
    },
    {
      id: 'operationDate',
      accessorKey: 'operationDate',
      size: columnWidth('Planlanan Tarih', 156),
      minSize: columnWidth('Planlanan Tarih', 156),
      meta: { label: 'Planlanan Tarih' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Planlanan Tarih' />,
      cell: ({ row }) => {
        const parsed = parseRouteDate(row.original.operationDate)
        return (
          <div className='flex flex-col gap-1 leading-tight'>
            <span className='whitespace-nowrap text-sm font-medium text-foreground'>
              {parsed?.date ?? row.original.operationDate}
            </span>
            <div className='flex flex-wrap items-center gap-1.5'>
              <RouteDateChip chip={row.original.dateChip} />
              {parsed ? (
                <span className='whitespace-nowrap text-[11px] capitalize text-muted-foreground'>
                  {parsed.weekday}
                </span>
              ) : null}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'vehiclePlate',
      size: columnWidth('Araç', 118),
      minSize: columnWidth('Araç', 118),
      meta: { label: 'Araç' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Araç' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap font-mono text-sm font-medium'>
          {row.original.vehiclePlate}
        </span>
      ),
    },
    {
      accessorKey: 'courierName',
      size: columnWidth('Kurye', 128),
      minSize: columnWidth('Kurye', 128),
      meta: { label: 'Kurye' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Kurye' />,
      cell: ({ row }) => (
        <span className='truncate text-sm' title={row.original.courierName ?? undefined}>
          {row.original.courierName?.trim() || '—'}
        </span>
      ),
    },
    {
      id: 'progress',
      accessorFn: (row) =>
        row.progressTotal > 0 ? row.progressCompleted / row.progressTotal : 0,
      size: columnWidth('İlerleme', 136),
      minSize: columnWidth('İlerleme', 136),
      meta: { label: 'İlerleme' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='İlerleme' />,
      cell: ({ row }) => (
        <ProgressCell
          completed={row.original.progressCompleted}
          total={row.original.progressTotal}
        />
      ),
    },
    {
      accessorKey: 'orderCount',
      size: columnWidth('Sipariş'),
      minSize: columnWidth('Sipariş'),
      meta: { label: 'Sipariş' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sipariş' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm'>{row.original.orderCount} adet</span>
      ),
    },
    {
      accessorKey: 'distanceKm',
      size: columnWidth('Mesafe'),
      minSize: columnWidth('Mesafe'),
      meta: { label: 'Mesafe' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mesafe' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm'>{formatDistanceKm(row.original.distanceKm)}</span>
      ),
    },
    {
      id: 'duration',
      accessorFn: (row) => row.durationPlannedMin,
      size: columnWidth('Süre', 108),
      minSize: columnWidth('Süre', 108),
      meta: { label: 'Süre' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Süre' />,
      cell: ({ row }) => (
        <div className='flex flex-col gap-0.5 leading-tight'>
          <span className='whitespace-nowrap text-sm tabular-nums'>
            {formatDurationMin(row.original.durationPlannedMin)}
            <span className='ml-1 text-xs text-muted-foreground'>plan</span>
          </span>
          <span className='whitespace-nowrap text-xs tabular-nums text-muted-foreground'>
            {formatDurationMin(row.original.durationActualMin)}
            <span className='ml-1'>gerçek</span>
          </span>
        </div>
      ),
    },
    {
      id: 'capacity',
      accessorFn: (row) => Math.max(row.capacityVolumePct, row.capacityWeightPct),
      size: columnWidth('Kapasite', 136),
      minSize: columnWidth('Kapasite', 136),
      meta: { label: 'Kapasite' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Kapasite' />,
      cell: ({ row }) => (
        <RouteCapacity
          volumePct={row.original.capacityVolumePct}
          weightPct={row.original.capacityWeightPct}
        />
      ),
    },
    {
      id: 'shift',
      accessorFn: (row) => row.shiftStart ?? '',
      size: columnWidth('Başlangıç–Bitiş'),
      minSize: columnWidth('Başlangıç–Bitiş'),
      meta: { label: 'Başlangıç–Bitiş' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Başlangıç–Bitiş' />
      ),
      cell: ({ row }) => {
        const { shiftStart, shiftEnd } = row.original
        if (!shiftStart && !shiftEnd) {
          return <span className='text-muted-foreground'>—</span>
        }
        return (
          <span className='whitespace-nowrap text-sm tabular-nums'>
            {shiftStart ?? '—'} – {shiftEnd ?? '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'parkLabel',
      size: columnWidth('Park / Başlangıç'),
      minSize: columnWidth('Park / Başlangıç'),
      meta: { label: 'Park / Başlangıç' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Park / Başlangıç' />
      ),
      cell: ({ row }) => (
        <span
          className='line-clamp-2 text-sm'
          title={row.original.parkLabel ?? undefined}
        >
          {row.original.parkLabel?.trim() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      size: columnWidth('Müşteri', 140),
      minSize: columnWidth('Müşteri', 140),
      meta: { label: 'Müşteri' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Müşteri' />,
      cell: ({ row }) => {
        const { customerId, customerName } = row.original
        if (!customerName) {
          return <span className='text-muted-foreground'>—</span>
        }
        if (customerId) {
          return (
            <Link
              href={ARF_ROUTES.lastmile.customers.detail(customerId)}
              className='truncate text-sm font-medium text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-primary'
              title={customerName}
            >
              {customerName}
            </Link>
          )
        }
        return (
          <span className='truncate text-sm' title={customerName}>
            {customerName}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      size: columnWidth('Oluşturulma Zamanı'),
      minSize: columnWidth('Oluşturulma Zamanı'),
      meta: { label: 'Oluşturulma Zamanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Oluşturulma Zamanı' />
      ),
      cell: ({ row }) => {
        const createdAt = parseRouteDateTime(row.original.createdAt)
        if (!createdAt) {
          return (
            <span className='whitespace-nowrap text-muted-foreground'>
              {row.original.createdAt || '—'}
            </span>
          )
        }
        return (
          <div className='flex flex-col gap-0.5 leading-tight'>
            <span className='whitespace-nowrap text-sm font-medium text-foreground'>
              {createdAt.date}
            </span>
            <span className='whitespace-nowrap tabular-nums text-xs text-muted-foreground'>
              {createdAt.time}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdBy',
      size: columnWidth('Oluşturan', 128),
      minSize: columnWidth('Oluşturan', 128),
      meta: { label: 'Oluşturan' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturan' />,
      cell: ({ row }) => (
        <span className='truncate text-sm' title={row.original.createdBy ?? undefined}>
          {row.original.createdBy?.trim() || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 136,
      meta: { label: 'İşlemler' },
      header: () => null,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium'
              >
                İşlemler
                <ChevronDown className='ml-1 size-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>{row.original.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={detailHref(row.original.id)}>
                  <Eye className='mr-2 size-4' />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ARF_ROUTES.lastmile.planning.orchestratorWithRoute(row.original.id)}>
                  <MapPinned className='mr-2 size-4' />
                  Orkestratörde Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  // Placeholder: edit route flow
                }}
              >
                <Pencil className='mr-2 size-4' />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  // Placeholder: transfer route flow
                }}
              >
                <ArrowRightLeft className='mr-2 size-4' />
                Transfer Et
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-rose-700 focus:text-rose-700'
                onSelect={() => {
                  // Placeholder: cancel route flow
                }}
              >
                <Ban className='mr-2 size-4' />
                İptal Et
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
