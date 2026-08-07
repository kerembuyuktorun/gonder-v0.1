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
import { Building2, Check, ShieldCheck, UserRound, X } from 'lucide-react'
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
import { Field } from '../../orders/new/_components/form-section'
import { PhoneInput } from '../../orders/new/_components/phone-input'
import { ToggleRow } from '../../orders/new/_components/toggle-row'
import { isValidTrMobilePhone } from '../../orders/new/_lib/phone'
import type { CustomerSector, LastmileCustomer } from '../_types/customer'
import { GeoCascadeFields } from './geo-cascade-fields'

type StepId = 'company' | 'contact' | 'preferences'

export type CustomerCreateFormValues = {
  firma_unvani: string
  marka_kisa_ad: string
  vkn: string
  vergi_dairesi: string
  sektor: CustomerSector | ''
  ana_yetkili: string
  ana_yetkili_unvan: string
  telefon: string
  email: string
  fatura_merkez_adresi: string
  cityId: string
  districtId: string
  neighbourId: string
  il: string
  ilce: string
  mahalle: string
  bildirim_sms: boolean
  bildirim_email: boolean
  teslimat_kaniti_zorunlu: boolean
  guvenli_teslimat_otp: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** create | edit — BE yazma; hata durumunda Error fırlatır */
  onSubmit: (values: CustomerCreateFormValues) => Promise<void>
  mode?: 'create' | 'edit'
  initialCustomer?: LastmileCustomer | null
}

const STEPS: Array<{
  id: StepId
  title: string
  short: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    id: 'company',
    title: 'Temel Firma Bilgileri',
    short: 'Firma',
    icon: Building2,
  },
  {
    id: 'contact',
    title: 'Merkez İletişim ve Adres',
    short: 'İletişim',
    icon: UserRound,
  },
  {
    id: 'preferences',
    title: 'Sistem ve Güvenlik',
    short: 'Güvenlik',
    icon: ShieldCheck,
  },
]

const SECTOR_OPTIONS: CustomerSector[] = [
  'E-Ticaret',
  'Hazır Yemek',
  'Yedek Parça',
  'Teknoloji',
  'Gıda',
  'Sağlık/Medikal',
  'Perakende',
  'Diğer',
]

export function buildEmptyCustomerCreateValues(): CustomerCreateFormValues {
  return {
    firma_unvani: '',
    marka_kisa_ad: '',
    vkn: '',
    vergi_dairesi: '',
    sektor: '',
    ana_yetkili: '',
    ana_yetkili_unvan: '',
    telefon: '',
    email: '',
    fatura_merkez_adresi: '',
    cityId: '',
    districtId: '',
    neighbourId: '',
    il: '',
    ilce: '',
    mahalle: '',
    bildirim_sms: false,
    bildirim_email: false,
    teslimat_kaniti_zorunlu: false,
    guvenli_teslimat_otp: false,
  }
}

export function customerToFormValues(customer: LastmileCustomer): CustomerCreateFormValues {
  return {
    firma_unvani: customer.firma_unvani,
    marka_kisa_ad: customer.marka_kisa_ad,
    vkn: customer.vkn,
    vergi_dairesi: customer.vergi_dairesi,
    sektor: customer.sektor,
    ana_yetkili: customer.ana_yetkili,
    ana_yetkili_unvan: customer.ana_yetkili_unvan,
    telefon: customer.telefon,
    email: customer.email,
    fatura_merkez_adresi: customer.fatura_merkez_adresi,
    cityId: customer.cityId ?? '',
    districtId: customer.districtId ?? '',
    neighbourId: customer.neighbourId ?? '',
    il: customer.il,
    ilce: customer.ilce,
    mahalle: customer.mahalle ?? '',
    bildirim_sms: customer.bildirim_sms,
    bildirim_email: customer.bildirim_email,
    teslimat_kaniti_zorunlu: customer.teslimat_kaniti_zorunlu,
    guvenli_teslimat_otp: customer.guvenli_teslimat_otp,
  }
}

function normalizeTaxId(value: string) {
  return value.replace(/\D/g, '')
}

function isValidTaxId(value: string) {
  const digits = normalizeTaxId(value)
  return digits.length === 10 || digits.length === 11
}

