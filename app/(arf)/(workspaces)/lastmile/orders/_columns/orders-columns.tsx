'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { createSelectionColumn, DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { withLastmileDemo } from '../../_lib/lastmile-demo-mode'
import {
  Ban,
  ChevronDown,
  Eye,
  Printer,
  Trash2,
  UserPlus,
} from 'lucide-react'
import type { LastmileOrder } from '../_types/order'
import { OrderStatusBadge } from '../_components/order-status-badge'
import { OrderTypeBadge } from '../_components/order-type-badge'
import { MetaChip } from '../_components/meta-chip'
import { RouteTypeBadge } from '../_components/route-type-badge'
import {
  formatContact,
  formatVolumeWeight,
  formatDistance,
  formatEta,
  formatPackageSize,
  formatPriority,
  formatTaskDuration,
  getEtaDisplay,
  getLocationDisplay,
  parseCreatedAt,
  parseCreator,
  parsePickupDeliverySchedule,
} from '../_lib/query-orders'

/** Başlık metni için varsayılan sütun genişliği */
function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

function PickupDeliveryTimeCell({
  pickup,
  delivery,
}: {
  pickup: string
  delivery: string
}) {
  const parsed = parsePickupDeliverySchedule(pickup, delivery)
  if (!parsed) {
    return <span className='text-muted-foreground'>—</span>
  }

  return (
    <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
      <span className='whitespace-nowrap text-sm font-medium text-foreground'>{parsed.date}</span>
      <span className='whitespace-nowrap tabular-nums text-xs text-muted-foreground'>
        {parsed.lines.join(' · ')}
      </span>
    </div>
  )
}

type OrderColumnOptions = {
  /** Rota detay — siparişi rotadan çıkar */
  onRemoveFromRoute?: (order: LastmileOrder) => void
  /** Demo mock gezinme — detay linklerine ?demo=1 ekler */
  demo?: boolean
  /** Satır iptal / iptal talebi */
  onCancelOrder?: (order: LastmileOrder) => void
}

