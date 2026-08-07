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
import {
  CarFront,
  Check,
  MapPinned,
  ShieldCheck,
  X,
} from 'lucide-react'
import { OperationScopeEditor } from '../../../customers/[id]/_components/operation-scope-editor'
import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import { AddressSearchField } from '../../../orders/new/_components/address-search-field'
import { Field } from '../../../orders/new/_components/form-section'
import { TimePickerButton } from '../../../orders/new/_components/time-window-field'
import type {
  LastmileVehicle,
  VehicleBodyType,
  VehicleClass,
  VehicleDocumentMeta,
  VehicleOwnership,
  VehicleSkill,
  VehicleSkillOption,
  VehicleStartStrategy,
} from '../_types/vehicle'
import { VehicleSkillsMultiSelect } from './vehicle-skills-multi-select'
import { VehicleLegalDocumentsUploadSection } from './vehicle-documents-manager'
import { toast } from 'sonner'
import { checkVehiclePlate } from '../_api/vehicles'
import type { CourierOption } from '../_lib/map-vehicle'
import {
  getCourierAssignmentConflict,
  isCourierAssignableToVehicle,
} from '../../_lib/assignment-validation'
import {
  VEHICLE_BODY_LABELS,
  VEHICLE_CLASS_LABELS,
  VEHICLE_OWNERSHIP_LABELS,
  VEHICLE_START_STRATEGY_LABELS,
} from '../_lib/query-vehicles'

type StepId = 'basics' | 'operation' | 'documents'

export type VehicleCreateFormValues = {
  plaka: string
  marka: string
  model: string
  model_yili: string
  mulkiyet: VehicleOwnership | ''
  zimmetli_surucu_id: string
  arac_tipi: VehicleClass | ''
  kasa_tipi: VehicleBodyType | ''
  max_hacim_m3: string
  max_agirlik_kg: string
  yetenekler: VehicleSkill[]
  hizmet_bolgesi_scopes: OperationScopeRow[]
  vardiya_baslangic: string
  vardiya_bitis: string
  baslangic_stratejisi: VehicleStartStrategy
  park_konumu: string
  park_lat: number | null
  park_lng: number | null
  trafik_sigortasi_bitis: string
  kasko_police_no: string
  kasko_bitis: string
  muayene_bitis: string
  evraklar: VehicleDocumentMeta[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: VehicleCreateFormValues) => Promise<void>
  mode?: 'create' | 'edit'
  initialVehicle?: LastmileVehicle | null
  initialFormValues?: VehicleCreateFormValues | null
  isDetailLoading?: boolean
  courierOptions?: CourierOption[]
  skillOptions?: VehicleSkillOption[]
  isSkillCatalogLoading?: boolean
}

const STEPS: Array<{
  id: StepId
  title: string
  short: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'basics', title: 'Araç Bilgileri', short: 'Araç Bilgileri', icon: CarFront },
  { id: 'operation', title: 'Operasyon Bilgileri', short: 'Operasyon Bilgileri', icon: MapPinned },
  { id: 'documents', title: 'Yasal Belgeler', short: 'Yasal Belgeler', icon: ShieldCheck },
]

const CLASS_OPTIONS = Object.entries(VEHICLE_CLASS_LABELS) as [VehicleClass, string][]
const BODY_OPTIONS = Object.entries(VEHICLE_BODY_LABELS) as [VehicleBodyType, string][]
const OWNERSHIP_OPTIONS = Object.entries(VEHICLE_OWNERSHIP_LABELS) as [
  VehicleOwnership,
  string,
][]
const START_STRATEGY_OPTIONS = Object.entries(VEHICLE_START_STRATEGY_LABELS) as [
  VehicleStartStrategy,
  string,
][]

const CURRENT_YEAR = new Date().getFullYear()

export function buildEmptyVehicleCreateValues(): VehicleCreateFormValues {
  return {
    plaka: '',
    marka: '',
    model: '',
    model_yili: String(CURRENT_YEAR),
    mulkiyet: '',
    zimmetli_surucu_id: '',
    arac_tipi: '',
    kasa_tipi: '',
    max_hacim_m3: '',
    max_agirlik_kg: '',
    yetenekler: [],
    hizmet_bolgesi_scopes: [],
    vardiya_baslangic: '09:00',
    vardiya_bitis: '18:00',
    baslangic_stratejisi: 'ilk_gorev',
    park_konumu: '',
    park_lat: null,
    park_lng: null,
    trafik_sigortasi_bitis: '',
    kasko_police_no: '',
    kasko_bitis: '',
    muayene_bitis: '',
    evraklar: [],
  }
}

