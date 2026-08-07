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
import { withLastmileDemo } from '../../_lib/lastmile-demo-mode'
import {
  ChevronDown,
  Eye,
  KeyRound,
  PauseCircle,
  Pencil,
  PlayCircle,
} from 'lucide-react'
import type { LastmileUser, UserKind, UserRole } from '../_types/user'
import { UserKindBadge } from '../_components/user-kind-badge'
import { UserStatusBadge } from '../_components/user-status-badge'
import {
  USER_KIND_LABELS,
  USER_ROLE_LABELS,
  formatUserDateTime,
} from '../_lib/query-users'

function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

type ColumnActions = {
  onEdit: (user: LastmileUser) => void
  onSendPasswordReset: (user: LastmileUser) => void
  onToggleAccess: (user: LastmileUser) => void
  demo?: boolean
}

export function createUserColumns({
  onEdit,
  onSendPasswordReset,
  onToggleAccess,
  demo = false,
}: ColumnActions): ColumnDef<LastmileUser>[] {
  const detailHref = (id: string) =>
    withLastmileDemo(ARF_ROUTES.lastmile.users.detail(id), demo)

  return [
    {
      accessorKey: 'ad_soyad',
      enableHiding: false,
      size: 220,
      minSize: 200,
      maxSize: 280,
      meta: { label: 'Ad Soyad' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ad Soyad' />,
      cell: ({ row }) => {
        const user = row.original
        const initials = userInitials(user.ad_soyad)

        return (
          <Link
            href={detailHref(user.id)}
            className='flex items-center gap-2.5'
          >
            {user.profil_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profil_url}
                alt=''
                className='size-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200'
              />
            ) : (
              <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-slate-200'>
                {initials || '?'}
              </span>
            )}
            <span className='text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'>
              {user.ad_soyad}
            </span>
          </Link>
        )
      },
    },
    {
      accessorKey: 'durum',
      size: columnWidth('Durum', 16),
      minSize: columnWidth('Durum'),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => <UserStatusBadge status={row.original.durum} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'iletisim',
      accessorFn: (row) => `${row.email} ${row.telefon}`,
      size: 240,
      minSize: 220,
      maxSize: 320,
      meta: { label: 'E-posta / Telefon' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='E-posta / Telefon' />
      ),
      cell: ({ row }) => (
        <div className='min-w-0 space-y-0.5'>
          <p className='truncate text-sm font-medium text-foreground' title={row.original.email}>
            {row.original.email}
          </p>
          <p className='tabular-nums text-xs text-muted-foreground'>{row.original.telefon}</p>
        </div>
      ),
    },
    {
      accessorKey: 'kullanici_tipi',
      size: columnWidth('Kullanıcı Tipi', 16),
      minSize: columnWidth('Kullanıcı Tipi'),
      meta: { label: 'Kullanıcı Tipi' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kullanıcı Tipi' />
      ),
      cell: ({ row }) => <UserKindBadge kind={row.original.kullanici_tipi} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'baglilik',
      accessorFn: (row) =>
        row.kullanici_tipi === 'musteri' ? row.bagli_kurum : '',
      size: columnWidth('Bağlılık', 40),
      minSize: columnWidth('Bağlılık'),
      maxSize: 320,
      meta: { label: 'Bağlılık' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bağlılık' />
      ),
      cell: ({ row }) => {
        const user = row.original
        if (user.kullanici_tipi !== 'musteri') {
          return <span className='text-sm text-muted-foreground'>—</span>
        }
        if (user.musteri_id) {
          return (
            <Link
              href={withLastmileDemo(
                ARF_ROUTES.lastmile.customers.detail(user.musteri_id),
                demo
              )}
              className='line-clamp-2 text-sm font-medium text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
              title={user.bagli_kurum}
            >
              {user.bagli_kurum}
            </Link>
          )
        }
        return (
          <span
            className='line-clamp-2 text-sm font-medium text-foreground'
            title={user.bagli_kurum}
          >
            {user.bagli_kurum}
          </span>
        )
      },
    },
    {
      accessorKey: 'rol',
      size: columnWidth('Rol', 40),
      minSize: columnWidth('Rol'),
      maxSize: 260,
      meta: { label: 'Rol' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rol' />,
      cell: ({ row }) => {
        const roleLabel =
          typeof row.original.rol === 'string'
            ? (USER_ROLE_LABELS[row.original.rol as UserRole] ?? row.original.rol)
            : row.original.rol
        return <span className='text-sm font-medium text-foreground'>{roleLabel}</span>
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: 'son_giris',
      size: columnWidth('Son Giriş', 24),
      minSize: columnWidth('Son Giriş'),
      meta: { label: 'Son Giriş' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Son Giriş' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm text-muted-foreground'>
          {formatUserDateTime(row.original.son_giris)}
        </span>
      ),
    },
    {
      accessorKey: 'olusturma_tarihi',
      size: columnWidth('Oluşturulma Zamanı', 8),
      minSize: columnWidth('Oluşturulma Zamanı'),
      meta: { label: 'Oluşturulma Zamanı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Oluşturulma Zamanı' />
      ),
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm text-muted-foreground'>
          {formatUserDateTime(row.original.olusturma_tarihi)}
        </span>
      ),
    },
    {
      accessorKey: 'olusturan',
      size: columnWidth('Oluşturan', 24),
      minSize: columnWidth('Oluşturan'),
      meta: { label: 'Oluşturan' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Oluşturan' />
      ),
      cell: ({ row }) => (
        <span
          className='truncate text-sm text-foreground'
          title={row.original.olusturan ?? undefined}
        >
          {row.original.olusturan?.trim() || '—'}
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
        const user = row.original
        const isInactive = user.durum === 'pasif' || user.durum === 'askida'

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
                <DropdownMenuLabel>{user.ad_soyad}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={detailHref(user.id)}>
                    <Eye className='mr-2 size-4' />
                    Detay Gör
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(user)}>
                  <Pencil className='mr-2 size-4' />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={
                    isInactive
                      ? 'text-emerald-700 focus:text-emerald-700'
                      : 'text-rose-700 focus:text-rose-700'
                  }
                  onSelect={() => onToggleAccess(user)}
                >
                  {isInactive ? (
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
                <DropdownMenuItem onSelect={() => onSendPasswordReset(user)}>
                  <KeyRound className='mr-2 size-4' />
                  Şifre Sıfırlama Bağlantısı Gönder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export const userKindFilterOptions = (
  Object.entries(USER_KIND_LABELS) as [UserKind, string][]
).map(([value, label]) => ({ label, value }))

export const userRoleFilterOptions = (
  Object.entries(USER_ROLE_LABELS) as [UserRole, string][]
).map(([value, label]) => ({ label, value }))
