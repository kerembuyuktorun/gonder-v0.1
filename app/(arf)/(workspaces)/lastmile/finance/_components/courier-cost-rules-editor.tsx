'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { createId } from '../_lib/format'
import type { CourierCostPricingMode, CourierCostRule, PriceZone } from '../_types'
import { COURIER_COST_MODE_LABELS } from '../_types'

type Props = {
  rules: CourierCostRule[]
  zones: PriceZone[]
  costListId: string
  onChange: (rules: CourierCostRule[]) => void
}

function emptyRule(
  costListId: string,
  mode: CourierCostPricingMode = 'base_plus_km'
): CourierCostRule {
  return {
    id: createId('ccr'),
    costListId,
    name: '',
    priority: 50,
    status: 'active',
    pricingMode: mode,
    baseFee: mode === 'desi_dynamic' || mode === 'base_plus_km' ? 50 : undefined,
    perDesi: mode === 'desi_dynamic' ? 10 : undefined,
    perKm:
      mode === 'base_plus_km' || mode === 'salary_bonus_km'
        ? mode === 'salary_bonus_km'
          ? 1.5
          : 4
        : undefined,
    perHour: mode === 'hourly_shift' ? 90 : undefined,
    perPackage:
      mode === 'package_fee' || mode === 'salary_bonus_package' ? 15 : undefined,
    flatFee:
      mode === 'od_district' || mode === 'zone_flat' || mode === 'desi_band_fixed'
        ? 100
        : undefined,
    desiStart: mode === 'desi_band_fixed' ? 1 : undefined,
    desiEnd: mode === 'desi_band_fixed' ? 5 : undefined,
  }
}

