'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import { Badge } from '@/components/ui/badge'
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
import { withLastmileDemo } from '../../../_lib/lastmile-demo-mode'
import {
  ChevronDown,
  Eye,
  KeyRound,
  MapPinned,
  PauseCircle,
  Pencil,
  PlayCircle,
} from 'lucide-react'
import type { LastmileCourier } from '../_types/courier'
import type { VehicleOption } from '../_lib/vehicle-options'
import { AssignedVehicleField } from '../_components/assigned-vehicle-field'
import { CourierDocWarnings } from '../_components/courier-doc-warnings'
import { CourierStatusField } from '../_components/courier-status-field'
import {
  COURIER_EMPLOYMENT_LABELS,
  resolveCourierSkillLabel,
} from '../_lib/query-couriers'

function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

function EmptyCell() {
  return <span className='text-sm text-muted-foreground'>—</span>
}

function formatTckn(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
}

function CourierEmailCell({ courier }: { courier: LastmileCourier }) {
  if (!courier.davet_kabul_edildi) {
    return (
      <Badge
        variant='outline'
        className='border-amber-200/80 bg-amber-50 font-medium text-amber-800 shadow-none'
      >
        Davet Edildi
      </Badge>
    )
  }

  if (courier.eposta) {
    return (
      <span className='block max-w-[220px] truncate text-sm font-medium text-foreground'>
        {courier.eposta}
      </span>
    )
  }

  return <EmptyCell />
}

type ColumnActions = {
  onEdit: (courier: LastmileCourier) => void
  onToggleStatus: (courier: LastmileCourier) => void
  onLiveTrack: (courier: LastmileCourier) => void
  onSendPasswordReset: (courier: LastmileCourier) => void
  onVehicleAssign: (courier: LastmileCourier, vehicleId: string | null) => void
  vehicleOptions: VehicleOption[]
  skillLabelMap?: Record<string, string>
  permissions?: {
    canUpdate: boolean
    canActivate: boolean
    canPassive: boolean
    canChangeVehicle: boolean
  }
  demo?: boolean
}

