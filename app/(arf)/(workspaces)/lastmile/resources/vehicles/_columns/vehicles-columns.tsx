'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  ChevronDown,
  Eye,
  MapPinned,
  PauseCircle,
  Pencil,
  PlayCircle,
} from 'lucide-react'
import type { LastmileVehicle } from '../_types/vehicle'
import type { CourierOption } from '../_lib/map-vehicle'
import { AssignedCourierField } from '../_components/assigned-courier-field'
import { VehicleDocWarnings } from '../_components/vehicle-doc-warnings'
import { VehicleOccupancy } from '../_components/vehicle-occupancy'
import { VehicleStatusField } from '../_components/vehicle-status-field'
import { VehicleTypeLabel } from '../_components/vehicle-type-label'
import { MetaChip } from '../../../orders/_components/meta-chip'
import { resolveSkillLabel, formatServiceRegionCompact } from '../_lib/query-vehicles'

function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

function formatDateTr(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function EmptyCell() {
  return <span className='text-sm text-muted-foreground'>—</span>
}

function ServiceRegionCell({ value }: { value: string }) {
  const full = value.trim() || 'Tanımsız'
  const compact = formatServiceRegionCompact(full)
  const isUndefined = full === 'Tanımsız'

  if (isUndefined) {
    return <span className='text-sm text-muted-foreground'>Tanımsız</span>
  }

  const label = (
    <span className='block max-w-[10.5rem] truncate text-sm font-medium text-foreground'>
      {compact}
    </span>
  )

  if (compact === full) return label

  return (
    <Tooltip>
      <TooltipTrigger asChild>{label}</TooltipTrigger>
      <TooltipContent side='top' className='max-w-xs text-xs leading-relaxed'>
        {full}
      </TooltipContent>
    </Tooltip>
  )
}

type ColumnActions = {
  onLiveTrack: (vehicle: LastmileVehicle) => void
  onEdit: (vehicle: LastmileVehicle) => void
  onCourierAssign: (vehicle: LastmileVehicle, courierId: string | null) => void
  onToggleStatus: (vehicle: LastmileVehicle) => void
  courierOptions: CourierOption[]
  skillLabels?: Record<string, string>
  permissions?: {
    canUpdate?: boolean
    canActivate?: boolean
    canPassive?: boolean
    canChangeDriver?: boolean
  }
}

export function createVehicleColumns({
  onLiveTrack,
  onEdit,
  onCourierAssign,
  onToggleStatus,
  courierOptions,
  skillLabels = {},
  permissions = {
    canUpdate: true,
    canActivate: true,
    canPassive: true,
    canChangeDriver: true,
  },
}: ColumnActions): ColumnDef<LastmileVehicle>[] {
  return [
    {
      accessorKey: 'plaka',
      enableHiding: false,
      size: 160,
      minSize: 140,
      maxSize: 180,
      meta: { label: 'Plaka' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Plaka' />,
      cell: ({ row }) => (
        <Link
          href={ARF_ROUTES.lastmile.resources.vehicles.detail(row.original.id)}
          className='font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.plaka}
        </Link>
      ),
    },
    {
      id: 'durum',
      accessorFn: (row) => row.durum,
      size: columnWidth('Durum', 24),
      minSize: columnWidth('Durum', 24),
      meta: { label: 'Durum' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Durum' />
      ),
      cell: ({ row }) => <VehicleStatusField vehicle={row.original} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'arac_tipi',
      accessorFn: (row) => row.arac_tipi,
      size: columnWidth('Araç · Kasa Tipi', 40),
      minSize: columnWidth('Araç · Kasa Tipi'),
      maxSize: 260,
      meta: { label: 'Araç · Kasa Tipi' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Araç · Kasa Tipi' />
      ),
      cell: ({ row }) => (
        <VehicleTypeLabel
          aracTipi={row.original.arac_tipi}
          kasaTipi={row.original.kasa_tipi}
        />
      ),
      filterFn: (row, _id, value: string[]) => value.includes(row.original.arac_tipi),
    },
    {
      id: 'marka_model',
      accessorFn: (row) => `${row.marka} ${row.model} ${row.model_yili}`,
      size: columnWidth('Marka · Model · Yıl', 24),
      minSize: columnWidth('Marka · Model · Yıl'),
      maxSize: 300,
      meta: { label: 'Marka · Model · Yıl' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Marka · Model · Yıl' />
      ),
      cell: ({ row }) => (
        <div className='truncate text-sm font-medium text-foreground'>
          {row.original.marka} · {row.original.model} · {row.original.model_yili}
        </div>
      ),
    },
    {
      accessorKey: 'mulkiyet',
      size: columnWidth('Mülkiyet'),
      minSize: columnWidth('Mülkiyet'),
      meta: { label: 'Mülkiyet' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mülkiyet' />,
      cell: ({ row }) => (
        <Badge
          variant='outline'
          className={
            row.original.mulkiyet === 'oz_mal'
              ? 'border-slate-200 bg-white font-medium text-slate-700 shadow-none'
              : row.original.mulkiyet === 'esnaf_kurye'
                ? 'border-amber-200/80 bg-amber-50 font-medium text-amber-800 shadow-none'
                : 'border-indigo-200/80 bg-indigo-50 font-medium text-indigo-700 shadow-none'
          }
        >
          {row.original.mulkiyet === 'oz_mal'
            ? 'Öz Mal'
            : row.original.mulkiyet === 'esnaf_kurye'
              ? 'Esnaf Kurye'
              : 'Kiralık'}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'zimmetli_surucu',
      accessorFn: (row) => row.zimmetli_surucu ?? '',
      size: columnWidth('Zimmetli Kurye'),
      minSize: columnWidth('Zimmetli Kurye'),
      maxSize: 240,
      meta: { label: 'Zimmetli Kurye' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Zimmetli Kurye' />
      ),
      cell: ({ row }) => (
        <AssignedCourierField
          vehicle={row.original}
          courierOptions={courierOptions}
          canChange={permissions.canChangeDriver}
          onAssign={(courierId) => onCourierAssign(row.original, courierId)}
          variant='table'
        />
      ),
    },
    {
      accessorKey: 'hizmet_bolgesi',
      size: 168,
      minSize: 148,
      maxSize: 200,
      meta: { label: 'Hizmet Bölgesi' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hizmet Bölgesi' />
      ),
      cell: ({ row }) => <ServiceRegionCell value={row.original.hizmet_bolgesi} />,
    },
    {
      id: 'vardiya',
      accessorFn: (row) => `${row.vardiya_baslangic}-${row.vardiya_bitis}`,
      size: columnWidth('Vardiya'),
      minSize: columnWidth('Vardiya'),
      meta: { label: 'Vardiya' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Vardiya' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {row.original.vardiya_baslangic}–{row.original.vardiya_bitis}
        </span>
      ),
    },
    {
      id: 'yetenekler',
      accessorFn: (row) => row.yetenekler.join(', '),
      enableSorting: false,
      size: columnWidth('Yetenekler', 40),
      minSize: columnWidth('Yetenekler'),
      maxSize: 480,
      meta: { label: 'Yetenekler' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Yetenekler' />,
      cell: ({ row }) => {
        if (row.original.yetenekler.length === 0) {
          return <EmptyCell />
        }
        return (
          <div className='flex max-w-full flex-wrap gap-1.5 overflow-hidden'>
            {row.original.yetenekler.map((skill) => (
              <MetaChip key={skill} variant='requirement'>
                {resolveSkillLabel(skill, skillLabels)}
              </MetaChip>
            ))}
          </div>
        )
      },
    },
    {
      id: 'kapasite_doluluk',
      accessorFn: (row) => Math.max(row.doluluk_hacim_pct, row.doluluk_agirlik_pct),
      size: 220,
      minSize: 200,
      maxSize: 260,
      meta: { label: 'Kapasite · Doluluk' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kapasite · Doluluk' />
      ),
      cell: ({ row }) => (
        <VehicleOccupancy
          volumePct={row.original.doluluk_hacim_pct}
          weightPct={row.original.doluluk_agirlik_pct}
          maxVolumeM3={row.original.max_hacim_m3}
          maxWeightKg={row.original.max_agirlik_kg}
        />
      ),
    },
    {
      accessorKey: 'muayene_bitis',
      size: columnWidth('Muayene Bitiş'),
      minSize: columnWidth('Muayene Bitiş'),
      meta: { label: 'Muayene Bitiş' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Muayene Bitiş' />
      ),
      cell: ({ row }) => {
        const formatted = formatDateTr(row.original.muayene_bitis)
        return formatted ? (
          <span className='tabular-nums text-sm font-medium text-foreground'>{formatted}</span>
        ) : (
          <EmptyCell />
        )
      },
    },
    {
      accessorKey: 'trafik_sigortasi_bitis',
      size: columnWidth('Sigorta Bitiş'),
      minSize: columnWidth('Sigorta Bitiş'),
      meta: { label: 'Sigorta Bitiş' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sigorta Bitiş' />
      ),
      cell: ({ row }) => {
        const formatted = formatDateTr(row.original.trafik_sigortasi_bitis)
        return formatted ? (
          <span className='tabular-nums text-sm font-medium text-foreground'>{formatted}</span>
        ) : (
          <EmptyCell />
        )
      },
    },
    {
      accessorKey: 'kasko_police_no',
      size: columnWidth('Kasko Poliçe No'),
      minSize: columnWidth('Kasko Poliçe No'),
      meta: { label: 'Kasko Poliçe No' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kasko Poliçe No' />
      ),
      cell: ({ row }) =>
        row.original.kasko_police_no ? (
          <span className='font-mono text-sm font-medium text-foreground'>
            {row.original.kasko_police_no}
          </span>
        ) : (
          <EmptyCell />
        ),
    },
    {
      accessorKey: 'kasko_bitis',
      size: columnWidth('Kasko Bitiş'),
      minSize: columnWidth('Kasko Bitiş'),
      meta: { label: 'Kasko Bitiş' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kasko Bitiş' />
      ),
      cell: ({ row }) => {
        const formatted = formatDateTr(row.original.kasko_bitis)
        return formatted ? (
          <span className='tabular-nums text-sm font-medium text-foreground'>{formatted}</span>
        ) : (
          <EmptyCell />
        )
      },
    },
    {
      id: 'evrak_uyarilari',
      accessorFn: (row) => row.evrak_uyarilari.length,
      enableSorting: false,
      size: 96,
      minSize: 88,
      maxSize: 112,
      meta: { label: 'Uyarılar' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Uyarılar' />
      ),
      cell: ({ row }) => <VehicleDocWarnings warnings={row.original.evrak_uyarilari} />,
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      size: 136,
      minSize: 136,
      maxSize: 152,
      header: () => <span className='sr-only'>İşlemler</span>,
      cell: ({ row }) => {
        const vehicle = row.original
        const isPassive = vehicle.durum === 'pasif'
        const canChangeStatus = isPassive ? permissions.canActivate : permissions.canPassive

        return (
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
                <DropdownMenuLabel className='font-mono'>{vehicle.plaka}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ARF_ROUTES.lastmile.resources.vehicles.detail(vehicle.id)}>
                    <Eye className='mr-2 size-4' />
                    Detay Gör
                  </Link>
                </DropdownMenuItem>
                {permissions.canUpdate ? (
                  <DropdownMenuItem onSelect={() => onEdit(vehicle)}>
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                ) : null}
                {canChangeStatus ? (
                  <DropdownMenuItem
                    className={
                      isPassive
                        ? 'text-emerald-700 focus:text-emerald-700'
                        : 'text-rose-700 focus:text-rose-700'
                    }
                    onSelect={() => onToggleStatus(vehicle)}
                  >
                    {isPassive ? (
                      <>
                        <PlayCircle className='mr-2 size-4' />
                        Aktif Et
                      </>
                    ) : (
                      <>
                        <PauseCircle className='mr-2 size-4' />
                        Pasife Al
                      </>
                    )}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onSelect={() => onLiveTrack(vehicle)}>
                  <MapPinned className='mr-2 size-4' />
                  Canlı İzle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export const vehicleOwnershipFilterOptions = [
  { label: 'Öz Mal', value: 'oz_mal' },
  { label: 'Kiralık', value: 'kiralik' },
  { label: 'Esnaf Kurye', value: 'esnaf_kurye' },
]