export function CourierCostRulesEditor({ rules, zones, costListId, onChange }: Props) {
  const update = (id: string, patch: Partial<CourierCostRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id))

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-semibold text-slate-900'>Maliyet Kuralları</h3>
          <p className='text-xs text-slate-500'>
            Yüksek öncelikli kural önce eşleşir. Modele uygun kurallar kullanın.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => onChange([emptyRule(costListId), ...rules])}
        >
          <Plus className='mr-1.5 size-3.5' />
          Kural Ekle
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className='rounded-xl border border-dashed px-4 py-8 text-center text-sm text-slate-500'>
          Henüz kural yok. Bir kural ekleyin.
        </div>
      ) : null}

      <div className='space-y-4'>
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-none'
          >
            <div className='flex flex-wrap items-start justify-between gap-2'>
              <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
                Kural #{index + 1}
              </p>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-8 text-slate-500'
                onClick={() => remove(rule.id)}
              >
                <Trash2 className='size-3.5' />
              </Button>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-1.5 sm:col-span-2'>
                <Label>Ad</Label>
                <Input
                  value={rule.name ?? ''}
                  onChange={(e) => update(rule.id, { name: e.target.value })}
                  placeholder='Örn. Paket ücreti'
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Mod</Label>
                <Select
                  value={rule.pricingMode}
                  onValueChange={(value) => {
                    const mode = value as CourierCostPricingMode
                    const next = emptyRule(costListId, mode)
                    update(rule.id, {
                      ...next,
                      id: rule.id,
                      name: rule.name,
                      priority: rule.priority,
                      status: rule.status,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COURIER_COST_MODE_LABELS) as CourierCostPricingMode[]).map(
                      (mode) => (
                        <SelectItem key={mode} value={mode}>
                          {COURIER_COST_MODE_LABELS[mode]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label>Öncelik</Label>
                <Input
                  type='number'
                  value={rule.priority}
                  onChange={(e) => update(rule.id, { priority: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            {(rule.pricingMode === 'base_plus_km' || rule.pricingMode === 'desi_dynamic') && (
              <div className='grid gap-3 sm:grid-cols-3'>
                <div className='space-y-1.5'>
                  <Label>Başlangıç ücreti (₺)</Label>
                  <Input
                    type='number'
                    value={rule.baseFee ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        baseFee: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                {rule.pricingMode === 'base_plus_km' ? (
                  <div className='space-y-1.5'>
                    <Label>Km başına (₺)</Label>
                    <Input
                      type='number'
                      value={rule.perKm ?? ''}
                      onChange={(e) =>
                        update(rule.id, {
                          perKm: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    <Label>Desi başına (₺)</Label>
                    <Input
                      type='number'
                      value={rule.perDesi ?? ''}
                      onChange={(e) =>
                        update(rule.id, {
                          perDesi: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
                <div className='space-y-1.5'>
                  <Label>Min ücret (₺)</Label>
                  <Input
                    type='number'
                    value={rule.minFee ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        minFee: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            {(rule.pricingMode === 'package_fee' ||
              rule.pricingMode === 'salary_bonus_package') && (
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label>Paket başına (₺)</Label>
                  <Input
                    type='number'
                    value={rule.perPackage ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        perPackage: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Min ücret (₺)</Label>
                  <Input
                    type='number'
                    value={rule.minFee ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        minFee: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            {(rule.pricingMode === 'hourly_shift' ||
              rule.pricingMode === 'salary_bonus_km') && (
              <div className='grid gap-3 sm:grid-cols-2'>
                {rule.pricingMode === 'hourly_shift' ? (
                  <div className='space-y-1.5'>
                    <Label>Saat başı (₺)</Label>
                    <Input
                      type='number'
                      value={rule.perHour ?? ''}
                      onChange={(e) =>
                        update(rule.id, {
                          perHour: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    <Label>Km primi (₺)</Label>
                    <Input
                      type='number'
                      value={rule.perKm ?? ''}
                      onChange={(e) =>
                        update(rule.id, {
                          perKm: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
                <div className='space-y-1.5'>
                  <Label>Min ücret (₺)</Label>
                  <Input
                    type='number'
                    value={rule.minFee ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        minFee: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            {(rule.pricingMode === 'od_district' ||
              rule.pricingMode === 'zone_flat' ||
              rule.pricingMode === 'desi_band_fixed') && (
              <div className='grid gap-3 sm:grid-cols-3'>
                <div className='space-y-1.5'>
                  <Label>Sabit ücret (₺)</Label>
                  <Input
                    type='number'
                    value={rule.flatFee ?? ''}
                    onChange={(e) =>
                      update(rule.id, {
                        flatFee: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                {rule.pricingMode === 'desi_band_fixed' ? (
                  <>
                    <div className='space-y-1.5'>
                      <Label>Desi başlangıç</Label>
                      <Input
                        type='number'
                        value={rule.desiStart ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            desiStart: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Desi bitiş</Label>
                      <Input
                        type='number'
                        value={rule.desiEnd ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            desiEnd: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </>
                ) : null}
                {rule.pricingMode === 'zone_flat' ? (
                  <div className='space-y-1.5 sm:col-span-2'>
                    <Label>Bölge</Label>
                    <Select
                      value={rule.zoneId ?? ''}
                      onValueChange={(value) => update(rule.id, { zoneId: value })}
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
              </div>
            )}

            {rule.pricingMode === 'od_district' ? (
              <div className='grid gap-3 lg:grid-cols-2'>
                <div className='space-y-2 rounded-xl border bg-slate-50/60 p-3'>
                  <p className='text-xs font-semibold text-slate-600'>Çıkış</p>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İl ID</Label>
                      <Input
                        value={rule.origin?.cityId ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            origin: {
                              cityId: e.target.value,
                              cityName: rule.origin?.cityName ?? e.target.value,
                              districtId: rule.origin?.districtId,
                              districtName: rule.origin?.districtName,
                            },
                          })
                        }
                        placeholder='34'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İl adı</Label>
                      <Input
                        value={rule.origin?.cityName ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            origin: {
                              cityId: rule.origin?.cityId ?? '',
                              cityName: e.target.value,
                              districtId: rule.origin?.districtId,
                              districtName: rule.origin?.districtName,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İlçe ID (ops.)</Label>
                      <Input
                        value={rule.origin?.districtId ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            origin: {
                              cityId: rule.origin?.cityId ?? '',
                              cityName: rule.origin?.cityName ?? '',
                              districtId: e.target.value || undefined,
                              districtName: rule.origin?.districtName,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İlçe adı</Label>
                      <Input
                        value={rule.origin?.districtName ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            origin: {
                              cityId: rule.origin?.cityId ?? '',
                              cityName: rule.origin?.cityName ?? '',
                              districtId: rule.origin?.districtId,
                              districtName: e.target.value || undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className='space-y-2 rounded-xl border bg-slate-50/60 p-3'>
                  <p className='text-xs font-semibold text-slate-600'>Varış</p>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İl ID</Label>
                      <Input
                        value={rule.destination?.cityId ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            destination: {
                              cityId: e.target.value,
                              cityName: rule.destination?.cityName ?? e.target.value,
                              districtId: rule.destination?.districtId,
                              districtName: rule.destination?.districtName,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İl adı</Label>
                      <Input
                        value={rule.destination?.cityName ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            destination: {
                              cityId: rule.destination?.cityId ?? '',
                              cityName: e.target.value,
                              districtId: rule.destination?.districtId,
                              districtName: rule.destination?.districtName,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İlçe ID (ops.)</Label>
                      <Input
                        value={rule.destination?.districtId ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            destination: {
                              cityId: rule.destination?.cityId ?? '',
                              cityName: rule.destination?.cityName ?? '',
                              districtId: e.target.value || undefined,
                              districtName: rule.destination?.districtName,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>İlçe adı</Label>
                      <Input
                        value={rule.destination?.districtName ?? ''}
                        onChange={(e) =>
                          update(rule.id, {
                            destination: {
                              cityId: rule.destination?.cityId ?? '',
                              cityName: rule.destination?.cityName ?? '',
                              districtId: rule.destination?.districtId,
                              districtName: e.target.value || undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className='space-y-1.5'>
              <Label>Not</Label>
              <Textarea
                rows={2}
                value={rule.notes ?? ''}
                onChange={(e) => update(rule.id, { notes: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
