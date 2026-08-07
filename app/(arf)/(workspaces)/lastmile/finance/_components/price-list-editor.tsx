'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { SEED_DISTRICTS, SEED_GEO } from '../_data/seed'
import { createId } from '../_lib/format'
import type {
  DesiPricingType,
  DistanceStructure,
  PriceRule,
  PriceZone,
} from '../_types'
import {
  DESI_PRICING_LABELS,
  DISTANCE_STRUCTURE_LABELS,
  pricingModeFromDistanceStructure,
} from '../_types'
import { PriceQuoteSimulator } from './price-quote-simulator'

export type PriceListEditorValues = {
  name: string
  isDefault: boolean
  distanceStructure: DistanceStructure
  rules: PriceRule[]
}

type Props = {
  mode: 'create' | 'edit'
  priceListId: string
  initial: PriceListEditorValues
  zones: PriceZone[]
  saving?: boolean
  /** Simülatör bu bileşende gösterilsin mi (detayda ayrı sekmede tutulur) */
  showSimulator?: boolean
  /** page: kendi başlık/padding; embedded: detay sekmesi içi */
  layout?: 'page' | 'embedded'
  onSubmit: (values: PriceListEditorValues) => void | Promise<void>
  onCancel: () => void
}

function emptyRule(
  priceListId: string,
  structure: DistanceStructure,
  priority = 50
): PriceRule {
  const mode = pricingModeFromDistanceStructure(structure)
  return {
    id: createId('rule'),
    priceListId,
    priority,
    status: 'active',
    pricingMode: mode,
    desiPricing: 'fixed',
    desiStart: 1,
    desiEnd: 5,
    flatFee: 100,
    perKm: structure === 'km' ? 4 : undefined,
    baseFee: undefined,
    perDesi: undefined,
    zoneId: structure === 'zone' ? undefined : undefined,
    origin:
      structure === 'od'
        ? {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.atasehir.districtId,
            districtName: SEED_GEO.atasehir.districtName,
          }
        : undefined,
    destination:
      structure === 'od'
        ? {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.tuzla.districtId,
            districtName: SEED_GEO.tuzla.districtName,
          }
        : undefined,
  }
}

function districtKey(cityId: string, districtId?: string) {
  return `${cityId}::${districtId ?? ''}`
}

function findDistrict(key: string) {
  return SEED_DISTRICTS.find((d) => districtKey(d.cityId, d.districtId) === key)
}

