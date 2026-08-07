'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertTriangle,
  Droplets,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  KeyRound,
  MapPinned,
  PauseCircle,
  Pencil,
  PlayCircle,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetaChip } from '../../../../orders/_components/meta-chip'
import { AssignedVehicleField } from '../../_components/assigned-vehicle-field'
import { CourierDocWarnings } from '../../_components/courier-doc-warnings'
import { CourierStatusField } from '../../_components/courier-status-field'
import {
  COURIER_EMPLOYMENT_LABELS,
  resolveCourierSkillLabel,
} from '../../_lib/query-couriers'
import type { VehicleOption } from '../../_lib/vehicle-options'
import type { CourierPermissions } from '../../_hooks/use-courier-permissions'
import type { LastmileCourier } from '../../_types/courier'

type Props = {
  courier: LastmileCourier
  vehicleOptions: VehicleOption[]
  skillLabelMap?: Record<string, string>
  permissions: Pick<
    CourierPermissions,
    'canUpdate' | 'canChangeVehicle' | 'canActivate' | 'canPassive'
  >
  onEdit: () => void
  onVehicleAssign: (vehicleId: string | null) => void
  onToggleStatus: () => void
  onSendPasswordReset: () => void
  onLiveTrack: () => void
}

const statusAccent: Record<
  LastmileCourier['durum'],
  { line: string; glow: string }
> = {
  yolda: { line: 'via-emerald-400/70', glow: 'bg-emerald-50/80' },
  bos_ta: { line: 'via-sky-400/70', glow: 'bg-sky-50/80' },
  pasif: { line: 'via-rose-400/70', glow: 'bg-rose-50/80' },
}

function BadgeGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
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
  return <div className='hidden h-10 w-px self-center bg-slate-200 sm:block' />
}

function HeaderStat({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: LucideIcon
  label: string
  value?: string
  children?: React.ReactNode
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
        {children ? (
          <div className='mt-0.5'>{children}</div>
        ) : (
          <p className='mt-0.5 truncate text-sm font-semibold tracking-tight text-slate-900'>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

export function CourierDetailHeader({
  courier,
  vehicleOptions,
  skillLabelMap = {},
  permissions,
  onEdit,
  onVehicleAssign,
  onToggleStatus,
  onSendPasswordReset,
  onLiveTrack,
}: Props) {
  const [showStats, setShowStats] = useState(false)
  const accent = statusAccent[courier.durum]
  const isPassive = courier.durum === 'pasif'
  const canChangeStatus = isPassive ? permissions.canActivate : permissions.canPassive
  const initials = courier.ad_soyad
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Card className='relative overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_rgba(15,23,42,0.05)]'>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent',
          accent.line
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl',
          accent.glow
        )}
      />

      <CardContent className='relative p-5 lg:p-6'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex min-w-0 items-start gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold tracking-tight text-white shadow-sm'>
              {initials || <UserRound className='size-6' />}
            </div>
            <div className='min-w-0'>
              <p className='mb-1.5 text-sm font-semibold tracking-tight text-slate-500'>
                Kurye Detayı
              </p>
              <h1 className='truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]'>
                {courier.ad_soyad}
              </h1>
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
              <DropdownMenuContent align='end' className='w-60'>
                {permissions.canUpdate ? (
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                ) : null}
                {canChangeStatus ? (
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
                <DropdownMenuItem onSelect={onLiveTrack}>
                  <MapPinned className='mr-2 size-4' />
                  Canlı İzle
                </DropdownMenuItem>
                {permissions.canUpdate ? (
                  <DropdownMenuItem onSelect={onSendPasswordReset}>
                    <KeyRound className='mr-2 size-4' />
                    Şifre Sıfırlama Bağlantısı Gönder
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='flex flex-wrap items-start gap-x-5 gap-y-3'>
            <BadgeGroup label='Durum'>
              <CourierStatusField courier={courier} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='İstihdam'>
              <Badge
                variant='outline'
                className={
                  courier.istihdam === 'sirket'
                    ? 'border-slate-200 bg-white font-medium text-slate-700 shadow-none'
                    : 'border-amber-200/80 bg-amber-50 font-medium text-amber-800 shadow-none'
                }
              >
                {COURIER_EMPLOYMENT_LABELS[courier.istihdam]}
              </Badge>
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Zimmetli Araç'>
              <AssignedVehicleField
                courier={courier}
                vehicleOptions={vehicleOptions}
                canChange={permissions.canChangeVehicle}
                onAssign={onVehicleAssign}
              />
            </BadgeGroup>
          </div>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500'>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarClock className='size-3.5 text-slate-400' />
              {courier.olusturulma_zamani}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <UserRound className='size-3.5 text-slate-400' />
              {courier.olusturan}
            </span>
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
            <div className='grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-4'>
              <HeaderStat
                icon={Clock}
                label='Vardiya'
                value={`${courier.vardiya_baslangic} – ${courier.vardiya_bitis}`}
              />
              <HeaderStat icon={Droplets} label='Kan Grubu' value={courier.kan_grubu} />
              <HeaderStat icon={Sparkles} label='Yetenekler'>
                {courier.yetenekler.length === 0 ? (
                  <span className='text-sm font-semibold text-slate-400'>—</span>
                ) : (
                  <div className='flex flex-wrap gap-1'>
                    {courier.yetenekler.map((skill) => (
                      <MetaChip key={skill} variant='requirement'>
                        {resolveCourierSkillLabel(skill, skillLabelMap)}
                      </MetaChip>
                    ))}
                  </div>
                )}
              </HeaderStat>
              <HeaderStat icon={AlertTriangle} label='Uyarı'>
                <CourierDocWarnings variant='text' warnings={courier.evrak_uyarilari} />
              </HeaderStat>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
