'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCourierCostList, quoteCourierCostApi } from '../_api/courier-cost-api'
import { SEED_GEO } from '../_data/seed'
import { formatCurrency } from '../_lib/format'
import type { CourierCostQuoteResult, QuantityBasis } from '../_types'
import {
  COMPENSATION_MODEL_LABELS,
  DISTANCE_STRUCTURE_LABELS,
  QUANTITY_BASIS_LABELS,
} from '../_types'

type Props = {
  costListId?: string
  courierId?: string
  /** Editor’dan geçici ölçü birimi (kaydedilmeden önce) */
  quantityBasis?: QuantityBasis
}

export function CourierCostQuoteSimulator({ costListId, courierId, quantityBasis }: Props) {
  const [resolvedBasis, setResolvedBasis] = useState<QuantityBasis>(quantityBasis ?? 'desi')
  const [originCityId, setOriginCityId] = useState<string>(SEED_GEO.istanbul.cityId)
  const [originDistrictId, setOriginDistrictId] = useState<string>(SEED_GEO.atasehir.districtId)
  const [destCityId, setDestCityId] = useState<string>(SEED_GEO.istanbul.cityId)
  const [destDistrictId, setDestDistrictId] = useState<string>(SEED_GEO.tuzla.districtId)
  const [desi, setDesi] = useState('3')
  const [packageCount, setPackageCount] = useState('2')
  const [distanceKm, setDistanceKm] = useState('18')
  const [result, setResult] = useState<CourierCostQuoteResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (quantityBasis) {
      setResolvedBasis(quantityBasis)
      return
    }
    if (!costListId) {
      setResolvedBasis('desi')
      return
    }
    void getCourierCostList(costListId).then((list) => {
      setResolvedBasis(list?.quantityBasis ?? 'desi')
    })
  }, [costListId, quantityBasis])

  const run = async () => {
    setLoading(true)
    try {
      const quote = await quoteCourierCostApi({
        costListId,
        courierId,
        origin: { cityId: originCityId, districtId: originDistrictId || undefined },
        destination: { cityId: destCityId, districtId: destDistrictId || undefined },
        desi: Number(desi) || 0,
        packageCount:
          resolvedBasis === 'package'
            ? packageCount === ''
              ? undefined
              : Number(packageCount)
            : undefined,
        distanceKm: distanceKm === '' ? undefined : Number(distanceKm),
      })
      setResult(quote)
    } finally {
      setLoading(false)
    }
  }

  const quantityFeeLabel =
    result && result.ok
      ? result.quantityBasis === 'package'
        ? 'Paket ücreti'
        : 'Desi ücreti'
      : resolvedBasis === 'package'
        ? 'Paket ücreti'
        : 'Desi ücreti'

  return (
    <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4'>
      <div>
        <h3 className='text-sm font-semibold text-slate-900'>Maliyet Dene</h3>
        <p className='text-xs text-slate-500'>
          Çıkış / varış / {QUANTITY_BASIS_LABELS[resolvedBasis].toLocaleLowerCase('tr-TR')} / km ile
          eşleşen kuralı önizleyin.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='space-y-1.5'>
          <Label>Çıkış il ID</Label>
          <Input value={originCityId} onChange={(e) => setOriginCityId(e.target.value)} />
        </div>
        <div className='space-y-1.5'>
          <Label>Çıkış ilçe ID</Label>
          <Input value={originDistrictId} onChange={(e) => setOriginDistrictId(e.target.value)} />
        </div>
        <div className='space-y-1.5'>
          <Label>Varış il ID</Label>
          <Input value={destCityId} onChange={(e) => setDestCityId(e.target.value)} />
        </div>
        <div className='space-y-1.5'>
          <Label>Varış ilçe ID</Label>
          <Input value={destDistrictId} onChange={(e) => setDestDistrictId(e.target.value)} />
        </div>
        {resolvedBasis === 'package' ? (
          <div className='space-y-1.5'>
            <Label>Paket adedi</Label>
            <Input
              type='number'
              value={packageCount}
              onChange={(e) => setPackageCount(e.target.value)}
            />
          </div>
        ) : (
          <div className='space-y-1.5'>
            <Label>Desi</Label>
            <Input type='number' value={desi} onChange={(e) => setDesi(e.target.value)} />
          </div>
        )}
        <div className='space-y-1.5'>
          <Label>Mesafe (km)</Label>
          <Input type='number' value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button
          type='button'
          className='bg-lime-400 text-black hover:bg-lime-300'
          disabled={loading}
          onClick={() => void run()}
        >
          {loading ? 'Hesaplanıyor…' : 'Hesapla'}
        </Button>
      </div>

      {result ? (
        <div className='rounded-xl border bg-slate-50/80 p-4 text-sm'>
          {!result.ok ? (
            <p className='font-medium text-amber-700'>{result.error}</p>
          ) : (
            <div className='space-y-2'>
              <p>
                <span className='text-slate-500'>Liste:</span> {result.costListName}{' '}
                <span className='text-xs text-slate-400'>
                  ({COMPENSATION_MODEL_LABELS[result.compensationModel]} ·{' '}
                  {QUANTITY_BASIS_LABELS[result.quantityBasis]} ·{' '}
                  {DISTANCE_STRUCTURE_LABELS[result.distanceStructure]})
                </span>
              </p>
              <p>
                <span className='text-slate-500'>Kural:</span> {result.matchedRuleLabel}
              </p>
              {result.inputs.fixedSalaryMonthly != null ? (
                <p className='text-xs text-slate-500'>
                  Aylık maaş (bilgi): {formatCurrency(result.inputs.fixedSalaryMonthly)}
                </p>
              ) : null}
              <div className='grid gap-1 border-t pt-2 text-xs text-slate-600 sm:grid-cols-2'>
                <p>Başlangıç: {formatCurrency(result.breakdown.baseFee)}</p>
                <p>Km: {formatCurrency(result.breakdown.distanceFee)}</p>
                <p>
                  {quantityFeeLabel}: {formatCurrency(result.breakdown.desiFee)}
                </p>
                <p>Sabit: {formatCurrency(result.breakdown.flatFee)}</p>
                {result.breakdown.bonusPortion > 0 ? (
                  <p>Prim: {formatCurrency(result.breakdown.bonusPortion)}</p>
                ) : null}
                <p>Ara toplam: {formatCurrency(result.breakdown.subtotal)}</p>
              </div>
              <p className='text-base font-semibold text-slate-900'>
                Toplam: {formatCurrency(result.breakdown.total)}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
