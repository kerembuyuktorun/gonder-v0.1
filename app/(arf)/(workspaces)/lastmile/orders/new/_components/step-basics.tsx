'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { CreateOrderType, CustomerOption, OrderCreateFormState } from '../_types/order-create'
import type { SkillCatalogItem } from '../../../_lib/skill-catalog'
import type { OrderCreateFieldErrors } from '../_lib/order-create-helpers'
import {
  getOrderTypeFieldConfig,
  getPickupMinDate,
  getServiceDateMaxDate,
} from '../_lib/order-create-helpers'
import {
  CREATE_ORDER_TYPE_OPTIONS,
  CREATE_ROUTE_TYPE_OPTIONS,
  TAG_OPTIONS,
} from '../_mock/order-create-options'
import { Field } from './form-section'
import { MultiSelectBox } from './multi-select-box'
import { DatePickerButton, TimeWindowField } from './time-window-field'

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
  customers: CustomerOption[]
  requirementOptions: SkillCatalogItem[]
  isRequirementsLoading?: boolean
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}

export function StepBasics({
  form,
  setForm,
  customers,
  requirementOptions,
  isRequirementsLoading = false,
  fieldError,
}: Props) {
  const pickupMinDate = getPickupMinDate()
  const serviceDateMaxDate = getServiceDateMaxDate()
  const scheduleConfig = getOrderTypeFieldConfig(form.siparis_tipi)
  const hasServiceDate = Boolean(form.alim_tarih)

  const handleServiceDateChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      alim_tarih: value,
      // Same-day BE rule: delivery locked to service day
      teslim_tarih: value,
    }))
  }

  const milkRunAllowed =
    form.siparis_tipi === 'toplama' || form.siparis_tipi === 'iade'
  const routeTypeOptions = CREATE_ROUTE_TYPE_OPTIONS.filter(
    (option) => option.value !== 'Toplama Ringi' || milkRunAllowed
  )

  const handleTypeChange = (value: CreateOrderType) => {
    const allowsMilkRun = value === 'toplama' || value === 'iade'
    const nextConfig = getOrderTypeFieldConfig(value)
    setForm((previous) => ({
      ...previous,
      siparis_tipi: value,
      rota_tipi:
        !allowsMilkRun && previous.rota_tipi === 'Toplama Ringi' ? '' : previous.rota_tipi,
      // Clear times that are no longer required for the new type
      ...(nextConfig.requirePickupWindow
        ? {}
        : { alim_baslangic: '', alim_bitis: '' }),
      ...(nextConfig.requireDeliveryWindow
        ? { teslim_tarih: previous.alim_tarih }
        : { teslim_tarih: '', teslim_baslangic: '', teslim_bitis: '' }),
      alis_tesis_id: '',
      alis_adres: '',
      alis_full_address: '',
      alis_lat: null,
      alis_lon: null,
      alis_place_id: '',
      alis_bina_no: '',
      alis_kat: '',
      alis_daire_no: '',
      alis_contact_tipi: '',
      alis_firma_adi: '',
      alis_vkn: '',
      alis_vergi_dairesi: '',
      alis_tckn: '',
      alis_muhatabi: '',
      alis_telefon: '',
      alis_adres_baslik: '',
      varis_tesis_id: '',
      varis_gel_al_id: '',
      varis_adres: '',
      varis_full_address: '',
      varis_lat: null,
      varis_lon: null,
      varis_place_id: '',
      varis_bina_no: '',
      varis_kat: '',
      varis_daire_no: '',
      varis_contact_tipi: '',
      varis_firma_adi: '',
      varis_vkn: '',
      varis_vergi_dairesi: '',
      varis_tckn: '',
      varis_muhatabi: '',
      varis_telefon: '',
      varis_adres_baslik: '',
    }))
  }

  return (
    <div className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-2'>
        <Field
          label='Müşteri'
          error={fieldError('musteriId')}
          hint='Siparişin ait olduğu kurumsal müşteriyi seçin.'
        >
          <Select
            value={form.musteriId}
            onValueChange={(value) =>
              setForm((previous) => ({
                ...previous,
                musteriId: value,
                alis_tesis_id: '',
                alis_muhatabi: '',
                alis_telefon: '',
                varis_tesis_id: '',
                varis_muhatabi: '',
                varis_telefon: '',
              }))
            }
          >
            <SelectTrigger
              className={cn('w-full', fieldError('musteriId') && 'border-rose-300')}
              aria-invalid={Boolean(fieldError('musteriId'))}
            >
              <SelectValue placeholder='Müşteri seçin' />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label='Referans No (External ID)'
          htmlFor='referans_no'
          error={fieldError('referans_no')}
          hint='Müşteri veya ERP tarafındaki harici takip numarasıdır.'
        >
          <Input
            id='referans_no'
            value={form.referans_no}
            onChange={(event) => updateField(setForm, 'referans_no', event.target.value)}
            placeholder='10056789'
            aria-invalid={Boolean(fieldError('referans_no'))}
            className={fieldError('referans_no') ? 'border-rose-300' : undefined}
          />
        </Field>

        <Field
          label='Sipariş Tipi'
          error={fieldError('siparis_tipi')}
          hint='Lokasyon ve zorunlu alanlar seçiminize göre otomatik düzenlenir.'
        >
          <Select
            value={form.siparis_tipi || undefined}
            onValueChange={(value) => handleTypeChange(value as CreateOrderType)}
          >
            <SelectTrigger
              className={cn('w-full', fieldError('siparis_tipi') && 'border-rose-300')}
              aria-invalid={Boolean(fieldError('siparis_tipi'))}
            >
              <SelectValue placeholder='Sipariş tipi seçin' />
            </SelectTrigger>
            <SelectContent>
              {CREATE_ORDER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label='Rota Tipi'
          error={fieldError('rota_tipi')}
          hint={
            milkRunAllowed
              ? 'Standart, ekspres veya toplama ringi operasyon tipini belirler.'
              : 'Standart veya ekspres operasyon tipini belirler. Toplama Ringi yalnızca Toplama/İade için seçilebilir.'
          }
        >
          <Select
            key={milkRunAllowed ? 'route-with-milk-run' : 'route-standard'}
            value={
              form.rota_tipi &&
              routeTypeOptions.some((option) => option.value === form.rota_tipi)
                ? form.rota_tipi
                : undefined
            }
            onValueChange={(value) => {
              updateField(setForm, 'rota_tipi', value as OrderCreateFormState['rota_tipi'])
            }}
          >
            <SelectTrigger
              className={cn('w-full', fieldError('rota_tipi') && 'border-rose-300')}
              aria-invalid={Boolean(fieldError('rota_tipi'))}
            >
              <SelectValue placeholder='Rota tipi seçin' />
            </SelectTrigger>
            <SelectContent>
              {routeTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div
        className={cn(
          'grid items-start gap-3',
          scheduleConfig.requirePickupWindow && scheduleConfig.requireDeliveryWindow
            ? 'md:grid-cols-[minmax(11rem,0.85fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]'
            : scheduleConfig.requirePickupWindow || scheduleConfig.requireDeliveryWindow
              ? 'md:grid-cols-[minmax(11rem,0.9fr)_minmax(0,1.4fr)]'
              : 'md:grid-cols-1'
        )}
      >
        <Field
          label='Alım/Teslim Tarihi'
          required
          className='min-w-0'
          error={fieldError('alim_tarih') && !form.alim_tarih ? fieldError('alim_tarih') : undefined}
          hint='Bugünden en fazla 7 gün ileri. Alım ve teslim aynı günde.'
          htmlFor='alim_teslim_tarih'
        >
          <DatePickerButton
            id='alim_teslim_tarih'
            value={form.alim_tarih}
            invalid={Boolean(fieldError('alim_tarih') && !form.alim_tarih)}
            minDate={pickupMinDate}
            maxDate={serviceDateMaxDate}
            onChange={handleServiceDateChange}
          />
        </Field>

        {scheduleConfig.requirePickupWindow ? (
          <TimeWindowField
            label='Alım Saat Aralığı'
            required
            hideDate
            compact
            hint={
              hasServiceDate
                ? 'Başlangıç–bitiş arası en fazla 4 saat olabilir.'
                : 'Önce Alım/Teslim tarihini seçin.'
            }
            error={
              form.alim_tarih
                ? fieldError('alim_tarih')
                : undefined
            }
            date={form.alim_tarih}
            start={form.alim_baslangic}
            end={form.alim_bitis}
            onDateChange={handleServiceDateChange}
            onStartChange={(value) => updateField(setForm, 'alim_baslangic', value)}
            onEndChange={(value) => updateField(setForm, 'alim_bitis', value)}
            dateId='alim_tarih'
            startId='alim_baslangic'
            endId='alim_bitis'
            disabled={!hasServiceDate}
          />
        ) : null}

        {scheduleConfig.requireDeliveryWindow ? (
          <TimeWindowField
            label='Teslim Saat Aralığı'
            required
            hideDate
            compact
            hint={
              !hasServiceDate
                ? 'Önce Alım/Teslim tarihini seçin.'
                : scheduleConfig.requirePickupWindow
                  ? 'Teslim başlangıcı, alım bitişinden önce olamaz. Pencere en fazla 4 saat.'
                  : 'Başlangıç–bitiş arası en fazla 4 saat olabilir.'
            }
            error={fieldError('teslim_tarih')}
            date={form.teslim_tarih || form.alim_tarih}
            start={form.teslim_baslangic}
            end={form.teslim_bitis}
            onDateChange={handleServiceDateChange}
            onStartChange={(value) =>
              setForm((previous) => ({
                ...previous,
                teslim_baslangic: value,
                teslim_tarih: previous.alim_tarih || previous.teslim_tarih,
              }))
            }
            onEndChange={(value) =>
              setForm((previous) => ({
                ...previous,
                teslim_bitis: value,
                teslim_tarih: previous.alim_tarih || previous.teslim_tarih,
              }))
            }
            dateId='teslim_tarih'
            startId='teslim_baslangic'
            endId='teslim_bitis'
            disabled={!hasServiceDate}
          />
        ) : null}
      </div>

      <div className='grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Field
          label='Görev Süresi (dk)'
          htmlFor='gorev_suresi'
          required
          error={fieldError('gorev_suresi_dk')}
          hint='Lokasyonda geçirilecek tahmini süre.'
        >
          <Input
            id='gorev_suresi'
            type='number'
            min={1}
            value={form.gorev_suresi_dk}
            onChange={(event) => updateField(setForm, 'gorev_suresi_dk', event.target.value)}
            placeholder='5'
            aria-invalid={Boolean(fieldError('gorev_suresi_dk'))}
            className={fieldError('gorev_suresi_dk') ? 'border-rose-300' : undefined}
          />
        </Field>

        <Field
          label='Öncelik Puanı (0–100)'
          htmlFor='oncelik_puani'
          required
          error={fieldError('oncelik_puani')}
          hint='Atama algoritmasının aciliyet endeksi.'
        >
          <Input
            id='oncelik_puani'
            type='number'
            min={0}
            max={100}
            value={form.oncelik_puani}
            onChange={(event) => updateField(setForm, 'oncelik_puani', event.target.value)}
            placeholder='50'
            aria-invalid={Boolean(fieldError('oncelik_puani'))}
            className={fieldError('oncelik_puani') ? 'border-rose-300' : undefined}
          />
        </Field>

        <Field
          label='Gereksinimler'
          error={fieldError('gereksinimler')}
          hint='Kurulum veya özel taşıma becerileri. Atama algoritmasında skill olarak kullanılır.'
        >
          <MultiSelectBox
            invalid={Boolean(fieldError('gereksinimler'))}
            options={requirementOptions.map((item) => item.name)}
            value={form.gereksinimler}
            onChange={(next) => updateField(setForm, 'gereksinimler', next)}
            placeholder={isRequirementsLoading ? 'Gereksinimler yükleniyor…' : 'Gereksinim seçin'}
            searchPlaceholder='Gereksinim ara…'
            emptyLabel={
              isRequirementsLoading ? 'Yükleniyor…' : 'Tanımlı gereksinim bulunamadı'
            }
          />
        </Field>

        <Field label='Etiketler' hint='Sahada kuryeyi uyaran görsel rozetler.'>
          <MultiSelectBox
            options={[...TAG_OPTIONS]}
            value={form.etiketler}
            onChange={(next) => updateField(setForm, 'etiketler', next)}
            placeholder='Etiket seçin'
            searchPlaceholder='Etiket ara…'
          />
        </Field>
      </div>

      <Field
        label='Kurye Notu'
        htmlFor='kurye_notu'
        hint='Kuryenin mobil uygulamada göreceği operasyon notudur.'
      >
        <Textarea
          id='kurye_notu'
          value={form.kurye_notu}
          onChange={(event) => updateField(setForm, 'kurye_notu', event.target.value)}
          placeholder='Kapıcıya bırakılabilir, zili çalın…'
          rows={3}
        />
      </Field>
    </div>
  )
}
