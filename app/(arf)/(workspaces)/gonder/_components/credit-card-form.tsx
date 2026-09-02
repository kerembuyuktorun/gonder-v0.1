'use client'

import { useState } from 'react'
import { CreditCard, Info, Lock, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  DEMO_CARDS,
  cvvLength,
  detectCardBrand,
  formatCardNumber,
  formatExpiryInput,
  onlyDigits,
} from '../_lib/payment-card'
import {
  CARD_BRAND_LABELS,
  type CardBrand,
  type CardFormErrors,
  type CardFormValue,
  type InstallmentOption,
} from '../_types/payment'

type Props = {
  value: CardFormValue
  onChange: (patch: Partial<CardFormValue>) => void
  errors?: CardFormErrors
  installmentOptions: InstallmentOption[]
  disabled?: boolean
  /** Demo kart doldurma kısayollarını gizlemek için */
  hideDemoCards?: boolean
}

const BRAND_GRADIENTS: Record<CardBrand, string> = {
  visa: 'from-sky-700 via-sky-800 to-slate-900',
  mastercard: 'from-orange-700 via-rose-800 to-slate-900',
  amex: 'from-teal-700 via-cyan-800 to-slate-900',
  troy: 'from-violet-700 via-indigo-800 to-slate-900',
  unknown: 'from-slate-700 via-slate-800 to-slate-900',
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value)
}

