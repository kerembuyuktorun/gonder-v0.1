'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  Clock3,
  Copy,
  KeyRound,
  Pencil,
  UserCheck,
  UserRound,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { UserKindBadge } from '../../_components/user-kind-badge'
import { UserStatusBadge } from '../../_components/user-status-badge'
import {
  USER_GENDER_LABELS,
  USER_MARITAL_STATUS_LABELS,
  USER_ROLE_LABELS,
  formatUserDateTime,
} from '../../_lib/query-users'
import type { LastmileUser, UserRole } from '../../_types/user'
import { UserAvatarControl } from './user-avatar-control'

type UserDetailHeaderProps = {
  user: LastmileUser
  onEdit: () => void
  onToggleStatus: () => void
  onPasswordReset: () => void
  onAvatarChange: (nextUrl: string | null) => void
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function BadgeGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 space-y-1.5'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
        {label}
      </p>
      {children}
    </div>
  )
}

function GroupDivider() {
  return <div className='hidden h-10 w-px self-center bg-slate-200 sm:block' aria-hidden />
}

export function UserDetailHeader({
  user,
  onEdit,
  onToggleStatus,
  onPasswordReset,
  onAvatarChange,
}: UserDetailHeaderProps) {
  const baglilik =
    user.kullanici_tipi === 'musteri' ? (user.bagli_kurum?.trim() || '—') : user.bagli_kurum?.trim() || '—'

  const roleLabel =
    user.rol && user.rol !== '—'
      ? user.rol in USER_ROLE_LABELS
        ? USER_ROLE_LABELS[user.rol as UserRole]
        : user.rol
      : '—'

  return (
    <Card className='overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_32px_rgba(15,23,42,0.04)]'>
      <CardContent className='p-5 lg:p-6'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0'>
            <div className='mb-2 flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='size-7 shrink-0 text-slate-500'
                asChild
              >
                <Link
                  href={ARF_ROUTES.lastmile.users.list}
                  aria-label='Kullanıcı listesine dön'
                >
                  <ArrowLeft className='size-4' />
                </Link>
              </Button>
              <p className='text-sm font-semibold tracking-tight text-slate-500'>
                Kullanıcı Detayı
              </p>
            </div>
            <div className='flex min-w-0 items-center gap-3.5'>
              <UserAvatarControl
                name={user.ad_soyad}
                src={user.profil_url}
                onChange={onAvatarChange}
              />
              <div className='min-w-0'>
                <h1 className='truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]'>
                  {user.ad_soyad}
                </h1>
                <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500'>
                  <button
                    type='button'
                    className='inline-flex items-center gap-1.5 transition-colors hover:text-slate-800'
                    onClick={async () => {
                      const ok = await copyText(user.email)
                      if (ok) toast.success('E-posta kopyalandı')
                      else toast.error('Kopyalama başarısız')
                    }}
                  >
                    <span className='truncate'>{user.email}</span>
                    <Copy className='size-3 shrink-0 opacity-50' aria-hidden />
                  </button>
                  {user.telefon?.trim() ? (
                    <>
                      <span className='text-slate-300' aria-hidden>
                        ·
                      </span>
                      <button
                        type='button'
                        className='inline-flex items-center gap-1.5 transition-colors hover:text-slate-800'
                        onClick={async () => {
                          const ok = await copyText(user.telefon)
                          if (ok) toast.success('Telefon kopyalandı')
                          else toast.error('Kopyalama başarısız')
                        }}
                      >
                        <span>{user.telefon}</span>
                        <Copy className='size-3 shrink-0 opacity-50' aria-hidden />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-9 gap-1.5'>
                İşlemler
                <ChevronDown className='size-3.5 opacity-60' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className='size-3.5' aria-hidden />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onToggleStatus}>
                {user.durum === 'aktif' ? (
                  <>
                    <UserX className='size-3.5' aria-hidden />
                    Pasife Al
                  </>
                ) : (
                  <>
                    <UserCheck className='size-3.5' aria-hidden />
                    Aktif Et
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onPasswordReset}>
                <KeyRound className='size-3.5' aria-hidden />
                Şifre Sıfırlama Bağlantısı Gönder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='flex flex-wrap items-start gap-x-5 gap-y-3'>
            <BadgeGroup label='Durum'>
              <UserStatusBadge status={user.durum} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Kullanıcı Tipi'>
              <UserKindBadge kind={user.kullanici_tipi} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Rol'>
              <span className='text-sm font-semibold text-slate-800'>{roleLabel}</span>
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Bağlılık'>
              {user.kullanici_tipi === 'musteri' && user.musteri_id ? (
                <Link
                  href={ARF_ROUTES.lastmile.customers.detail(user.musteri_id)}
                  className='text-sm font-semibold text-sky-700 underline-offset-2 hover:underline'
                >
                  {baglilik}
                </Link>
              ) : (
                <span className='text-sm font-semibold text-slate-800'>{baglilik}</span>
              )}
            </BadgeGroup>
          </div>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 xl:justify-end'>
            <span className='inline-flex items-center gap-1.5'>
              <Clock3 className='size-3.5 text-slate-400' aria-hidden />
              <span className='tabular-nums'>{formatUserDateTime(user.son_giris)}</span>
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarClock className='size-3.5 text-slate-400' aria-hidden />
              <span className='tabular-nums'>
                {formatUserDateTime(user.olusturma_tarihi)}
              </span>
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <UserRound className='size-3.5 text-slate-400' aria-hidden />
              <span>{user.olusturan?.trim() || '—'}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
