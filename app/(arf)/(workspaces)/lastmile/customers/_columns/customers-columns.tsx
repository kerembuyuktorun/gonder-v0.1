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
import { ARF_ROUTES } from '../../../../_shared/routes'
import { ChevronDown, Eye, PauseCircle, Pencil, PlayCircle } from 'lucide-react'
import type { LastmileCustomer } from '../_types/customer'
import { CustomerStatusBadge } from '../_components/customer-status-badge'
import {
  formatCount,
  formatSuccessRate,
  formatVolume,
} from '../_lib/query-customers'

function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

type ColumnActions = {
  onEdit: (customer: LastmileCustomer) => void
  onToggleStatus: (customer: LastmileCustomer) => void
}

export function createCustomerColumns({
  onEdit,
  onToggleStatus,
}: ColumnActions): ColumnDef<LastmileCustomer>[] {
  return [
    {
      accessorKey: 'musteri_kodu',
      enableHiding: false,
      size: 176,
      minSize: 160,
      maxSize: 200,
      meta: { label: 'Müşteri Kodu' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Müşteri Kodu' />,
      cell: ({ row }) => (
        <Link
          href={ARF_ROUTES.lastmile.customers.detail(row.original.id)}
          className='font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.musteri_kodu}
        </Link>
      ),
    },
    {
      accessorKey: 'durum',
      size: columnWidth('Durum', 24),
      minSize: columnWidth('Durum', 24),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => <CustomerStatusBadge status={row.original.durum} />,
    },
    {
      id: 'firma_unvani',
      accessorFn: (row) => `${row.marka_kisa_ad} ${row.firma_unvani}`,
      size: columnWidth('Kısa Ad Ve Firma Ünvanı', 40),
      minSize: columnWidth('Kısa Ad Ve Firma Ünvanı'),
      maxSize: 420,
      meta: { label: 'Kısa Ad Ve Firma Ünvanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kısa Ad Ve Firma Ünvanı' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span
            className='truncate text-sm font-medium text-foreground'
            title={row.original.marka_kisa_ad}
          >
            {row.original.marka_kisa_ad}
          </span>
          <span
            className='truncate text-xs text-muted-foreground'
            title={row.original.firma_unvani}
          >
            {row.original.firma_unvani}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'vkn',
      size: columnWidth('VKN'),
      minSize: columnWidth('VKN'),
      meta: { label: 'VKN' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='VKN' />,
      cell: ({ row }) => (
        <span className='font-mono text-sm font-medium tabular-nums text-foreground'>
          {row.original.vkn}
        </span>
      ),
    },
    {
      accessorKey: 'sektor',
      size: columnWidth('Sektör'),
      minSize: columnWidth('Sektör'),
      meta: { label: 'Sektör' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sektör' />,
      cell: ({ row }) => (
        <span className='text-sm font-medium text-foreground'>{row.original.sektor}</span>
      ),
    },
    {
      id: 'tesis',
      accessorFn: (row) => row.tesis_sayisi,
      size: columnWidth('Toplam Tesis'),
      minSize: columnWidth('Toplam Tesis'),
      meta: { label: 'Toplam Tesis' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Toplam Tesis' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatCount(row.original.tesis_sayisi)}
        </span>
      ),
    },
    {
      id: 'ana_yetkili',
      accessorFn: (row) => `${row.ana_yetkili} ${row.ana_yetkili_unvan}`,
      size: columnWidth('Yetkili Ve Ünvanı', 24),
      minSize: columnWidth('Yetkili Ve Ünvanı'),
      maxSize: 320,
      meta: { label: 'Yetkili Ve Ünvanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Yetkili Ve Ünvanı' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span className='truncate text-sm font-medium text-foreground' title={row.original.ana_yetkili}>
            {row.original.ana_yetkili}
          </span>
          <span className='truncate text-xs text-muted-foreground' title={row.original.ana_yetkili_unvan}>
            {row.original.ana_yetkili_unvan}
          </span>
        </div>
      ),
    },
    {
      id: 'iletisim',
      accessorFn: (row) => `${row.telefon} ${row.email}`,
      size: columnWidth('İletişim', 40),
      minSize: columnWidth('İletişim'),
      maxSize: 360,
      meta: { label: 'İletişim' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='İletişim' />,
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span
            className='truncate text-sm font-medium tabular-nums text-foreground'
            title={row.original.telefon}
          >
            {row.original.telefon}
          </span>
          <span className='truncate text-xs text-muted-foreground' title={row.original.email}>
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'bugunku_aktif_siparis',
      size: columnWidth('Bugünkü Aktif Sipariş'),
      minSize: columnWidth('Bugünkü Aktif Sipariş'),
      meta: { label: 'Bugünkü Aktif Sipariş' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bugünkü Aktif Sipariş' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatCount(row.original.bugunku_aktif_siparis)}
        </span>
      ),
    },
    {
      accessorKey: 'gunluk_ortalama_hacim',
      size: columnWidth('Ort. Günlük Hacim'),
      minSize: columnWidth('Ort. Günlük Hacim'),
      meta: { label: 'Ort. Günlük Hacim' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ort. Günlük Hacim' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm font-medium text-foreground'>
          {formatVolume(row.original.gunluk_ortalama_hacim)}
        </span>
      ),
    },
    {
      accessorKey: 'ortalama_gorev_suresi_dk',
      size: columnWidth('Ort. Görev Süresi'),
      minSize: columnWidth('Ort. Görev Süresi'),
      meta: { label: 'Ort. Görev Süresi' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ort. Görev Süresi' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium text-foreground'>
          {row.original.ortalama_gorev_suresi_dk.toLocaleString('tr-TR')} dk
        </span>
      ),
    },
    {
      accessorKey: 'teslimat_basari_orani',
      size: columnWidth('Ort. % SLA'),
      minSize: columnWidth('Ort. % SLA'),
      meta: { label: 'Ort. % SLA' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ort. % SLA' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatSuccessRate(row.original.teslimat_basari_orani)}
        </span>
      ),
    },
    {
      accessorKey: 'toplam_paket',
      size: columnWidth('Toplam Sipariş'),
      minSize: columnWidth('Toplam Sipariş'),
      meta: { label: 'Toplam Sipariş' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Toplam Sipariş' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatCount(row.original.toplam_paket)}
        </span>
      ),
    },
    {
      accessorKey: 'toplam_teslim',
      size: columnWidth('Toplam Teslim'),
      minSize: columnWidth('Toplam Teslim'),
      meta: { label: 'Toplam Teslim' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Toplam Teslim' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatCount(row.original.toplam_teslim)}
        </span>
      ),
    },
    {
      accessorKey: 'toplam_iptal',
      size: columnWidth('Toplam İptal'),
      minSize: columnWidth('Toplam İptal'),
      meta: { label: 'Toplam İptal' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Toplam İptal' />,
      cell: ({ row }) => (
        <span className='tabular-nums text-sm font-medium text-foreground'>
          {formatCount(row.original.toplam_iptal)}
        </span>
      ),
    },
    {
      accessorKey: 'kayit_tarihi',
      size: columnWidth('Oluşturulma Zamanı'),
      minSize: columnWidth('Oluşturulma Zamanı'),
      meta: { label: 'Oluşturulma Zamanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Oluşturulma Zamanı' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium text-foreground'>
          {row.original.kayit_tarihi}
        </span>
      ),
    },
    {
      accessorKey: 'son_senkronizasyon',
      size: columnWidth('Son Senkronizasyon'),
      minSize: columnWidth('Son Senkronizasyon'),
      meta: { label: 'Son Senkronizasyon' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Son Senkronizasyon' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium text-foreground'>
          {row.original.son_senkronizasyon}
        </span>
      ),
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
        const customer = row.original
        const isActive = customer.durum === 'aktif'

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
              <DropdownMenuContent align='end' className='w-52'>
                <DropdownMenuLabel>{customer.musteri_kodu}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ARF_ROUTES.lastmile.customers.detail(customer.id)}>
                    <Eye className='mr-2 size-4' />
                    Detaya Git
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(customer)}>
                  <Pencil className='mr-2 size-4' />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={
                    isActive
                      ? 'text-amber-700 focus:text-amber-700'
                      : 'text-emerald-700 focus:text-emerald-700'
                  }
                  onSelect={() => onToggleStatus(customer)}
                >
                  {isActive ? (
                    <>
                      <PauseCircle className='mr-2 size-4' />
                      Pasife Al
                    </>
                  ) : (
                    <>
                      <PlayCircle className='mr-2 size-4' />
                      Aktifleştir
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export const customerSectorFilterOptions = [
  'E-Ticaret',
  'Hazır Yemek',
  'Yedek Parça',
  'Teknoloji',
  'Gıda',
  'Sağlık/Medikal',
  'Perakende',
  'Diğer',
].map((value) => ({ label: value, value }))
