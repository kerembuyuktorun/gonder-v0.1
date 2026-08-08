'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getPriceList, quotePriceApi } from '../_api/pricing-api'
import { formatCurrency } from '../_lib/format'
import type { PricePackageDefinition, QuantityBasis, QuoteResult } from '../_types'
import { DISTANCE_STRUCTURE_LABELS, QUANTITY_BASIS_LABELS } from '../_types'
import { SEED_GEO } from '../_data/seed'

type Props = {
  priceListId?: string
  customerId?: string
  /** Editor’dan geçici ölçü birimi (kaydedilmeden önce) */
  quantityBasis?: QuantityBasis
  /** Editor’dan canlı paket kataloğu (kaydedilmeden önce) */
  packages?: PricePackageDefinition[]
}

export function PriceQuoteSimulator({
  priceListId,
  customerId,
  quantityBasis,
  packages: packagesProp,
}: Props) {
  const [resolvedBasis, setResolvedBasis] = useState<QuantityBasis>(quantityBasis ?? 'desi')
  const [resolvedPackages, setResolvedPackages] = useState<PricePackageDefinition[]>(
    packagesProp ?? []
  )
  const [originCityId, setOriginCityId] = useState<string>(SEED_GEO.istanbul.cityId)
  const [originDistrictId, setOriginDistrictId] = useState<string>(SEED_GEO.atasehir.districtId)
  const [destCityId, setDestCityId] = useState<string>(SEED_GEO.istanbul.cityId)
  const [destDistrictId, setDestDistrictId] = useState<string>(SEED_GEO.tuzla.districtId)
  const [desi, setDesi] = useState('3')
  const [packageCount, setPackageCount] = useState('2')
  const [packageQtys, setPackageQtys] = useState<Record<string, string>>({})
  const [distanceKm, setDistanceKm] = useState('18')
  const [includeKdv, setIncludeKdv] = useState(true)
  const [result, setResult] = useState<QuoteResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (quantityBasis) {
      setResolvedBasis(quantityBasis)
      if (packagesProp) {
        setResolvedPackages(packagesProp)
      }
      return
    }
    if (!priceListId) {
      setResolvedBasis('desi')
      setResolvedPackages([])
      return
    }
    void getPriceList(priceListId).then((list) => {
      setResolvedBasis(list?.quantityBasis ?? 'desi')
      setResolvedPackages(list?.packages ?? [])
    })
  }, [priceListId, quantityBasis, packagesProp])

  useEffect(() => {
    if (packagesProp !== undefined) {
      setResolvedPackages(packagesProp)
    }
  }, [packagesProp])

  useEffect(() => {
    setPackageQtys((prev) => {
      const next: Record<string, string> = {}
      for (const pkg of resolvedPackages) {
        next[pkg.id] = prev[pkg.id] ?? (pkg.id === resolvedPackages[0]?.id ? '1' : '0')
      }
      return next
    })
  }, [resolvedPackages])

  const catalogMode = resolvedBasis === 'package' && resolvedPackages.length > 0

  const packageLines = useMemo(() => {
    if (!catalogMode) return undefined
    return resolvedPackages
      .map((pkg) => ({
        packageId: pkg.id,
        quantity: Number(packageQtys[pkg.id] || 0),
      }))
      .filter((line) => line.quantity > 0)
  }, [catalogMode, resolvedPackages, packageQtys])

  const run = async () => {
    setLoading(true)
    try {
      const quote = await quotePriceApi({
        priceListId,
        customerId,
        origin: { cityId: originCityId, districtId: originDistrictId || undefined },
        destination: { cityId: destCityId, districtId: destDistrictId || undefined },
        desi: Number(desi) || 0,
        packageCount:
          resolvedBasis === 'package'
            ? catalogMode
              ? packageLines?.reduce((s, l) => s + l.quantity, 0)
              : packageCount === ''
                ? undefined
                : Number(packageCount)
            : undefined,
        packageLines: catalogMode ? packageLines : undefined,
        distanceKm: distanceKm === '' ? undefined : Number(distanceKm),
        includeKdv,
      })
      setResult(quote)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4'>
      <div>
        <h3 className='text-sm font-semibold text-slate-900'>Fiyat Dene</h3>
        <p className='text-xs text-slate-500'>
          Çıkış / varış / {QUANTITY_BASIS_LABELS[resolvedBasis].toLocaleLowerCase('tr-TR')} / km ile
          eşleşen kuralı ve tutarı önizleyin.
          {catalogMode ? ' Paket ücreti katalog birim fiyatlarından hesaplanır.' : null}
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
        {resolvedBasis === 'desi' ? (
          <div className='space-y-1.5'>
            <Label>Desi</Label>
            <Input type='number' value={desi} onChange={(e) => setDesi(e.target.value)} />
          </div>
        ) : null}
        {resolvedBasis === 'package' && !catalogMode ? (
          <div className='space-y-1.5'>
            <Label>Paket adedi</Label>
            <Input
              type='number'
              value={packageCount}
              onChange={(e) => setPackageCount(e.target.value)}
            />
          </div>
        ) : null}
        <div className='space-y-1.5'>
          <Label>Mesafe (km)</Label>
          <Input type='number' value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
        </div>
      </div>

      {catalogMode ? (
        <div className='space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3'>
          <p className='text-xs font-medium text-slate-700'>Paket satırları</p>
          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {resolvedPackages.map((pkg) => (
              <div key={pkg.id} className='space-y-1'>
                <Label className='text-xs'>
                  {pkg.code || pkg.name || 'Paket'}
                  {pkg.unitPrice != null ? ` · ${formatCurrency(pkg.unitPrice)}` : ''}
                </Label>
                <Input
                  type='number'
                  min={0}
                  value={packageQtys[pkg.id] ?? '0'}
                  onChange={(e) =>
                    setPackageQtys((prev) => ({ ...prev, [pkg.id]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Switch checked={includeKdv} onCheckedChange={setIncludeKdv} id='sim-kdv' />
          <Label htmlFor='sim-kdv'>KDV %20 dahil</Label>
        </div>
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
                <span className='text-slate-500'>Liste:</span> {result.priceListName}
              </p>
              <p>
                <span className='text-slate-500'>Kural:</span> {result.matchedRuleLabel}{' '}
                <span className='text-xs text-slate-400'>
                  ({DISTANCE_STRUCTURE_LABELS[result.distanceStructure]})
                </span>
              </p>
              <div className='grid gap-1 border-t pt-2 text-xs text-slate-600 sm:grid-cols-2'>
                <p>Başlangıç: {formatCurrency(result.breakdown.baseFee)}</p>
                <p>Km: {formatCurrency(result.breakdown.distanceFee)}</p>
                <p>
                  {result.quantityBasis === 'package' ? 'Paket' : 'Desi'}:{' '}
                  {formatCurrency(result.breakdown.desiFee)}
                </p>
                <p>Sabit: {formatCurrency(result.breakdown.flatFee)}</p>
                <p>Ara toplam: {formatCurrency(result.breakdown.subtotal)}</p>
                <p>KDV: {formatCurrency(result.breakdown.kdvAmount ?? 0)}</p>
              </div>
              {result.breakdown.adjustments.length > 0 ? (
                <ul className='border-t pt-2 text-xs text-slate-600'>
                  {result.breakdown.adjustments.map((adj, i) => (
                    <li key={`${adj.label}-${i}`}>
                      {adj.label}: {formatCurrency(adj.amount)}
                    </li>
                  ))}
                </ul>
              ) : null}
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
