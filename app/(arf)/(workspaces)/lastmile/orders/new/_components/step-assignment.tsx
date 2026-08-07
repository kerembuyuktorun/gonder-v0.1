'use client'

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { ShieldCheck, Workflow } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ActiveRouteOption, OrderCreateFormState } from '../_types/order-create'
import type { OrderCreateFieldErrors } from '../_lib/order-create-helpers'
import { fetchActiveRoutes } from '../_api/routes'
import { Field } from './form-section'
import { ToggleRow } from './toggle-row'

function updateField<K extends keyof OrderCreateFormState>(
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>,
  key: K,
  value: OrderCreateFormState[K]
) {
  setForm((previous) => ({ ...previous, [key]: value }))
}

type Props = {
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}

export function StepAssignment({ form, setForm, fieldError }: Props) {
  const [routes, setRoutes] = useState<ActiveRouteOption[]>([])

  useEffect(() => {
    if (!form.aninda_sahaya_ilet || !form.musteriId) {
      setRoutes([])
      return
    }

    let cancelled = false
    void (async () => {
      const result = await fetchActiveRoutes(form.musteriId)
      if (cancelled) return
      if (result.success) setRoutes(result.data.items)
      else setRoutes([])
    })()

    return () => {
      cancelled = true
    }
  }, [form.aninda_sahaya_ilet, form.musteriId])

  return (
    <div className='grid items-start gap-6 lg:grid-cols-2'>
      <section className='space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs'>
        <div className='flex items-center gap-3 border-b border-slate-200 pb-4'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600'>
            <ShieldCheck className='size-5' />
          </span>
          <h3 className='text-[15px] font-semibold tracking-tight text-slate-900'>
            Teslimat ve Bildirimler
          </h3>
        </div>

        <div className='space-y-3'>
          <ToggleRow
            label='Teslimat Kanıtı Zorunlu'
            description='Tamamlamak için T.C. kimlik ve lokasyon fotoğrafı gerekir.'
            checked={form.teslimat_kaniti_zorunlu}
            onCheckedChange={(checked) => updateField(setForm, 'teslimat_kaniti_zorunlu', checked)}
          />
          <ToggleRow
            label='SMS Bildirimi'
            description='Alıcıya operasyon durumu SMS ile iletilir.'
            checked={form.bildirim_sms}
            onCheckedChange={(checked) => updateField(setForm, 'bildirim_sms', checked)}
          />
          <ToggleRow
            label='E-posta Bildirimi'
            description='Alıcıya operasyon durumu e-posta ile iletilir.'
            checked={form.bildirim_email}
            onCheckedChange={(checked) => updateField(setForm, 'bildirim_email', checked)}
          />
        </div>
      </section>

      <section className='space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs'>
        <div className='flex items-center gap-3 border-b border-slate-200 pb-4'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600'>
            <Workflow className='size-5' />
          </span>
          <h3 className='text-[15px] font-semibold tracking-tight text-slate-900'>
            Güvenlik ve Saha Ataması
          </h3>
        </div>

        <div className='space-y-3'>
          <ToggleRow
            label='Güvenli Teslimat Kodu (OTP)'
            description='Teslimatta alıcıya SMS ile tek kullanımlık kod gider.'
            checked={form.guvenli_teslimat_otp}
            onCheckedChange={(checked) => updateField(setForm, 'guvenli_teslimat_otp', checked)}
          />
          <ToggleRow
            label='Yakındaki Kuryelere Dağıt'
            description='En yakın uygun kuryelere görev bildirimi gönderilir.'
            checked={form.yakin_kuryelere_dagit}
            onCheckedChange={(checked) => {
              setForm((previous) => ({
                ...previous,
                yakin_kuryelere_dagit: checked,
                aninda_sahaya_ilet: checked ? false : previous.aninda_sahaya_ilet,
                aktif_rota_id: checked ? '' : previous.aktif_rota_id,
              }))
            }}
          />
          <div className='space-y-2'>
            <ToggleRow
              label='Anında Sahaya İlet'
              description='Atanmayanlar havuzunu atlayıp aktif rotaya ekler.'
              checked={form.aninda_sahaya_ilet}
              onCheckedChange={(checked) => {
                setForm((previous) => ({
                  ...previous,
                  aninda_sahaya_ilet: checked,
                  yakin_kuryelere_dagit: checked ? false : previous.yakin_kuryelere_dagit,
                  aktif_rota_id: checked ? previous.aktif_rota_id : '',
                }))
              }}
            />
            {fieldError('aninda_sahaya_ilet') ? (
              <p className='text-xs font-medium text-rose-600' role='alert'>
                {fieldError('aninda_sahaya_ilet')}
              </p>
            ) : null}
          </div>

          {form.aninda_sahaya_ilet && (
            <Field
              label='Aktif Rotaya Ekle'
              required
              error={fieldError('aktif_rota_id')}
              hint='Siparişin ekleneceği saha rotasını ve tahmini süre etkisini seçin.'
            >
              <Select
                value={form.aktif_rota_id}
                onValueChange={(value) => updateField(setForm, 'aktif_rota_id', value)}
              >
                <SelectTrigger
                  className={cn('w-full', fieldError('aktif_rota_id') && 'border-rose-300')}
                  aria-invalid={Boolean(fieldError('aktif_rota_id'))}
                >
                  <SelectValue placeholder='Rota seçin' />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.label} {route.courier} — {route.distanceKm} km — +
                      {route.costMinutes} dk
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      </section>
    </div>
  )
}
