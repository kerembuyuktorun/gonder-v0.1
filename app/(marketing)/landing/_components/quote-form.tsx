'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../(arf)/_shared/routes'
import { useQuoteLanding } from './quote-context'
import { createSpecialRequestRef, fetchMockQuotes } from '../_lib/mock-quotes'
import {
  BODY_OPTIONS,
  KARGO_PRESETS,
  VEHICLE_OPTIONS,
  calcPieceTotals,
  createEmptyPiece,
  type KargoSizePreset,
  type QuoteOffer,
  type QuotePiece,
} from '../_lib/quote-types'
import { SAMPLE_DISTRICTS, TURKEY_CITIES } from '../_lib/turkey-cities'

const KARGO_STEPS = ['Boyut', 'Parçalar', 'Güzergâh', 'Sonuç']
const LOJISTIK_STEPS = ['Tür', 'Yük', 'Güzergâh', 'Sonuç']

function StepIndicators({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <div className='flex gap-1 px-4 pt-3 lg:hidden' aria-label='Form adımları'>
      {steps.map((label, i) => (
        <div key={label} className='flex flex-1 flex-col items-center gap-1'>
          <div
            className={`h-1 w-full rounded-full ${
              i <= current ? 'bg-[var(--gl-accent)]' : 'bg-[var(--gl-border)]'
            }`}
          />
          <span className={`text-[10px] ${i === current ? 'font-semibold' : 'text-[var(--gl-muted)]'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function LocationFields({
  prefix,
  city,
  district,
  onCityChange,
  onDistrictChange,
  cityError,
}: {
  prefix: string
  city: string
  district: string
  onCityChange: (v: string) => void
  onDistrictChange: (v: string) => void
  cityError?: string
}) {
  const districts = city ? SAMPLE_DISTRICTS[city] ?? [] : []

  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      <div className='space-y-1.5'>
        <Label htmlFor={`${prefix}-city`}>İl</Label>
        <Select value={city || undefined} onValueChange={onCityChange}>
          <SelectTrigger id={`${prefix}-city`} className={cityError ? 'border-red-500' : ''}>
            <SelectValue placeholder='İl seçin' />
          </SelectTrigger>
          <SelectContent>
            {TURKEY_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cityError ? <p className='text-xs text-red-600'>{cityError}</p> : null}
      </div>
      <div className='space-y-1.5'>
        <Label htmlFor={`${prefix}-district`}>İlçe</Label>
        {districts.length > 0 ? (
          <Select value={district || undefined} onValueChange={onDistrictChange}>
            <SelectTrigger id={`${prefix}-district`}>
              <SelectValue placeholder='İlçe seçin' />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={`${prefix}-district`}
            placeholder='İlçe'
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
          />
        )}
      </div>
    </div>
  )
}

function OfferCard({ offer }: { offer: QuoteOffer }) {
  return (
    <div className='rounded-xl border border-[var(--gl-border)] bg-white p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{offer.carrierName}</p>
          <p className='text-sm text-[var(--gl-muted)]'>{offer.serviceName}</p>
        </div>
        {offer.badge === 'lowest_price' ? (
          <span className='rounded-full bg-[var(--gl-yellow)]/60 px-2 py-0.5 text-[10px] font-semibold'>
            En düşük fiyat
          </span>
        ) : offer.badge === 'fastest' ? (
          <span className='rounded-full bg-[var(--gl-petrol)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--gl-petrol)]'>
            En erken teslimat
          </span>
        ) : null}
      </div>
      <p className='mt-3 text-2xl font-bold text-[var(--gl-accent)]'>
        ₺{offer.totalPrice.toLocaleString('tr-TR')}
        <span className='ml-1 text-xs font-normal text-[var(--gl-muted)]'>
          {offer.includesVat ? 'KDV dahil' : 'KDV hariç'}
        </span>
      </p>
      <p className='mt-1 text-xs text-[var(--gl-muted)]'>Tahmini: {offer.estimatedDays}</p>
      <ul className='mt-3 space-y-1 text-xs text-[var(--gl-muted)]'>
        {offer.includedServices.map((s) => (
          <li key={s}>· {s}</li>
        ))}
      </ul>
      {offer.extraFeeNote ? (
        <p className='mt-2 text-[10px] text-[var(--gl-muted)]'>{offer.extraFeeNote}</p>
      ) : null}
      <Link
        href={ARF_ROUTES.auth.signIn}
        className='gl-btn-primary mt-4 block w-full text-center text-sm'
      >
        Gönderiyi oluştur · Giriş
      </Link>
    </div>
  )
}

function ContactStep({
  onSubmit,
  submitting,
}: {
  onSubmit: () => void
  submitting: boolean
}) {
  const { contact, setContact } = useQuoteLanding()

  return (
    <div className='space-y-3'>
      <p className='text-sm text-[var(--gl-muted)]'>
        Bu gönderi için özel teklif hazırlayalım. İletişim bilgilerini bırak.
      </p>
      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1'>
          <Label htmlFor='ct-name'>Ad Soyad</Label>
          <Input
            id='ct-name'
            required
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='ct-company'>Şirket (opsiyonel)</Label>
          <Input
            id='ct-company'
            value={contact.company}
            onChange={(e) => setContact({ ...contact, company: e.target.value })}
          />
        </div>
      </div>
      <div className='space-y-1'>
        <Label htmlFor='ct-email'>E-posta</Label>
        <Input
          id='ct-email'
          type='email'
          required
          value={contact.email}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
      </div>
      <div className='space-y-1'>
        <Label htmlFor='ct-phone'>Telefon</Label>
        <Input
          id='ct-phone'
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
        />
      </div>
      <div className='space-y-1'>
        <Label htmlFor='ct-note'>Not</Label>
        <Textarea
          id='ct-note'
          rows={2}
          value={contact.note}
          onChange={(e) => setContact({ ...contact, note: e.target.value })}
        />
      </div>
      <Button
        type='button'
        className='w-full bg-[var(--gl-accent)] hover:bg-[var(--gl-accent-hover)]'
        disabled={submitting || !contact.name || !contact.email}
        onClick={onSubmit}
      >
        {submitting ? 'Kaydediliyor…' : 'Özel teklif talebi oluştur'}
      </Button>
    </div>
  )
}

export function QuoteForm() {
  const { draft, setDraft, result, setResult, formStep, setFormStep, contact } = useQuoteLanding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contactSubmitting, setContactSubmitting] = useState(false)

  const isKargo = draft.mode === 'kargo'
  const steps = isKargo ? KARGO_STEPS : LOJISTIK_STEPS
  const kargoTotals = useMemo(() => calcPieceTotals(draft.kargo.pieces), [draft.kargo.pieces])

  const setMode = (mode: 'kargo' | 'lojistik') => {
    setDraft((d) => ({ ...d, mode }))
    setFormStep(0)
    setResult({ kind: 'idle' })
    setErrors({})
  }

  const applyPreset = (preset: KargoSizePreset) => {
    if (preset === 'custom') {
      setDraft((d) => ({
        ...d,
        kargo: { ...d.kargo, sizePreset: 'custom' },
      }))
      return
    }
    const p = KARGO_PRESETS[preset]
    setDraft((d) => ({
      ...d,
      kargo: {
        ...d.kargo,
        sizePreset: preset,
        pieces: [
          {
            ...d.kargo.pieces[0],
            widthCm: p.widthCm,
            lengthCm: p.lengthCm,
            heightCm: p.heightCm,
            weightKg: p.weightKg,
          },
        ],
      },
    }))
  }

  const updatePiece = (id: string, patch: Partial<QuotePiece>) => {
    setDraft((d) => ({
      ...d,
      kargo: {
        ...d.kargo,
        pieces: d.kargo.pieces.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      },
    }))
  }

  const validateStep = useCallback((): boolean => {
    const next: Record<string, string> = {}

    if (isKargo) {
      if (formStep === 0 && !draft.kargo.sizePreset) {
        next.preset = 'Paket boyutu seçin veya ölçülerinizi gireceğinizi belirtin.'
      }
      if (formStep === 2) {
        if (!draft.kargo.origin.city) next.origin = 'Çıkış ili zorunlu.'
        if (!draft.kargo.destination.city) next.dest = 'Varış ili zorunlu.'
      }
    } else {
      if (formStep === 0 && !draft.lojistik.subtype) {
        next.subtype = 'Taşıma türünü seçin.'
      }
      if (formStep === 1) {
        if (draft.lojistik.subtype === 'ftl' && !draft.lojistik.unsureVehicle && !draft.lojistik.vehicleType) {
          next.vehicle = 'Araç tipi seçin veya emin değilim işaretleyin.'
        }
        if (draft.lojistik.weightKg <= 0) next.weight = 'Geçerli bir ağırlık girin.'
      }
      if (formStep === 2) {
        if (!draft.lojistik.origin.city) next.origin = 'Çıkış ili zorunlu.'
        if (!draft.lojistik.destination.city) next.dest = 'Varış ili zorunlu.'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }, [draft, formStep, isKargo])

  const fetchQuotes = async () => {
    if (!validateStep()) return
    setResult({ kind: 'loading' })
    setFormStep(3)
    const res = await fetchMockQuotes(draft)
    setResult(res)
  }

  const goNext = () => {
    if (!validateStep()) return
    if (formStep === 2) {
      void fetchQuotes()
      return
    }
    setFormStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => {
    if (formStep === 3 && result.kind !== 'idle') {
      setResult({ kind: 'idle' })
    }
    setFormStep((s) => Math.max(s - 1, 0))
  }

  const handleSpecialSubmit = () => {
    setContactSubmitting(true)
    setTimeout(() => {
      setResult({ kind: 'special_request', reference: createSpecialRequestRef() })
      setContactSubmitting(false)
    }, 600)
  }

  const showResults = formStep === 3

  return (
    <div className='flex flex-col'>
      <Tabs value={draft.mode} onValueChange={(v) => setMode(v as 'kargo' | 'lojistik')}>
        <div className='border-b border-[var(--gl-border)] px-4 pt-4'>
          <TabsList className='grid w-full grid-cols-2 bg-[var(--gl-bg)]'>
            <TabsTrigger value='kargo' className='gap-1.5 text-xs sm:text-sm'>
              <Package className='size-3.5' />
              Kargo
            </TabsTrigger>
            <TabsTrigger value='lojistik' className='gap-1.5 text-xs sm:text-sm'>
              <Truck className='size-3.5' />
              Lojistik
            </TabsTrigger>
          </TabsList>
          <p className='mt-2 pb-3 text-xs text-[var(--gl-muted)]'>
            {isKargo ? 'Paket ve koli gönderileri.' : 'Parsiyel yük ve komple araç taşımaları.'}
          </p>
        </div>

        <StepIndicators steps={steps} current={formStep} />

        <div className='p-4'>
          <TabsContent value='kargo' className='mt-0 space-y-4'>
            {!showResults ? (
              <>
                {formStep === 0 ? (
                  <div className='space-y-3'>
                    <Label>Paket boyutu</Label>
                    <div className='grid gap-2 sm:grid-cols-2'>
                      {(Object.keys(KARGO_PRESETS) as Array<keyof typeof KARGO_PRESETS>).map((key) => {
                        const p = KARGO_PRESETS[key]
                        const selected = draft.kargo.sizePreset === key
                        return (
                          <button
                            key={key}
                            type='button'
                            onClick={() => applyPreset(key)}
                            className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                              selected
                                ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)]/5'
                                : 'border-[var(--gl-border)] hover:border-[var(--gl-ink)]'
                            }`}
                          >
                            <p className='font-semibold'>{p.label}</p>
                            <p className='mt-0.5 text-xs text-[var(--gl-muted)]'>
                              {p.widthCm}×{p.lengthCm}×{p.heightCm} cm · ~{p.weightKg} kg
                            </p>
                          </button>
                        )
                      })}
                      <button
                        type='button'
                        onClick={() => applyPreset('custom')}
                        className={`rounded-xl border p-3 text-left text-sm sm:col-span-2 ${
                          draft.kargo.sizePreset === 'custom'
                            ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)]/5'
                            : 'border-[var(--gl-border)]'
                        }`}
                      >
                        <p className='font-semibold'>Ölçülerimi gireceğim</p>
                        <p className='text-xs text-[var(--gl-muted)]'>Manuel en, boy, yükseklik ve ağırlık</p>
                      </button>
                    </div>
                    {errors.preset ? <p className='text-xs text-red-600'>{errors.preset}</p> : null}
                  </div>
                ) : null}

                {formStep === 1 ? (
                  <div className='space-y-4'>
                    {draft.kargo.pieces.map((piece, index) => (
                      <div key={piece.id} className='rounded-xl border border-[var(--gl-border)] p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <p className='text-sm font-medium'>Parça {index + 1}</p>
                          {draft.kargo.pieces.length > 1 ? (
                            <button
                              type='button'
                              className='text-[var(--gl-muted)] hover:text-red-600'
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  kargo: {
                                    ...d.kargo,
                                    pieces: d.kargo.pieces.filter((p) => p.id !== piece.id),
                                  },
                                }))
                              }
                            >
                              <Trash2 className='size-4' />
                            </button>
                          ) : null}
                        </div>
                        <div className='grid grid-cols-3 gap-2'>
                          {(['widthCm', 'lengthCm', 'heightCm'] as const).map((dim) => (
                            <div key={dim} className='space-y-1'>
                              <Label className='text-[10px]'>
                                {dim === 'widthCm' ? 'En' : dim === 'lengthCm' ? 'Boy' : 'Yük.'} (cm)
                              </Label>
                              <Input
                                type='number'
                                min={1}
                                value={piece[dim]}
                                onChange={(e) => updatePiece(piece.id, { [dim]: Number(e.target.value) })}
                              />
                            </div>
                          ))}
                        </div>
                        <div className='mt-2 grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label className='text-[10px]'>Ağırlık (kg)</Label>
                            <Input
                              type='number'
                              min={0.1}
                              step={0.1}
                              value={piece.weightKg}
                              onChange={(e) =>
                                updatePiece(piece.id, { weightKg: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-[10px]'>Adet</Label>
                            <Input
                              type='number'
                              min={1}
                              value={piece.quantity}
                              onChange={(e) =>
                                updatePiece(piece.id, { quantity: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          kargo: { ...d.kargo, pieces: [...d.kargo.pieces, createEmptyPiece()] },
                        }))
                      }
                    >
                      <Plus className='mr-1 size-3.5' />
                      Farklı boyutta parça ekle
                    </Button>
                    <div className='rounded-lg bg-[var(--gl-bg)] p-3 text-xs'>
                      <p>
                        <strong>Özet:</strong> {kargoTotals.quantity} parça · {kargoTotals.weightKg} kg ·{' '}
                        {kargoTotals.desi} desi
                      </p>
                      <p className='mt-1 text-[var(--gl-muted)]'>
                        Fiyatlandırma ağırlığı taşıyıcı kurallarına göre desi veya gerçek ağırlıktan
                        büyük olanı esas alır.
                      </p>
                    </div>
                  </div>
                ) : null}

                {formStep === 2 ? (
                  <div className='space-y-4'>
                    <div>
                      <p className='mb-2 text-sm font-medium'>Çıkış</p>
                      <LocationFields
                        prefix='k-o'
                        city={draft.kargo.origin.city}
                        district={draft.kargo.origin.district}
                        onCityChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            kargo: { ...d.kargo, origin: { city: v, district: '' } },
                          }))
                        }
                        onDistrictChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            kargo: { ...d.kargo, origin: { ...d.kargo.origin, district: v } },
                          }))
                        }
                        cityError={errors.origin}
                      />
                    </div>
                    <div>
                      <p className='mb-2 text-sm font-medium'>Varış</p>
                      <LocationFields
                        prefix='k-d'
                        city={draft.kargo.destination.city}
                        district={draft.kargo.destination.district}
                        onCityChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            kargo: { ...d.kargo, destination: { city: v, district: '' } },
                          }))
                        }
                        onDistrictChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            kargo: {
                              ...d.kargo,
                              destination: { ...d.kargo.destination, district: v },
                            },
                          }))
                        }
                        cityError={errors.dest}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <ResultsPanel
                result={result}
                onRetry={fetchQuotes}
                onSpecialRequest={handleSpecialSubmit}
                contactSubmitting={contactSubmitting}
                contact={contact}
              />
            )}
          </TabsContent>

          <TabsContent value='lojistik' className='mt-0 space-y-4'>
            {!showResults ? (
              <>
                {formStep === 0 ? (
                  <div className='space-y-3'>
                    <Label>Taşıma türü</Label>
                    <div className='grid gap-2 sm:grid-cols-2'>
                      {[
                        { id: 'ftl' as const, title: 'Komple Taşıma', desc: 'Bir aracı yüküne ayır.' },
                        { id: 'ltl' as const, title: 'Parsiyel Taşıma', desc: 'Araçta yükün kadar yer kullan.' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type='button'
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              lojistik: { ...d.lojistik, subtype: opt.id },
                            }))
                          }
                          className={`rounded-xl border p-3 text-left text-sm ${
                            draft.lojistik.subtype === opt.id
                              ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)]/5'
                              : 'border-[var(--gl-border)]'
                          }`}
                        >
                          <p className='font-semibold'>{opt.title}</p>
                          <p className='text-xs text-[var(--gl-muted)]'>{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                    {errors.subtype ? <p className='text-xs text-red-600'>{errors.subtype}</p> : null}
                  </div>
                ) : null}

                {formStep === 1 ? (
                  <div className='space-y-4'>
                    {draft.lojistik.subtype === 'ftl' ? (
                      <>
                        <Label>Araç tipi</Label>
                        <div className='grid gap-2 sm:grid-cols-3'>
                          {VEHICLE_OPTIONS.map((v) => (
                            <button
                              key={v.id}
                              type='button'
                              disabled={draft.lojistik.unsureVehicle}
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  lojistik: { ...d.lojistik, vehicleType: v.id },
                                }))
                              }
                              className={`rounded-lg border p-2 text-left text-xs ${
                                draft.lojistik.vehicleType === v.id
                                  ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)]/5'
                                  : 'border-[var(--gl-border)]'
                              } ${draft.lojistik.unsureVehicle ? 'opacity-50' : ''}`}
                            >
                              <p className='font-semibold'>{v.label}</p>
                              <p className='text-[var(--gl-muted)]'>{v.capacity}</p>
                            </button>
                          ))}
                        </div>
                        <label className='flex items-center gap-2 text-sm'>
                          <Checkbox
                            checked={draft.lojistik.unsureVehicle}
                            onCheckedChange={(c) =>
                              setDraft((d) => ({
                                ...d,
                                lojistik: {
                                  ...d.lojistik,
                                  unsureVehicle: Boolean(c),
                                  vehicleType: c ? null : d.lojistik.vehicleType,
                                },
                              }))
                            }
                          />
                          Araç tipinden emin değilim
                        </label>
                        {errors.vehicle ? <p className='text-xs text-red-600'>{errors.vehicle}</p> : null}
                        <div className='space-y-1'>
                          <Label>Kasa tipi</Label>
                          <Select
                            value={draft.lojistik.bodyType ?? undefined}
                            onValueChange={(v) =>
                              setDraft((d) => ({ ...d, lojistik: { ...d.lojistik, bodyType: v } }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Seçin (opsiyonel)' />
                            </SelectTrigger>
                            <SelectContent>
                              {BODY_OPTIONS.map((b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='space-y-1'>
                          <Label>Yük birimi</Label>
                          <Select
                            value={draft.lojistik.loadUnit}
                            onValueChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                lojistik: { ...d.lojistik, loadUnit: v as typeof d.lojistik.loadUnit },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='palet'>Palet</SelectItem>
                              <SelectItem value='koli'>Koli</SelectItem>
                              <SelectItem value='diger'>Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label>Parça adedi</Label>
                            <Input
                              type='number'
                              min={1}
                              value={draft.lojistik.pieceCount}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  lojistik: { ...d.lojistik, pieceCount: Number(e.target.value) },
                                }))
                              }
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label>Ağırlık (kg)</Label>
                            <Input
                              type='number'
                              min={1}
                              value={draft.lojistik.weightKg}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  lojistik: { ...d.lojistik, weightKg: Number(e.target.value) },
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-2'>
                          {(['widthCm', 'lengthCm', 'heightCm'] as const).map((dim) => (
                            <div key={dim} className='space-y-1'>
                              <Label className='text-[10px]'>
                                {dim === 'widthCm' ? 'En' : dim === 'lengthCm' ? 'Boy' : 'Yük.'} (cm)
                              </Label>
                              <Input
                                type='number'
                                value={draft.lojistik[dim]}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    lojistik: { ...d.lojistik, [dim]: Number(e.target.value) },
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                        <div className='space-y-1'>
                          <Label>Yük cinsi</Label>
                          <Input
                            placeholder='Seramik, gıda, makine…'
                            value={draft.lojistik.loadDescription}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                lojistik: { ...d.lojistik, loadDescription: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <label className='flex items-center gap-2 text-sm'>
                          <Checkbox
                            checked={draft.lojistik.stackable}
                            onCheckedChange={(c) =>
                              setDraft((d) => ({
                                ...d,
                                lojistik: { ...d.lojistik, stackable: Boolean(c) },
                              }))
                            }
                          />
                          İstiflenebilir
                        </label>
                      </>
                    )}
                    <div className='space-y-1'>
                      <Label>Tahmini toplam ağırlık (kg)</Label>
                      <Input
                        type='number'
                        min={1}
                        value={draft.lojistik.weightKg}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: { ...d.lojistik, weightKg: Number(e.target.value) },
                          }))
                        }
                      />
                      {errors.weight ? <p className='text-xs text-red-600'>{errors.weight}</p> : null}
                    </div>
                    <div className='rounded-xl border border-[var(--gl-border)] p-3'>
                      <p className='text-sm font-medium'>Ek ihtiyaçlar</p>
                      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
                        {[
                          { key: 'lift' as const, label: 'Lift' },
                          { key: 'forklift' as const, label: 'Forklift' },
                          { key: 'temperatureControl' as const, label: 'Sıcaklık kontrolü' },
                          { key: 'fragile' as const, label: 'Kırılgan yük' },
                          { key: 'hazmat' as const, label: 'Tehlikeli madde (ADR)' },
                        ].map((extra) => (
                          <label key={extra.key} className='flex items-center gap-2 text-xs'>
                            <Checkbox
                              checked={draft.lojistik.extras[extra.key]}
                              onCheckedChange={(c) =>
                                setDraft((d) => ({
                                  ...d,
                                  lojistik: {
                                    ...d.lojistik,
                                    extras: { ...d.lojistik.extras, [extra.key]: Boolean(c) },
                                  },
                                }))
                              }
                            />
                            {extra.label}
                          </label>
                        ))}
                      </div>
                      {draft.lojistik.extras.hazmat ? (
                        <p className='mt-2 text-[10px] text-amber-700'>
                          Tehlikeli madde gönderileri özel teklif akışına yönlendirilir.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {formStep === 2 ? (
                  <div className='space-y-4'>
                    <div>
                      <p className='mb-2 text-sm font-medium'>Çıkış</p>
                      <LocationFields
                        prefix='l-o'
                        city={draft.lojistik.origin.city}
                        district={draft.lojistik.origin.district}
                        onCityChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: { ...d.lojistik, origin: { city: v, district: '' } },
                          }))
                        }
                        onDistrictChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: { ...d.lojistik, origin: { ...d.lojistik.origin, district: v } },
                          }))
                        }
                        cityError={errors.origin}
                      />
                    </div>
                    <div>
                      <p className='mb-2 text-sm font-medium'>Varış</p>
                      <LocationFields
                        prefix='l-d'
                        city={draft.lojistik.destination.city}
                        district={draft.lojistik.destination.district}
                        onCityChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: { ...d.lojistik, destination: { city: v, district: '' } },
                          }))
                        }
                        onDistrictChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: {
                              ...d.lojistik,
                              destination: { ...d.lojistik.destination, district: v },
                            },
                          }))
                        }
                        cityError={errors.dest}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='load-date'>Yükleme tarihi</Label>
                      <Input
                        id='load-date'
                        type='date'
                        value={draft.lojistik.loadingDate}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            lojistik: { ...d.lojistik, loadingDate: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <ResultsPanel
                result={result}
                onRetry={fetchQuotes}
                onSpecialRequest={handleSpecialSubmit}
                contactSubmitting={contactSubmitting}
                contact={contact}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      {!showResults ? (
        <div className='flex gap-2 border-t border-[var(--gl-border)] p-4'>
          {formStep > 0 ? (
            <Button type='button' variant='outline' onClick={goBack}>
              <ArrowLeft className='mr-1 size-4' />
              Geri
            </Button>
          ) : (
            <div />
          )}
          <Button
            type='button'
            className='ml-auto flex-1 bg-[var(--gl-accent)] hover:bg-[var(--gl-accent-hover)] sm:flex-none sm:px-8'
            onClick={goNext}
          >
            {formStep === 2 ? (
              <>
                Fiyatları Gör
                <ArrowRight className='ml-1 size-4' />
              </>
            ) : (
              <>
                Devam
                <ArrowRight className='ml-1 size-4' />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className='border-t border-[var(--gl-border)] p-4'>
          <Button type='button' variant='outline' className='w-full' onClick={goBack}>
            <ArrowLeft className='mr-1 size-4' />
            Formu düzenle
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultsPanel({
  result,
  onRetry,
  onSpecialRequest,
  contactSubmitting,
  contact,
}: {
  result: ReturnType<typeof useQuoteLanding>['result']
  onRetry: () => void
  onSpecialRequest: () => void
  contactSubmitting: boolean
  contact: ReturnType<typeof useQuoteLanding>['contact']
}) {
  if (result.kind === 'loading') {
    return (
      <div className='flex flex-col items-center gap-3 py-10 text-center'>
        <Loader2 className='size-8 animate-spin text-[var(--gl-petrol)]' />
        <p className='text-sm font-medium'>Fiyatlar hesaplanıyor…</p>
        <p className='text-xs text-[var(--gl-muted)]'>Taşıyıcı seçenekleri getiriliyor</p>
      </div>
    )
  }

  if (result.kind === 'offers') {
    return (
      <div className='space-y-3'>
        <p className='text-sm font-semibold'>{result.offers.length} taşıma seçeneği bulundu</p>
        {result.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    )
  }

  if (result.kind === 'special_request' && result.reference) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-center'>
        <CheckCircle2 className='size-10 text-[var(--gl-petrol)]' />
        <p className='font-semibold'>Özel teklif talebin alındı</p>
        <p className='text-sm text-[var(--gl-muted)]'>
          Referans: <strong>{result.reference}</strong>
        </p>
        <p className='text-xs text-[var(--gl-muted)]'>
          Ekibimiz bilgilerini inceleyip seninle iletişime geçecek.
        </p>
        <Link href={ARF_ROUTES.auth.signIn} className='gl-btn-secondary mt-2 text-sm'>
          Giriş yap · Panelde takip et
        </Link>
      </div>
    )
  }

  if (result.kind === 'no_service' || result.kind === 'special_request') {
    return (
      <div className='space-y-4'>
        <div className='flex gap-3 rounded-xl bg-[var(--gl-bg)] p-4'>
          <AlertCircle className='size-5 shrink-0 text-[var(--gl-accent)]' />
          <div>
            <p className='text-sm font-medium'>
              {result.kind === 'no_service' ? 'Anlık fiyat bulunamadı' : 'Özel teklif gerekli'}
            </p>
            <p className='mt-1 text-xs text-[var(--gl-muted)]'>
              {result.kind === 'no_service'
                ? result.message
                : 'Bu yük için uzman değerlendirmesi gerekiyor. Bilgilerin korunur.'}
            </p>
          </div>
        </div>
        <ContactStep onSubmit={onSpecialRequest} submitting={contactSubmitting} />
      </div>
    )
  }

  if (result.kind === 'error') {
    return (
      <div className='space-y-4'>
        <div className='flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4'>
          <AlertCircle className='size-5 shrink-0 text-red-600' />
          <div>
            <p className='text-sm font-medium text-red-800'>Bir sorun oluştu</p>
            <p className='mt-1 text-xs text-red-700'>{result.message}</p>
          </div>
        </div>
        {result.retryable ? (
          <Button type='button' className='w-full' onClick={onRetry}>
            Tekrar dene
          </Button>
        ) : null}
      </div>
    )
  }

  return null
}
