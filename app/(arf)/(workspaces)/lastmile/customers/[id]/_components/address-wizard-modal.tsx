'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Check, MapPinned, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasOperationRegions } from '../_lib/operation-scope-helpers'
import { AddressSearchField } from '../../../orders/new/_components/address-search-field'
import { Field } from '../../../orders/new/_components/form-section'
import { PhoneInput } from '../../../orders/new/_components/phone-input'
import { isValidTrMobilePhone } from '../../../orders/new/_lib/phone'
import type { CustomerAddress, OperationScopeRow } from '../_types/customer-detail'
import { OperationScopeEditor } from './operation-scope-editor'
import { InfoHint } from './info-hint'

type StepId = 'address' | 'region'

const STEPS: Array<{
  id: StepId
  short: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'address', short: 'Adres', icon: MapPin },
  { id: 'region', short: 'Operasyon Bölgesi', icon: MapPinned },
]

export type AddressWizardFormValues = {
  baslik: string
  adres: string
  bina_no: string
  kat_no: string
  daire_no: string
  muhatap_ad_soyad: string
  muhatap_telefon: string
  lat: number | null
  lng: number | null
  giden_teslimat_scopes: OperationScopeRow[]
  gelen_teslimat_scopes: OperationScopeRow[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (address: CustomerAddress) => void | Promise<void>
  editAddress?: CustomerAddress | null
  startOnRegionStep?: boolean
}

function emptyValues(): AddressWizardFormValues {
  return {
    baslik: '',
    adres: '',
    bina_no: '',
    kat_no: '',
    daire_no: '',
    muhatap_ad_soyad: '',
    muhatap_telefon: '',
    lat: null,
    lng: null,
    giden_teslimat_scopes: [],
    gelen_teslimat_scopes: [],
  }
}

function fromAddress(address: CustomerAddress): AddressWizardFormValues {
  return {
    baslik: address.baslik,
    adres: address.adres,
    bina_no: address.bina_no,
    kat_no: address.kat_no,
    daire_no: address.daire_no,
    muhatap_ad_soyad: address.muhatap_ad_soyad,
    muhatap_telefon: address.muhatap_telefon,
    lat: address.lat,
    lng: address.lng,
    giden_teslimat_scopes: address.giden_teslimat_scopes,
    gelen_teslimat_scopes: address.gelen_teslimat_scopes,
  }
}

export function AddressWizardModal({
  open,
  onOpenChange,
  onSaved,
  editAddress = null,
  startOnRegionStep = false,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<AddressWizardFormValues>(emptyValues)
  const [showValidation, setShowValidation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(editAddress)
  const currentStep = STEPS[stepIndex]

  useEffect(() => {
    if (!open) return
    setShowValidation(false)
    setIsSubmitting(false)
    if (editAddress) {
      setValues(fromAddress(editAddress))
      setStepIndex(startOnRegionStep || !editAddress.operasyon_bolgesi_tanimli ? 1 : 0)
    } else {
      setValues(emptyValues())
      setStepIndex(0)
    }
  }, [open, editAddress, startOnRegionStep])

  function patch(partial: Partial<AddressWizardFormValues>) {
    setValues((previous) => ({ ...previous, ...partial }))
  }

  const addressErrors: Partial<Record<keyof AddressWizardFormValues, string>> = {}
  if (!values.baslik.trim()) addressErrors.baslik = 'Adres başlığı zorunlu'
  if (!values.adres.trim() || values.lat == null || values.lng == null) {
    addressErrors.adres = 'Listeden bir adres seçin'
  }
  if (!values.bina_no.trim()) addressErrors.bina_no = 'Bina no zorunlu'
  if (!values.muhatap_ad_soyad.trim()) {
    addressErrors.muhatap_ad_soyad = 'Muhatap adı zorunlu'
  }
  if (!values.muhatap_telefon.trim()) {
    addressErrors.muhatap_telefon = 'Telefon zorunlu'
  } else if (!isValidTrMobilePhone(values.muhatap_telefon)) {
    addressErrors.muhatap_telefon = 'Geçerli bir cep telefonu girin'
  }

  const regionErrors: Partial<Record<'giden_teslimat_scopes' | 'gelen_teslimat_scopes', string>> =
    {}
  if (values.giden_teslimat_scopes.length === 0) {
    regionErrors.giden_teslimat_scopes = 'En az bir giden teslimat kapsamı ekleyin'
  }

  const isAddressStepValid = Object.keys(addressErrors).length === 0
  const isRegionStepValid = Object.keys(regionErrors).length === 0

  function fieldError(key: keyof AddressWizardFormValues) {
    if (!showValidation || stepIndex !== 0) return undefined
    return addressErrors[key]
  }

  async function handleNext() {
    if (stepIndex === 0) {
      if (!isAddressStepValid) {
        setShowValidation(true)
        return
      }
      setShowValidation(false)
      setStepIndex(1)
      return
    }

    if (!isRegionStepValid) {
      setShowValidation(true)
      return
    }

    if (values.lat == null || values.lng == null) return
    setIsSubmitting(true)
    const id = editAddress?.id ?? `addr-pending`
    try {
      await onSaved({
        id,
        baslik: values.baslik.trim(),
        adres: values.adres.trim(),
        bina_no: values.bina_no.trim(),
        kat_no: values.kat_no.trim() || '-',
        daire_no: values.daire_no.trim() || '-',
        muhatap_ad_soyad: values.muhatap_ad_soyad.trim(),
        muhatap_telefon: values.muhatap_telefon.trim(),
        aktif: editAddress?.aktif ?? true,
        operasyon_bolgesi_tanimli: hasOperationRegions(
          values.giden_teslimat_scopes,
          values.gelen_teslimat_scopes
        ),
        giden_teslimat_scopes: values.giden_teslimat_scopes,
        gelen_teslimat_scopes: values.gelen_teslimat_scopes,
        lat: values.lat,
        lng: values.lng,
      })
      onOpenChange(false)
    } catch {
      // Parent shows toast; keep modal open
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='max-h-[92vh] overflow-y-auto rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-[760px]!'
      >
        <DialogHeader className='space-y-0'>
          <div className='relative overflow-hidden rounded-t-[28px] border-2 border-b-0 border-lime-400 bg-slate-950 px-5 pt-5 pb-14 text-white'>
            <div
              aria-hidden
              className='pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-lime-300/20 blur-3xl'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute -bottom-20 left-10 size-40 rounded-full bg-sky-400/15 blur-3xl'
            />
            <div className='relative flex items-start justify-between gap-3'>
              <div>
                <p className='text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase'>
                  Adım {stepIndex + 1} / {STEPS.length}
                </p>
                <DialogTitle className='mt-1 text-2xl font-semibold tracking-tight text-white'>
                  {isEdit ? 'Adresi Düzenle' : 'Adres Ekle'}
                </DialogTitle>
              </div>
              <DialogClose asChild>
                <button
                  type='button'
                  className='inline-flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
                  aria-label='Kapat'
                >
                  <X className='size-5' />
                </button>
              </DialogClose>
            </div>
          </div>

          <nav aria-label='Adres ekleme adımları' className='relative z-10 -mt-9 px-5'>
            <ol className='grid grid-cols-2 gap-2.5'>
              {STEPS.map((step, index) => {
                const isActive = index === stepIndex
                const isCompleted = index < stepIndex
                const Icon = step.icon

                return (
                  <li key={step.id}>
                    <button
                      type='button'
                      onClick={() => {
                        if (index === 1 && !isAddressStepValid) {
                          setShowValidation(true)
                          return
                        }
                        setShowValidation(false)
                        setStepIndex(index)
                      }}
                      aria-current={isActive ? 'step' : undefined}
                      className={cn(
                        'group relative flex w-full flex-col items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-all duration-300',
                        isActive
                          ? 'border-slate-900/10 bg-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5'
                          : 'border-slate-200/80 bg-slate-50/90 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                      )}
                    >
                      <span className='flex w-full items-center justify-between gap-2'>
                        <span
                          className={cn(
                            'relative flex size-9 items-center justify-center rounded-xl transition-colors',
                            isActive
                              ? 'bg-slate-900 text-white'
                              : isCompleted
                                ? 'bg-lime-100 text-slate-900'
                                : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 group-hover:text-slate-700'
                          )}
                        >
                          <Icon className='size-4' />
                          {isCompleted && !isActive ? (
                            <span className='absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white'>
                              <Check className='size-2.5 stroke-3' />
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] font-bold tabular-nums',
                            isActive ? 'text-slate-400' : 'text-slate-300'
                          )}
                        >
                          0{index + 1}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold leading-tight',
                          isActive ? 'text-slate-900' : 'text-slate-600'
                        )}
                      >
                        {step.short}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </DialogHeader>

        <div className='px-5 pt-4 pb-5'>
          {currentStep.id === 'address' ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              <Field
                label='Adres Başlığı'
                htmlFor='addr-baslik'
                error={fieldError('baslik')}
                className='sm:col-span-2'
              >
                <Input
                  id='addr-baslik'
                  value={values.baslik}
                  placeholder='Örn. Kadıköy Ana Depo'
                  onChange={(event) => patch({ baslik: event.target.value })}
                />
              </Field>

              <Field
                label='Adres'
                htmlFor='addr-search'
                hint='Autocomplete listesinden seçin; koordinat otomatik gelir.'
                error={fieldError('adres')}
                className='sm:col-span-2'
              >
                <AddressSearchField
                  id='addr-search'
                  value={values.adres}
                  invalid={Boolean(fieldError('adres'))}
                  onSelect={(result) =>
                    patch({
                      adres: result.fullAddress || result.label,
                      lat: result.latitude,
                      lng: result.longitude,
                    })
                  }
                  onClear={() => patch({ adres: '', lat: null, lng: null })}
                />
              </Field>

              <Field label='Bina No' htmlFor='addr-bina' error={fieldError('bina_no')}>
                <Input
                  id='addr-bina'
                  value={values.bina_no}
                  placeholder='12'
                  onChange={(event) => patch({ bina_no: event.target.value })}
                />
              </Field>
              <Field label='Kat No' htmlFor='addr-kat'>
                <Input
                  id='addr-kat'
                  value={values.kat_no}
                  placeholder='3'
                  onChange={(event) => patch({ kat_no: event.target.value })}
                />
              </Field>
              <Field label='Daire No' htmlFor='addr-daire'>
                <Input
                  id='addr-daire'
                  value={values.daire_no}
                  placeholder='5'
                  onChange={(event) => patch({ daire_no: event.target.value })}
                />
              </Field>
              <div className='hidden sm:block' />

              <Field
                label='Muhatap Ad Soyad'
                htmlFor='addr-muhatap'
                error={fieldError('muhatap_ad_soyad')}
              >
                <Input
                  id='addr-muhatap'
                  value={values.muhatap_ad_soyad}
                  placeholder='Ad Soyad'
                  onChange={(event) => patch({ muhatap_ad_soyad: event.target.value })}
                />
              </Field>
              <Field
                label='Muhatap Telefonu'
                htmlFor='addr-telefon'
                error={fieldError('muhatap_telefon')}
              >
                <PhoneInput
                  id='addr-telefon'
                  value={values.muhatap_telefon}
                  invalid={Boolean(fieldError('muhatap_telefon'))}
                  onChange={(value) => patch({ muhatap_telefon: value })}
                />
              </Field>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-sm font-medium text-slate-900'>{values.baslik || 'Adres'}</p>
                  <InfoHint
                    label={values.baslik || 'Adres'}
                    content='Kapsamı il → ilçe → mahalle düzeyinde satır satır ekleyin. Her satır tek bir ilçeyi temsil eder; mahalle listesinden tek tek veya “Tümünü Seç” ile ilçedeki tüm mahalleleri işaretleyebilirsiniz. Örnek: Beşiktaş ilçesinin tamamı bir satır, Bağcılar ilçesinden yalnızca Mahmutbey ayrı bir satır olabilir.'
                  />
                </div>
                <p className='mt-0.5 text-xs text-slate-500'>
                  {[
                    values.adres,
                    values.bina_no && `No:${values.bina_no}`,
                    values.kat_no && `Kat:${values.kat_no}`,
                    values.daire_no && `Daire:${values.daire_no}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              <OperationScopeEditor
                title='Giden teslimat kapsamı'
                tooltip='Bu adresten alım yapan kuryenin siparişi teslim edebileceği sınırlar. Depo veya mağazadan çıkan gönderiler yalnızca burada tanımladığınız il, ilçe ve mahallelere bırakılabilir.'
                scopes={values.giden_teslimat_scopes}
                onChange={(giden_teslimat_scopes) => patch({ giden_teslimat_scopes })}
                error={showValidation ? regionErrors.giden_teslimat_scopes : undefined}
              />

              <OperationScopeEditor
                title='Gelen teslimat kapsamı'
                tooltip='Burada seçtiğiniz il, ilçe ve mahallelerden alınan paketler bu depoya (operasyon noktasına) teslim edilebilir. Örneğin Bağcılar–Mahmutbey ve çevresinden toplanan gönderiler bu adrese kabul edilir; kapsam dışı bölgelerden gelen paketler ise bu noktaya teslim edilemez.'
                scopes={values.gelen_teslimat_scopes}
                onChange={(gelen_teslimat_scopes) => patch({ gelen_teslimat_scopes })}
              />
            </div>
          )}
        </div>

        <DialogFooter className='border-t border-slate-200 px-6 py-4'>
          <Button
            type='button'
            variant='outline'
            disabled={stepIndex === 0 || isSubmitting}
            onClick={() => {
              setShowValidation(false)
              setStepIndex(0)
            }}
          >
            Geri
          </Button>
          <Button type='button' disabled={isSubmitting} onClick={handleNext}>
            {stepIndex < STEPS.length - 1
              ? 'Devam'
              : isEdit
                ? 'Kaydet'
                : 'Adresi ve Bölgeyi Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