export function createOrderColumns(
  options: OrderColumnOptions = {}
): ColumnDef<LastmileOrder>[] {
  const { onRemoveFromRoute, onCancelOrder, demo = false } = options
  const detailHref = (id: string) =>
    withLastmileDemo(ARF_ROUTES.lastmile.orders.detail(id), demo)

  return [
    createSelectionColumn<LastmileOrder>(),
    {
      accessorKey: 'takip_no',
      enableHiding: false,
      size: columnWidth('Takip No'),
      minSize: columnWidth('Takip No'),
      meta: { label: 'Takip No' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Takip No' />,
      cell: ({ row }) => (
        <Link
          href={detailHref(row.original.id)}
          className='font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.takip_no}
        </Link>
      ),
    },
    {
      accessorKey: 'referans_no',
      size: columnWidth('Referans No'),
      minSize: columnWidth('Referans No'),
      meta: { label: 'Referans No' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Referans No' />,
      cell: ({ row }) => (
        <span className='font-mono text-sm font-medium text-foreground'>{row.original.referans_no}</span>
      ),
    },
    {
      accessorKey: 'siparis_tipi',
      size: columnWidth('Sipariş Tipi', 24),
      minSize: columnWidth('Sipariş Tipi', 24),
      meta: { label: 'Sipariş Tipi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sipariş Tipi' />,
      cell: ({ row }) => <OrderTypeBadge type={row.original.siparis_tipi} />,
    },
    {
      accessorKey: 'rota_tipi',
      size: columnWidth('Rota Tipi'),
      minSize: columnWidth('Rota Tipi'),
      meta: { label: 'Rota Tipi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rota Tipi' />,
      cell: ({ row }) => <RouteTypeBadge type={row.original.rota_tipi} />,
    },
    {
      accessorKey: 'durum',
      size: columnWidth('Durum', 40),
      minSize: columnWidth('Durum', 40),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => (
        <OrderStatusBadge
          status={row.original.durum}
          label={row.original.durum_etiketi}
        />
      ),
    },
    {
      id: 'alim_teslim_zamani',
      accessorFn: (row) =>
        [row.alim_zaman_penceresi, row.teslim_zaman_penceresi].filter(Boolean).join(' '),
      size: columnWidth('Alım/Teslim Zamanı', 24),
      minSize: columnWidth('Alım/Teslim Zamanı', 24),
      meta: { label: 'Alım/Teslim Zamanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Alım/Teslim Zamanı' />
      ),
      cell: ({ row }) => (
        <PickupDeliveryTimeCell
          pickup={row.original.alim_zaman_penceresi}
          delivery={row.original.teslim_zaman_penceresi}
        />
      ),
    },
    {
      id: 'eta',
      accessorFn: (row) => formatEta(row),
      size: columnWidth('Tahmini Varış Süresi (ETA)'),
      minSize: columnWidth('Tahmini Varış Süresi (ETA)'),
      meta: { label: 'Tahmini Varış Süresi (ETA)' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tahmini Varış Süresi (ETA)' />
      ),
      cell: ({ row }) => {
        const eta = getEtaDisplay(row.original)

        if (eta.tone === 'waiting') {
          return <span className='text-sm font-medium text-amber-700'>{eta.time}</span>
        }

        const detailClass =
          eta.tone === 'late'
            ? 'text-rose-600'
            : eta.tone === 'done'
              ? 'text-emerald-600'
              : 'text-muted-foreground'

        return (
          <div className='flex flex-col gap-0.5 leading-tight'>
            <span className='whitespace-nowrap tabular-nums text-sm font-medium text-foreground'>
              {eta.time}
            </span>
            {eta.detail && (
              <span className={`whitespace-nowrap text-xs ${detailClass}`}>{eta.detail}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'gorev_suresi',
      accessorFn: (row) => row.gorev_suresi_dk,
      size: columnWidth('Görev Süresi', 40),
      minSize: columnWidth('Görev Süresi', 40),
      meta: { label: 'Görev Süresi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Görev Süresi' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium text-foreground'>
          {formatTaskDuration(row.original.gorev_suresi_dk, row.original.siparis_tipi)}
        </span>
      ),
    },
    {
      accessorKey: 'oncelik_puani',
      size: columnWidth('Öncelik Puanı'),
      minSize: columnWidth('Öncelik Puanı'),
      meta: { label: 'Öncelik Puanı' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Öncelik Puanı' />,
      cell: ({ row }) => {
        const score = row.original.oncelik_puani
        return (
          <span
            className={
              score >= 90
                ? 'text-sm font-semibold text-rose-600'
                : score >= 70
                  ? 'text-sm font-medium text-amber-700'
                  : 'text-sm font-medium text-foreground'
            }
          >
            {formatPriority(score)}
          </span>
        )
      },
    },
    {
      id: 'gereksinimler',
      accessorFn: (row) => row.gereksinimler.join(', '),
      size: columnWidth('Gereksinimler', 40),
      minSize: columnWidth('Gereksinimler'),
      maxSize: 480,
      meta: { label: 'Gereksinimler' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Gereksinimler' />,
      cell: ({ row }) => {
        if (row.original.gereksinimler.length === 0) {
          return <span className='text-muted-foreground'>—</span>
        }

        return (
          <div className='flex max-w-full flex-wrap gap-1.5 overflow-hidden'>
            {row.original.gereksinimler.map((item) => (
              <MetaChip key={item} variant='requirement'>
                {item}
              </MetaChip>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'musteri',
      size: columnWidth('Müşteri', 40),
      minSize: columnWidth('Müşteri'),
      meta: { label: 'Müşteri' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Müşteri' />,
      cell: ({ row }) => (
        <span className='text-sm font-medium text-foreground'>{row.original.musteri}</span>
      ),
    },
    {
      accessorKey: 'alis_noktasi',
      size: columnWidth('Alış Noktası', 40),
      minSize: columnWidth('Alış Noktası'),
      maxSize: 520,
      meta: { label: 'Alış Noktası' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Alış Noktası' />,
      cell: ({ row }) => {
        const location = getLocationDisplay(row.original.alis_noktasi)
        return (
          <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
            <span className='truncate text-sm font-medium text-foreground' title={location.title}>
              {location.title}
            </span>
            {location.detail && (
              <span className='text-xs text-muted-foreground'>{location.detail}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'alis_muhatabi',
      accessorFn: (row) => formatContact(row.alis_muhatabi, row.alis_telefon),
      size: columnWidth('Alış Muhatabı & İletişim'),
      minSize: columnWidth('Alış Muhatabı & İletişim'),
      maxSize: 480,
      meta: { label: 'Alış Muhatabı & İletişim' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Alış Muhatabı & İletişim' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span className='truncate text-sm font-medium text-foreground' title={row.original.alis_muhatabi}>
            {row.original.alis_muhatabi}
          </span>
          <span className='truncate tabular-nums text-xs text-muted-foreground' title={row.original.alis_telefon}>
            {row.original.alis_telefon}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'varis_noktasi',
      size: columnWidth('Varış Noktası', 40),
      minSize: columnWidth('Varış Noktası'),
      maxSize: 520,
      meta: { label: 'Varış Noktası' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Varış Noktası' />,
      cell: ({ row }) => {
        const location = getLocationDisplay(row.original.varis_noktasi)
        return (
          <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
            <span className='truncate text-sm font-medium text-foreground' title={location.title}>
              {location.title}
            </span>
            {location.detail && (
              <span className='text-xs text-muted-foreground'>{location.detail}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'varis_muhatabi',
      accessorFn: (row) => formatContact(row.varis_muhatabi, row.varis_telefon),
      size: columnWidth('Varış Muhatabı & İletişim'),
      minSize: columnWidth('Varış Muhatabı & İletişim'),
      maxSize: 480,
      meta: { label: 'Varış Muhatabı & İletişim' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Varış Muhatabı & İletişim' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span className='truncate text-sm font-medium text-foreground' title={row.original.varis_muhatabi}>
            {row.original.varis_muhatabi}
          </span>
          <span className='truncate tabular-nums text-xs text-muted-foreground' title={row.original.varis_telefon}>
            {row.original.varis_telefon}
          </span>
        </div>
      ),
    },
    {
      id: 'mesafe',
      accessorFn: (row) => row.mesafe_m,
      size: columnWidth('Mesafe'),
      minSize: columnWidth('Mesafe'),
      meta: { label: 'Mesafe' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mesafe' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatDistance(row.original.mesafe_m)}
        </span>
      ),
    },
    {
      id: 'paket_boyutu_adedi',
      accessorFn: (row) => `${row.hacim_sinifi} ${row.paket_sayisi}`,
      size: columnWidth('Paket Boyutu & Adedi'),
      minSize: columnWidth('Paket Boyutu & Adedi'),
      meta: { label: 'Paket Boyutu & Adedi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Paket Boyutu & Adedi' />,
      cell: ({ row }) => {
        const packageSize = formatPackageSize(row.original)
        return (
          <div className='flex flex-col gap-0.5 leading-tight'>
            <span className='whitespace-nowrap text-sm font-medium text-foreground'>
              {packageSize.size}
            </span>
            <span className='whitespace-nowrap text-xs text-muted-foreground'>{packageSize.count}</span>
          </div>
        )
      },
    },
    {
      id: 'toplam_hacim_agirlik',
      accessorFn: (row) => row.toplam_hacim,
      size: columnWidth('Hacim & Ağırlık'),
      minSize: columnWidth('Hacim & Ağırlık'),
      meta: { label: 'Hacim & Ağırlık' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hacim & Ağırlık' />
      ),
      cell: ({ row }) => {
        const volumeWeight = formatVolumeWeight(row.original)
        return (
          <div className='flex flex-col gap-0.5 leading-tight'>
            <span className='whitespace-nowrap tabular-nums text-sm font-medium text-foreground'>
              {volumeWeight.volume}
            </span>
            <span className='whitespace-nowrap tabular-nums text-xs text-muted-foreground'>
              {volumeWeight.weight}
            </span>
          </div>
        )
      },
    },
    {
      id: 'atanan_arac',
      accessorFn: (row) => row.atanan_arac ?? 'Atanmadı',
      size: columnWidth('Atanan Araç'),
      minSize: columnWidth('Atanan Araç'),
      meta: { label: 'Atanan Araç' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Atanan Araç' />,
      cell: ({ row }) =>
        row.original.atanan_arac ? (
          <span className='font-mono text-sm font-medium text-foreground'>{row.original.atanan_arac}</span>
        ) : (
          <span className='text-sm font-medium text-amber-700'>Atanmadı</span>
        ),
    },
    {
      id: 'atanan_kurye',
      accessorFn: (row) => row.atanan_kurye ?? 'Atanmadı',
      size: columnWidth('Atanan Kurye'),
      minSize: columnWidth('Atanan Kurye'),
      meta: { label: 'Atanan Kurye' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Atanan Kurye' />,
      cell: ({ row }) =>
        row.original.atanan_kurye ? (
          <span className='text-sm font-medium text-foreground'>{row.original.atanan_kurye}</span>
        ) : (
          <span className='text-sm font-medium text-amber-700'>Atanmadı</span>
        ),
    },
    {
      id: 'etiketler',
      accessorFn: (row) => row.etiketler.join(', '),
      size: columnWidth('Etiketler', 40),
      minSize: columnWidth('Etiketler'),
      maxSize: 520,
      meta: { label: 'Etiketler' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etiketler' />,
      cell: ({ row }) => {
        if (row.original.etiketler.length === 0) {
          return <span className='text-muted-foreground'>—</span>
        }

        return (
          <div className='flex max-w-full flex-wrap gap-1.5 overflow-hidden'>
            {row.original.etiketler.map((tag) => (
              <MetaChip key={tag} variant='tag'>
                {tag}
              </MetaChip>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'olusturulma_zamani',
      size: columnWidth('Oluşturulma Zamanı'),
      minSize: columnWidth('Oluşturulma Zamanı'),
      meta: { label: 'Oluşturulma Zamanı' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturulma Zamanı' />,
      cell: ({ row }) => {
        const createdAt = parseCreatedAt(row.original.olusturulma_zamani)
        if (!createdAt) {
          return (
            <span className='whitespace-nowrap text-muted-foreground'>
              {row.original.olusturulma_zamani}
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
      accessorKey: 'olusturan',
      size: columnWidth('Oluşturan'),
      minSize: columnWidth('Oluşturan'),
      meta: { label: 'Oluşturan' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturan' />,
      cell: ({ row }) => {
        const creator = parseCreator(row.original.olusturan)
        return (
          <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
            <span className='truncate text-sm font-medium text-foreground' title={creator.title}>
              {creator.title}
            </span>
            {creator.detail && (
              <span className='truncate text-xs text-muted-foreground' title={creator.detail}>
                {creator.detail}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      size: 136,
      minSize: 136,
      maxSize: 152,
      header: () => <span className='sr-only'>İşlemler</span>,
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
            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuLabel>{`Takip No ${row.original.takip_no}`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={detailHref(row.original.id)}>
                  <Eye className='mr-2 size-4' />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  // Placeholder: assign courier flow
                }}
              >
                <UserPlus className='mr-2 size-4' />
                Ata
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  // Placeholder: print label flow
                }}
              >
                <Printer className='mr-2 size-4' />
                Etiket Yazdır
              </DropdownMenuItem>
              {onRemoveFromRoute ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-rose-700 focus:text-rose-700'
                    onSelect={() => onRemoveFromRoute(row.original)}
                  >
                    <Trash2 className='mr-2 size-4' />
                    Rotadan Çıkar
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-amber-700 focus:text-amber-700'
                disabled={row.original.durum === 'iptal_edildi'}
                onSelect={() => {
                  onCancelOrder?.(row.original)
                }}
              >
                <Ban className='mr-2 size-4' />
                İptal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