export function createCourierColumns({
  onEdit,
  onToggleStatus,
  onLiveTrack,
  onSendPasswordReset,
  onVehicleAssign,
  vehicleOptions,
  skillLabelMap = {},
  permissions = {
    canUpdate: true,
    canActivate: true,
    canPassive: true,
    canChangeVehicle: true,
  },
  demo = false,
}: ColumnActions): ColumnDef<LastmileCourier>[] {
  const detailHref = (id: string) =>
    withLastmileDemo(ARF_ROUTES.lastmile.resources.couriers.detail(id), demo)

  return [
    {
      accessorKey: 'ad_soyad',
      enableHiding: false,
      size: 200,
      minSize: 180,
      maxSize: 260,
      meta: { label: 'Ad Soyad' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ad Soyad' />,
      cell: ({ row }) => (
        <Link
          href={detailHref(row.original.id)}
          className='text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.ad_soyad}
        </Link>
      ),
    },
    {
      id: 'durum',
      accessorFn: (row) => row.durum,
      size: columnWidth('Durum', 24),
      minSize: columnWidth('Durum', 24),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => <CourierStatusField courier={row.original} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: 'telefon',
      size: columnWidth('Telefon'),
      minSize: columnWidth('Telefon'),
      meta: { label: 'Telefon' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Telefon' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {row.original.telefon}
        </span>
      ),
    },
    {
      id: 'eposta',
      accessorFn: (row) =>
        row.davet_kabul_edildi ? row.eposta ?? '' : 'davet_edildi',
      size: columnWidth('E-Posta', 24),
      minSize: columnWidth('E-Posta'),
      maxSize: 260,
      meta: { label: 'E-Posta' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='E-Posta' />,
      cell: ({ row }) => <CourierEmailCell courier={row.original} />,
    },
    {
      accessorKey: 'tckn',
      size: columnWidth('TCKN'),
      minSize: columnWidth('TCKN'),
      meta: { label: 'TCKN' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='TCKN' />,
      cell: ({ row }) =>
        row.original.tckn ? (
          <span className='whitespace-nowrap font-mono text-sm font-medium tabular-nums text-foreground'>
            {formatTckn(row.original.tckn)}
          </span>
        ) : (
          <EmptyCell />
        ),
    },
    {
      accessorKey: 'kan_grubu',
      size: columnWidth('Kan Grubu', 16),
      minSize: columnWidth('Kan Grubu'),
      meta: { label: 'Kan Grubu' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Kan Grubu' />,
      cell: ({ row }) =>
        row.original.kan_grubu ? (
          <Badge
            variant='outline'
            className='border-rose-200/80 bg-rose-50/70 font-medium text-rose-800 shadow-none'
          >
            {row.original.kan_grubu}
          </Badge>
        ) : (
          <EmptyCell />
        ),
    },
    {
      accessorKey: 'istihdam',
      size: columnWidth('İstihdam', 24),
      minSize: columnWidth('İstihdam'),
      meta: { label: 'İstihdam' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='İstihdam' />,
      cell: ({ row }) => {
        const type = row.original.istihdam
        return (
          <Badge
            variant='outline'
            className={
              type === 'sirket'
                ? 'border-slate-200 bg-white font-medium text-slate-700 shadow-none'
                : 'border-amber-200/80 bg-amber-50 font-medium text-amber-800 shadow-none'
            }
          >
            {type === 'sirket' ? 'Şirket' : 'Esnaf'}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'zimmetli_arac',
      accessorFn: (row) => row.zimmetli_arac_plaka ?? '',
      size: columnWidth('Zimmetli Araç'),
      minSize: columnWidth('Zimmetli Araç'),
      maxSize: 200,
      meta: { label: 'Zimmetli Araç' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Zimmetli Araç' />
      ),
      cell: ({ row }) => (
        <AssignedVehicleField
          courier={row.original}
          vehicleOptions={vehicleOptions}
          canChange={permissions.canChangeVehicle}
          onAssign={(vehicleId) => onVehicleAssign(row.original, vehicleId)}
          variant='table'
        />
      ),
    },
    {
      id: 'vardiya',
      accessorFn: (row) => `${row.vardiya_baslangic}-${row.vardiya_bitis}`,
      size: 150,
      minSize: 140,
      maxSize: 180,
      meta: { label: 'Vardiya' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Vardiya' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm font-medium text-foreground'>
          {row.original.vardiya_baslangic} – {row.original.vardiya_bitis}
        </span>
      ),
    },
    {
      id: 'yetenekler',
      accessorFn: (row) => row.yetenekler.join(' '),
      enableSorting: false,
      size: 220,
      minSize: 180,
      maxSize: 300,
      meta: { label: 'Yetenekler' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Yetenekler' />,
      cell: ({ row }) => {
        if (row.original.yetenekler.length === 0) {
          return <EmptyCell />
        }
        return (
          <div className='flex max-w-[260px] flex-wrap gap-1'>
            {row.original.yetenekler.map((skill) => (
              <Badge
                key={skill}
                variant='outline'
                className='rounded-md border-slate-200 bg-slate-50 px-2 py-0 text-[11px] font-medium text-slate-700 shadow-none'
              >
                {resolveCourierSkillLabel(skill, skillLabelMap)}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'evrak_uyarilari',
      accessorFn: (row) => row.evrak_uyarilari.length,
      enableSorting: false,
      size: 120,
      minSize: 100,
      maxSize: 140,
      meta: { label: 'Uyarılar' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Uyarılar' />,
      cell: ({ row }) => <CourierDocWarnings warnings={row.original.evrak_uyarilari} />,
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
        const courier = row.original
        const isPassive = courier.durum === 'pasif'
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
              <DropdownMenuContent align='end' className='w-60'>
                <DropdownMenuLabel>{courier.ad_soyad}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={detailHref(courier.id)}>
                    <Eye className='mr-2 size-4' />
                    Detay Gör
                  </Link>
                </DropdownMenuItem>
                {permissions.canUpdate ? (
                  <DropdownMenuItem onSelect={() => onEdit(courier)}>
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
                    onSelect={() => onToggleStatus(courier)}
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
                <DropdownMenuItem onSelect={() => onLiveTrack(courier)}>
                  <MapPinned className='mr-2 size-4' />
                  Canlı İzle
                </DropdownMenuItem>
                {permissions.canUpdate ? (
                  <DropdownMenuItem onSelect={() => onSendPasswordReset(courier)}>
                    <KeyRound className='mr-2 size-4' />
                    Şifre Sıfırlama Bağlantısı Gönder
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export const courierEmploymentFilterOptions = (
  Object.entries(COURIER_EMPLOYMENT_LABELS) as [string, string][]
).map(([value, label]) => ({
  label: value === 'sirket' ? 'Şirket' : 'Esnaf',
  value,
}))
