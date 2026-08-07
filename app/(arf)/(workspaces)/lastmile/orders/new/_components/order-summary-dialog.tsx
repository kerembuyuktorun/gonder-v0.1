'use client'

import type { ReactNode } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type {
  CustomerOption,
  FacilityOption,
  OrderCreateFormState,
  OrderTypeFieldConfig,
} from '../_types/order-create'
import { CREATE_ORDER_TYPE_OPTIONS, mockGelAlPoints } from '../_mock/order-create-options'
import { calculatePackageTotals, formatStructuredAddress } from '../_lib/order-create-helpers'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: OrderCreateFormState
  config: OrderTypeFieldConfig
  customers: CustomerOption[]
  customerFacilities: FacilityOption[]
  submitting: boolean
  onConfirm: () => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className='grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3'>
      <p className='text-xs font-medium tracking-wide text-slate-500 uppercase'>{label}</p>
      <p className='text-sm text-slate-900'>{value}</p>
    </div>
  )
}

function SummarySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className='space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4'>
      <h4 className='text-sm font-semibold text-slate-900'>{title}</h4>
      <div className='space-y-2.5'>{children}</div>
    </section>
  )
}

function formatDateTimeWindow(date: string, start: string, end: string) {
  if (!date) return '—'
  const [year, month, day] = date.split('-')
  const dateLabel = year && month && day ? `${day}.${month}.${year}` : date
  return `${dateLabel} · ${start || '—'} – ${end || '—'}`
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function OrderSummaryDialog({
  open,
  onOpenChange,
  form,
  config,
  customers,
  customerFacilities,
  submitting,
  onConfirm,
}: Props) {
  const customer =
    customers.find((item) => item.id === form.musteriId)?.label ?? '—'
  const orderType =
    CREATE_ORDER_TYPE_OPTIONS.find((item) => item.value === form.siparis_tipi)?.label ??
    form.siparis_tipi

  const pickupFacility = customerFacilities.find((item) => item.id === form.alis_tesis_id)
  const dropFacility = customerFacilities.find((item) => item.id === form.varis_tesis_id)
  const gelAl = mockGelAlPoints.find((item) => item.id === form.varis_gel_al_id)
  const packageTotals = calculatePackageTotals(form.paketler)

  const pickupLabel =
    config.alisMode === 'facility'
      ? pickupFacility?.label ?? '—'
      : formatStructuredAddress(
          form.alis_adres,
          form.alis_bina_no,
          form.alis_kat,
          form.alis_daire_no
        ) || '—'
  const pickupContact =
    form.alis_muhatabi || pickupFacility?.contactName || '—'
  const pickupPhone =
    form.alis_telefon || pickupFacility?.contactPhone || '—'
  const pickupContactSummary =
    config.alisMode === 'address'
      ? [
          form.alis_contact_tipi === 'kurumsal'
            ? 'Kurumsal'
            : form.alis_contact_tipi === 'bireysel'
              ? 'Bireysel'
              : null,
          form.alis_firma_adi.trim() || null,
          form.alis_vergi_dairesi.trim() || null,
          pickupContact,
          form.alis_contact_tipi === 'kurumsal'
            ? form.alis_vkn || null
            : form.alis_tckn || null,
          pickupPhone,
          form.alis_adres_baslik.trim() || null,
        ]
          .filter(Boolean)
          .join(' · ')
      : `${pickupContact} · ${pickupPhone}`

  const dropLabel =
    config.varisMode === 'facility'
      ? dropFacility?.label ?? '—'
      : config.varisMode === 'gel_al'
        ? gelAl?.label ?? '—'
        : formatStructuredAddress(
            form.varis_adres,
            form.varis_bina_no,
            form.varis_kat,
            form.varis_daire_no
          ) || '—'
  const dropContact =
    form.varis_muhatabi || dropFacility?.contactName || gelAl?.contactName || '—'
  const dropPhone =
    form.varis_telefon || dropFacility?.contactPhone || gelAl?.contactPhone || '—'
  const dropContactSummary =
    config.varisMode === 'address'
      ? [
          form.varis_contact_tipi === 'kurumsal'
            ? 'Kurumsal'
            : form.varis_contact_tipi === 'bireysel'
              ? 'Bireysel'
              : null,
          form.varis_firma_adi.trim() || null,
          form.varis_vergi_dairesi.trim() || null,
          dropContact,
          form.varis_contact_tipi === 'kurumsal'
            ? form.varis_vkn || null
            : form.varis_tckn || null,
          dropPhone,
          form.varis_adres_baslik.trim() || null,
        ]
          .filter(Boolean)
          .join(' · ')
      : `${dropContact} · ${dropPhone}`

  const enabledFlags = [
    form.teslimat_kaniti_zorunlu ? 'Teslimat Kanıtı' : null,
    form.bildirim_sms ? 'SMS' : null,
    form.bildirim_email ? 'E-posta' : null,
    form.guvenli_teslimat_otp ? 'OTP' : null,
    form.yakin_kuryelere_dagit ? 'Yakın Kuryelere Dağıt' : null,
    form.aninda_sahaya_ilet ? 'Anında Sahaya İlet' : null,
  ].filter(Boolean)

  const metaFields = form.meta_fields.filter((item) => item.key.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden p-0 sm:max-w-2xl'
      >
        <div className='border-b border-slate-200 px-6 py-5'>
          <DialogHeader className='gap-2 text-left'>
            <DialogTitle className='text-xl font-semibold tracking-tight'>
              Sipariş Özeti
            </DialogTitle>
            <DialogDescription>
              Bilgileri kontrol edin. Onayladığınızda sipariş oluşturulur.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='max-h-[min(60vh,520px)] space-y-4 overflow-y-auto px-6 py-5'>
          <SummarySection title='Sipariş Bilgileri'>
            <SummaryRow label='Müşteri' value={customer} />
            <SummaryRow label='Referans No' value={form.referans_no || '—'} />
            <SummaryRow label='Sipariş Tipi' value={orderType} />
            <SummaryRow label='Rota Tipi' value={form.rota_tipi || '—'} />
            <SummaryRow
              label='Alım/Teslim Tarihi'
              value={(() => {
                if (!form.alim_tarih) return '—'
                const [year, month, day] = form.alim_tarih.split('-')
                return year && month && day
                  ? `${day}.${month}.${year}`
                  : form.alim_tarih
              })()}
            />
            <SummaryRow
              label='Alım'
              value={
                form.alim_baslangic && form.alim_bitis
                  ? formatDateTimeWindow(
                      form.alim_tarih,
                      form.alim_baslangic,
                      form.alim_bitis
                    )
                  : '—'
              }
            />
            <SummaryRow
              label='Teslim'
              value={
                form.teslim_baslangic && form.teslim_bitis
                  ? formatDateTimeWindow(
                      form.teslim_tarih || form.alim_tarih,
                      form.teslim_baslangic,
                      form.teslim_bitis
                    )
                  : '—'
              }
            />
            <SummaryRow
              label='Görev Süresi'
              value={form.gorev_suresi_dk ? `${form.gorev_suresi_dk} dk` : '—'}
            />
            <SummaryRow label='Öncelik Puanı' value={form.oncelik_puani || '—'} />
            {form.gereksinimler.length > 0 ? (
              <SummaryRow label='Gereksinimler' value={form.gereksinimler.join(', ')} />
            ) : null}
            {form.etiketler.length > 0 ? (
              <SummaryRow label='Etiketler' value={form.etiketler.join(', ')} />
            ) : null}
            {form.kurye_notu.trim() ? (
              <SummaryRow label='Kurye Notu' value={form.kurye_notu.trim()} />
            ) : null}
          </SummarySection>

          <SummarySection title='Lokasyon'>
            <SummaryRow label='Alış' value={pickupLabel} />
            <SummaryRow label='Alış Muhatap' value={pickupContactSummary} />
            <SummaryRow label='Varış' value={dropLabel} />
            <SummaryRow label='Varış Muhatap' value={dropContactSummary} />
          </SummarySection>

          <SummarySection title='Paket Bilgileri'>
            {form.paketler.map((item, index) => (
              <SummaryRow
                key={item.id}
                label={`Kalem ${index + 1}`}
                value={`${item.hacim_sinifi} · ${item.adet} adet${item.hacim ? ` · ${item.hacim} hacim` : ''}${item.agirlik_kg ? ` · ${item.agirlik_kg} kg` : ''}`}
              />
            ))}
            <SummaryRow
              label='Toplam'
              value={`${packageTotals.adet} adet · ${formatDecimal(packageTotals.hacim)} hacim · ${formatDecimal(packageTotals.agirlikKg)} kg`}
            />
          </SummarySection>

          <SummarySection title='Atama ve Güvenlik'>
            <SummaryRow
              label='Tercihler'
              value={enabledFlags.length > 0 ? enabledFlags.join(' · ') : 'Ek tercih yok'}
            />
            {form.aninda_sahaya_ilet ? (
              <SummaryRow label='Aktif Rota' value={form.aktif_rota_id || '—'} />
            ) : null}
          </SummarySection>

          {metaFields.length > 0 ? (
            <SummarySection title='Meta Veri'>
              {metaFields.map((field) => (
                <SummaryRow
                  key={field.id}
                  label={field.key.trim()}
                  value={field.value.trim() || '—'}
                />
              ))}
            </SummarySection>
          ) : null}
        </div>

        <DialogFooter className='gap-2 border-t border-slate-200 px-6 py-4 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            className='h-11 rounded-2xl px-5'
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Düzenle
          </Button>
          <Button
            type='button'
            className='h-11 rounded-2xl px-5'
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? (
              'Oluşturuluyor…'
            ) : (
              <>
                <Send className='mr-2 size-4' />
                Onayla ve Oluştur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
