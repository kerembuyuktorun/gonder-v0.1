'use client'

import type { Dispatch, SetStateAction } from 'react'
import { MapPin, Warehouse } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  AddressContactKind,
  FacilityOption,
  OrderCreateFormState,
  OrderTypeFieldConfig,
  GelAlOption,
} from '../_types/order-create'
import type { OrderCreateFieldErrors } from '../_lib/order-create-helpers'
import { ADDRESS_TITLE_OPTIONS, mockGelAlPoints } from '../_mock/order-create-options'
import { AddressSearchField } from './address-search-field'
import { AddressMapPreview } from './address-map-preview'
import { Field } from './form-section'
import { PhoneInput } from './phone-input'
import { toStoredPhoneValue } from '../_lib/phone'

function updateField<K extends keyof OrderCreateFormState>(
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>,
  key: K,
  value: OrderCreateFormState[K]
) {
  setForm((previous) => ({ ...previous, [key]: value }))
}

function LocationPreview({ address }: { address: string }) {
  return (
    <div className='flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2'>
      <MapPin className='mt-0.5 size-3.5 shrink-0 text-slate-500' />
      <p className='text-xs leading-relaxed text-muted-foreground'>{address}</p>
    </div>
  )
}

function FacilityInfoValue({ value }: { value: string }) {
  return (
    <div className='flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3'>
      <p className='truncate text-sm text-slate-700'>{value}</p>
    </div>
  )
}