export function vehicleToFormValues(vehicle: LastmileVehicle): VehicleCreateFormValues {
  return {
    plaka: vehicle.plaka,
    marka: vehicle.marka,
    model: vehicle.model,
    model_yili: String(vehicle.model_yili),
    mulkiyet: vehicle.mulkiyet,
    zimmetli_surucu_id: vehicle.zimmetli_surucu_id ?? '',
    arac_tipi: vehicle.arac_tipi,
    kasa_tipi: vehicle.kasa_tipi ?? '',
    max_hacim_m3: String(vehicle.max_hacim_m3),
    max_agirlik_kg: String(vehicle.max_agirlik_kg),
    yetenekler: [...vehicle.yetenekler],
    hizmet_bolgesi_scopes: [],
    vardiya_baslangic: vehicle.vardiya_baslangic || '09:00',
    vardiya_bitis: vehicle.vardiya_bitis || '18:00',
    baslangic_stratejisi: vehicle.baslangic_stratejisi,
    park_konumu: vehicle.park_konumu ?? '',
    park_lat: vehicle.park_lat,
    park_lng: vehicle.park_lng,
    trafik_sigortasi_bitis: vehicle.trafik_sigortasi_bitis ?? '',
    kasko_police_no: vehicle.kasko_police_no ?? '',
    kasko_bitis: vehicle.kasko_bitis ?? '',
    muayene_bitis: vehicle.muayene_bitis ?? '',
    evraklar: vehicle.evraklar.map((doc) => ({
      ...doc,
      type: doc.type ?? 'diger',
      uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
      uploadedBy: doc.uploadedBy ?? 'Mevcut Kullanıcı',
    })),
  }
}

function formatCourierOptionLabel(courier: CourierOption) {
  return courier.name
}

