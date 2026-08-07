'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronDown,
  Copy,
  ImageIcon,
  Package,
  Ruler,
  Scale,
  ScanBarcode,
} from 'lucide-react'
import type { OrderPackageLine, PackageLineStatus } from '../_types/order-detail'
import { copyToClipboard, packageStatusLabel } from '../_lib/order-detail-helpers'
import { cn } from '@/lib/utils'

export function PackagesSection({ paketler }: { paketler: OrderPackageLine[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (paketler.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        Paket kaydı yok
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {paketler.map((line, index) => {
        const open = openIds.has(line.id)
        return (
          <article
            key={line.id}
            className={cn(
              'overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all',
              open ? 'shadow-sm ring-1 ring-slate-100' : 'hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <div
              role="button"
              tabIndex={0}
              className="flex w-full cursor-pointer items-center gap-4 px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:px-5"
              onClick={() => toggle(line.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  toggle(line.id)
                }
              }}
              aria-expanded={open}
              aria-label={open ? 'Paket detayını gizle' : 'Paket detayını göster'}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Package className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Paket {index + 1}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold',
                      packageStatusClass(line.durum)
                    )}
                  >
                    {packageStatusLabel(line.durum)}
                  </span>
                </div>
                <div className="mt-1.5 flex min-w-0 items-center gap-1">
                  <ScanBarcode className="size-3.5 shrink-0 text-slate-400" />
                  <p className="truncate text-sm font-semibold text-slate-900">{line.barkod}</p>
                  {line.barkod && line.barkod !== '—' ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-slate-400 hover:text-slate-700"
                      aria-label="Barkodu kopyala"
                      onClick={async (event) => {
                        event.stopPropagation()
                        const ok = await copyToClipboard(line.barkod)
                        if (ok) toast.success(`${line.barkod} kopyalandı`)
                        else toast.error('Barkod kopyalanamadı')
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-2 md:flex">
                <PackageMetric
                  icon={<Ruler className="size-3.5" />}
                  label="Boyut"
                  value={line.hacim_sinifi}
                />
                <PackageMetric
                  icon={<Package className="size-3.5" />}
                  label="Hacim"
                  value={
                    line.hacim != null
                      ? line.hacim.toLocaleString('tr-TR', { maximumFractionDigits: 3 })
                      : '—'
                  }
                />
                <PackageMetric
                  icon={<Scale className="size-3.5" />}
                  label="Ağırlık"
                  value={line.agirlik_kg != null ? `${line.agirlik_kg} kg` : '—'}
                />
              </div>

              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-slate-400 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 px-4 py-3 md:hidden">
              <CompactMetric label="Boyut" value={line.hacim_sinifi} />
              <CompactMetric
                label="Hacim"
                value={
                  line.hacim != null
                    ? line.hacim.toLocaleString('tr-TR', { maximumFractionDigits: 3 })
                    : '—'
                }
              />
              <CompactMetric
                label="Ağırlık"
                value={line.agirlik_kg != null ? `${line.agirlik_kg} kg` : '—'}
              />
            </div>

            {open ? (
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                <ProofPanel line={line} />
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function packageStatusClass(status: PackageLineStatus): string {
  switch (status) {
    case 'teslim_edildi':
    case 'teslim_alindi':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70'
    case 'yolda':
    case 'alindi':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70'
    case 'teslim_edilemedi':
    case 'reddedildi':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/70'
    case 'iptal':
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
    default:
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70'
  }
}

function PackageMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-24 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-2.5 py-2 text-center ring-1 ring-slate-200/70">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
    </div>
  )
}

function ProofPanel({ line }: { line: OrderPackageLine }) {
  const proof = line.kanit

  if (!proof) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Package className="size-4" />
        Teslim / alım kanıtı henüz yok
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="TC Son 4" value={proof.tc_son_4 ?? '—'} />
      <Field label="Ad Soyad" value={proof.alici_ad_soyad ?? '—'} />
      <div className="sm:col-span-2">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          Fotoğraflar
        </p>
        {proof.foto_urls.length === 0 ? (
          <p className="text-sm text-slate-500">—</p>
        ) : (
          <ProofGallery urls={proof.foto_urls} barcode={line.barkod} />
        )}
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Kurye Görev Notu
        </p>
        <p className="text-sm text-slate-700">{proof.kurye_gorev_notu?.trim() || '—'}</p>
      </div>
    </div>
  )
}

function ProofGallery({ urls, barcode }: { urls: string[]; barcode: string }) {
  const [open, setOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return

    const updateIndex = () => setCurrentIndex(api.selectedScrollSnap())
    updateIndex()
    api.on('select', updateIndex)

    return () => {
      api.off('select', updateIndex)
    }
  }, [api])

  const showPhoto = (index: number) => {
    setStartIndex(index)
    setCurrentIndex(index)
    setOpen(true)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => showPhoto(index)}
            className="group relative h-16 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label={`${index + 1}. teslimat kanıtı fotoğrafını büyüt`}
          >
            <PhotoSurface url={url} className="size-full" />
            <span className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/10" />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-base text-slate-900">Teslimat Kanıtı</DialogTitle>
            <DialogDescription className="text-slate-500">
              {barcode} · {currentIndex + 1} / {urls.length}
            </DialogDescription>
          </DialogHeader>

          <Carousel
            key={`${startIndex}-${open}`}
            setApi={setApi}
            opts={{ startIndex, loop: urls.length > 1 }}
            className="px-12 pb-6"
          >
            <CarouselContent>
              {urls.map((url, index) => (
                <CarouselItem key={`${url}-modal-${index}`}>
                  <PhotoSurface
                    url={url}
                    className="h-[65vh] min-h-80 w-full rounded-xl border border-slate-200 bg-slate-50"
                    expanded
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {urls.length > 1 ? (
              <>
                <CarouselPrevious className="left-3 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900" />
                <CarouselNext className="right-3 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900" />
              </>
            ) : null}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PhotoSurface({
  url,
  className,
  expanded = false,
}: {
  url: string
  className?: string
  expanded?: boolean
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const image = new window.Image()
    image.onload = () => setLoaded(true)
    image.onerror = () => setLoaded(false)
    image.src = url

    return () => {
      image.onload = null
      image.onerror = null
    }
  }, [url])

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-slate-50 bg-contain bg-center bg-no-repeat text-slate-400',
        className
      )}
      style={loaded ? { backgroundImage: `url("${url}")` } : undefined}
    >
      {!loaded ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageIcon className={expanded ? 'size-10' : 'size-5'} />
          {expanded ? (
            <span className="max-w-xs text-xs text-slate-500">Teslimat kanıtı fotoğrafı</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}
