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
  CompensationModel,
  DesiPricingType,
  DistanceStructure,
  CourierCostRule,
  PriceZone,
  QuantityBasis,
} from '../_types'
import {
  COMPENSATION_MODEL_LABELS,
  DESI_PRICING_LABELS,
  DISTANCE_STRUCTURE_LABELS,
  QUANTITY_BASIS_LABELS,
  pricingModeFromDistanceStructure,
} from '../_types'
import { CourierCostQuoteSimulator } from './courier-cost-quote-simulator'

export type CourierCostListEditorValues = {
  name: string
  isDefault: boolean
  distanceStructure: DistanceStructure
  compensationModel: CompensationModel
  fixedSalaryMonthly?: number
  quantityBasis: QuantityBasis
  rules: CourierCostRule[]
}

type Props = {
  mode: 'create' | 'edit'
  costListId: string
  initial: CourierCostListEditorValues
  zones: PriceZone[]
  saving?: boolean
  /** Simülatör bu bileşende gösterilsin mi (detayda ayrı sekmede tutulur) */
  showSimulator?: boolean
  /** page: kendi başlık/padding; embedded: detay sekmesi içi */
  layout?: 'page' | 'embedded'
  onSubmit: (values: CourierCostListEditorValues) => void | Promise<void>
  onCancel: () => void
}