export function PriceListEditor({
  mode,
  priceListId,
  initial,
  zones,
  saving,
  showSimulator = false,
  layout = 'page',
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial.name)
  const [isDefault, setIsDefault] = useState(initial.isDefault)
  const [distanceStructure, setDistanceStructure] = useState<DistanceStructure>(
    initial.distanceStructure
  )
  const [rules, setRules] = useState<PriceRule[]>(initial.rules)

  const structureOptions = useMemo(
    () => Object.entries(DISTANCE_STRUCTURE_LABELS) as [DistanceStructure, string][],
    []
  )

  const changeStructure = (next: DistanceStructure) => {
    if (next === distanceStructure) return
    if (rules.length > 0) {
      const ok = window.confirm(
        'Mesafe kurgusu değişince mevcut kurallar silinir. Devam edilsin mi?'
      )
      if (!ok) return
    }
    setDistanceStructure(next)
    setRules([])
  }

  const updateRule = (id: string, patch: Partial<PriceRule>) => {
    setRules((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const setDesiPricing = (id: string, desiPricing: DesiPricingType) => {
    setRules((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r
        if (desiPricing === 'fixed') {
          return {
            ...r,
            desiPricing,
            flatFee: r.flatFee ?? 100,
            baseFee: undefined,
            perDesi: undefined,
          }
        }
        return {
          ...r,
          desiPricing,
          baseFee: r.baseFee ?? 50,
          perDesi: r.perDesi ?? 10,
          flatFee: undefined,
        }
      })
    )
  }

  const addRule = () => {
    setRules((rows) => [emptyRule(priceListId, distanceStructure, 100 - rows.length), ...rows])
  }

  const removeRule = (id: string) => setRules((rows) => rows.filter((r) => r.id !== id))

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'İsim en az 2 karakter olmalı.'
    if (rules.length === 0) return 'En az bir kural satırı ekleyin.'
    for (const [i, rule] of rules.entries()) {
      const label = `Satır ${i + 1}`
      if (rule.desiStart == null || rule.desiEnd == null) {
        return `${label}: desi başlangıç/bitiş zorunlu.`
      }
      if (rule.desiStart > rule.desiEnd) {
        return `${label}: desi başlangıç, bitişten büyük olamaz.`
      }
      if (rule.desiPricing === 'fixed' && (rule.flatFee == null || Number.isNaN(rule.flatFee))) {
        return `${label}: sabit ücret girin.`
      }
      if (rule.desiPricing === 'dynamic') {
        if (rule.perDesi == null || Number.isNaN(rule.perDesi)) {
          return `${label}: desi birim ücreti girin.`
        }
      }
      if (distanceStructure === 'km' && (rule.perKm == null || Number.isNaN(rule.perKm))) {
        return `${label}: km başına ücret girin.`
      }
      if (distanceStructure === 'zone' && !rule.zoneId) {
        return `${label}: bölge seçin.`
      }
      if (distanceStructure === 'od') {
        if (!rule.origin?.districtId || !rule.destination?.districtId) {
          return `${label}: çıkış ve varış ilçe seçin.`
        }
      }
    }
    return null
  }

  const save = async () => {
    const err = validate()
    if (err) {
      toast.error(err)
      return
    }
    const normalized = rules.map((r, index) => ({
      ...r,
      priceListId,
      pricingMode: pricingModeFromDistanceStructure(distanceStructure),
      priority: r.priority || 100 - index,
    }))
    await onSubmit({
      name: name.trim(),
      isDefault,
      distanceStructure,
      rules: normalized,
    })
  }

  return (
    <div
      className={
        layout === 'embedded'
          ? 'flex w-full flex-col gap-6'
          : 'mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6'
      }
    >
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          {layout === 'page' ? (
            <>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {mode === 'create' ? 'Yeni Fiyat Listesi' : 'Fiyat Listesini Düzenle'}
              </h1>
              <p className='mt-1 text-sm text-slate-500'>
                İsim ve mesafe kurgusunu seçin; desi satırlarıyla ücretleri tek sayfada tanımlayın.
              </p>
            </>
          ) : (
            <p className='text-sm text-slate-500'>
              İsim, mesafe kurgusu ve desi satırlarını güncelleyin.
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            {layout === 'embedded' ? 'Listeye dön' : 'İptal'}
          </Button>
          <Button
            type='button'
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <section className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>İsim *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Örn. Asya çıkış–varış tarifesi'
            />
          </div>
          <div className='flex items-center gap-2 sm:col-span-2'>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} id='pl-default' />
            <Label htmlFor='pl-default'>Varsayılan fiyat listesi</Label>
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Mesafe kurgusu *</Label>
          <p className='text-xs text-slate-500'>
            Bu listede tüm kurallar aynı mesafe yapısını kullanır; satırda değiştirilemez.
          </p>
          <div className='flex flex-wrap gap-2'>
            {structureOptions.map(([value, label]) => (
              <button
                key={value}
                type='button'
                onClick={() => changeStructure(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  distanceStructure === value
                    ? 'bg-lime-400 text-black'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-sm font-semibold text-slate-900'>Desi kuralları</h2>
            <p className='text-xs text-slate-500'>
              Her satır bir desi aralığıdır. Sabit bant veya desi birim (dinamik) seçin.
            </p>
          </div>
          <Button type='button' size='sm' variant='outline' onClick={addRule}>
            <Plus className='mr-1.5 size-3.5' />
            Satır ekle
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className='rounded-xl border border-dashed px-4 py-10 text-center text-sm text-slate-500'>
            Henüz kural yok. Satır ekleyerek desi aralığı tanımlayın.
          </div>
        ) : (
          <div className='space-y-3'>
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className='space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-none'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
                    Satır #{index + 1}
                  </p>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-8 text-slate-500'
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>

                <div className='grid gap-2 lg:grid-cols-12'>
                  {distanceStructure === 'od' ? (
                    <>
                      <div className='space-y-1 lg:col-span-3'>
                        <Label className='text-xs'>Çıkış ilçe</Label>
                        <Select
                          value={districtKey(
                            rule.origin?.cityId ?? SEED_GEO.istanbul.cityId,
                            rule.origin?.districtId
                          )}
                          onValueChange={(key) => {
                            const d = findDistrict(key)
                            if (!d) return
                            updateRule(rule.id, {
                              origin: {
                                cityId: d.cityId,
                                cityName: d.cityName,
                                districtId: d.districtId,
                                districtName: d.districtName,
                              },
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Çıkış' />
                          </SelectTrigger>
                          <SelectContent>
                            {SEED_DISTRICTS.map((d) => (
                              <SelectItem
                                key={districtKey(d.cityId, d.districtId)}
                                value={districtKey(d.cityId, d.districtId)}
                              >
                                {d.districtName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1 lg:col-span-3'>
                        <Label className='text-xs'>Varış ilçe</Label>
                        <Select
                          value={districtKey(
                            rule.destination?.cityId ?? SEED_GEO.istanbul.cityId,
                            rule.destination?.districtId
                          )}
                          onValueChange={(key) => {
                            const d = findDistrict(key)
                            if (!d) return
                            updateRule(rule.id, {
                              destination: {
                                cityId: d.cityId,
                                cityName: d.cityName,
                                districtId: d.districtId,
                                districtName: d.districtName,
                              },
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Varış' />
                          </SelectTrigger>
                          <SelectContent>
                            {SEED_DISTRICTS.map((d) => (
                              <SelectItem
                                key={`dest-${districtKey(d.cityId, d.districtId)}`}
                                value={districtKey(d.cityId, d.districtId)}
                              >
                                {d.districtName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : null}

                  {distanceStructure === 'zone' ? (
                    <div className='space-y-1 lg:col-span-3'>
                      <Label className='text-xs'>Bölge</Label>
                      <Select
                        value={rule.zoneId ?? ''}
                        onValueChange={(value) => updateRule(rule.id, { zoneId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Bölge seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((z) => (
                            <SelectItem key={z.id} value={z.id}>
                              {z.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  <div className='space-y-1 lg:col-span-2'>
                    <Label className='text-xs'>Desi başlangıç</Label>
                    <Input
                      type='number'
                      value={rule.desiStart}
                      onChange={(e) =>
                        updateRule(rule.id, { desiStart: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className='space-y-1 lg:col-span-2'>
                    <Label className='text-xs'>Desi bitiş</Label>
                    <Input
                      type='number'
                      value={rule.desiEnd}
                      onChange={(e) =>
                        updateRule(rule.id, { desiEnd: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className='space-y-1 lg:col-span-2'>
                    <Label className='text-xs'>Desi tipi</Label>
                    <Select
                      value={rule.desiPricing}
                      onValueChange={(v) => setDesiPricing(rule.id, v as DesiPricingType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(DESI_PRICING_LABELS) as DesiPricingType[]).map((t) => (
                          <SelectItem key={t} value={t}>
                            {DESI_PRICING_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {rule.desiPricing === 'fixed' ? (
                    <div className='space-y-1 lg:col-span-2'>
                      <Label className='text-xs'>Sabit ücret (₺)</Label>
                      <Input
                        type='number'
                        value={rule.flatFee ?? ''}
                        onChange={(e) =>
                          updateRule(rule.id, {
                            flatFee: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className='space-y-1 lg:col-span-2'>
                        <Label className='text-xs'>Başlangıç (₺)</Label>
                        <Input
                          type='number'
                          value={rule.baseFee ?? ''}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              baseFee: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className='space-y-1 lg:col-span-2'>
                        <Label className='text-xs'>Desi birim (₺)</Label>
                        <Input
                          type='number'
                          value={rule.perDesi ?? ''}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              perDesi: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  {distanceStructure === 'km' ? (
                    <div className='space-y-1 lg:col-span-2'>
                      <Label className='text-xs'>Km başına (₺)</Label>
                      <Input
                        type='number'
                        value={rule.perKm ?? ''}
                        onChange={(e) =>
                          updateRule(rule.id, {
                            perKm: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showSimulator ? <PriceQuoteSimulator priceListId={priceListId} /> : null}
    </div>
  )
}
