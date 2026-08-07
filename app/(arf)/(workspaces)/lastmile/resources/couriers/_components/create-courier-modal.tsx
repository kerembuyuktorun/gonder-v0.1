'use client'

import type { ChangeEvent, ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, ShieldCheck, UserRound, X } from 'lucide-react'
import { Field } from '../../../orders/new/_components/form-section'
import { PhoneInput } from '../../../orders/new/_components/phone-input'
import {
  DatePickerButton,
  TimePickerButton,
} from '../../../orders/new/_components/time-window-field'
import {
  formatNationalPhone,
  isValidTrMobilePhone,
  toNationalPhoneDigits,
} from '../../../orders/new/_lib/phone'
import {
  getVehicleAssignmentConflict,
  isVehicleAssignableToCourier,
} from '../../_lib/assignment-validation'
import type {
  CourierBloodType,
  CourierDocumentMeta,
  CourierEmploymentType,
  CourierSkill,
  LastmileCourier,
} from '../_types/courier'
import type { VehicleOption } from '../_lib/vehicle-options'
import { COURIER_EMPLOYMENT_LABELS } from '../_lib/query-couriers'
import type { CourierSkillOption } from '../_types/courier'
import { CourierLegalDocumentsUploadSection } from './courier-documents-manager'
import { CourierSkillsMultiSelect } from './courier-skills-multi-select'

type StepId = 'basics' | 'documents'

export type CourierCreateFormValues = {
  ad_soyad: string
  telefon: string
  eposta: string
  tckn: string
  kan_grubu: CourierBloodType | ''
  istihdam: CourierEmploymentType | ''
  zimmetli_arac_id: string
  vardiya_baslangic: string
  vardiya_bitis: string
  yetenekler: CourierSkill[]
  ehliyet_bitis: string
  src_bitis: string
  saglik_bitis: string
  evraklar: CourierDocumentMeta[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CourierCreateFormValues) => Promise<void>
  mode?: 'create' | 'edit'
  initialCourier?: LastmileCourier | null
  initialFormValues?: CourierCreateFormValues | null
  isDetailLoading?: boolean
  vehicleOptions?: VehicleOption[]
  skillOptions?: CourierSkillOption[]
  isSkillCatalogLoading?: boolean
}

const STEPS: Array<{
  id: StepId
  title: string
  short: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'basics', title: 'Kurye Bilgileri', short: 'Kurye Bilgileri', icon: UserRound },
  { id: 'documents', title: 'Yasal Belgeler', short: 'Yasal Belgeler', icon: ShieldCheck },
]

const EMPLOYMENT_OPTIONS = Object.entries(COURIER_EMPLOYMENT_LABELS) as [
  CourierEmploymentType,
  string,
][]

const SELECT_UNSET = '__unset__'

const BLOOD_TYPE_OPTIONS: CourierBloodType[] = [
  'A Rh+',
  'A Rh-',
  'B Rh+',
  'B Rh-',
  'AB Rh+',
  'AB Rh-',
  '0 Rh+',
  '0 Rh-',
]