function AddressContactFields({
  prefix,
  form,
  setForm,
  fieldError,
}: {
  prefix: 'alis' | 'varis'
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}) {
  const tipKey = `${prefix}_contact_tipi` as const
  const firmaKey = `${prefix}_firma_adi` as const
  const vknKey = `${prefix}_vkn` as const
  const vergiKey = `${prefix}_vergi_dairesi` as const
  const tcknKey = `${prefix}_tckn` as const
  const muhatabiKey = `${prefix}_muhatabi` as const
  const telefonKey = `${prefix}_telefon` as const
  const tip = form[tipKey]
  const sideLabel = prefix === 'alis' ? 'Alış' : 'Varış'

  const setContactTip = (next: AddressContactKind) => {
    setForm((previous) => ({
      ...previous,
      [tipKey]: next,
      [firmaKey]: '',
      [vknKey]: '',
      [vergiKey]: '',
      [tcknKey]: '',
      [muhatabiKey]: '',
      [telefonKey]: '',
    }))
  }

  return (
    <div className='space-y-4'>
      <Field
        label='Muhatap Tipi'
        required
        error={fieldError(tipKey)}
        hint='Serbest adres için önce bireysel veya kurumsal seçin.'
      >
        <div className='grid grid-cols-2 gap-2'>
          {(
            [
              { value: 'bireysel', label: 'Bireysel' },
              { value: 'kurumsal', label: 'Kurumsal' },
            ] as const
          ).map((option) => {
            const selected = tip === option.value
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => setContactTip(option.value)}
                className={cn(
                  'h-10 rounded-lg border px-3 text-sm font-medium transition',
                  selected
                    ? 'border-secondary bg-secondary text-secondary-foreground'
                    : 'border-border bg-card text-foreground hover:border-secondary/40'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </Field>

      {tip === 'kurumsal' ? (
        <>
          <Field
            label='Firma İsmi'
            required
            htmlFor={`${prefix}_firma_adi`}
            error={fieldError(firmaKey)}
          >
            <Input
              id={`${prefix}_firma_adi`}
              value={form[firmaKey]}
              onChange={(event) => updateField(setForm, firmaKey, event.target.value)}
              placeholder='Firma ünvanı'
              aria-invalid={Boolean(fieldError(firmaKey))}
              className={fieldError(firmaKey) ? 'border-rose-300' : undefined}
            />
          </Field>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field
              label='VKN'
              required
              htmlFor={`${prefix}_vkn`}
              error={fieldError(vknKey)}
              hint='10 haneli vergi kimlik numarası.'
            >
              <Input
                id={`${prefix}_vkn`}
                inputMode='numeric'
                maxLength={10}
                value={form[vknKey]}
                onChange={(event) =>
                  updateField(setForm, vknKey, event.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder='1234567890'
                aria-invalid={Boolean(fieldError(vknKey))}
                className={fieldError(vknKey) ? 'border-rose-300' : undefined}
              />
            </Field>
            <Field
              label='Vergi Dairesi'
              required
              htmlFor={`${prefix}_vergi_dairesi`}
              error={fieldError(vergiKey)}
            >
              <Input
                id={`${prefix}_vergi_dairesi`}
                value={form[vergiKey]}
                onChange={(event) => updateField(setForm, vergiKey, event.target.value)}
                placeholder='Örn. Kadıköy'
                aria-invalid={Boolean(fieldError(vergiKey))}
                className={fieldError(vergiKey) ? 'border-rose-300' : undefined}
              />
            </Field>
          </div>
          <Field
            label={`${sideLabel} Muhatabı`}
            required
            htmlFor={`${prefix}_muhatabi`}
            error={fieldError(muhatabiKey)}
            hint={`${sideLabel} noktasındaki yetkili kişi.`}
          >
            <Input
              id={`${prefix}_muhatabi`}
              value={form[muhatabiKey]}
              onChange={(event) => updateField(setForm, muhatabiKey, event.target.value)}
              placeholder='Ad Soyad'
              aria-invalid={Boolean(fieldError(muhatabiKey))}
              className={fieldError(muhatabiKey) ? 'border-rose-300' : undefined}
            />
          </Field>
          <Field
            label={`${sideLabel} İletişim`}
            required
            htmlFor={`${prefix}_telefon`}
            error={fieldError(telefonKey)}
            hint='Muhataba ulaşmak için telefon numarası.'
          >
            <PhoneInput
              id={`${prefix}_telefon`}
              value={form[telefonKey]}
              onChange={(next) => updateField(setForm, telefonKey, next)}
              invalid={Boolean(fieldError(telefonKey))}
            />
          </Field>
        </>
      ) : null}

      {tip === 'bireysel' ? (
        <>
          <Field
            label='Ad Soyad'
            required
            htmlFor={`${prefix}_muhatabi`}
            error={fieldError(muhatabiKey)}
          >
            <Input
              id={`${prefix}_muhatabi`}
              value={form[muhatabiKey]}
              onChange={(event) => updateField(setForm, muhatabiKey, event.target.value)}
              placeholder='Ad Soyad'
              aria-invalid={Boolean(fieldError(muhatabiKey))}
              className={fieldError(muhatabiKey) ? 'border-rose-300' : undefined}
            />
          </Field>
          <Field
            label='TCKN'
            required
            htmlFor={`${prefix}_tckn`}
            error={fieldError(tcknKey)}
            hint='11 haneli T.C. kimlik numarası.'
          >
            <Input
              id={`${prefix}_tckn`}
              inputMode='numeric'
              maxLength={11}
              value={form[tcknKey]}
              onChange={(event) =>
                updateField(setForm, tcknKey, event.target.value.replace(/\D/g, '').slice(0, 11))
              }
              placeholder='12345678901'
              aria-invalid={Boolean(fieldError(tcknKey))}
              className={fieldError(tcknKey) ? 'border-rose-300' : undefined}
            />
          </Field>
          <Field
            label='Telefon'
            required
            htmlFor={`${prefix}_telefon`}
            error={fieldError(telefonKey)}
          >
            <PhoneInput
              id={`${prefix}_telefon`}
              value={form[telefonKey]}
              onChange={(next) => updateField(setForm, telefonKey, next)}
              invalid={Boolean(fieldError(telefonKey))}
            />
          </Field>
        </>
      ) : null}

      {tip ? (
        <AddressDetailFields
          prefix={prefix}
          form={form}
          setForm={setForm}
          fieldError={fieldError}
        />
      ) : null}
    </div>
  )
}

function AddressDetailFields({
  prefix,
  form,
  setForm,
  fieldError,
}: {
  prefix: 'alis' | 'varis'
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}) {
  const baslikKey = `${prefix}_adres_baslik` as const
  const adresKey = `${prefix}_adres` as const
  const binaKey = `${prefix}_bina_no` as const
  const katKey = `${prefix}_kat` as const
  const daireKey = `${prefix}_daire_no` as const
  const latKey = `${prefix}_lat` as const
  const lonKey = `${prefix}_lon` as const
  const selected = Boolean(form[adresKey].trim())

  return (
    <>
      <Field
        label='Adres Başlığı'
        required
        error={fieldError(baslikKey)}
        hint='Adresin kısa adını listeden seçin.'
      >
        <Select
          value={form[baslikKey] || undefined}
          onValueChange={(value) => updateField(setForm, baslikKey, value)}
        >
          <SelectTrigger
            className={cn('w-full', fieldError(baslikKey) && 'border-rose-300')}
            aria-invalid={Boolean(fieldError(baslikKey))}
          >
            <SelectValue placeholder='Adres başlığı seçin' />
          </SelectTrigger>
          <SelectContent>
            {ADDRESS_TITLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label='Adres'
        required
        htmlFor={`${prefix}_adres`}
        error={fieldError(adresKey)}
        hint='Mahalle, sokak veya cadde arayıp listeden seçin.'
      >
        <AddressSearchField
          id={`${prefix}_adres`}
          value={form[adresKey]}
          invalid={Boolean(fieldError(adresKey))}
          onSelect={(result) =>
            setForm((previous) => ({
              ...previous,
              [adresKey]: result.label,
              [`${prefix}_full_address`]: result.fullAddress,
              [`${prefix}_lat`]: result.latitude,
              [`${prefix}_lon`]: result.longitude,
              [`${prefix}_place_id`]: result.placeId ?? '',
            }))
          }
          onClear={() =>
            setForm((previous) => ({
              ...previous,
              [adresKey]: '',
              [`${prefix}_full_address`]: '',
              [`${prefix}_lat`]: null,
              [`${prefix}_lon`]: null,
              [`${prefix}_place_id`]: '',
              [binaKey]: '',
              [katKey]: '',
              [daireKey]: '',
            }))
          }
        />
      </Field>

      {selected ? (
        <>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field
              label='Bina No'
              required
              htmlFor={`${prefix}_bina_no`}
              error={fieldError(binaKey)}
            >
              <Input
                id={`${prefix}_bina_no`}
                value={form[binaKey]}
                onChange={(event) => updateField(setForm, binaKey, event.target.value)}
                placeholder='12A'
                aria-invalid={Boolean(fieldError(binaKey))}
                className={fieldError(binaKey) ? 'border-rose-300' : undefined}
              />
            </Field>
            <Field label='Kat' htmlFor={`${prefix}_kat`} error={fieldError(katKey)}>
              <Input
                id={`${prefix}_kat`}
                inputMode='numeric'
                value={form[katKey]}
                onChange={(event) =>
                  updateField(setForm, katKey, event.target.value.replace(/\D/g, ''))
                }
                placeholder='3'
                aria-invalid={Boolean(fieldError(katKey))}
                className={fieldError(katKey) ? 'border-rose-300' : undefined}
              />
            </Field>
            <Field
              label='Daire No'
              htmlFor={`${prefix}_daire_no`}
              error={fieldError(daireKey)}
            >
              <Input
                id={`${prefix}_daire_no`}
                value={form[daireKey]}
                onChange={(event) => updateField(setForm, daireKey, event.target.value)}
                placeholder='8'
                aria-invalid={Boolean(fieldError(daireKey))}
                className={fieldError(daireKey) ? 'border-rose-300' : undefined}
              />
            </Field>
          </div>

          <AddressMapPreview
            latitude={form[latKey]}
            longitude={form[lonKey]}
            title={form[adresKey]}
            kind="home"
            tone={prefix === 'alis' ? 'sky' : 'emerald'}
          />
        </>
      ) : null}
    </>
  )
}

type Props = {
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
  config: OrderTypeFieldConfig
  customerFacilities: FacilityOption[]
  fieldError: (key: keyof OrderCreateFieldErrors) => string | undefined
}

export function StepLocations({
  form,
  setForm,
  config,
  customerFacilities,
  fieldError,
}: Props) {
  const selectedPickupFacility = customerFacilities.find((item) => item.id === form.alis_tesis_id)
  const selectedDropFacility = customerFacilities.find((item) => item.id === form.varis_tesis_id)
  const selectedGelAl = mockGelAlPoints.find((item) => item.id === form.varis_gel_al_id) as
    | GelAlOption
    | undefined

  return (
    <div className='grid items-start gap-6 lg:grid-cols-2'>
        <div className='space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:sticky lg:top-4'>
          <div className='flex items-center gap-3 border-b border-slate-200 pb-4'>
            <span className='flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600'>
              <Warehouse className='size-[18px]' />
            </span>
            <div className='min-w-0'>
              <h3 className='text-[15px] font-semibold tracking-tight text-slate-900'>
                Alış Noktası
              </h3>
            </div>
          </div>

          {config.alisMode === 'facility' && (
            <div className='space-y-4'>
              <Field
                label='Adres Seçimi'
                required
                error={fieldError('alis_tesis_id')}
                hint={
                  !form.musteriId
                    ? 'Önce müşteri seçin.'
                    : customerFacilities.length === 0
                      ? 'Bu müşteri için tesis tanımlı değil.'
                      : 'Alış noktası müşteriye tanımlı tesislerden seçilir.'
                }
              >
                <Select
                  value={form.alis_tesis_id}
                  onValueChange={(value) => {
                    const facility = customerFacilities.find((item) => item.id === value)
                    setForm((previous) => ({
                      ...previous,
                      alis_tesis_id: value,
                      alis_muhatabi: facility?.contactName ?? '',
                      alis_telefon: facility?.contactPhone
                        ? toStoredPhoneValue(facility.contactPhone)
                        : '',
                    }))
                  }}
                  disabled={!form.musteriId || customerFacilities.length === 0}
                >
                  <SelectTrigger
                    className={cn('w-full', fieldError('alis_tesis_id') && 'border-rose-300')}
                    aria-invalid={Boolean(fieldError('alis_tesis_id'))}
                  >
                    <SelectValue placeholder='Depo / şube seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {customerFacilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedPickupFacility ? (
                <>
                  <Field
                    label='Adres'
                    hint='Tesis kaydındaki adrestir; tesis tanımlarında yönetilir.'
                  >
                    <LocationPreview address={selectedPickupFacility.address} />
                  </Field>
                  <AddressMapPreview
                    latitude={selectedPickupFacility.latitude}
                    longitude={selectedPickupFacility.longitude}
                    title={selectedPickupFacility.label}
                    kind="facility"
                    tone="sky"
                  />
                  <Field
                    label='Alış Muhatabı'
                    hint='Tesis kaydındaki muhatap bilgisidir.'
                  >
                    <FacilityInfoValue value={selectedPickupFacility.contactName} />
                  </Field>
                  <Field
                    label='Alış İletişim'
                    hint='Tesis kaydındaki iletişim bilgisidir.'
                  >
                    <FacilityInfoValue
                      value={toStoredPhoneValue(selectedPickupFacility.contactPhone)}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          )}

          {config.alisMode === 'address' && (
            <AddressContactFields
              prefix='alis'
              form={form}
              setForm={setForm}
              fieldError={fieldError}
            />
          )}
        </div>

        <div className='space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs'>
          <div className='flex items-center gap-3 border-b border-slate-200 pb-4'>
            <span className='flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600'>
              <MapPin className='size-[18px]' />
            </span>
            <div className='min-w-0'>
              <h3 className='text-[15px] font-semibold tracking-tight text-slate-900'>
                Varış Noktası
              </h3>
            </div>
          </div>

          {config.varisMode === 'facility' && (
            <div className='space-y-4'>
              <Field
                label='Adres Seçimi'
                required
                error={fieldError('varis_tesis_id')}
                hint={
                  !form.musteriId
                    ? 'Önce müşteri seçin.'
                    : customerFacilities.length === 0
                      ? 'Bu müşteri için tesis tanımlı değil.'
                      : 'Varış noktası müşteriye tanımlı tesislerden seçilir.'
                }
              >
                <Select
                  value={form.varis_tesis_id}
                  onValueChange={(value) => {
                    const facility = customerFacilities.find((item) => item.id === value)
                    setForm((previous) => ({
                      ...previous,
                      varis_tesis_id: value,
                      varis_muhatabi: facility?.contactName ?? '',
                      varis_telefon: facility?.contactPhone
                        ? toStoredPhoneValue(facility.contactPhone)
                        : '',
                    }))
                  }}
                  disabled={!form.musteriId || customerFacilities.length === 0}
                >
                  <SelectTrigger
                    className={cn('w-full', fieldError('varis_tesis_id') && 'border-rose-300')}
                    aria-invalid={Boolean(fieldError('varis_tesis_id'))}
                  >
                    <SelectValue placeholder='Depo / şube seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {customerFacilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedDropFacility ? (
                <>
                  <Field
                    label='Adres'
                    hint='Tesis kaydındaki adrestir; tesis tanımlarında yönetilir.'
                  >
                    <LocationPreview address={selectedDropFacility.address} />
                  </Field>
                  <AddressMapPreview
                    latitude={selectedDropFacility.latitude}
                    longitude={selectedDropFacility.longitude}
                    title={selectedDropFacility.label}
                    kind="facility"
                    tone="emerald"
                  />
                  <Field
                    label='Varış Muhatabı'
                    hint='Tesis kaydındaki muhatap bilgisidir.'
                  >
                    <FacilityInfoValue value={selectedDropFacility.contactName} />
                  </Field>
                  <Field
                    label='Varış İletişim'
                    hint='Tesis kaydındaki iletişim bilgisidir.'
                  >
                    <FacilityInfoValue
                      value={toStoredPhoneValue(selectedDropFacility.contactPhone)}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          )}

          {config.varisMode === 'gel_al' && (
            <div className='space-y-4'>
              <Field
                label='Gel-Al Noktası'
                required
                error={fieldError('varis_gel_al_id')}
                hint='Varış, tanımlı Gel-Al noktalarından seçilir. Kaynak yapı backend netleşince bağlanacak.'
              >
                <Select
                  value={form.varis_gel_al_id}
                  onValueChange={(value) => {
                    const point = mockGelAlPoints.find((item) => item.id === value)
                    setForm((previous) => ({
                      ...previous,
                      varis_gel_al_id: value,
                      varis_muhatabi: point?.contactName ?? '',
                      varis_telefon: point?.contactPhone
                        ? toStoredPhoneValue(point.contactPhone)
                        : '',
                    }))
                  }}
                >
                  <SelectTrigger
                    className={cn('w-full', fieldError('varis_gel_al_id') && 'border-rose-300')}
                    aria-invalid={Boolean(fieldError('varis_gel_al_id'))}
                  >
                    <SelectValue placeholder='Gel-Al noktası seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGelAlPoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        {point.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedGelAl ? (
                <>
                  <Field
                    label='Adres'
                    hint='Gel-Al kaydındaki adrestir; nokta tanımlarında yönetilir.'
                  >
                    <LocationPreview address={selectedGelAl.address} />
                  </Field>
                  <Field
                    label='Varış Muhatabı'
                    hint='Gel-Al kaydındaki muhatap bilgisidir.'
                  >
                    <FacilityInfoValue value={selectedGelAl.contactName} />
                  </Field>
                  <Field
                    label='Varış İletişim'
                    hint='Gel-Al kaydındaki iletişim bilgisidir.'
                  >
                    <FacilityInfoValue value={toStoredPhoneValue(selectedGelAl.contactPhone)} />
                  </Field>
                </>
              ) : null}
            </div>
          )}

          {config.varisMode === 'address' && (
            <>
              <AddressContactFields
                prefix='varis'
                form={form}
                setForm={setForm}
                fieldError={fieldError}
              />
            </>
          )}
        </div>
    </div>
  )
}
