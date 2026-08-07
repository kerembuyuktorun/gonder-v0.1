'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Pencil,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Trash2,
  User,
  Users2,
  type LucideIcon,
} from 'lucide-react'
import { SystemRoleBadge } from '../../_components/system-role-badge'
import { RoleStatusBadge } from '../../_components/role-status-badge'
import type { RoleDetail } from '../../_types/role'

type Props = {
  role: RoleDetail
  onSaveProfile: (values: { name: string; description: string }) => Promise<void>
  onToggleStatus: () => void
  onDelete: () => void
}

function BadgeGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
        {label}
      </p>
      {children}
    </div>
  )
}

function GroupDivider() {
  return <div className='hidden h-10 w-px bg-slate-200 sm:block' />
}

function HeaderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className='flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2.5'>
      <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/70'>
        <Icon className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
          {label}
        </p>
        <p className='mt-0.5 truncate text-sm font-semibold tracking-tight text-slate-900'>
          {value}
        </p>
      </div>
    </div>
  )
}

function formatRoleDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function RoleProfileHeader({ role, onSaveProfile, onToggleStatus, onDelete }: Props) {
  const [showStats, setShowStats] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(role.name)
  const [editDesc, setEditDesc] = useState(role.description ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!editOpen) return
    setEditName(role.name)
    setEditDesc(role.description ?? '')
  }, [editOpen, role.description, role.name])

  const isCustom = role.roleType === 'custom'
  const isPassive = role.status === 'passive'
  const accentLine = isPassive ? 'via-slate-400/70' : 'via-emerald-400/70'
  const accentGlow = isPassive ? 'bg-slate-50/80' : 'bg-emerald-50/80'

  const handleSave = async () => {
    if (!editName.trim()) return
    setIsSaving(true)
    try {
      await onSaveProfile({ name: editName.trim(), description: editDesc.trim() })
      setEditOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card className='relative overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_rgba(15,23,42,0.05)]'>
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent',
            accentLine
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl',
            accentGlow
          )}
        />

        <CardContent className='relative p-5 lg:p-6'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <div className='flex min-w-0 items-start gap-4'>
              <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm'>
                <ShieldCheck className='size-6' />
              </div>
              <div className='min-w-0'>
                <p className='mb-1.5 text-sm font-semibold tracking-tight text-slate-500'>
                  Rol Detayı
                </p>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]'>
                    {role.name}
                  </h1>
                  <RoleStatusBadge status={role.status} />
                  <SystemRoleBadge roleType={role.roleType} />
                </div>
                <p className='mt-2 max-w-xl text-sm leading-relaxed text-slate-500'>
                  {role.description || 'Bu rol için açıklama girilmemiş.'}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2 lg:justify-end'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size='sm' type='button' className='gap-2'>
                    İşlemler
                    <ChevronDown className='size-4 opacity-70' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  {isCustom ? (
                    <>
                      <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                        <Pencil className='mr-2 size-4' />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={onToggleStatus}
                        className={
                          isPassive
                            ? 'text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800'
                            : 'text-rose-700 focus:bg-rose-50 focus:text-rose-800'
                        }
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
                      {isPassive ? (
                        <DropdownMenuItem
                          onSelect={onDelete}
                          className='text-rose-700 focus:bg-rose-50 focus:text-rose-800'
                        >
                          <Trash2 className='mr-2 size-4' />
                          Sil
                        </DropdownMenuItem>
                      ) : null}
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      <ShieldCheck className='mr-2 size-4' />
                      Sistem rolü değiştirilemez
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className='mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between'>
            <div className='flex flex-wrap items-start gap-x-5 gap-y-3'>
              <BadgeGroup label='Atanmış Kullanıcı'>
                <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800'>
                  <Users2 className='size-3.5 text-slate-400' />
                  {role.userCount}
                </span>
              </BadgeGroup>
              <GroupDivider />
              <BadgeGroup label='Oluşturulma'>
                <span className='text-sm font-semibold text-slate-800'>
                  {formatRoleDate(role.createdAt)}
                </span>
              </BadgeGroup>
              <GroupDivider />
              <BadgeGroup label='Oluşturan'>
                <span className='text-sm font-semibold text-slate-800'>
                  {role.createdBy ?? '—'}
                </span>
              </BadgeGroup>
            </div>
          </div>

          <div className='relative mt-5'>
            <div className='border-t border-slate-200/90' />
            <button
              type='button'
              aria-label={showStats ? 'Özeti gizle' : 'Özeti göster'}
              aria-expanded={showStats}
              onClick={() => setShowStats((previous) => !previous)}
              className='absolute left-1/2 top-0 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40'
            >
              {showStats ? (
                <ChevronUp className='size-4 stroke-[2.25]' />
              ) : (
                <ChevronDown className='size-4 stroke-[2.25]' />
              )}
            </button>
            {showStats ? (
              <div className='grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4'>
                <HeaderStat icon={Users2} label='Kullanıcı Sayısı' value={String(role.userCount)} />
                <HeaderStat
                  icon={ShieldCheck}
                  label='Yetki Sayısı'
                  value={String(Object.values(role.permissions).filter(Boolean).length)}
                />
                <HeaderStat icon={User} label='Oluşturan' value={role.createdBy ?? '—'} />
                <HeaderStat
                  icon={CalendarDays}
                  label='Son Güncelleme'
                  value={formatRoleDate(role.updatedAt)}
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Rol Profili Düzenle</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 pt-2'>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-slate-700'>
                Rol Adı <span className='text-rose-500'>*</span>
              </label>
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder='Rol adı'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-slate-700'>Açıklama</label>
              <Textarea
                value={editDesc}
                onChange={(event) => setEditDesc(event.target.value)}
                rows={3}
                placeholder='Rolün sorumluluğunu tanımlayın'
                className='resize-none'
              />
            </div>
          </div>
          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
            >
              Vazgeç
            </Button>
            <Button
              type='button'
              disabled={isSaving || !editName.trim()}
              onClick={handleSave}
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
