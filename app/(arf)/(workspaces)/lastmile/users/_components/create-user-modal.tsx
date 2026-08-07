'use client'

import type { ComponentType } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Check,
  ContactRound,
  FileUp,
  Mail,
  UserRound,
  X,
} from 'lucide-react'
import { Field } from '../../orders/new/_components/form-section'
import { PhoneInput } from '../../orders/new/_components/phone-input'
import {
  formatNationalPhone,
  isValidTrMobilePhone,
  toNationalPhoneDigits,
} from '../../orders/new/_lib/phone'
import type {
  LastmileUser,
  UserDocumentMeta,
  UserGender,
  UserKind,
  UserMaritalStatus,
  UserPersonnelInfo,
} from '../_types/user'
import {
  USER_GENDER_LABELS,
  USER_KIND_LABELS,
  USER_MARITAL_STATUS_LABELS,
  createEmptyPersonnel,
} from '../_lib/query-users'
import { fetchRoles } from '../_api/users-client'
import { fetchCustomersList } from '../../customers/_api/customers'
import type { RoleOption } from '../_lib/map-user'
import {
  UserDocumentUploadButton,
  UserDocumentsList,
  useUserDocumentsActions,
} from './user-documents-manager'

type StepId = 'basics' | 'personnel' | 'documents'

export type UserCreateFormValues = {
  ad_soyad: string
  email: string
  telefon: string
  kullanici_tipi: UserKind | ''
  bagli_kurum: string
  musteri_id: string | null
  roleId: string
  davet_notu: string
  personel: UserPersonnelInfo
  evraklar: UserDocumentMeta[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: UserCreateFormValues) => Promise<void>
  mode?: 'create' | 'edit'
  initialUser?: LastmileUser | null
}

type CustomerOption = { id: string; name: string }

type StepDef = {
  id: StepId
  title: string
  short: string
  icon: ComponentType<{ className?: string }>
}

const BLOOD_GROUPS = [
  'A Rh+',
  'A Rh-',
  'B Rh+',
  'B Rh-',
  'AB Rh+',
  'AB Rh-',
  '0 Rh+',
  '0 Rh-',
]

const EDUCATION_OPTIONS = [
  'İlköğretim',
  'Lise',
  'Ön Lisans',
  'Lisans',
  'Yüksek Lisans',
  'Doktora',
]

const GENDER_OPTIONS = Object.entries(USER_GENDER_LABELS) as [UserGender, string][]
const MARITAL_OPTIONS = Object.entries(USER_MARITAL_STATUS_LABELS) as [
  UserMaritalStatus,
  string,
][]

function buildSteps(kind: UserKind | ''): StepDef[] {
  const steps: StepDef[] = [
    {
      id: 'basics',
      title: 'Bilgiler',
      short: 'Bilgiler',
      icon: UserRound,
    },
  ]

  if (kind === 'ic_ekip') {
    steps.push(
      {
        id: 'personnel',
        title: 'Özlük Bilgileri',
        short: 'Özlük Bilgileri',
        icon: ContactRound,
      },
      {
        id: 'documents',
        title: 'Personel Evrakları',
        short: 'Personel Evrakları',
        icon: FileUp,
      }
    )
  }

  return steps
}

export function buildEmptyUserCreateValues(): UserCreateFormValues {
  return {
    ad_soyad: '',
    email: '',
    telefon: '',
    kullanici_tipi: '',
    bagli_kurum: '',
    musteri_id: null,
    roleId: '',
    davet_notu: '',
    personel: createEmptyPersonnel(),
    evraklar: [],
  }
}

export function userToFormValues(user: LastmileUser): UserCreateFormValues {
  return {
    ad_soyad: user.ad_soyad,
    email: user.email,
    telefon: user.telefon,
    kullanici_tipi: user.kullanici_tipi,
    bagli_kurum: user.bagli_kurum,
    musteri_id: user.musteri_id,
    roleId: user.roleId ?? '',
    davet_notu: '',
    personel: { ...createEmptyPersonnel(), ...user.personel },
    evraklar: [...(user.evraklar ?? [])],
  }
}