export function CreditCardForm({
  value,
  onChange,
  errors,
  installmentOptions,
  disabled,
  hideDemoCards,
}: Props) {
  const [flipped, setFlipped] = useState(false)
  const brand = detectCardBrand(value.number)
  const hasInstallments = installmentOptions.length > 1

  return (
    <div className='space-y-4'>
      <div className='[perspective:1200px]'>
        <div
          className={cn(
            'relative h-44 w-full transition-transform duration-500 [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]'
          )}
        >
          <div
            className={cn(
              '@container absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg [backface-visibility:hidden]',
              BRAND_GRADIENTS[brand]
            )}
          >
            <div className='flex items-start justify-between'>
              <div className='h-7 w-10 rounded-md bg-white/25 ring-1 ring-white/30' />
              <span className='text-sm font-semibold tracking-wide'>
                {brand === 'unknown' ? 'ARF Pay' : CARD_BRAND_LABELS[brand]}
              </span>
            </div>
            <p className='flex w-full min-w-0 flex-nowrap items-center justify-start gap-x-[0.38em] font-mono text-[min(1rem,calc(100cqi/16.5))] leading-none tracking-[0.05em] tabular-nums'>
              {(formatCardNumber(value.number) || '•••• •••• •••• ••••').split(/\s+/).map((group, index) => (
                <span key={`${group}-${index}`} className='shrink-0'>
                  {group}
                </span>
              ))}
            </p>
            <div className='flex items-end justify-between gap-3 text-xs'>
              <div className='min-w-0'>
                <p className='text-white/60'>Kart sahibi</p>
                <p className='truncate font-medium uppercase'>
                  {value.holder.trim() || 'AD SOYAD'}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-white/60'>Son kullanma</p>
                <p className='font-medium tabular-nums'>{value.expiry || 'AA/YY'}</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]',
              BRAND_GRADIENTS[brand]
            )}
          >
            <div className='-mx-4 mt-3 h-9 bg-black/60' />
            <div className='space-y-1'>
              <p className='text-xs text-white/60'>Güvenlik kodu</p>
              <div className='flex h-8 items-center rounded-md bg-white px-3 font-mono text-base tracking-[0.3em] text-slate-900 tabular-nums'>
                {onlyDigits(value.cvv) || '•••'}
              </div>
            </div>
            <p className='inline-flex items-center gap-1 text-[11px] text-white/60'>
              <Lock className='size-3' />
              Kart verileri demo ortamında saklanmaz
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs text-muted-foreground'>Kart numarası</Label>
          <div className='relative'>
            <CreditCard className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={formatCardNumber(value.number)}
              onChange={(e) => onChange({ number: e.target.value })}
              onFocus={() => setFlipped(false)}
              placeholder='0000 0000 0000 0000'
              inputMode='numeric'
              autoComplete='cc-number'
              aria-invalid={Boolean(errors?.number)}
              disabled={disabled}
              className='pl-9 font-mono tracking-wider tabular-nums'
            />
          </div>
          {errors?.number ? (
            <p className='text-[11px] text-destructive'>{errors.number}</p>
          ) : null}
        </div>

        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs text-muted-foreground'>Kart üzerindeki isim</Label>
          <Input
            value={value.holder}
            onChange={(e) => onChange({ holder: e.target.value })}
            onFocus={() => setFlipped(false)}
            placeholder='Ad Soyad'
            autoComplete='cc-name'
            aria-invalid={Boolean(errors?.holder)}
            disabled={disabled}
            className='uppercase'
          />
          {errors?.holder ? (
            <p className='text-[11px] text-destructive'>{errors.holder}</p>
          ) : null}
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Son kullanma (AA/YY)</Label>
          <Input
            value={value.expiry}
            onChange={(e) => onChange({ expiry: formatExpiryInput(e.target.value) })}
            onFocus={() => setFlipped(false)}
            placeholder='12/30'
            inputMode='numeric'
            autoComplete='cc-exp'
            aria-invalid={Boolean(errors?.expiry)}
            disabled={disabled}
            className='tabular-nums'
          />
          {errors?.expiry ? (
            <p className='text-[11px] text-destructive'>{errors.expiry}</p>
          ) : null}
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>CVV</Label>
          <Input
            value={onlyDigits(value.cvv)}
            onChange={(e) =>
              onChange({ cvv: onlyDigits(e.target.value).slice(0, cvvLength(brand)) })
            }
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            placeholder={'•'.repeat(cvvLength(brand))}
            inputMode='numeric'
            autoComplete='cc-csc'
            aria-invalid={Boolean(errors?.cvv)}
            disabled={disabled}
            className='tabular-nums'
          />
          {errors?.cvv ? <p className='text-[11px] text-destructive'>{errors.cvv}</p> : null}
        </div>
      </div>

      {hasInstallments ? (
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Taksit seçenekleri</Label>
          <div className='grid gap-1.5 sm:grid-cols-3'>
            {installmentOptions.map((option) => (
              <button
                key={option.count}
                type='button'
                disabled={disabled}
                onClick={() => onChange({ installment: option.count })}
                className={cn(
                  'rounded-lg border px-2.5 py-2 text-left transition-colors disabled:opacity-50',
                  value.installment === option.count
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <span className='block text-xs font-semibold'>
                  {option.count === 1 ? 'Tek çekim' : `${option.count} taksit`}
                </span>
                <span className='block text-[11px] text-muted-foreground tabular-nums'>
                  {option.count === 1
                    ? formatMoney(option.totalTry)
                    : `${formatMoney(option.monthlyTry)} × ${option.count}`}
                </span>
                {option.surchargeRate > 0 ? (
                  <span className='block text-[10px] text-amber-700'>
                    +%{(option.surchargeRate * 100).toFixed(1)} vade farkı
                  </span>
                ) : (
                  <span className='block text-[10px] text-emerald-700'>Vade farkı yok</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className='inline-flex items-center gap-1.5 text-[11px] text-muted-foreground'>
          <Info className='size-3.5' />
          Bu kart / tutar için taksit seçeneği bulunmuyor, işlem tek çekim yapılır.
        </p>
      )}

      <div className='space-y-2 rounded-lg border bg-muted/30 p-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <Label className='text-sm font-medium'>3D Secure ile doğrula</Label>
            <p className='text-[11px] text-muted-foreground'>
              Banka SMS doğrulaması simüle edilir.
            </p>
          </div>
          <Switch
            checked={value.use3ds}
            onCheckedChange={(checked) => onChange({ use3ds: checked })}
            disabled={disabled}
          />
        </div>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <Label className='text-sm font-medium'>Kartı kaydet</Label>
            <p className='text-[11px] text-muted-foreground'>
              Sonraki ödemelerde hızlı seçim için saklanır.
            </p>
          </div>
          <Switch
            checked={value.saveCard}
            onCheckedChange={(checked) => onChange({ saveCard: checked })}
            disabled={disabled}
          />
        </div>
      </div>

      {hideDemoCards ? null : (
        <div className='space-y-1.5 rounded-lg border border-dashed p-3'>
          <p className='inline-flex items-center gap-1.5 text-xs font-medium'>
            <Wallet className='size-3.5' />
            Demo kartlar
          </p>
          <div className='grid gap-1.5 sm:grid-cols-2'>
            {DEMO_CARDS.map((card) => (
              <Button
                key={card.id}
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled}
                className='h-auto flex-col items-start gap-0.5 py-1.5 text-left'
                onClick={() =>
                  onChange({
                    number: card.number,
                    holder: card.holder,
                    expiry: card.expiry,
                    cvv: card.cvv,
                  })
                }
              >
                <span className='flex w-full items-center gap-1.5'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'px-1.5 py-0 text-[10px] font-normal',
                      card.outcome === 'success'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                        : 'border-rose-500/20 bg-rose-500/10 text-rose-700'
                    )}
                  >
                    {card.label}
                  </Badge>
                </span>
                <span className='font-mono text-[11px] tabular-nums'>{card.number}</span>
                <span className='text-[10px] font-normal text-muted-foreground'>
                  {card.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