function emptyRule(
  costListId: string,
  structure: DistanceStructure,
  quantityBasis: QuantityBasis,
  needsKm: boolean,
  priority = 50
): CourierCostRule {
  const mode = pricingModeFromDistanceStructure(structure)
  const isPackage = quantityBasis === 'package'
  return {
    id: createId('ccr'),
    costListId,
    priority,
    status: 'active',
    pricingMode: mode,
    desiPricing: 'fixed',
    desiStart: isPackage ? 0 : 1,
    desiEnd: isPackage ? 999 : 5,
    packageStart: isPackage ? 1 : undefined,
    packageEnd: isPackage ? 5 : undefined,
    flatFee: 100,
    perKm: needsKm ? 4 : undefined,
    baseFee: undefined,
    perDesi: undefined,
    perPackage: undefined,
    zoneId: undefined,
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

export function CourierCostListEditor({
  mode,
  costListId,
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
  const [compensationModel, setCompensationModel] = useState<CompensationModel>(
    initial.compensationModel
  )
  const [fixedSalaryMonthly, setFixedSalaryMonthly] = useState(
    initial.fixedSalaryMonthly != null ? String(initial.fixedSalaryMonthly) : ''
  )
  const [quantityBasis, setQuantityBasis] = useState<QuantityBasis>(initial.quantityBasis)
  const [rules, setRules] = useState<CourierCostRule[]>(initial.rules)

  const needsKm = compensationModel === 'hybrid' || distanceStructure === 'km'

  const structureOptions = useMemo(
    () => Object.entries(DISTANCE_STRUCTURE_LABELS) as [DistanceStructure, string][],
    []
  )

  const compensationOptions = useMemo(
    () => Object.entries(COMPENSATION_MODEL_LABELS) as [CompensationModel, string][],
    []
  )

  const quantityOptions = useMemo(
    () => Object.entries(QUANTITY_BASIS_LABELS) as [QuantityBasis, string][],
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

  const changeQuantityBasis = (next: QuantityBasis) => {
    if (next === quantityBasis) return
    if (rules.length > 0) {
      const ok = window.confirm(
        'Ölçü birimi değişince mevcut kurallar silinir. Devam edilsin mi?'
      )
      if (!ok) return
    }
    setQuantityBasis(next)
    setRules([])
  }

  const changeCompensationModel = (next: CompensationModel) => {
    setCompensationModel(next)
    if (next !== 'salary_plus_bonus') {
      setFixedSalaryMonthly('')
    }
  }

  const updateRule = (id: string, patch: Partial<CourierCostRule>) => {
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
            perPackage: undefined,
            minFee: undefined,
          }
        }
        return {
          ...r,
          desiPricing,
          baseFee: r.baseFee ?? 50,
          perDesi: quantityBasis === 'desi' ? (r.perDesi ?? 10) : undefined,
          perPackage: quantityBasis === 'package' ? (r.perPackage ?? 15) : undefined,
          flatFee: undefined,
          minFee: r.minFee ?? undefined,
        }
      })
    )
  }

  const addRule = () => {
    setRules((rows) => [
      emptyRule(costListId, distanceStructure, quantityBasis, needsKm, 100 - rows.length),
      ...rows,
    ])
  }

  const removeRule = (id: string) => setRules((rows) => rows.filter((r) => r.id !== id))

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'İsim en az 2 karakter olmalı.'
    if (compensationModel === 'salary_plus_bonus') {
      const salary = Number(fixedSalaryMonthly)
      if (!fixedSalaryMonthly.trim() || Number.isNaN(salary) || salary <= 0) {
        return 'Maaşlı model için aylık maaş girin.'
      }
    }
    const rulesRequired = compensationModel !== 'salary_plus_bonus'
    if (rulesRequired && rules.length === 0) return 'En az bir kural satırı ekleyin.'

    for (const [i, rule] of rules.entries()) {
      const label = `Satır ${i + 1}`
      if (quantityBasis === 'package') {
        if (rule.packageStart == null || rule.packageEnd == null) {
          return `${label}: paket başlangıç/bitiş zorunlu.`
        }
        if (rule.packageStart > rule.packageEnd) {
          return `${label}: paket başlangıç, bitişten büyük olamaz.`
        }
      } else {
        if (rule.desiStart == null || rule.desiEnd == null) {
          return `${label}: desi başlangıç/bitiş zorunlu.`
        }
        if (rule.desiStart > rule.desiEnd) {
          return `${label}: desi başlangıç, bitişten büyük olamaz.`
        }
      }
      if (rule.desiPricing === 'fixed' && (rule.flatFee == null || Number.isNaN(rule.flatFee))) {
        return `${label}: sabit ücret girin.`
      }
      if (rule.desiPricing === 'dynamic') {
        if (quantityBasis === 'package') {
          if (rule.perPackage == null || Number.isNaN(rule.perPackage)) {
            return `${label}: paket birim ücreti girin.`
          }
        } else if (rule.perDesi == null || Number.isNaN(rule.perDesi)) {
          return `${label}: desi birim ücreti girin.`
        }
      }
      if (needsKm && (rule.perKm == null || Number.isNaN(rule.perKm))) {
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
      costListId,
      pricingMode: pricingModeFromDistanceStructure(distanceStructure),
      priority: r.priority || 100 - index,
      perKm: needsKm ? r.perKm : undefined,
      ...(quantityBasis === 'package'
        ? {
            desiStart: 0,
            desiEnd: 999,
            perDesi: undefined,
          }
        : {
            packageStart: undefined,
            packageEnd: undefined,
            perPackage: undefined,
          }),
    }))
    await onSubmit({
      name: name.trim(),
      isDefault,
      distanceStructure,
      compensationModel,
      fixedSalaryMonthly:
        compensationModel === 'salary_plus_bonus' ? Number(fixedSalaryMonthly) : undefined,
      quantityBasis,
      rules: normalized,
    })
  }

  const quantityNoun = quantityBasis === 'package' ? 'Paket' : 'Desi'
  const unitLabel = quantityBasis === 'package' ? 'Paket birim (₺)' : 'Desi birim (₺)'

  return (
    <div
      className={
        layout === 'embedded'
          ? 'flex w-full flex-col gap-6'
          : 'mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6'
      }
    >
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          {layout === 'page' ? (
            <>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {mode === 'create' ? 'Yeni Kurye Ücret Listesi' : 'Ücret Listesini Düzenle'}
              </h1>
              <p className='mt-1 text-sm text-slate-500'>
                Ödeme modeli, ölçü birimi ve mesafe kurgusunu seçip kural satırlarıyla tanımlayın.
              </p>
            </>
          ) : (
            <p className='text-sm text-slate-500'>
              Ödeme modeli, ölçü birimi ve kural satırlarını güncelleyin.
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
            <Switch checked={isDefault} onCheckedChange={setIsDefault} id='cc-default' />
            <Label htmlFor='cc-default'>Varsayılan ücret listesi</Label>
          </div>

          <div className='space-y-1.5'>
            <Label>Ödeme modeli *</Label>
            <Select
              value={compensationModel}
              onValueChange={(v) => changeCompensationModel(v as CompensationModel)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {compensationOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {compensationModel === 'salary_plus_bonus' ? (
            <div className='space-y-1.5'>
              <Label>Aylık maaş (₺) *</Label>
              <Input
                type='number'
                value={fixedSalaryMonthly}
                onChange={(e) => setFixedSalaryMonthly(e.target.value)}
                placeholder='Örn. 28500'
              />
            </div>
          ) : null}

          <div className='space-y-2 sm:col-span-2'>
            <Label>Ölçü birimi *</Label>
            <p className='text-xs text-slate-500'>
              Kural satırları desi veya paket adedi aralığı üzerinden çalışır.
            </p>
            <div className='flex flex-wrap gap-2'>
              {quantityOptions.map(([value, label]) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => changeQuantityBasis(value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    quantityBasis === value
                      ? 'bg-lime-400 text-black'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Mesafe kurgusu *</Label>
          <p className='text-xs text-slate-500'>
            Bu listede tüm kurallar aynı mesafe yapısını kullanır; satırda değiştirilemez.
            {compensationModel === 'hybrid'
              ? ' Hibrit modelde mesafe kurgusu ne olursa olsun km ücreti eklenir.'
              : null}
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
            <h2 className='text-sm font-semibold text-slate-900'>{quantityNoun} kuralları</h2>
            <p className='text-xs text-slate-500'>
              {compensationModel === 'salary_plus_bonus'
                ? 'Kurallar opsiyonel primdir; eşleşmezse yalnızca maaş bilgisi döner.'
                : `Her satır bir ${quantityNoun.toLocaleLowerCase('tr-TR')} aralığıdır. Sabit bant veya birim (dinamik) seçin.`}
            </p>
          </div>
          <Button type='button' size='sm' variant='outline' onClick={addRule}>
            <Plus className='mr-1.5 size-3.5' />
            Satır ekle
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className='rounded-xl border border-dashed px-4 py-10 text-center text-sm text-slate-500'>
            {compensationModel === 'salary_plus_bonus'
              ? 'Kural yok — yalnızca aylık maaş bilgisi kullanılır. İsterseniz prim satırı ekleyin.'
              : `Henüz kural yok. Satır ekleyerek ${quantityNoun.toLocaleLowerCase('tr-TR')} aralığı tanımlayın.`}
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

                <div className='flex items-end gap-2 overflow-x-auto pb-0.5'>
                  {distanceStructure === 'od' ? (
                    <>
                      <div className='w-[132px] shrink-0 space-y-1'>
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
                          <SelectTrigger className='w-full'>
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
                      <div className='w-[132px] shrink-0 space-y-1'>
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
                          <SelectTrigger className='w-full'>
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
                    <div className='w-[148px] shrink-0 space-y-1'>
                      <Label className='text-xs'>Bölge</Label>
                      <Select
                        value={rule.zoneId ?? ''}
                        onValueChange={(value) => updateRule(rule.id, { zoneId: value })}
                      >
                        <SelectTrigger className='w-full'>
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

                  {quantityBasis === 'package' ? (
                    <>
                      <div className='w-[88px] shrink-0 space-y-1'>
                        <Label className='text-xs'>Paket baş.</Label>
                        <Input
                          type='number'
                          value={rule.packageStart ?? ''}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              packageStart: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className='w-[88px] shrink-0 space-y-1'>
                        <Label className='text-xs'>Paket bitiş</Label>
                        <Input
                          type='number'
                          value={rule.packageEnd ?? ''}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              packageEnd: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='w-[88px] shrink-0 space-y-1'>
                        <Label className='text-xs'>Desi baş.</Label>
                        <Input
                          type='number'
                          value={rule.desiStart}
                          onChange={(e) =>
                            updateRule(rule.id, { desiStart: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className='w-[88px] shrink-0 space-y-1'>
                        <Label className='text-xs'>Desi bitiş</Label>
                        <Input
                          type='number'
                          value={rule.desiEnd}
                          onChange={(e) =>
                            updateRule(rule.id, { desiEnd: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className='w-[158px] shrink-0 space-y-1'>
                    <Label className='text-xs'>{quantityNoun} tipi</Label>
                    <Select
                      value={rule.desiPricing}
                      onValueChange={(v) => setDesiPricing(rule.id, v as DesiPricingType)}
                    >
                      <SelectTrigger className='w-full'>
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
                    <div className='w-[112px] shrink-0 space-y-1'>
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
                      <div className='w-[100px] shrink-0 space-y-1'>
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
                      <div className='w-[100px] shrink-0 space-y-1'>
                        <Label className='text-xs'>{unitLabel}</Label>
                        <Input
                          type='number'
                          value={
                            quantityBasis === 'package'
                              ? (rule.perPackage ?? '')
                              : (rule.perDesi ?? '')
                          }
                          onChange={(e) => {
                            const n =
                              e.target.value === '' ? undefined : Number(e.target.value)
                            updateRule(
                              rule.id,
                              quantityBasis === 'package'
                                ? { perPackage: n }
                                : { perDesi: n }
                            )
                          }}
                        />
                      </div>
                      <div className='w-[112px] shrink-0 space-y-1'>
                        <Label className='text-xs'>Minimum ücret (₺)</Label>
                        <Input
                          type='number'
                          value={rule.minFee ?? ''}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              minFee: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          placeholder='Opsiyonel'
                        />
                      </div>
                    </>
                  )}

                  {needsKm ? (
                    <div className='w-[100px] shrink-0 space-y-1'>
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

      {showSimulator ? (
        <CourierCostQuoteSimulator costListId={costListId} quantityBasis={quantityBasis} />
      ) : null}
    </div>
  )
}