function normalizePlate(value: string) {
  return value
    .toLocaleUpperCase('tr-TR')
    .replace(/[^0-9A-ZÇĞİÖŞÜ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isValidPlate(value: string) {
  const plate = normalizePlate(value)
  return /^(0[1-9]|[1-7][0-9]|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,4}$/.test(plate)
}

function timeToMinutes(value: string): number | undefined {
  if (!value) return undefined
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined
  return hour * 60 + minute
}

export function CreateVehicleModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialVehicle = null,
  initialFormValues = null,
  isDetailLoading = false,
  courierOptions = [],
  skillOptions = [],
  isSkillCatalogLoading = false,
}: Props) {
  const [values, setValues] = useState<VehicleCreateFormValues>(buildEmptyVehicleCreateValues())
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [plateCheckError, setPlateCheckError] = useState<string | null>(null)
  const [isCheckingPlate, setIsCheckingPlate] = useState(false)
  const currentStep = STEPS[stepIndex]
  const isEdit = mode === 'edit'
  const courierAssignmentLocked =
    isEdit &&
    Boolean(initialVehicle?.zimmetli_surucu_id || initialFormValues?.zimmetli_surucu_id)
  const isMotorcycle = values.arac_tipi === 'motosiklet'
  const needsParkLocation = values.baslangic_stratejisi === 'sabit_park'

  useEffect(() => {
    if (!open) return
    if (isEdit && isDetailLoading) return
    setValues(
      isEdit && initialFormValues
        ? initialFormValues
        : isEdit && initialVehicle
          ? vehicleToFormValues(initialVehicle)
          : buildEmptyVehicleCreateValues()
    )
    setStepIndex(0)
    setIsSubmitting(false)
    setShowValidation(false)
    setSubmitError(null)
    setPlateCheckError(null)
    setIsCheckingPlate(false)
  }, [initialFormValues, initialVehicle, isDetailLoading, isEdit, open])

  const handlePlateBlur = async () => {
    const plate = normalizePlate(values.plaka)
    if (!plate || !isValidPlate(plate)) {
      setPlateCheckError(null)
      return
    }

    setIsCheckingPlate(true)
    const result = await checkVehiclePlate(
      plate,
      isEdit && initialVehicle ? initialVehicle.id : undefined
    )
    setIsCheckingPlate(false)

    if (!result.success) return

    if (!result.data.available) {
      setPlateCheckError('Bu plaka zaten kayıtlı.')
      return
    }

    setPlateCheckError(null)
  }

  const handleCourierChange = (value: string) => {
    if (courierAssignmentLocked) return

    const editingVehicleId = isEdit && initialVehicle ? initialVehicle.id : null

    if (value !== '__none__') {
      const courier = courierOptions.find((item) => item.id === value)
      if (courier) {
        if (editingVehicleId) {
          const conflict = getCourierAssignmentConflict(courier, editingVehicleId)
          if (conflict) {
            toast.error(conflict)
            return
          }
        } else if (courier.assignedVehicleId) {
          const plateHint = courier.assignedVehiclePlate
            ? ` (${courier.assignedVehiclePlate})`
            : ''
          toast.error(`${courier.name ?? 'Kurye'} başka bir araçta zimmetli${plateHint}.`)
          return
        }
      }
    }

    updateField('zimmetli_surucu_id', value === '__none__' ? '' : value)
  }

  const updateField = <K extends keyof VehicleCreateFormValues>(
    key: K,
    value: VehicleCreateFormValues[K]
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleInputChange =
    (key: keyof VehicleCreateFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateField(key, event.target.value as VehicleCreateFormValues[typeof key])
    }

  const basicsErrors = useMemo(() => {
    const errors: Partial<Record<keyof VehicleCreateFormValues, string>> = {}
    if (!values.plaka.trim()) {
      errors.plaka = 'Plaka zorunludur'
    } else if (!isValidPlate(values.plaka)) {
      errors.plaka = 'Geçerli bir plaka girin (ör. 34 ABC 123)'
    }
    if (!values.marka.trim()) errors.marka = 'Marka zorunludur'
    if (!values.model.trim()) errors.model = 'Model zorunludur'
    const year = Number(values.model_yili)
    if (!values.model_yili.trim() || !Number.isFinite(year)) {
      errors.model_yili = 'Yıl zorunludur'
    } else if (year < 1990 || year > CURRENT_YEAR + 1) {
      errors.model_yili = `Yıl 1990–${CURRENT_YEAR + 1} arasında olmalı`
    }
    if (!values.mulkiyet) errors.mulkiyet = 'Mülkiyet seçimi zorunludur'
    if (!values.arac_tipi) errors.arac_tipi = 'Araç tipi zorunludur'
    if (values.arac_tipi && values.arac_tipi !== 'motosiklet' && !values.kasa_tipi) {
      errors.kasa_tipi = 'Kasa tipi zorunludur'
    }
    const volume = Number(values.max_hacim_m3.replace(',', '.'))
    const weight = Number(values.max_agirlik_kg.replace(',', '.'))
    if (!values.max_hacim_m3.trim() || !Number.isFinite(volume) || volume < 0) {
      errors.max_hacim_m3 = 'Hacim kapasitesi zorunludur'
    }
    if (!values.max_agirlik_kg.trim() || !Number.isFinite(weight) || weight <= 0) {
      errors.max_agirlik_kg = 'Ağırlık kapasitesi zorunludur'
    }
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

  const operationErrors = useMemo(() => {
    const errors: Partial<Record<keyof VehicleCreateFormValues, string>> = {}
    if (values.hizmet_bolgesi_scopes.length === 0) {
      errors.hizmet_bolgesi_scopes = 'En az bir hizmet bölgesi kapsamı ekleyin'
    }
    if (needsParkLocation && !values.park_konumu.trim()) {
      errors.park_konumu = 'Sabit park konumu seçilmelidir'
    }
    return errors
  }, [needsParkLocation, values.hizmet_bolgesi_scopes.length, values.park_konumu])

  const isBasicsValid = Object.keys(basicsErrors).length === 0
  const isOperationValid = Object.keys(operationErrors).length === 0

  const canMoveNext =
    stepIndex === 0 ? isBasicsValid : stepIndex === 1 ? isOperationValid : true

  const canSave = isBasicsValid && isOperationValid && !plateCheckError

  const plakaFieldError = () => {
    if (plateCheckError) return plateCheckError
    return fieldError('plaka')
  }

  const handleNext = () => {
    if (!canMoveNext) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setStepIndex((previous) => Math.min(previous + 1, STEPS.length - 1))
  }

  const verifyPlateAvailable = async (): Promise<boolean> => {
    const plate = normalizePlate(values.plaka)
    if (!plate || !isValidPlate(plate)) return true

    const result = await checkVehiclePlate(
      plate,
      isEdit && initialVehicle ? initialVehicle.id : undefined
    )
    if (!result.success) return true

    if (!result.data.available) {
      setPlateCheckError('Bu plaka zaten kayıtlı.')
      return false
    }

    setPlateCheckError(null)
    return true
  }

  const handleSave = async () => {
    const plateOk = await verifyPlateAvailable()
    if (!plateOk) {
      setStepIndex(0)
      setShowValidation(true)
      return
    }

    if (!isBasicsValid || !isOperationValid) {
      if (!isBasicsValid) {
        setStepIndex(0)
        setShowValidation(true)
        return
      }
      if (!isOperationValid) {
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
        plaka: normalizePlate(values.plaka),
        marka: values.marka.trim(),
        model: values.model.trim(),
        model_yili: String(Number(values.model_yili)),
        kasa_tipi: values.arac_tipi === 'motosiklet' ? '' : values.kasa_tipi,
        max_hacim_m3: String(Number(values.max_hacim_m3.replace(',', '.'))),
        max_agirlik_kg: String(Number(values.max_agirlik_kg.replace(',', '.'))),
        kasko_police_no: values.kasko_police_no.trim(),
        park_konumu:
          values.baslangic_stratejisi === 'sabit_park' ? values.park_konumu.trim() : '',
        park_lat: values.baslangic_stratejisi === 'sabit_park' ? values.park_lat : null,
        park_lng: values.baslangic_stratejisi === 'sabit_park' ? values.park_lng : null,
      })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Araç kaydedilemedi. Lütfen tekrar deneyin.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (key: keyof VehicleCreateFormValues) => {
    if (!showValidation) return undefined
    if (stepIndex === 0) return basicsErrors[key]
    if (stepIndex === 1) return operationErrors[key]
    return undefined
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
                  {isEdit ? 'Araç Düzenle' : 'Araç Ekle'}
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

          <nav aria-label='Araç ekleme adımları' className='relative z-10 -mt-8 px-5'>
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
                Araç bilgileri yükleniyor…
              </div>
            ) : (
              <>
            {currentStep.id === 'basics' && (
              <div className='grid gap-3 sm:grid-cols-3'>
                <Field
                  label='Plaka'
                  htmlFor='vehicle-plaka'
                  hint='Sistemin ana referans noktasıdır.'
                  error={plakaFieldError()}
                >
                  <Input
                    id='vehicle-plaka'
                    value={values.plaka}
                    onChange={(event) => {
                      setPlateCheckError(null)
                      updateField('plaka', event.target.value.toLocaleUpperCase('tr-TR'))
                    }}
                    onBlur={() => void handlePlateBlur()}
                    placeholder='34 ABC 123'
                    className='font-mono'
                    aria-busy={isCheckingPlate}
                  />
                </Field>

                <Field
                  label='Mülkiyet Durumu'
                  hint='Finansal ve hukuki takip için araç aidiyeti.'
                  error={fieldError('mulkiyet')}
                >
                  <Select
                    value={values.mulkiyet}
                    onValueChange={(value: VehicleOwnership) => updateField('mulkiyet', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Mülkiyet seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNERSHIP_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label='Zimmetli Kurye'
                  hint={
                    courierAssignmentLocked
                      ? 'Bu araçta atanmış kurye var; düzenlemede zimmet değiştirilemez.'
                      : 'Opsiyonel — sistemde kayıtlı kuryeler.'
                  }
                >
                  <Select
                    value={values.zimmetli_surucu_id || '__none__'}
                    onValueChange={handleCourierChange}
                    disabled={courierAssignmentLocked}
                  >
                    <SelectTrigger className='w-full' disabled={courierAssignmentLocked}>
                      <SelectValue placeholder='Kurye seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none__'>Atanmamış</SelectItem>
                      {courierOptions.map((courier) => {
                        const editingVehicleId =
                          isEdit && initialVehicle ? initialVehicle.id : null
                        const isDisabled = editingVehicleId
                          ? !isCourierAssignableToVehicle(courier, editingVehicleId)
                          : Boolean(courier.assignedVehicleId)

                        return (
                          <SelectItem key={courier.id} value={courier.id} disabled={isDisabled}>
                            {formatCourierOptionLabel(courier)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label='Marka'
                  htmlFor='vehicle-marka'
                  hint='Aracın üretici firması.'
                  error={fieldError('marka')}
                >
                  <Input
                    id='vehicle-marka'
                    value={values.marka}
                    onChange={handleInputChange('marka')}
                    placeholder='Fiat'
                  />
                </Field>

                <Field
                  label='Model'
                  htmlFor='vehicle-model'
                  hint='Aracın serisi / model adı.'
                  error={fieldError('model')}
                >
                  <Input
                    id='vehicle-model'
                    value={values.model}
                    onChange={handleInputChange('model')}
                    placeholder='Fiorino'
                  />
                </Field>

                <Field
                  label='Yıl'
                  htmlFor='vehicle-yil'
                  hint='Üretim yılı — sahada fiziksel tanımayı kolaylaştırır.'
                  error={fieldError('model_yili')}
                >
                  <Input
                    id='vehicle-yil'
                    value={values.model_yili}
                    onChange={handleInputChange('model_yili')}
                    placeholder={String(CURRENT_YEAR)}
                    inputMode='numeric'
                    maxLength={4}
                  />
                </Field>

                <Field
                  label='Araç Tipi'
                  hint='Rotalama motorunun sokak ve hız kurallarını baz alacağı profil.'
                  error={fieldError('arac_tipi')}
                >
                  <Select
                    value={values.arac_tipi}
                    onValueChange={(value: VehicleClass) => {
                      setValues((previous) => ({
                        ...previous,
                        arac_tipi: value,
                        kasa_tipi: value === 'motosiklet' ? '' : previous.kasa_tipi,
                      }))
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Araç tipi seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label='Kasa Tipi'
                  hint={
                    isMotorcycle
                      ? 'Motosiklette kasa tipi uygulanmaz.'
                      : 'Yük taşıma bölümünün fiziksel yapısı.'
                  }
                  error={fieldError('kasa_tipi')}
                >
                  <Select
                    value={values.kasa_tipi}
                    onValueChange={(value: VehicleBodyType) => updateField('kasa_tipi', value)}
                    disabled={isMotorcycle}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={isMotorcycle ? 'Uygulanmaz' : 'Kasa tipi seçin'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
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
                      id='vehicle-vardiya-bas'
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
                      id='vehicle-vardiya-bit'
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
                  label='Max Ağırlık (kg)'
                  htmlFor='vehicle-agirlik'
                  hint='Algoritma bu limiti aşan yük ataması yapmaz.'
                  error={fieldError('max_agirlik_kg')}
                >
                  <Input
                    id='vehicle-agirlik'
                    value={values.max_agirlik_kg}
                    onChange={handleInputChange('max_agirlik_kg')}
                    placeholder='650'
                    inputMode='decimal'
                  />
                </Field>

                <Field
                  label='Max Hacim (m³)'
                  htmlFor='vehicle-hacim'
                  hint='Yer kaplayan ürünlerin araca sığıp sığmayacağını planlamak için kullanılır.'
                  error={fieldError('max_hacim_m3')}
                >
                  <Input
                    id='vehicle-hacim'
                    value={values.max_hacim_m3}
                    onChange={handleInputChange('max_hacim_m3')}
                    placeholder='3.2'
                    inputMode='decimal'
                  />
                </Field>

                <Field
                  label='Yetenekler'
                  hint='Sipariş gereksinimleriyle eşleşen özellikler.'
                >
                  <VehicleSkillsMultiSelect
                    value={values.yetenekler}
                    onChange={(yetenekler) => updateField('yetenekler', yetenekler)}
                    options={skillOptions}
                    isLoading={isSkillCatalogLoading}
                  />
                </Field>
              </div>
            )}

            {currentStep.id === 'operation' && (
              <div className='space-y-3'>
                <OperationScopeEditor
                  title='Hizmet Bölgesi'
                  tooltip='Kapsamı il → ilçe → mahalle düzeyinde satır satır ekleyin. Atama motoru aracı yalnızca bu bölgelerdeki işlere yönlendirir.'
                  scopes={values.hizmet_bolgesi_scopes}
                  onChange={(hizmet_bolgesi_scopes) =>
                    updateField('hizmet_bolgesi_scopes', hizmet_bolgesi_scopes)
                  }
                  error={
                    showValidation ? operationErrors.hizmet_bolgesi_scopes : undefined
                  }
                />

                <Field
                  label='Başlangıç Konumu'
                  hint='Routing algoritmasının maliyet hesaplamaya nereden başlayacağını belirler.'
                >
                  <Select
                    value={values.baslangic_stratejisi}
                    onValueChange={(value: VehicleStartStrategy) => {
                      setValues((previous) => ({
                        ...previous,
                        baslangic_stratejisi: value,
                        ...(value === 'ilk_gorev'
                          ? { park_konumu: '', park_lat: null, park_lng: null }
                          : null),
                      }))
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Başlangıç konumu seçin' />
                    </SelectTrigger>
                    <SelectContent>
                      {START_STRATEGY_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {needsParkLocation ? (
                  <Field
                    label='Park Konumu'
                    hint='Haritadan adres seçin; rota maliyeti buradan hesaplanır.'
                    error={fieldError('park_konumu')}
                  >
                    <AddressSearchField
                      id='vehicle-park'
                      value={values.park_konumu}
                      invalid={Boolean(fieldError('park_konumu'))}
                      placeholder='Mahalle, sokak veya cadde ara…'
                      onSelect={(result) => {
                        setValues((previous) => ({
                          ...previous,
                          park_konumu: result.fullAddress || result.label,
                          park_lat: result.latitude,
                          park_lng: result.longitude,
                        }))
                      }}
                      onClear={() => {
                        setValues((previous) => ({
                          ...previous,
                          park_konumu: '',
                          park_lat: null,
                          park_lng: null,
                        }))
                      }}
                    />
                  </Field>
                ) : null}
              </div>
            )}

            {currentStep.id === 'documents' && (
              <div className='space-y-3'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <Field label='Muayene Bitiş' htmlFor='vehicle-muayene' hint='Yaklaşınca filo yöneticisine uyarı üretilir.'>
                    <Input
                      id='vehicle-muayene'
                      type='date'
                      value={values.muayene_bitis}
                      onChange={handleInputChange('muayene_bitis')}
                    />
                  </Field>

                  <Field label='Sigorta Bitiş' htmlFor='vehicle-trafik' hint='Zorunlu mali sorumluluk sigortasının dolacağı tarih.'>
                    <Input
                      id='vehicle-trafik'
                      type='date'
                      value={values.trafik_sigortasi_bitis}
                      onChange={handleInputChange('trafik_sigortasi_bitis')}
                    />
                  </Field>

                  <Field
                    label='Kasko Poliçe No'
                    htmlFor='vehicle-kasko-no'
                    hint='Kaza süreçlerinde evraklara hızlı erişim için takip numarası.'
                  >
                    <Input
                      id='vehicle-kasko-no'
                      value={values.kasko_police_no}
                      onChange={handleInputChange('kasko_police_no')}
                      placeholder='KSK-2024-88421'
                      className='font-mono'
                    />
                  </Field>

                  <Field label='Kasko Bitiş' htmlFor='vehicle-kasko' hint='Kasko güvencesinin sona ereceği tarih.'>
                    <Input
                      id='vehicle-kasko'
                      type='date'
                      value={values.kasko_bitis}
                      onChange={handleInputChange('kasko_bitis')}
                    />
                  </Field>
                </div>

                <VehicleLegalDocumentsUploadSection
                  title='Yasal Belgeler'
                  vehicleId={isEdit && initialVehicle ? initialVehicle.id : undefined}
                  documents={values.evraklar}
                  onChange={(evraklar) =>
                    setValues((previous) => ({ ...previous, evraklar }))
                  }
                  persistToServer={isEdit && Boolean(initialVehicle)}
                  showDownload={isEdit && Boolean(initialVehicle)}
                  onUploadingChange={setIsSubmitting}
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
                    : 'Aracı Ekle'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
