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
  ChevronDown,
  Eye,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
  Users2,
} from 'lucide-react'
import type { LastmileRole } from '../_types/role'
import { SystemRoleBadge } from '../_components/system-role-badge'
import { RoleStatusBadge } from '../_components/role-status-badge'

function columnWidth(title: string, extras = 0) {
  return Math.max(160, Math.ceil(title.length * 9.5) + 96 + extras)
}

function formatRoleDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type ColumnActions = {
  onEdit: (role: LastmileRole) => void
  onToggleStatus: (role: LastmileRole) => void
  onDelete: (role: LastmileRole) => void
}

export function createRoleColumns({
  onEdit,
  onToggleStatus,
  onDelete,
}: ColumnActions): ColumnDef<LastmileRole>[] {
  return [
    {
      accessorKey: 'name',
      enableHiding: false,
      size: 240,
      minSize: 200,
      maxSize: 320,
      meta: { label: 'Rol Adı' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rol Adı' />,
      cell: ({ row }) => (
        <Link
          href={ARF_ROUTES.lastmile.settings.roles.detail(row.original.id)}
          className='text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'roleType',
      size: columnWidth('Rol Tipi', 16),
      minSize: columnWidth('Rol Tipi'),
      meta: { label: 'Rol Tipi' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Rol Tipi' />,
      cell: ({ row }) => <SystemRoleBadge roleType={row.original.roleType} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: 'status',
      size: columnWidth('Durum', 16),
      minSize: columnWidth('Durum'),
      meta: { label: 'Durum' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
      cell: ({ row }) => <RoleStatusBadge status={row.original.status} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: 'userCount',
      size: columnWidth('Kullanıcı Sayısı', 16),
      minSize: columnWidth('Kullanıcı Sayısı'),
      meta: { label: 'Kullanıcı Sayısı' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kullanıcı Sayısı' />
      ),
      cell: ({ row }) =>
        row.original.userCount > 0 ? (
          <Link
            href={ARF_ROUTES.lastmile.users.list}
            className='inline-flex items-center gap-1.5 text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
          >
            <Users2 className='size-3.5' />
            <span className='tabular-nums'>{row.original.userCount}</span>
          </Link>
        ) : (
          <span className='tabular-nums text-sm text-muted-foreground'>0</span>
        ),
    },
    {
      accessorKey: 'createdAt',
      size: columnWidth('Oluşturulma', 16),
      minSize: columnWidth('Oluşturulma'),
      meta: { label: 'Oluşturulma' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturulma' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap tabular-nums text-sm text-muted-foreground'>
          {formatRoleDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'createdBy',
      size: columnWidth('Oluşturan', 24),
      minSize: columnWidth('Oluşturan'),
      meta: { label: 'Oluşturan' },
      header: ({ column }) => <DataTableColumnHeader column={column} title='Oluşturan' />,
      cell: ({ row }) => (
        <span className='text-sm font-medium text-foreground'>
          {row.original.createdBy ?? '—'}
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
        const role = row.original
        const isCustom = role.roleType === 'custom'
        const isPassive = role.status === 'passive'
        const canDelete = isCustom && isPassive

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
                <DropdownMenuLabel>{role.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ARF_ROUTES.lastmile.settings.roles.detail(role.id)}>
                    <Eye className='mr-2 size-4' />
                    Detaya Git
                  </Link>
                </DropdownMenuItem>
                {isCustom ? (
                  <>
                    <DropdownMenuItem onSelect={() => onEdit(role)}>
                      <Pencil className='mr-2 size-4' />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={
                        isPassive
                          ? 'text-emerald-700 focus:text-emerald-700'
                          : 'text-rose-700 focus:text-rose-700'
                      }
                      onSelect={() => onToggleStatus(role)}
                    >
                      {isPassive ? (
                        <>
                          <PlayCircle className='mr-2 size-4' />
                          Aktifleştir
                        </>
                      ) : (
                        <>
                          <PauseCircle className='mr-2 size-4' />
                          Pasife Al
                        </>
                      )}
                    </DropdownMenuItem>
                    {canDelete ? (
                      <DropdownMenuItem
                        className='text-rose-700 focus:text-rose-700'
                        onSelect={() => onDelete(role)}
                      >
                        <Trash2 className='mr-2 size-4' />
                        Sil
                      </DropdownMenuItem>
                    ) : null}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

export const roleTypeFilterOptions = [
  { label: 'Sistem', value: 'system' },
  { label: 'Özel', value: 'custom' },
]

export const roleStatusFilterOptions = [
  { label: 'Aktif', value: 'active' },
  { label: 'Pasif', value: 'passive' },
]