export function formatUserPhoneDisplay(value: string) {
  const national = toNationalPhoneDigits(value)
  if (!national) return value.trim()
  return `0${formatNationalPhone(national)}`
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function isCustomerRole(role: RoleOption): boolean {
  return role.keys.some((key) => key.toLowerCase().includes('customer'))
}

function filterRolesForKind(roles: RoleOption[], kind: UserKind | ''): RoleOption[] {
  if (!kind) return roles
  if (kind === 'musteri') return roles.filter(isCustomerRole)
  return roles.filter((role) => !isCustomerRole(role))
}

export function CreateUserModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialUser = null,
}: Props) {
  const [values, setValues] = useState<UserCreateFormValues>(buildEmptyUserCreateValues())
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState(false)
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const isEdit = mode === 'edit'

  const steps = useMemo(
    () => buildSteps(values.kullanici_tipi),
    [values.kullanici_tipi]
  )
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)]
  const isMerkez = values.kullanici_tipi === 'ic_ekip'

  useEffect(() => {
    if (!open) return
    setValues(
      isEdit && initialUser ? userToFormValues(initialUser) : buildEmptyUserCreateValues()
    )
    setStepIndex(0)
    setIsSubmitting(false)
    setShowValidation(false)
    setSubmitError(null)
    setInviteSent(false)
  }, [initialUser, isEdit, open])

  useEffect(() => {
    if (!open) return

    void fetchRoles().then((result) => {
      if (result.success) setRoles(result.data)
    })

    void fetchCustomersList({ page: 1, pageSize: 100, statusScope: 'aktif' }).then((result) => {
      if (!result.success) return
      setCustomers(
        result.data.items.map((customer) => ({
          id: customer.id,
          name: customer.firma_unvani || customer.marka_kisa_ad || customer.id,
        }))
      )
    })
  }, [open])

  useEffect(() => {
    setStepIndex((previous) => Math.min(previous, steps.length - 1))
  }, [steps.length])

  const documentActions = useUserDocumentsActions({
    documents: values.evraklar,
    onChange: (evraklar) => setValues((previous) => ({ ...previous, evraklar })),
    uploadedBy: 'Operasyon Ekibi',
  })

  const updateField = <K extends keyof UserCreateFormValues>(
    key: K,
    value: UserCreateFormValues[K]
  ) => {
    setValues((previous) => {
      const next = { ...previous, [key]: value }
      if (key === 'kullanici_tipi' && value) {
        const kind = value as UserKind
        next.bagli_kurum = kind === 'ic_ekip' ? '' : ''
        next.musteri_id = null
        const allowed = filterRolesForKind(roles, kind)
        if (next.roleId && !allowed.some((role) => role.id === next.roleId)) {
          next.roleId = allowed[0]?.id ?? ''
        }
        if (kind !== 'ic_ekip') {
          next.personel = createEmptyPersonnel()
          next.evraklar = []
        }
      }
      return next
    })
    setShowValidation(false)
    setStepIndex(0)
  }

  const updatePersonnelField = (
    key: keyof UserPersonnelInfo,
    value: string | null
  ) => {
    setValues((previous) => ({
      ...previous,
      personel: { ...previous.personel, [key]: value },
    }))
  }

  const roleOptions = filterRolesForKind(roles, values.kullanici_tipi)

  const basicsErrors = useMemo(() => {
    const errors: Partial<Record<string, string>> = {}
    if (!values.kullanici_tipi) errors.kullanici_tipi = 'Kullanıcı tipi seçin'
    if (!values.ad_soyad.trim()) errors.ad_soyad = 'Ad soyad zorunludur'
    if (!values.email.trim()) {
      errors.email = 'E-posta zorunludur'
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Geçerli bir e-posta girin'
    }
    if (!values.telefon.trim()) {
      errors.telefon = 'Telefon zorunludur'
    } else if (!isValidTrMobilePhone(values.telefon)) {
      errors.telefon = 'Geçerli bir cep telefonu girin'
    }
    if (values.kullanici_tipi === 'musteri' && !values.musteri_id) {
      errors.musteri_id = 'Bağlılık (müşteri) seçin'
    }
    if (!values.roleId) errors.roleId = 'Rol seçin'
    return errors
  }, [
    values.ad_soyad,
    values.email,
    values.kullanici_tipi,
    values.musteri_id,
    values.roleId,
    values.telefon,
  ])

  const personnelErrors = useMemo(() => {
    const errors: Partial<Record<string, string>> = {}
    if (!isMerkez) return errors

    const tckn = digitsOnly(values.personel.tckn ?? '')
    if (!tckn) {
      errors.tckn = 'TCKN zorunludur'
    } else if (tckn.length !== 11) {
      errors.tckn = 'TCKN 11 haneli olmalıdır'
    }

    if (!values.personel.ise_giris_tarihi) {
      errors.ise_giris_tarihi = 'İşe giriş tarihi zorunludur'
    }
    if (!values.personel.ikamet_adresi?.trim()) {
      errors.ikamet_adresi = 'İkamet adresi zorunludur'
    }

    const acilPhone = values.personel.acil_telefon?.trim()
    if (acilPhone && !isValidTrMobilePhone(acilPhone)) {
      errors.acil_telefon = 'Geçerli bir cep telefonu girin'
    }

    return errors
  }, [isMerkez, values.personel])

  const stepErrors =
    currentStep.id === 'basics'
      ? basicsErrors
      : currentStep.id === 'personnel'
        ? personnelErrors
        : {}
  const isBasicsValid = Object.keys(basicsErrors).length === 0
  const isPersonnelValid = Object.keys(personnelErrors).length === 0
  const canMoveNext =
    currentStep.id === 'basics'
      ? isBasicsValid
      : currentStep.id === 'personnel'
        ? isPersonnelValid
        : true
  const canSave = isBasicsValid && (!isMerkez || isPersonnelValid)

  const fieldError = (key: string) => {
    if (!showValidation) return undefined
    return stepErrors[key]
  }

  const handleNext = () => {
    if (!canMoveNext) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1))
  }

  const handleSave = async () => {
    if (!canSave) {
      if (!isBasicsValid) {
        setStepIndex(0)
        setShowValidation(true)
        return
      }
      if (isMerkez && !isPersonnelValid) {
        setStepIndex(1)
        setShowValidation(true)
        return
      }
      return
    }

    const customer =
      values.kullanici_tipi === 'musteri'
        ? customers.find((item) => item.id === values.musteri_id)
        : null

    const tcknDigits = digitsOnly(values.personel.tckn ?? '')

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        ...values,
        ad_soyad: values.ad_soyad.trim().replace(/\s+/g, ' '),
        email: values.email.trim().toLowerCase(),
        telefon: formatUserPhoneDisplay(values.telefon),
        bagli_kurum:
          values.kullanici_tipi === 'musteri' ? (customer?.name ?? '') : '',
        musteri_id: values.kullanici_tipi === 'musteri' ? values.musteri_id : null,
        davet_notu: '',
        personel:
          values.kullanici_tipi === 'ic_ekip'
            ? {
                ...values.personel,
                tckn: tcknDigits || null,
                unvan: null,
                ikamet_adresi: values.personel.ikamet_adresi?.trim() || null,
                acil_kisi: values.personel.acil_kisi?.trim() || null,
                acil_telefon: values.personel.acil_telefon?.trim()
                  ? formatUserPhoneDisplay(values.personel.acil_telefon)
                  : null,
                egitim_durumu: values.personel.egitim_durumu?.trim() || null,
                kan_grubu: values.personel.kan_grubu?.trim() || null,
              }
            : createEmptyPersonnel(),
        evraklar: values.kullanici_tipi === 'ic_ekip' ? values.evraklar : [],
      })
      if (isEdit) {
        onOpenChange(false)
      } else {
        setInviteSent(true)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Kullanıcı kaydedilemedi. Lütfen tekrar deneyin.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastStep = stepIndex >= steps.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-[860px]!'
      >
        {inviteSent ? (
          <div className='px-6 py-12 text-center'>
            <span className='mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'>
              <Mail className='size-6' />
            </span>
            <h2 className='mt-4 text-xl font-semibold tracking-tight text-slate-900'>
              Davet gönderildi
            </h2>
            <p className='mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500'>
              <span className='font-medium text-slate-800'>{values.email}</span> adresine
              aktivasyon bağlantısı iletildi.
            </p>
            <Button type='button' className='mt-6' onClick={() => onOpenChange(false)}>
              Listeye Dön
            </Button>
          </div>
        ) : (
          <>
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
                      Adım {Math.min(stepIndex, steps.length - 1) + 1} / {steps.length}
                    </p>
                    <DialogTitle className='mt-1 text-2xl font-semibold tracking-tight text-white'>
                      {isEdit ? 'Kullanıcı Düzenle' : 'Kullanıcı Davet Et'}
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

              <nav aria-label='Kullanıcı davet adımları' className='relative z-10 -mt-8 px-5'>
                <ol
                  className={cn(
                    'grid gap-2.5',
                    steps.length === 1
                      ? 'grid-cols-1'
                      : steps.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                  )}
                >
                  {steps.map((step, index) => {
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
                            'group relative flex w-full flex-col items-start gap-2.5 rounded-2xl border px-3 py-3 text-left transition-all duration-300',
                            isActive
                              ? 'border-slate-900/10 bg-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5'
                              : 'border-slate-200/80 bg-slate-50/90 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                          )}
                        >
                          <span className='flex w-full items-center justify-between gap-2'>
                            <span
                              className={cn(
                                'relative flex size-8 items-center justify-center rounded-xl transition-colors',
                                isActive
                                  ? 'bg-slate-900 text-white'
                                  : isCompleted
                                    ? 'bg-lime-100 text-slate-900'
                                    : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 group-hover:text-slate-700'
                              )}
                            >
                              <Icon className='size-3.5' />
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

            <div className='min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-2'>
              {currentStep.id === 'basics' ? (
                <div className='space-y-3'>
                  <div
                    className={cn(
                      'grid items-start gap-3 sm:grid-cols-2',
                      values.kullanici_tipi === 'musteri'
                        ? 'lg:grid-cols-4'
                        : 'lg:grid-cols-3'
                    )}
                  >
                    <Field
                      label='Ad Soyad'
                      htmlFor='user-ad'
                      error={fieldError('ad_soyad')}
                      className='min-w-0'
                    >
                      <Input
                        id='user-ad'
                        value={values.ad_soyad}
                        onChange={(event) => updateField('ad_soyad', event.target.value)}
                        placeholder='Ayşe Demir'
                      />
                    </Field>

                    <Field
                      label='Kullanıcı Tipi'
                      htmlFor='user-tip'
                      hint='Merkez seçilirse özlük bilgileri adımı açılır.'
                      error={fieldError('kullanici_tipi')}
                      className='min-w-0'
                    >
                      <Select
                        value={values.kullanici_tipi}
                        onValueChange={(value) =>
                          updateField('kullanici_tipi', value as UserKind)
                        }
                      >
                        <SelectTrigger id='user-tip' className='w-full'>
                          <SelectValue placeholder='Merkez veya Müşteri' />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(USER_KIND_LABELS) as [UserKind, string][]).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field
                      label='Rol'
                      htmlFor='user-rol'
                      error={fieldError('roleId')}
                      className='min-w-0'
                    >
                      <Select
                        value={values.roleId}
                        onValueChange={(value) => updateField('roleId', value)}
                        disabled={!values.kullanici_tipi}
                      >
                        <SelectTrigger id='user-rol' className='w-full'>
                          <SelectValue placeholder='Rol seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    {values.kullanici_tipi === 'musteri' ? (
                      <Field
                        label='Bağlılık'
                        htmlFor='user-baglilik'
                        hint='Kullanıcının bağlı olduğu müşteri.'
                        error={fieldError('musteri_id')}
                        className='min-w-0'
                      >
                        <Select
                          value={values.musteri_id ?? ''}
                          onValueChange={(value) => {
                            const customer = customers.find((item) => item.id === value)
                            setValues((previous) => ({
                              ...previous,
                              musteri_id: value,
                              bagli_kurum: customer?.name ?? '',
                            }))
                          }}
                        >
                          <SelectTrigger id='user-baglilik' className='w-full'>
                            <SelectValue placeholder='Müşteri seçin' />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : null}
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    <Field
                      label='E-posta'
                      htmlFor='user-email'
                      error={fieldError('email')}
                    >
                      <Input
                        id='user-email'
                        type='email'
                        value={values.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        placeholder='ayse@getarf.com'
                        autoComplete='email'
                      />
                    </Field>

                    <Field
                      label='Telefon'
                      htmlFor='user-telefon'
                      error={fieldError('telefon')}
                    >
                      <PhoneInput
                        id='user-telefon'
                        value={values.telefon}
                        onChange={(next) => updateField('telefon', next)}
                        invalid={Boolean(fieldError('telefon'))}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {currentStep.id === 'personnel' ? (
                <div className='space-y-3'>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <Field label='TCKN' htmlFor='user-tckn' error={fieldError('tckn')}>
                      <Input
                        id='user-tckn'
                        inputMode='numeric'
                        maxLength={11}
                        value={values.personel.tckn ?? ''}
                        onChange={(event) =>
                          updatePersonnelField(
                            'tckn',
                            digitsOnly(event.target.value).slice(0, 11)
                          )
                        }
                        placeholder='12345678901'
                        className='font-mono'
                      />
                    </Field>
                    <Field label='Doğum Tarihi' htmlFor='user-dogum'>
                      <Input
                        id='user-dogum'
                        type='date'
                        value={values.personel.dogum_tarihi ?? ''}
                        onChange={(event) =>
                          updatePersonnelField('dogum_tarihi', event.target.value || null)
                        }
                      />
                    </Field>
                    <Field
                      label='İşe Giriş'
                      htmlFor='user-ise-giris'
                      error={fieldError('ise_giris_tarihi')}
                    >
                      <Input
                        id='user-ise-giris'
                        type='date'
                        value={values.personel.ise_giris_tarihi ?? ''}
                        onChange={(event) =>
                          updatePersonnelField('ise_giris_tarihi', event.target.value || null)
                        }
                      />
                    </Field>
                  </div>

                  <div className='grid gap-3 sm:grid-cols-4'>
                    <Field label='Cinsiyet' htmlFor='user-cinsiyet'>
                      <Select
                        value={values.personel.cinsiyet ?? ''}
                        onValueChange={(value) =>
                          updatePersonnelField('cinsiyet', value as UserGender)
                        }
                      >
                        <SelectTrigger id='user-cinsiyet' className='w-full'>
                          <SelectValue placeholder='Seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label='Medeni Hal' htmlFor='user-medeni'>
                      <Select
                        value={values.personel.medeni_hal ?? ''}
                        onValueChange={(value) =>
                          updatePersonnelField('medeni_hal', value as UserMaritalStatus)
                        }
                      >
                        <SelectTrigger id='user-medeni' className='w-full'>
                          <SelectValue placeholder='Seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {MARITAL_OPTIONS.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label='Kan Grubu' htmlFor='user-kan'>
                      <Select
                        value={values.personel.kan_grubu ?? ''}
                        onValueChange={(value) => updatePersonnelField('kan_grubu', value)}
                      >
                        <SelectTrigger id='user-kan' className='w-full'>
                          <SelectValue placeholder='Seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label='Eğitim Durumu' htmlFor='user-egitim'>
                      <Select
                        value={values.personel.egitim_durumu ?? ''}
                        onValueChange={(value) => updatePersonnelField('egitim_durumu', value)}
                      >
                        <SelectTrigger id='user-egitim' className='w-full'>
                          <SelectValue placeholder='Seçin' />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_OPTIONS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    <Field label='Acil Durum Kişisi' htmlFor='user-acil-kisi'>
                      <Input
                        id='user-acil-kisi'
                        value={values.personel.acil_kisi ?? ''}
                        onChange={(event) =>
                          updatePersonnelField('acil_kisi', event.target.value)
                        }
                        placeholder='Mehmet Demir'
                      />
                    </Field>
                    <Field
                      label='Acil Durum Telefonu'
                      htmlFor='user-acil-tel'
                      error={fieldError('acil_telefon')}
                    >
                      <PhoneInput
                        id='user-acil-tel'
                        value={values.personel.acil_telefon ?? ''}
                        onChange={(next) => updatePersonnelField('acil_telefon', next)}
                        invalid={Boolean(fieldError('acil_telefon'))}
                      />
                    </Field>
                  </div>

                  <Field
                    label='İkamet Adresi'
                    htmlFor='user-ikamet'
                    error={fieldError('ikamet_adresi')}
                  >
                    <Textarea
                      id='user-ikamet'
                      value={values.personel.ikamet_adresi ?? ''}
                      onChange={(event) =>
                        updatePersonnelField('ikamet_adresi', event.target.value)
                      }
                      placeholder='Mahalle, cadde, ilçe / il'
                      rows={2}
                      className='resize-none'
                    />
                  </Field>
                </div>
              ) : null}

              {currentStep.id === 'documents' ? (
                <div className='rounded-2xl border border-slate-200 bg-white'>
                  <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3'>
                    <div className='flex items-center gap-2.5'>
                      <span className='flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                        <FileUp className='size-4' />
                      </span>
                      <div>
                        <p className='text-sm font-semibold text-slate-900'>
                          Personel Evrakları
                        </p>
                        <p className='text-xs text-slate-500'>
                          Kimlik, sözleşme, ikametgâh vb. (isteğe bağlı)
                        </p>
                      </div>
                    </div>
                    <UserDocumentUploadButton
                      fileInputRef={documentActions.fileInputRef}
                      isUploading={documentActions.isUploading}
                      onUpload={documentActions.handleUploadDocument}
                    />
                  </div>
                  <div className='px-4 py-4'>
                    <UserDocumentsList
                      documents={values.evraklar}
                      actions={documentActions}
                    />
                  </div>
                </div>
              ) : null}
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
                {!isLastStep ? (
                  <Button type='button' onClick={handleNext}>
                    İleri
                  </Button>
                ) : (
                  <Button
                    type='button'
                    onClick={() => void handleSave()}
                    disabled={isSubmitting || !canSave}
                  >
                    {isSubmitting
                      ? isEdit
                        ? 'Kaydediliyor...'
                        : 'Davet gönderiliyor...'
                      : isEdit
                        ? 'Değişiklikleri Kaydet'
                        : 'Davet Gönder'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
