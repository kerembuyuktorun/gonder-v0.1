'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@hascanb/arf-ui-kit/datatable-kit'
import {
  formatAddressDetail,
  formatPhone,
  formatPrimaryName,
  formatTaxIdentity,
  parseKayitTarihi,
} from '../_lib/query-connections'
import type { LastmileConnection } from '../_types/connection'
import { ContactTypeBadge } from '../_components/contact-type-badge'

function columnWidth(title: string, extras = 0) {
  return Math.max(140, Math.ceil(title.length * 9.5) + 88 + extras)
}

export function createConnectionColumns(): ColumnDef<LastmileConnection>[] {
  return [
    {
      id: 'primary_name',
      accessorFn: (row) => formatPrimaryName(row),
      enableHiding: false,
      size: columnWidth('Firma · Muhatap', 32),
      minSize: columnWidth('Firma · Muhatap'),
      maxSize: 320,
      meta: { label: 'Firma · Muhatap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Firma · Muhatap' />,
      cell: ({ row }) => {
        const primary = formatPrimaryName(row.original)
        const secondary =
          row.original.muhatap_tipi === 'kurumsal' ? row.original.muhatabi : null

        return (
          <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
            <span className='truncate text-sm font-medium text-foreground' title={primary}>
              {primary}
            </span>
            {secondary ? (
              <span className='truncate text-xs text-muted-foreground' title={secondary}>
                {secondary}
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: 'muhatap_tipi',
      size: columnWidth('Bağlantı Tipi', 16),
      minSize: columnWidth('Bağlantı Tipi'),
      meta: { label: 'Bağlantı Tipi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Bağlantı Tipi' />,
      cell: ({ row }) => <ContactTypeBadge type={row.original.muhatap_tipi} />,
    },
    {
      id: 'tax_identity',
      accessorFn: (row) => formatTaxIdentity(row),
      size: columnWidth('TCKN / VKN'),
      minSize: columnWidth('TCKN / VKN'),
      meta: { label: 'TCKN / VKN' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='TCKN / VKN' />,
      cell: ({ row }) => (
        <span className='font-mono text-sm font-medium tabular-nums text-foreground'>
          {formatTaxIdentity(row.original)}
        </span>
      ),
    },
    {
      accessorKey: 'vergi_dairesi',
      size: columnWidth('Vergi Dairesi'),
      minSize: columnWidth('Vergi Dairesi'),
      meta: { label: 'Vergi Dairesi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Vergi Dairesi' />,
      cell: ({ row }) => (
        <span className='text-sm font-medium text-foreground'>
          {row.original.vergi_dairesi ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'telefon',
      size: columnWidth('Telefon'),
      minSize: columnWidth('Telefon'),
      meta: { label: 'Telefon' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Telefon' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium tabular-nums text-foreground'>
          {formatPhone(row.original.telefon)}
        </span>
      ),
    },
    {
      accessorKey: 'adres_baslik',
      size: columnWidth('Adres Başlığı'),
      minSize: columnWidth('Adres Başlığı'),
      meta: { label: 'Adres Başlığı' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Adres Başlığı' />,
      cell: ({ row }) => (
        <span className='text-sm font-medium text-foreground'>{row.original.adres_baslik}</span>
      ),
    },
    {
      accessorKey: 'adres',
      size: 260,
      minSize: 220,
      maxSize: 360,
      meta: { label: 'Adres' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Adres' />,
      cell: ({ row }) => (
        <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
          <span className='truncate text-sm font-medium text-foreground' title={row.original.adres}>
            {row.original.adres}
          </span>
          <span
            className='truncate text-xs text-muted-foreground'
            title={row.original.full_address}
          >
            {row.original.full_address}
          </span>
        </div>
      ),
    },
    {
      id: 'adres_detay',
      accessorFn: (row) => formatAddressDetail(row),
      size: columnWidth('Bina · Kat · Daire', 24),
      minSize: columnWidth('Bina · Kat · Daire'),
      meta: { label: 'Bina · Kat · Daire' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bina · Kat · Daire' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-medium tabular-nums text-foreground'>
          {formatAddressDetail(row.original)}
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
      cell: ({ row }) => {
        const createdAt = parseKayitTarihi(row.original.kayit_tarihi)
        if (!createdAt) {
          return (
            <span className='whitespace-nowrap text-sm font-medium text-muted-foreground'>
              {row.original.kayit_tarihi}
            </span>
          )
        }

        return (
          <div className='flex flex-col gap-0.5 leading-tight'>
            <span className='whitespace-nowrap text-sm font-medium text-foreground'>
              {createdAt.date}
            </span>
            {createdAt.time ? (
              <span className='whitespace-nowrap tabular-nums text-xs text-muted-foreground'>
                {createdAt.time}
              </span>
            ) : null}
          </div>
        )
      },
    },
  ]
}

export const addressTitleFilterOptions = [
  { label: 'Ev', value: 'Ev' },
  { label: 'Ofis', value: 'Ofis' },
  { label: 'İşyeri', value: 'İşyeri' },
  { label: 'Depo', value: 'Depo' },
  { label: 'Şube', value: 'Şube' },
  { label: 'Mağaza', value: 'Mağaza' },
]
