'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Lock,
  MapPinned,
  Package,
  PackageOpen,
  Route,
  Truck,
  UserRound,
} from 'lucide-react'
import type { ReoptimizePreview } from '../_lib/reoptimize-active-route'

type Props = {
  open: boolean
  preview: ReoptimizePreview | null
  onOpenChange: (open: boolean) => void
  onApply: () => void
}

const PREVIEW_HELP =
  'Tamamlanan duraklar kilitli kalır. Kalan sıra yeniden optimize edilir; Uygula’dan önce farkı kontrol edin.'

const REMAINING_STOPS_HELP =
  'Sıra tahmini; Uygula sonrası aktif detay ve harita güncellenir.'

function roundMetric(value: number, decimals = 0): number {
  if (decimals <= 0) return Math.round(value)
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function formatMetric(value: number, decimals = 0): string {
  const rounded = roundMetric(value, decimals)
  return decimals > 0
    ? rounded.toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
    : String(rounded)
}

function MetricDelta({
  label,
  before,
  after,
  suffix = '',
  decimals = 0,
}: {
  label: string
  before: number
  after: number
  suffix?: string
  decimals?: number
}) {
  const delta = roundMetric(after - before, decimals)
  const neutral = delta === 0
  const up = delta > 0

  return (
    <div className='rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-border/60'>
      <p className='text-[10px] font-medium tracking-wide text-slate-500 uppercase'>
        {label}
      </p>
      <div className='mt-1.5 flex items-center gap-1.5 text-xs font-semibold tabular-nums text-slate-900'>
        <span>
          {formatMetric(before, decimals)}
          {suffix}
        </span>
        <ArrowRight className='size-3 shrink-0 text-slate-300' aria-hidden />
        <span>{formatMetric(after, decimals)}{suffix}</span>
      </div>
      <p
        className={cn(
          'mt-1 text-[11px] font-medium tabular-nums',
          neutral && 'text-slate-400',
          !neutral && up && 'text-amber-700',
          !neutral && !up && 'text-emerald-700'
        )}
      >
        {neutral
          ? 'Değişmez'
          : `${up ? '+' : ''}${formatMetric(delta, decimals)}${suffix}`}
      </p>
    </div>
  )
}

function SectionLabel({
  children,
  icon: Icon,
  tooltip,
}: {
  children: React.ReactNode
  icon?: typeof Package
  tooltip?: string
}) {
  return (
    <h4 className='mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase'>
      {Icon ? <Icon className='size-3.5 shrink-0' aria-hidden /> : null}
      <span>{children}</span>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
              aria-label={tooltip}
            >
              <Info className='size-3.5' aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            sideOffset={6}
            className='max-w-xs text-left font-normal normal-case tracking-normal leading-relaxed'
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </h4>
  )
}

export function ReoptimizePreviewDialog({
  open,
  preview,
  onOpenChange,
  onApply,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <DialogHeader className='shrink-0 border-b border-slate-200/80 px-5 py-4 text-left sm:px-6'>
          <div className='flex items-center gap-3 pr-8'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm'>
              <Route className='size-5' aria-hidden />
            </span>
            <div className='flex min-w-0 items-center gap-1.5'>
              <DialogTitle className='text-base font-semibold tracking-tight text-slate-900'>
                Rotaya Ekle Önizleme
              </DialogTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    className='inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
                    aria-label={PREVIEW_HELP}
                  >
                    <Info className='size-3.5' aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  sideOffset={6}
                  className='max-w-xs text-left leading-relaxed'
                >
                  {PREVIEW_HELP}
                </TooltipContent>
              </Tooltip>
              <DialogDescription className='sr-only'>{PREVIEW_HELP}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {preview ? (
          <div className='min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6'>
            <div className='rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50/90 to-white px-3.5 py-3 shadow-sm'>
              <div className='flex items-start gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-200/80'>
                  <Route className='size-4 text-emerald-600' aria-hidden />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold tracking-tight text-slate-900'>
                    {preview.routeLabel}
                  </p>
                  <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600'>
                    <span className='inline-flex items-center gap-1'>
                      <Truck className='size-3.5 text-slate-400' aria-hidden />
                      {preview.vehiclePlate}
                    </span>
                    {preview.courierName ? (
                      <span className='inline-flex items-center gap-1'>
                        <UserRound className='size-3.5 text-slate-400' aria-hidden />
                        {preview.courierName}
                      </span>
                    ) : null}
                  </div>
                  <p className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200/70'>
                    <Lock className='size-3 shrink-0' aria-hidden />
                    {preview.lockedStopCount} tamamlanmış durak korunacak
                  </p>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel icon={Package}>Eklenecek siparişler</SectionLabel>
              <ul className='flex flex-wrap gap-1.5'>
                {preview.addedOrders.map((order) => (
                  <li
                    key={order.id}
                    className='inline-flex max-w-full items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-950 ring-1 ring-sky-200/70'
                  >
                    <span className='font-mono font-semibold tracking-tight'>
                      {order.takipNo}
                    </span>
                    <span className='truncate text-sky-800/75'>{order.musteri}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionLabel>Etki özeti</SectionLabel>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                <MetricDelta
                  label='Sipariş'
                  before={preview.before.orderCount}
                  after={preview.after.orderCount}
                />
                <MetricDelta
                  label='Durak'
                  before={preview.before.stopCount}
                  after={preview.after.stopCount}
                />
                <MetricDelta
                  label='Mesafe'
                  before={preview.before.distanceKm}
                  after={preview.after.distanceKm}
                  suffix=' km'
                  decimals={1}
                />
                <MetricDelta
                  label='Süre'
                  before={preview.before.durationMin}
                  after={preview.after.durationMin}
                  suffix=' dk'
                />
              </div>
            </div>

            <div>
              <SectionLabel icon={MapPinned} tooltip={REMAINING_STOPS_HELP}>
                Önerilen kalan sıra
              </SectionLabel>
              <ol className='max-h-48 space-y-1.5 overflow-y-auto overscroll-contain rounded-2xl bg-slate-50/70 p-2 ring-1 ring-border/50'>
                {preview.proposedIncompleteStops.length === 0 ? (
                  <li className='px-2 py-3 text-center text-xs text-slate-400'>
                    Önerilen incomplete durak yok
                  </li>
                ) : (
                  preview.proposedIncompleteStops.map((stop) => {
                    const isPickup = stop.kind === 'pickup'
                    const KindIcon = isPickup ? PackageOpen : Package
                    return (
                      <li
                        key={`${stop.sequence}-${stop.title}`}
                        className='flex items-start gap-2.5 rounded-xl bg-white px-2.5 py-2 shadow-sm ring-1 ring-border/40'
                      >
                        <span className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold tabular-nums text-slate-600'>
                          {stop.sequence}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg',
                            isPickup ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                          )}
                        >
                          <KindIcon className='size-3.5' aria-hidden />
                        </span>
                        <span className='min-w-0 flex-1'>
                          <span
                            className={cn(
                              'text-[11px] font-semibold',
                              isPickup ? 'text-sky-700' : 'text-emerald-700'
                            )}
                          >
                            {isPickup ? 'Alım' : 'Teslim'}
                          </span>
                          <span className='mt-0.5 block truncate text-xs font-medium text-slate-800'>
                            {stop.title}
                          </span>
                          {stop.address ? (
                            <span className='mt-0.5 block truncate text-[11px] leading-snug text-slate-500'>
                              {stop.address}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    )
                  })
                )}
              </ol>
            </div>

            {preview.warnings.length > 0 ? (
              <div className='space-y-1.5'>
                {preview.warnings.map((warning) => (
                  <p
                    key={warning}
                    className='flex items-start gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900'
                  >
                    <AlertTriangle className='mt-0.5 size-3.5 shrink-0' aria-hidden />
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className='shrink-0 gap-2 border-t border-slate-200/80 px-5 py-4 sm:justify-end sm:px-6'>
          <Button
            type='button'
            variant='outline'
            className='h-9'
            onClick={() => onOpenChange(false)}
          >
            Vazgeç
          </Button>
          <Button
            type='button'
            className='h-9 min-w-24'
            onClick={onApply}
            disabled={!preview}
          >
            Uygula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