export function CreateCustomerModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialCustomer = null,
}: Props) {
  const [values, setValues] = useState<CustomerCreateFormValues>(buildEmptyCustomerCreateValues())
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const currentStep = STEPS[stepIndex]
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    setValues(
      isEdit && initialCustomer
        ? customerToFormValues(initialCustomer)
        : buildEmptyCustomerCreateValues()
    )
    setStepIndex(0)
    setIsSubmitting(false)
    setShowValidation(false)
    setSubmitError(null)
  }, [initialCustomer, isEdit, open])

  const updateField = <K extends keyof CustomerCreateFormValues>(
    key: K,
    value: CustomerCreateFormValues[K]
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleInputChange =
    (key: keyof CustomerCreateFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateField(key, event.target.value as CustomerCreateFormValues[typeof key])
    }

  const taxIdDigits = normalizeTaxId(values.vkn)

  const companyErrors = useMemo(() => {
    const errors: Partial<Record<keyof CustomerCreateFormValues, string>> = {}
    if (!values.firma_unvani.trim()) errors.firma_unvani = 'Firma resmi ünvanı zorunludur'
    if (!values.marka_kisa_ad.trim()) errors.marka_kisa_ad = 'Marka / kısa ad zorunludur'
    if (!taxIdDigits) {
      errors.vkn = 'VKN / T.C. kimlik numarası zorunludur'
    } else if (!isValidTaxId(taxIdDigits)) {
      errors.vkn = 'Kurumsal için 10, gerçek kişi için 11 hane girin'
    }
    if (!values.sektor) errors.sektor = 'Sektör seçimi zorunludur'
    return errors
  }, [taxIdDigits, values.firma_unvani, values.marka_kisa_ad, values.sektor])

  const contactErrors = useMemo(() => {
    const errors: Partial<Record<keyof CustomerCreateFormValues, string>> = {}
    if (!values.ana_yetkili.trim()) errors.ana_yetkili = 'Yetkili ad soyad zorunludur'
    if (!values.telefon.trim()) {
      errors.telefon = 'Yetkili telefonu zorunludur'
    } else if (!isValidTrMobilePhone(values.telefon)) {
      errors.telefon = 'Yetkili telefonu geçerli değil'
    }
    if (!values.email.trim()) errors.email = 'Yetkili e-posta zorunludur'
    return errors
  }, [values.ana_yetkili, values.email, values.telefon])

  const isCompanyStepValid = Object.keys(companyErrors).length === 0
  const isContactStepValid = Object.keys(contactErrors).length === 0

  const canMoveNext =
    stepIndex === 0 ? isCompanyStepValid : stepIndex === 1 ? isContactStepValid : true

  const canSave = isCompanyStepValid && isContactStepValid

  const handleNext = () => {
    if (!canMoveNext) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setStepIndex((previous) => Math.min(previous + 1, STEPS.length - 1))
  }

  const handleSave = async () => {
    if (!canSave || !values.sektor) {
      if (!isCompanyStepValid) {
        setStepIndex(0)
        setShowValidation(true)
        return
      }
      if (!isContactStepValid) {
        setStepIndex(1)
        setShowValidation(true)
        return
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        ...values,
        vkn: taxIdDigits,
        firma_unvani: values.firma_unvani.trim(),
        marka_kisa_ad: values.marka_kisa_ad.trim(),
        vergi_dairesi: values.vergi_dairesi.trim(),
        ana_yetkili: values.ana_yetkili.trim(),
        ana_yetkili_unvan: values.ana_yetkili_unvan.trim(),
        telefon: values.telefon.trim(),
        email: values.email.trim(),
        fatura_merkez_adresi: values.fatura_merkez_adresi.trim(),
        il: values.il.trim(),
        ilce: values.ilce.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Müşteri oluşturulamadı. Lütfen tekrar deneyin.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (key: keyof CustomerCreateFormValues) => {
    if (!showValidation) return undefined
    if (stepIndex === 0) return companyErrors[key]
    if (stepIndex === 1) return contactErrors[key]
    return undefined
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='max-h-[92vh] overflow-y-auto rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-[780px]!'
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
                  {isEdit ? 'Müşteri Düzenle' : 'Müşteri Ekle'}
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

          <nav aria-label='Müşteri ekleme adımları' className='relative z-10 -mt-9 px-5'>
            <ol className='grid grid-cols-3 gap-2.5'>
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
          <div className='min-w-0'>
            {currentStep.id === 'company' && (
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='Resmi Ünvan'
                  htmlFor='customer-firma'
                  hint='Fatura kesiminde ve resmi evraklarda kullanılacak tam addır.'
                  error={fieldError('firma_unvani')}
                  className='sm:col-span-2'
                >
                  <Input
                    id='customer-firma'
                    value={values.firma_unvani}
                    onChange={handleInputChange('firma_unvani')}
                    placeholder='ABC Lojistik ve Teknoloji A.Ş.'
                  />
                </Field>

                <Field
                  label='Kısa Ad'
                  htmlFor='customer-marka'
                  hint='Tablolarda ve kurye mobil uygulamasında yer kaplamaması için kullanılan kısa addır.'
                  error={fieldError('marka_kisa_ad')}
                  className='sm:col-span-2'
                >
                  <Input
                    id='customer-marka'
                    value={values.marka_kisa_ad}
                    onChange={handleInputChange('marka_kisa_ad')}
                    placeholder='ABC'
                  />
                </Field>

                <Field
                  label='VKN / TCKN'
                  htmlFor='customer-vkn'
                  hint='Kurumsal firmalar için 10 haneli VKN, şahıs şirketleri için 11 haneli T.C. kimlik numarasıdır. Mükerrer kayıt engellenir.'
                  error={fieldError('vkn')}
                >
                  <Input
                    id='customer-vkn'
                    value={values.vkn}
                    onChange={handleInputChange('vkn')}
                    placeholder='12345678901'
                    inputMode='numeric'
                    maxLength={11}
                  />
                </Field>

                <Field
                  label='Vergi Dairesi'
                  htmlFor='customer-vd'
                  hint='Resmi işlemler için gereklidir.'
                >
                  <Input
                    id='customer-vd'
                    value={values.vergi_dairesi}
                    onChange={handleInputChange('vergi_dairesi')}
                    placeholder='Kadıköy V.D.'
                  />
                </Field>

                <Field
                  label='Sektör'
                  hint='Müşterinin faaliyet gösterdiği alanı belirler.'
                  error={fieldError('sektor')}
                  className='sm:col-span-2'
                >
                  <Select
                    value={values.sektor}
                    onValueChange={(value: CustomerSector) => updateField('sektor', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Sektör seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTOR_OPTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}

            {currentStep.id === 'contact' && (
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='Yetkili Ad Soyad'
                  htmlFor='customer-yetkili'
                  hint='Operasyonel kriz anında muhatap alınacak kişinin adıdır.'
                  error={fieldError('ana_yetkili')}
                >
                  <Input
                    id='customer-yetkili'
                    value={values.ana_yetkili}
                    onChange={handleInputChange('ana_yetkili')}
                    placeholder='Ahmet Yılmaz'
                  />
                </Field>

                <Field
                  label='Yetkili Ünvanı'
                  htmlFor='customer-unvan'
                  hint='Kişinin firmadaki pozisyonu.'
                >
                  <Input
                    id='customer-unvan'
                    value={values.ana_yetkili_unvan}
                    onChange={handleInputChange('ana_yetkili_unvan')}
                    placeholder='Operasyon Müdürü'
                  />
                </Field>

                <Field
                  label='Yetkili Telefonu'
                  htmlFor='customer-telefon'
                  hint='İletişim numarası.'
                  error={fieldError('telefon')}
                >
                  <PhoneInput
                    id='customer-telefon'
                    value={values.telefon}
                    onChange={(next) => updateField('telefon', next)}
                    invalid={Boolean(fieldError('telefon'))}
                  />
                </Field>

                <Field
                  label='Yetkili E-posta'
                  htmlFor='customer-email'
                  hint='İletişim ve sisteme giriş davetiyesinin gönderilebileceği mail adresidir.'
                  error={fieldError('email')}
                >
                  <Input
                    id='customer-email'
                    type='email'
                    value={values.email}
                    onChange={handleInputChange('email')}
                    placeholder='ornek@abc.com'
                  />
                </Field>

                <Field
                  label='Fatura Adresi'
                  htmlFor='customer-adres'
                  hint='Cadde / bina / kapı — serbest metin. İl / ilçe / mahalle aşağıdan seçilir.'
                  className='sm:col-span-2'
                >
                  <Textarea
                    id='customer-adres'
                    value={values.fatura_merkez_adresi}
                    onChange={handleInputChange('fatura_merkez_adresi')}
                    placeholder='Cadde, bina, kapı no'
                    rows={3}
                    className='resize-none'
                  />
                </Field>

                <div className='sm:col-span-2'>
                  <GeoCascadeFields
                    value={{
                      cityId: values.cityId,
                      districtId: values.districtId,
                      neighbourId: values.neighbourId,
                      il: values.il,
                      ilce: values.ilce,
                      mahalle: values.mahalle,
                    }}
                    onChange={(geo) =>
                      setValues((previous) => ({
                        ...previous,
                        cityId: geo.cityId,
                        districtId: geo.districtId,
                        neighbourId: geo.neighbourId,
                        il: geo.il,
                        ilce: geo.ilce,
                        mahalle: geo.mahalle,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {currentStep.id === 'preferences' && (
              <div className='space-y-3'>
                <ToggleRow
                  label='Teslimat Kanıtı Zorunlu'
                  description='Tamamlamak için T.C. kimlik ve lokasyon fotoğrafı gerekir.'
                  checked={values.teslimat_kaniti_zorunlu}
                  onCheckedChange={(checked) => updateField('teslimat_kaniti_zorunlu', checked)}
                />
                <ToggleRow
                  label='SMS Bildirimi'
                  description='Alıcıya operasyon durumu SMS ile iletilir.'
                  checked={values.bildirim_sms}
                  onCheckedChange={(checked) => updateField('bildirim_sms', checked)}
                />
                <ToggleRow
                  label='E-posta Bildirimi'
                  description='Alıcıya operasyon durumu e-posta ile iletilir.'
                  checked={values.bildirim_email}
                  onCheckedChange={(checked) => updateField('bildirim_email', checked)}
                />
                <ToggleRow
                  label='Güvenli Teslimat Kodu (OTP)'
                  description='Teslimatta alıcıya SMS ile tek kullanımlık kod gider.'
                  checked={values.guvenli_teslimat_otp}
                  onCheckedChange={(checked) => updateField('guvenli_teslimat_otp', checked)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-col'>
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
                {isSubmitting ? (isEdit ? 'Kaydediliyor...' : 'Ekleniyor...') : isEdit ? 'Değişiklikleri Kaydet' : 'Müşteriyi Ekle'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
