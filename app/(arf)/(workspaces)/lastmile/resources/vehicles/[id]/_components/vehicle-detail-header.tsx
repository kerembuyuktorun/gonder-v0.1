'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
  CalendarClock,
  CarFront,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Gauge,
  MapPinned,
  PauseCircle,
  Pencil,
  PlayCircle,
  Sparkles,
  Tag,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../../../_shared/routes'
import { MetaChip } from '../../../../orders/_components/meta-chip'
import { AssignedCourierField } from '../../_components/assigned-courier-field'
import { VehicleDocWarnings } from '../../_components/vehicle-doc-warnings'
import { VehicleOccupancy } from '../../_components/vehicle-occupancy'
import { VehicleStatusField } from '../../_components/vehicle-status-field'
import { VehicleTypeLabel } from '../../_components/vehicle-type-label'
import type { CourierOption } from '../../_lib/map-vehicle'
import { resolveSkillLabel } from '../../_lib/query-vehicles'
import type { VehiclePermissions } from '../../_hooks/use-vehicle-permissions'
import type { LastmileVehicle } from '../../_types/vehicle'
import { copyText } from './detail-panels'

type Props = {
  vehicle: LastmileVehicle
  courierOptions: CourierOption[]
  skillLabelMap?: Record<string, string>
  permissions: Pick<
    VehiclePermissions,
    'canUpdate' | 'canChangeDriver' | 'canActivate' | 'canPassive'
  >
  onEdit: () => void
  onCourierAssign: (courierId: string | null) => void
  onToggleStatus: () => void
  onLiveTrack: () => void
}

const statusAccent: Record<
  LastmileVehicle['durum'],
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

export function VehicleDetailHeader({
  vehicle,
  courierOptions,
  skillLabelMap = {},
  permissions,
  onEdit,
  onCourierAssign,
  onToggleStatus,
  onLiveTrack,
}: Props) {
  const [showStats, setShowStats] = useState(false)
  const accent = statusAccent[vehicle.durum]
  const isPassive = vehicle.durum === 'pasif'
  const canChangeStatus = isPassive ? permissions.canActivate : permissions.canPassive
  const ownershipShort =
    vehicle.mulkiyet === 'oz_mal'
      ? 'Öz Mal'
      : vehicle.mulkiyet === 'esnaf_kurye'
        ? 'Esnaf Kurye'
        : 'Kiralık'

  const handleCopyPlate = async () => {
    const ok = await copyText(vehicle.plaka)
    if (ok) toast.success(`${vehicle.plaka} kopyalandı`)
    else toast.error('Kopyalanamadı')
  }

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
            <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm'>
              <CarFront className='size-6' />
            </div>
            <div className='min-w-0'>
              <p className='mb-1.5 text-sm font-semibold tracking-tight text-slate-500'>
                Araç Detayı
              </p>
              <button
                type='button'
                onClick={handleCopyPlate}
                className='group inline-flex max-w-full items-center gap-2 rounded-lg text-left transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30'
              >
                <h1 className='truncate font-mono text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]'>
                  {vehicle.plaka}
                </h1>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors group-hover:border-sky-200 group-hover:text-sky-600'>
                  <Copy className='size-3.5' />
                </span>
              </button>
              <p className='mt-1 text-sm font-medium text-slate-500'>
                {vehicle.marka} · {vehicle.model} · {vehicle.model_yili}
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='flex flex-wrap items-start gap-x-5 gap-y-3'>
            <BadgeGroup label='Durum'>
              <VehicleStatusField vehicle={vehicle} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Araç / Kasa'>
              <VehicleTypeLabel
                aracTipi={vehicle.arac_tipi}
                kasaTipi={vehicle.kasa_tipi}
              />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Zimmetli Kurye'>
              <AssignedCourierField
                vehicle={vehicle}
                courierOptions={courierOptions}
                canChange={permissions.canChangeDriver}
                onAssign={onCourierAssign}
              />
            </BadgeGroup>
          </div>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500'>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarClock className='size-3.5 text-slate-400' />
              {vehicle.olusturulma_zamani}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <UserRound className='size-3.5 text-slate-400' />
              {vehicle.olusturan}
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
            <div className='grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
              <HeaderStat icon={Tag} label='Mülkiyet' value={ownershipShort} />
              <HeaderStat
                icon={Clock}
                label='Vardiya'
                value={`${vehicle.vardiya_baslangic} – ${vehicle.vardiya_bitis}`}
              />
              <HeaderStat icon={Gauge} label='Kapasite · Doluluk'>
                <VehicleOccupancy
                  volumePct={vehicle.doluluk_hacim_pct}
                  weightPct={vehicle.doluluk_agirlik_pct}
                  maxVolumeM3={vehicle.max_hacim_m3}
                  maxWeightKg={vehicle.max_agirlik_kg}
                />
              </HeaderStat>
              <HeaderStat icon={Sparkles} label='Yetenekler'>
                {vehicle.yetenekler.length === 0 ? (
                  <span className='text-sm font-semibold text-slate-400'>—</span>
                ) : (
                  <div className='flex flex-wrap gap-1'>
                    {vehicle.yetenekler.map((skill) => (
                      <MetaChip key={skill} variant='requirement'>
                        {resolveSkillLabel(skill, skillLabelMap)}
                      </MetaChip>
                    ))}
                  </div>
                )}
              </HeaderStat>
              <HeaderStat icon={AlertTriangle} label='Uyarı'>
                <VehicleDocWarnings variant='text' warnings={vehicle.evrak_uyarilari} />
              </HeaderStat>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
