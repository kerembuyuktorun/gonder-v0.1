'use client'

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import Link from 'next/link'
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
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  getCustomerPaymentTerms,
  quotePriceApi,
} from '../../../finance/_api/pricing-api'
import { sumPackageDesi } from '../../../finance/_lib/desi'
import { formatCurrency } from '../../../finance/_lib/format'
import type { QuoteResult, SettlementType } from '../../../finance/_types'
import { PRICING_MODE_LABELS, SETTLEMENT_TYPE_LABELS } from '../../../finance/_types'
import type { OrderCreateFormState } from '../_types/order-create'
import type { OrderCreateFieldErrors } from '../_lib/order-create-helpers'
import { Field } from './form-section'

type Props = {
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
  onQuoteChange?: (quote: QuoteResult | null) => void
}

export function StepPricing({ form, setForm, fieldError, onQuoteChange }: Props) {
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [termsLoaded, setTermsLoaded] = useState(false)

  const totalDesi = useMemo(() => sumPackageDesi(form.paketler), [form.paketler])
  const packageCount = useMemo(
    () =>
      form.paketler.reduce((sum, pkg) => {
        const n = Number(pkg.adet)
        return sum + (Number.isFinite(n) && n > 0 ? n : 0)
      }, 0),
    [form.paketler]
  )

  useEffect(() => {
    if (!form.musteriId || termsLoaded) return
    let cancelled = false
    void getCustomerPaymentTerms(form.musteriId).then((terms) => {
      if (cancelled || !terms) return
      setForm((prev) => ({
        ...prev,
        ucret_settlement_type: terms.settlementType,
        ucret_credit_days: String(terms.creditDays),
      }))
      setTermsLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [form.musteriId, setForm, termsLoaded])

  useEffect(() => {
    setTermsLoaded(false)
  }, [form.musteriId])

  const runQuote = async () => {
    if (!form.ucret_origin_city_id || !form.ucret_dest_city_id) return
    setLoading(true)
    try {
      const result = await quotePriceApi({
        customerId: form.musteriId || undefined,
        origin: {
          cityId: form.ucret_origin_city_id,
          districtId: form.ucret_origin_district_id || undefined,
        },
        destination: {
          cityId: form.ucret_dest_city_id,
          districtId: form.ucret_dest_district_id || undefined,
        },
        desi: totalDesi,
        packageCount: packageCount > 0 ? packageCount : undefined,
        distanceKm:
          form.ucret_distance_km === '' ? undefined : Number(form.ucret_distance_km),
        includeKdv: form.ucret_include_kdv,
        manualSubtotalOverride: form.ucret_manual_override
          ? Number(form.ucret_manual_subtotal) || 0
          : undefined,
      })
      setQuote(result)
      onQuoteChange?.(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void runQuote()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- quote on key input changes
  }, [
    form.musteriId,
    form.ucret_origin_city_id,
    form.ucret_origin_district_id,
    form.ucret_dest_city_id,
    form.ucret_dest_district_id,
    form.ucret_distance_km,
    form.ucret_include_kdv,
    form.ucret_manual_override,
    form.ucret_manual_subtotal,
    totalDesi,
    packageCount,
  ])

  const patch = (partial: Partial<OrderCreateFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-slate-900'>Ücret ve Ödeme</h2>
        <p className='mt-1 text-sm text-slate-500'>
          Toplam desi:{' '}
          <strong>{totalDesi.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</strong>
          {' · '}
          Paket adedi: <strong>{packageCount}</strong>
          {' · '}
          <Link
            href={ARF_ROUTES.lastmile.finance.priceLists.list}
            className='text-lime-700 underline-offset-2 hover:underline'
          >
            Fiyat listeleri
          </Link>
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Field label='Çıkış il ID' error={fieldError('ucret_origin_city_id')}>
          <Input
            value={form.ucret_origin_city_id}
            onChange={(e) => patch({ ucret_origin_city_id: e.target.value })}
          />
        </Field>
        <Field label='Çıkış ilçe ID'>
          <Input
            value={form.ucret_origin_district_id}
            onChange={(e) => patch({ ucret_origin_district_id: e.target.value })}
          />
        </Field>
        <Field label='Varış il ID' error={fieldError('ucret_dest_city_id')}>
          <Input
            value={form.ucret_dest_city_id}
            onChange={(e) => patch({ ucret_dest_city_id: e.target.value })}
          />
        </Field>
        <Field label='Varış ilçe ID'>
          <Input
            value={form.ucret_dest_district_id}
            onChange={(e) => patch({ ucret_dest_district_id: e.target.value })}
          />
        </Field>
        <Field label='Mesafe (km)' hint='Km bazlı kural için gerekli'>
          <Input
            type='number'
            value={form.ucret_distance_km}
            onChange={(e) => patch({ ucret_distance_km: e.target.value })}
          />
        </Field>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Çalışma şekli'>
          <Select
            value={form.ucret_settlement_type}
            onValueChange={(v) => {
              const settlement = v as SettlementType
              patch({
                ucret_settlement_type: settlement,
                ucret_credit_days: settlement === 'pesin' ? '0' : form.ucret_credit_days || '30',
              })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SETTLEMENT_TYPE_LABELS) as SettlementType[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SETTLEMENT_TYPE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {form.ucret_settlement_type === 'vadeli' ? (
          <Field label='Vade günü'>
            <Input
              type='number'
              value={form.ucret_credit_days}
              onChange={(e) => patch({ ucret_credit_days: e.target.value })}
            />
          </Field>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center gap-6'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={form.ucret_include_kdv}
            onCheckedChange={(v) => patch({ ucret_include_kdv: v })}
            id='ucret-kdv'
          />
          <Label htmlFor='ucret-kdv'>KDV %20</Label>
        </div>
        <div className='flex items-center gap-2'>
          <Switch
            checked={form.ucret_manual_override}
            onCheckedChange={(v) => patch({ ucret_manual_override: v })}
            id='ucret-manual'
          />
          <Label htmlFor='ucret-manual'>Manuel tutar</Label>
        </div>
        {form.ucret_manual_override ? (
          <Field label='Manuel ara toplam (₺)' className='w-40'>
            <Input
              type='number'
              value={form.ucret_manual_subtotal}
              onChange={(e) => patch({ ucret_manual_subtotal: e.target.value })}
            />
          </Field>
        ) : null}
        <Button type='button' variant='outline' size='sm' disabled={loading} onClick={() => void runQuote()}>
          Yeniden hesapla
        </Button>
      </div>

      <div className='rounded-2xl border bg-slate-50/80 p-4 text-sm'>
        {!quote ? (
          <p className='text-slate-500'>Hesaplanıyor…</p>
        ) : !quote.ok ? (
          <p className='font-medium text-amber-700'>
            {quote.error} — Manuel tutar ile devam edebilirsiniz.
          </p>
        ) : (
          <div className='space-y-2'>
            <p>
              <span className='text-slate-500'>Liste:</span> {quote.priceListName}
            </p>
            <p>
              <span className='text-slate-500'>Kural:</span> {quote.matchedRuleLabel}{' '}
              <span className='text-xs text-slate-400'>
                ({PRICING_MODE_LABELS[quote.pricingMode]})
              </span>
            </p>
            <div className='grid gap-1 border-t pt-2 text-xs text-slate-600 sm:grid-cols-2'>
              <p>Başlangıç: {formatCurrency(quote.breakdown.baseFee)}</p>
              <p>Km: {formatCurrency(quote.breakdown.distanceFee)}</p>
              <p>
                {quote.quantityBasis === 'package' ? 'Paket' : 'Desi'}:{' '}
                {formatCurrency(quote.breakdown.desiFee)}
              </p>
              <p>Sabit: {formatCurrency(quote.breakdown.flatFee)}</p>
              <p>Ara toplam: {formatCurrency(quote.breakdown.subtotal)}</p>
              <p>KDV: {formatCurrency(quote.breakdown.kdvAmount ?? 0)}</p>
            </div>
            <p className='text-lg font-semibold text-slate-900'>
              Toplam: {formatCurrency(quote.breakdown.total)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