function timeToMinutes(value: string): number | undefined {
  if (!value) return undefined
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined
  return hour * 60 + minute
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidTckn(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 0 || digits.length === 11
}

export function buildEmptyCourierCreateValues(): CourierCreateFormValues {
  return {
    ad_soyad: '',
    telefon: '',
    eposta: '',
    tckn: '',
    kan_grubu: '',
    istihdam: '',
    zimmetli_arac_id: '',
    vardiya_baslangic: '09:00',
    vardiya_bitis: '18:00',
    yetenekler: [],
    ehliyet_bitis: '',
    src_bitis: '',
    saglik_bitis: '',
    evraklar: [],
  }
}

export function courierToFormValues(courier: LastmileCourier): CourierCreateFormValues {
  return {
    ad_soyad: courier.ad_soyad,
    telefon: courier.telefon,
    eposta: courier.eposta ?? '',
    tckn: courier.tckn ?? '',
    kan_grubu: courier.kan_grubu ?? '',
    istihdam: courier.istihdam,
    zimmetli_arac_id: courier.zimmetli_arac_id ?? '',
    vardiya_baslangic: courier.vardiya_baslangic || '09:00',
    vardiya_bitis: courier.vardiya_bitis || '18:00',
    yetenekler: [...courier.yetenekler],
    ehliyet_bitis: courier.ehliyet_bitis ?? '',
    src_bitis: courier.src_bitis ?? '',
    saglik_bitis: courier.saglik_bitis ?? '',
    evraklar: [...courier.evraklar],
  }
}

export function formatCourierPhoneDisplay(value: string) {
  const national = toNationalPhoneDigits(value)
  if (!national) return value.trim()
  return `0${formatNationalPhone(national)}`
}

export function CreateCourierModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialCourier = null,
  initialFormValues = null,
  isDetailLoading = false,
  vehicleOptions = [],
  skillOptions = [],
  isSkillCatalogLoading = false,
}: Props) {
  const [values, setValues] = useState<CourierCreateFormValues>(buildEmptyCourierCreateValues())
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const currentStep = STEPS[stepIndex]
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    if (isEdit && isDetailLoading) return
    setValues(
      isEdit && initialFormValues
        ? initialFormValues
        : isEdit && initialCourier
          ? courierToFormValues(initialCourier)
          : buildEmptyCourierCreateValues()
    )
    setStepIndex(0)
    setIsSubmitting(false)
    setShowValidation(false)
    setSubmitError(null)
  }, [initialCourier, initialFormValues, isDetailLoading, isEdit, open])

  const updateField = <K extends keyof CourierCreateFormValues>(
    key: K,
    value: CourierCreateFormValues[K]
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleInputChange =
    (key: keyof CourierCreateFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateField(key, event.target.value as CourierCreateFormValues[typeof key])
    }

  const handleVehicleChange = (value: string) => {
    const editingCourierId = isEdit && initialCourier ? initialCourier.id : null

    if (value !== '__none__') {
      const vehicle = vehicleOptions.find((item) => item.id === value)
      if (vehicle) {
        if (editingCourierId) {
          const conflict = getVehicleAssignmentConflict(vehicle, editingCourierId)
          if (conflict) {
            toast.error(conflict)
            return
          }
        } else if (vehicle.assignedCourierId) {
          toast.error(`${vehicle.plaka} başka bir kuryede zimmetli.`)
          return
        }
      }
    }

    updateField('zimmetli_arac_id', value === '__none__' ? '' : value)
  }

  const basicsErrors = useMemo(() => {
    const errors: Partial<Record<keyof CourierCreateFormValues, string>> = {}
    if (!values.ad_soyad.trim()) errors.ad_soyad = 'Ad soyad zorunludur'
    if (!values.telefon.trim()) {
      errors.telefon = 'Telefon zorunludur'
    } else if (!isValidTrMobilePhone(values.telefon)) {
      errors.telefon = 'Geçerli bir cep telefonu girin'
    }
    if (!values.eposta.trim()) {
      errors.eposta = 'E-posta zorunludur'
    } else if (!isValidEmail(values.eposta)) {
      errors.eposta = 'Geçerli bir e-posta adresi girin'
    }
    if (!isValidTckn(values.tckn)) errors.tckn = 'TCKN 11 haneli olmalıdır'
    if (!values.kan_grubu) errors.kan_grubu = 'Kan grubu zorunludur'
    if (!values.istihdam) errors.istihdam = 'İstihdam tipi zorunludur'
    if (!values.vardiya_baslangic) errors.vardiya_baslangic = 'Başlangıç saati zorunludur'
    if (!values.vardiya_bitis) errors.vardiya_bitis = 'Bitiş saati zorunludur'
    if (
      values.vardiya_baslangic &&
      values.vardiya_bitis &&
      values.vardiya_baslangic >= values.vardiya_bitis
    ) {
      errors.vardiya_bitis = 'Bitiş saati başlangıçtan sonra olmalı'
    }
    return errors
  }, [values])

  const isBasicsValid = Object.keys(basicsErrors).length === 0
  const canMoveNext = stepIndex === 0 ? isBasicsValid : true
  const canSave = isBasicsValid

  const handleNext = () => {
    if (!canMoveNext) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setStepIndex((previous) => Math.min(previous + 1, STEPS.length - 1))
  }

  const handleSave = async () => {
    if (!canSave) {
      setStepIndex(0)
      setShowValidation(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        ...values,
        ad_soyad: values.ad_soyad.trim().replace(/\s+/g, ' '),
        telefon: formatCourierPhoneDisplay(values.telefon),
        eposta: values.eposta.trim().toLowerCase(),
        tckn: values.tckn.replace(/\D/g, ''),
      })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kurye kaydedilemedi. Lütfen tekrar deneyin.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (key: keyof CourierCreateFormValues) => {
    if (!showValidation || stepIndex !== 0) return undefined
    return basicsErrors[key]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-[780px]!'
      >
        <DialogHeader className='shrink-0 space-y-0'>
          <div className='relative overflow-hidden rounded-t-[28px] border-2 border-b-0 border-lime-400 bg-slate-950 px-5 pt-4 pb-12 text-white'>
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
                  {isEdit ? 'Kurye Düzenle' : 'Kurye Ekle'}
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

          <nav aria-label='Kurye ekleme adımları' className='relative z-10 -mt-8 px-5'>
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
                        setShowValidation(false)
                        setStepIndex(index)
                      }}
                      aria-current={isActive ? 'step' : undefined}
                      className={cn(
                        'group relative flex w-full flex-col items-start gap-2 rounded-2xl border px-3 py-3 text-left transition-all duration-300',
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

        <div className='overflow-y-auto px-5 pt-3 pb-2'>
          {isDetailLoading ? (
            <div className='flex min-h-[240px] items-center justify-center text-sm text-muted-foreground'>
              Kurye bilgileri yükleniyor…
            </div>
          ) : (
            <>
          {currentStep.id === 'basics' && (
            <div className='grid gap-3 sm:grid-cols-3'>
              <Field
                label='Ad Soyad'
                htmlFor='courier-ad'
                hint='Kuryenin sistemdeki görünen adı.'
                error={fieldError('ad_soyad')}
              >
                <Input
                  id='courier-ad'
                  value={values.ad_soyad}
                  onChange={handleInputChange('ad_soyad')}
                  placeholder='Mehmet Yılmaz'
                />
              </Field>

              <Field
                label='TCKN'
                htmlFor='courier-tckn'
                hint='Opsiyonel — 11 haneli kimlik numarası.'
                error={fieldError('tckn')}
              >
                <Input
                  id='courier-tckn'
                  value={values.tckn}
                  onChange={(event) =>
                    updateField('tckn', event.target.value.replace(/\D/g, '').slice(0, 11))
                  }
                  placeholder='12345678901'
                  inputMode='numeric'
                  className='font-mono'
                />
              </Field>

              <Field
                label='Kan Grubu'
                hint='Acil durum ve saha operasyonu için.'
                error={fieldError('kan_grubu')}
              >
                <Select
                  value={values.kan_grubu || SELECT_UNSET}
                  onValueChange={(value) => {
                    if (value === SELECT_UNSET) return
                    updateField('kan_grubu', value as CourierBloodType)
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Kan grubu seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_UNSET} disabled className='hidden'>
                      Seçilmedi
                    </SelectItem>
                    {BLOOD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label='İstihdam Tipi'
                hint='Şirket personeli veya esnaf kurye ayrımı.'
                error={fieldError('istihdam')}
              >
                <Select
                  value={values.istihdam || SELECT_UNSET}
                  onValueChange={(value) => {
                    if (value === SELECT_UNSET) return
                    updateField('istihdam', value as CourierEmploymentType)
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='İstihdam seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_UNSET} disabled className='hidden'>
                      Seçilmedi
                    </SelectItem>
                    {EMPLOYMENT_OPTIONS.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label='Telefon'
                htmlFor='courier-telefon'
                hint='Operasyon iletişimi ve SMS bildirimleri için.'
                error={fieldError('telefon')}
              >
                <PhoneInput
                  id='courier-telefon'
                  value={values.telefon}
                  onChange={(next) => updateField('telefon', next)}
                  invalid={Boolean(fieldError('telefon'))}
                />
              </Field>

              <Field
                label='E-Posta'
                htmlFor='courier-eposta'
                hint='Uygulama daveti ve şifre sıfırlama için.'
                error={fieldError('eposta')}
              >
                <Input
                  id='courier-eposta'
                  type='email'
                  value={values.eposta}
                  onChange={handleInputChange('eposta')}
                  placeholder='mehmet.yilmaz@getarf.com'
                />
              </Field>

              <Field label='Zimmetli Araç' hint='Opsiyonel — sonra listeden de atanabilir.'>
                <Select
                  value={values.zimmetli_arac_id || '__none__'}
                  onValueChange={handleVehicleChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Araç seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none__'>Atanmamış</SelectItem>
                    {vehicleOptions.map((vehicle) => {
                      const editingCourierId =
                        isEdit && initialCourier ? initialCourier.id : null
                      const isDisabled = editingCourierId
                        ? !isVehicleAssignableToCourier(vehicle, editingCourierId)
                        : Boolean(vehicle.assignedCourierId)

                      return (
                        <SelectItem key={vehicle.id} value={vehicle.id} disabled={isDisabled}>
                          {vehicle.plaka}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label='Vardiya'
                hint='Mesai başlangıç ve bitiş saati.'
                error={fieldError('vardiya_bitis') ?? fieldError('vardiya_baslangic')}
              >
                <div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2'>
                  <TimePickerButton
                    id='courier-vardiya-bas'
                    value={values.vardiya_baslangic}
                    invalid={Boolean(fieldError('vardiya_baslangic'))}
                    onChange={(value) => {
                      setValues((previous) => {
                        const startMinutes = timeToMinutes(value)
                        const endMinutes = timeToMinutes(previous.vardiya_bitis)
                        let vardiya_bitis = previous.vardiya_bitis
                        if (
                          startMinutes !== undefined &&
                          endMinutes !== undefined &&
                          endMinutes <= startMinutes
                        ) {
                          const nextTotal = Math.min(startMinutes + 60, 23 * 60 + 55)
                          vardiya_bitis = `${String(Math.floor(nextTotal / 60)).padStart(2, '0')}:${String(nextTotal % 60).padStart(2, '0')}`
                        }
                        return { ...previous, vardiya_baslangic: value, vardiya_bitis }
                      })
                    }}
                  />
                  <span className='text-sm text-muted-foreground'>–</span>
                  <TimePickerButton
                    id='courier-vardiya-bit'
                    value={values.vardiya_bitis}
                    invalid={Boolean(fieldError('vardiya_bitis'))}
                    minMinutes={
                      timeToMinutes(values.vardiya_baslangic) !== undefined
                        ? (timeToMinutes(values.vardiya_baslangic) as number) + 5
                        : undefined
                    }
                    onChange={(value) => updateField('vardiya_bitis', value)}
                  />
                </div>
              </Field>

              <Field
                label='Yetenekler'
                hint='Sipariş gereksinimleriyle eşleşen yetkinlikler.'
              >
                <CourierSkillsMultiSelect
                  value={values.yetenekler}
                  onChange={(yetenekler) => updateField('yetenekler', yetenekler)}
                  options={skillOptions}
                  isLoading={isSkillCatalogLoading}
                />
              </Field>
            </div>
          )}

          {currentStep.id === 'documents' && (
            <div className='space-y-3'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='Ehliyet Bitiş'
                  htmlFor='courier-ehliyet'
                  hint='Yaklaşınca filo yöneticisine uyarı üretilir.'
                >
                  <DatePickerButton
                    id='courier-ehliyet'
                    value={values.ehliyet_bitis}
                    onChange={(value) => updateField('ehliyet_bitis', value)}
                  />
                </Field>

                <Field
                  label='SRC Belgesi Bitiş'
                  htmlFor='courier-src'
                  hint='SRC / psikoteknik geçerlilik tarihi.'
                >
                  <DatePickerButton
                    id='courier-src'
                    value={values.src_bitis}
                    onChange={(value) => updateField('src_bitis', value)}
                  />
                </Field>

                <Field
                  label='Sağlık Raporu Bitiş'
                  htmlFor='courier-saglik'
                  hint='Periyodik sağlık raporu geçerlilik tarihi.'
                  className='sm:col-span-2'
                >
                  <DatePickerButton
                    id='courier-saglik'
                    value={values.saglik_bitis}
                    onChange={(value) => updateField('saglik_bitis', value)}
                  />
                </Field>
              </div>

              <CourierLegalDocumentsUploadSection
                title='Yüklenen Yasal Belgeler'
                documents={values.evraklar}
                onChange={(evraklar) => updateField('evraklar', evraklar)}
                onUploadingChange={setIsSubmitting}
                driverId={isEdit && initialCourier ? initialCourier.id : undefined}
                persistToServer={isEdit}
              />
            </div>
          )}
            </>
          )}
        </div>

        <DialogFooter className='shrink-0 flex-col gap-2 border-t border-slate-200 px-5 py-2.5 sm:flex-col'>
          {submitError ? (
            <p className='w-full text-sm text-rose-600' role='alert'>
              {submitError}
            </p>
          ) : null}
          <div className='flex w-full flex-wrap items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setShowValidation(false)
                setStepIndex((previous) => Math.max(previous - 1, 0))
              }}
              disabled={stepIndex === 0 || isSubmitting}
            >
              Geri
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button type='button' onClick={handleNext}>
                İleri
              </Button>
            ) : (
              <Button type='button' onClick={handleSave} disabled={isSubmitting || !canSave}>
                {isSubmitting
                  ? isEdit
                    ? 'Kaydediliyor...'
                    : 'Ekleniyor...'
                  : isEdit
                    ? 'Değişiklikleri Kaydet'
                    : 'Kuryeyi Ekle'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
