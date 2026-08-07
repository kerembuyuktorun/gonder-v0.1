'use client'

import type { Dispatch, SetStateAction } from 'react'
import { PackageCheck, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { OrderCreateFormState, OrderPackageItem } from '../_types/order-create'
import type { OrderCreateFieldErrors } from '../_lib/order-create-helpers'
import {
  calculatePackageTotals,
  getPackageItemError,
} from '../_lib/order-create-helpers'
import { PACKAGE_SIZE_OPTIONS } from '../_mock/order-create-options'
import { Field } from './form-section'

function PackageTotal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </p>
      <p className='mt-1 text-base font-semibold text-slate-900'>{value}</p>
    </div>
  )
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(value)
}

type Props = {
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  showGidenPaket: boolean
  showErrors: boolean
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}

export function StepPackages({
  form,
  setForm,
  showGidenPaket,
  showErrors,
  fieldError,
}: Props) {
  const packageTotals = calculatePackageTotals(form.paketler)

  const addPackage = () => {
    const item: OrderPackageItem = {
      id: `package-${Date.now()}`,
      hacim_sinifi: 'M',
      adet: '1',
      hacim: '',
      agirlik_kg: '',
    }
    setForm((previous) => ({ ...previous, paketler: [...previous.paketler, item] }))
  }

  const updatePackage = (id: string, patch: Partial<OrderPackageItem>) => {
    setForm((previous) => ({
      ...previous,
      paketler: previous.paketler.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const removePackage = (id: string) => {
    setForm((previous) => ({
      ...previous,
      paketler: previous.paketler.filter((item) => item.id !== id),
    }))
  }

  return (
    <div className='space-y-3'>
        {form.paketler.map((item, index) => {
          const itemError = showErrors ? getPackageItemError(item) : undefined
          return (
            <div
              key={item.id}
              className={cn(
                'rounded-xl border bg-white p-4',
                itemError ? 'border-rose-200' : 'border-slate-200'
              )}
            >
              <div className='flex items-end gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700'>
                  {index + 1}
                </span>

                <div className='grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  <Field
                    label='Paket Boyutu'
                    required
                    hint={
                      PACKAGE_SIZE_OPTIONS.find((option) => option.value === item.hacim_sinifi)
                        ?.description ?? 'Hacim sınıfını seçin.'
                    }
                  >
                    <Select
                      value={item.hacim_sinifi}
                      onValueChange={(value) =>
                        updatePackage(item.id, {
                          hacim_sinifi: value as OrderPackageItem['hacim_sinifi'],
                        })
                      }
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGE_SIZE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field
                    label='Adet'
                    required
                    htmlFor={`package-quantity-${item.id}`}
                    hint='Bu boyuttaki paketlerin sayısı.'
                  >
                    <Input
                      id={`package-quantity-${item.id}`}
                      type='number'
                      min={1}
                      value={item.adet}
                      onChange={(event) => updatePackage(item.id, { adet: event.target.value })}
                      aria-invalid={Boolean(itemError)}
                      className={itemError ? 'border-rose-300' : undefined}
                    />
                  </Field>

                  <Field
                    label='Hacim'
                    required
                    htmlFor={`package-volume-${item.id}`}
                    hint='Tek paket için hacim değeri.'
                  >
                    <Input
                      id={`package-volume-${item.id}`}
                      type='number'
                      min={0}
                      step='0.001'
                      value={item.hacim}
                      onChange={(event) =>
                        updatePackage(item.id, { hacim: event.target.value })
                      }
                      placeholder='Örn. 0.05'
                      aria-invalid={Boolean(itemError)}
                      className={itemError ? 'border-rose-300' : undefined}
                    />
                  </Field>

                  <Field
                    label='Birim Ağırlık (kg)'
                    required
                    htmlFor={`package-weight-${item.id}`}
                    hint='Tek paket için ağırlık.'
                  >
                    <Input
                      id={`package-weight-${item.id}`}
                      type='number'
                      min={0}
                      step='0.1'
                      value={item.agirlik_kg}
                      onChange={(event) =>
                        updatePackage(item.id, { agirlik_kg: event.target.value })
                      }
                      placeholder='Örn. 4.5'
                      aria-invalid={Boolean(itemError)}
                      className={itemError ? 'border-rose-300' : undefined}
                    />
                  </Field>
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 text-muted-foreground hover:text-rose-600'
                  disabled={form.paketler.length === 1}
                  aria-label={`${index + 1}. paket kalemini sil`}
                  onClick={() => removePackage(item.id)}
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>

              {itemError ? (
                <p className='mt-2 text-xs font-medium text-rose-600' role='alert'>
                  {itemError}
                </p>
              ) : null}
            </div>
          )
        })}

        <div className='flex justify-center'>
          <Button type='button' variant='outline' onClick={addPackage}>
            <Plus className='mr-2 size-4' />
            Paket Ekle
          </Button>
        </div>

        {fieldError('paketler') ? (
          <p className='text-xs font-medium text-rose-600' role='alert'>
            {fieldError('paketler')}
          </p>
        ) : null}

        <div className='grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3'>
          <PackageTotal label='Toplam Paket' value={`${packageTotals.adet} adet`} />
          <PackageTotal label='Toplam Hacim' value={formatDecimal(packageTotals.hacim)} />
          <PackageTotal
            label='Toplam Ağırlık'
            value={`${formatDecimal(packageTotals.agirlikKg)} kg`}
          />
        </div>

        {showGidenPaket ? (
          <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs'>
              <PackageCheck className='size-5' />
            </span>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-sm font-semibold text-slate-900'>Değişim Paketi Akışı</p>
                <span className='rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600'>
                  {packageTotals.adet} giden paket
                </span>
              </div>
              <p className='mt-1 text-xs leading-relaxed text-slate-500'>
                Giden paketler teslimat sırasında alıcıya bırakılır. Dönen paket bilgileri kurye
                tarafından saha uygulamasında kaydedilir.
              </p>
            </div>
          </div>
        ) : null}
    </div>
  )
}
