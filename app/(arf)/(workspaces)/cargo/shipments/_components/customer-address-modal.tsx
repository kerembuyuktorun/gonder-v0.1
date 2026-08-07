'use client'

import { type ChangeEvent, type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, X } from 'lucide-react'

export type PartySide = 'sender' | 'receiver'
export type ModalEntity = 'customer' | 'address'
export type ModalMode = 'create' | 'edit'
export type CustomerType = 'corporate' | 'individual'
export type CustomerCreateStep = 'type' | 'customer' | 'address'

export interface ModalState {
  side: PartySide
  entity: ModalEntity
  mode: ModalMode
  targetId?: string
}

export interface CustomerFormState {
  customerType: CustomerType
  tradeName: string
  taxNumber: string
  taxOffice: string
  tcIdentityNumber: string
  firstName: string
  lastName: string
  email: string
  contactName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  branch: string
}

export interface AddressFormState {
  label: string
  city: string
  district: string
  neighborhood: string
  line1: string
  contactName: string
  phone: string
  branch: string
}

interface CustomerAddressModalProps {
  modalState: ModalState | null
  customerCreateStep: CustomerCreateStep
  customerForm: CustomerFormState
  addressForm: AddressFormState
  modalError: string
  setCustomerForm: Dispatch<SetStateAction<CustomerFormState>>
  setAddressForm: Dispatch<SetStateAction<AddressFormState>>
  onClose: () => void
  onBack: () => void
  onSave: () => void
}

const cityBranchMap: Record<string, string> = {
  Adana: 'Adana Şube',
  Ankara: 'Ankara Şube',
  İstanbul: 'İstanbul Şube',
  İzmir: 'İzmir Şube',
  Kahramanmaraş: 'Kahramanmaraş Şube',
  Mersin: 'Mersin Şube',
}

type BranchResolutionRule = {
  city: string
  district?: string
  neighborhood?: string
  branch: string
}

const branchResolutionRules: BranchResolutionRule[] = [
  { city: 'Adana', district: 'Seyhan', neighborhood: 'Alidede', branch: 'Adana Şube' },
  { city: 'Kahramanmaraş', district: 'Onikişubat', neighborhood: 'Afşar', branch: 'Kahramanmaraş Şube' },
  { city: 'İstanbul', district: 'Başakşehir', neighborhood: 'İkitelli OSB', branch: 'İstanbul Şube' },
  { city: 'İzmir', district: 'Bornova', branch: 'İzmir Şube' },
  { city: 'Ankara', district: 'Çankaya', branch: 'Ankara Şube' },
  { city: 'Mersin', district: 'Akdeniz', branch: 'Mersin Şube' },
]

function normalizeLocationValue(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

export function resolveAddressBranch(city: string, district: string, neighborhood: string) {
  const normalizedCity = normalizeLocationValue(city)
  const normalizedDistrict = normalizeLocationValue(district)
  const normalizedNeighborhood = normalizeLocationValue(neighborhood)

  const matchedRule = branchResolutionRules.find((rule) => {
    if (normalizeLocationValue(rule.city) !== normalizedCity) {
      return false
    }

    if (rule.district && normalizeLocationValue(rule.district) !== normalizedDistrict) {
      return false
    }

    if (rule.neighborhood && normalizeLocationValue(rule.neighborhood) !== normalizedNeighborhood) {
      return false
    }

    return true
  })

  if (matchedRule) {
    return matchedRule.branch
  }

  return cityBranchMap[city.trim()] || ''
}

const cityOptions = ['Adana', 'Ankara', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Mersin']
const districtOptions = ['Seyhan', 'Çankaya', 'Başakşehir', 'Bornova', 'Onikişubat', 'Akdeniz']
const neighborhoodOptions = ['Alidede', 'Afşar', 'İkitelli OSB', 'Merkez Mahallesi', 'Yeniköy']
const addressTitleOptions = [
  'Gönderici Merkez Adres',
  'Alıcı Fabrika Adres',
  'Merkez Depo',
  'Şube Depo',
  'Operasyon Merkezi',
  'Sevkiyat Noktası',
]

const customerCreateSteps = [
  { id: 'type' as CustomerCreateStep, label: 'Tip Seçimi' },
  { id: 'customer' as CustomerCreateStep, label: 'Müşteri Bilgileri' },
  { id: 'address' as CustomerCreateStep, label: 'Adres Bilgileri' },
]

export function CustomerAddressModal({
  modalState,
  customerCreateStep,
  customerForm,
  addressForm,
  modalError,
  setCustomerForm,
  setAddressForm,
  onClose,
  onBack,
  onSave,
}: CustomerAddressModalProps) {
  if (!modalState) {
    return null
  }

  const isCustomerCreateFlow = modalState.entity === 'customer' && modalState.mode === 'create'
  const isAddressStepInCreateFlow = isCustomerCreateFlow && customerCreateStep === 'address'
  const isAddressCreateMode = modalState.entity === 'address' && modalState.mode === 'create'
  const isAddressEditMode = modalState.entity === 'address' && modalState.mode === 'edit'
  const showCustomerStepIndicator = modalState.entity === 'customer' && isCustomerCreateFlow
  const activeCustomerStepIndex = customerCreateSteps.findIndex((step) => step.id === customerCreateStep)

  const selectedCustomerTypeLabel = customerForm.customerType === 'corporate' ? 'Kurumsal Müşteri' : 'Bireysel Müşteri'
  const selectedCustomerSummary =
    customerForm.customerType === 'corporate'
      ? { label: 'Şirket Adı', value: customerForm.tradeName.trim() }
      : { label: 'Müşteri Ad Ve Soyadı', value: `${customerForm.firstName} ${customerForm.lastName}`.trim() }

  const contactNameLabel = customerForm.customerType === 'corporate' ? 'Şirket Yetkili Adı' : 'Ad'
  const contactSurnameLabel = customerForm.customerType === 'corporate' ? 'Şirket Yetkili Soyadı' : 'Soyad'
  const contactEmailLabel = customerForm.customerType === 'corporate' ? 'Şirket Yetkili Email' : 'Email'
  const contactPhoneLabel = customerForm.customerType === 'corporate' ? 'Şirket Yetkili Telefonu' : 'Telefon Numarası'
  const availableAddressTitleOptions = useMemo(() => {
    const optionSet = new Set(addressTitleOptions)
    const currentLabel = addressForm.label.trim()

    if (currentLabel) {
      optionSet.add(currentLabel)
    }

    return Array.from(optionSet)
  }, [addressForm.label])

  const resolvedAddressBranch = useMemo(
    () => resolveAddressBranch(addressForm.city, addressForm.district, addressForm.neighborhood),
    [addressForm.city, addressForm.district, addressForm.neighborhood],
  )

  const modalTitle = useMemo(() => {
    if (modalState.entity === 'address') {
      return modalState.mode === 'edit' ? 'Adresi Düzenle' : 'Yeni Adres Ekle'
    }

    return `${modalState.mode === 'edit' ? 'Düzenle' : 'Yeni'} ${modalState.side === 'sender' ? 'Gönderici' : 'Alıcı'} Müşteri ${modalState.mode === 'edit' ? '' : 'Ekle'}`
  }, [modalState.entity, modalState.mode, modalState.side])

  const modalDescription = useMemo(() => {
    if (isAddressStepInCreateFlow) {
      return 'Müşteri kaydı tamamlandı. Şimdi adres bilgisini ekleyip seçimi tamamlayabilirsiniz.'
    }

    if (modalState.entity === 'address' && modalState.mode === 'edit') {
      return 'Kayıtlı adres üzerinde gerekli güncellemeleri yapabilirsiniz.'
    }

    if (modalState.entity === 'address') {
      return 'Adres bilgisini oluşturun. Şube alanı konuma göre sistem tarafından otomatik atanır.'
    }

    if (modalState.mode === 'edit') {
      return 'Kayıt bilgilerini güncelleyip kaydedin.'
    }

    return 'Önce müşteri tipini seçin, ardından formu doldurup adrese geçin.'
  }, [isAddressStepInCreateFlow, modalState.entity, modalState.mode])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-4 pt-16 backdrop-blur-[2px]">
      <div className="max-h-[calc(100vh-5rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900">
              {modalTitle}
            </h2>
            <p className="text-sm text-slate-500">
              {modalDescription}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {showCustomerStepIndicator && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                {customerCreateSteps.map((step, index) => {
                  const isActive = index === activeCustomerStepIndex
                  const isCompleted = index < activeCustomerStepIndex

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        'inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition',
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : isCompleted
                          ? 'bg-lime-50 text-slate-900'
                          : 'bg-white text-slate-500',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                          isActive ? 'bg-white/15 text-white' : isCompleted ? 'bg-lime-200 text-slate-900' : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 truncate font-medium">{step.label}</div>
                    </div>
                  )
                })}
              </div>

              {customerCreateStep !== 'type' && (
                <div className="px-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {customerCreateStep === 'address' ? (
                    <>
                      {selectedCustomerSummary.label}:{' '}
                      <span className="font-semibold text-slate-800">{selectedCustomerSummary.value || '-'}</span>
                    </>
                  ) : (
                    <>
                      Seçilen tip: <span className="font-semibold text-slate-800">{selectedCustomerTypeLabel}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {modalState.entity === 'customer' && customerCreateStep === 'type' ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    'group rounded-[24px] border px-5 py-4 text-left transition',
                    customerForm.customerType === 'corporate'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white',
                  )}
                  onClick={() => setCustomerForm((current) => ({ ...current, customerType: 'corporate' }))}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">Kurumsal Müşteri</div>
                      <div
                        className={cn(
                          'mt-1 text-sm',
                          customerForm.customerType === 'corporate' ? 'text-white/75' : 'text-slate-500',
                        )}
                      >
                        Vergi bilgileri ve şirket yetkilisi ile kayıt oluşturun.
                      </div>
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition',
                        customerForm.customerType === 'corporate'
                          ? 'border-white bg-white text-slate-900'
                          : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400',
                      )}
                    >
                      <div className="size-2 rounded-full bg-current" />
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className={cn(
                    'group rounded-[24px] border px-5 py-4 text-left transition',
                    customerForm.customerType === 'individual'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white',
                  )}
                  onClick={() => setCustomerForm((current) => ({ ...current, customerType: 'individual' }))}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">Bireysel Müşteri</div>
                      <div
                        className={cn(
                          'mt-1 text-sm',
                          customerForm.customerType === 'individual' ? 'text-white/75' : 'text-slate-500',
                        )}
                      >
                        Kişisel kimlik ve iletişim bilgileriyle hızlı kayıt açın.
                      </div>
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition',
                        customerForm.customerType === 'individual'
                          ? 'border-white bg-white text-slate-900'
                          : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400',
                      )}
                    >
                      <div className="size-2 rounded-full bg-current" />
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-center text-sm text-slate-500">
                Devam etmeden önce müşteri tipini seçin. Sonraki adımda form alanları seçime göre açılacaktır.
              </p>
            </div>
          ) : modalState.entity === 'customer' && customerCreateStep === 'customer' ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {customerForm.customerType === 'corporate' ? (
                  <>
                    <div className="sm:col-span-2">
                      <FloatingLabelField
                        label="Şirket Adı"
                        value={customerForm.tradeName}
                        placeholder="Şirket adı"
                        onChange={(value) => setCustomerForm((current) => ({ ...current, tradeName: value }))}
                      />
                    </div>
                    <FloatingLabelField
                      label="Vergi Numarası"
                      value={customerForm.taxNumber}
                      placeholder="Vergi numarası"
                      onChange={(value) => setCustomerForm((current) => ({ ...current, taxNumber: value }))}
                    />
                    <FloatingLabelField
                      label="Vergi Dairesi"
                      value={customerForm.taxOffice}
                      placeholder="Vergi dairesi"
                      onChange={(value) => setCustomerForm((current) => ({ ...current, taxOffice: value }))}
                    />
                    <div className="sm:col-span-2 pt-1">
                      <h3 className="text-sm font-semibold text-slate-900">Şirket Yetkili Bilgileri</h3>
                    </div>
                  </>
                ) : null}

                <FloatingLabelField
                  label={contactNameLabel}
                  value={customerForm.firstName}
                  placeholder={contactNameLabel}
                  onChange={(value) => setCustomerForm((current) => ({ ...current, firstName: value }))}
                />
                <FloatingLabelField
                  label={contactSurnameLabel}
                  value={customerForm.lastName}
                  placeholder={contactSurnameLabel}
                  onChange={(value) => setCustomerForm((current) => ({ ...current, lastName: value }))}
                />

                {customerForm.customerType === 'individual' && (
                  <div className="sm:col-span-2">
                    <FloatingLabelField
                      label="TC Kimlik Numarası"
                      value={customerForm.tcIdentityNumber}
                      placeholder="11 haneli TC kimlik numarası"
                      onChange={(value) => setCustomerForm((current) => ({ ...current, tcIdentityNumber: value }))}
                    />
                  </div>
                )}

                <FloatingLabelField
                  label={contactEmailLabel}
                  value={customerForm.email}
                  placeholder={customerForm.customerType === 'corporate' ? 'Yetkili email' : 'Email (bireyselde opsiyonel)'}
                  onChange={(value) => setCustomerForm((current) => ({ ...current, email: value }))}
                />
                <FloatingLabelField
                  label={contactPhoneLabel}
                  value={customerForm.phone}
                  placeholder="5XX XXX XX XX"
                  onChange={(value) => setCustomerForm((current) => ({ ...current, phone: value }))}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-500">Adres Başlığı</Label>
                  <AddressTitleSelect
                    value={addressForm.label}
                    options={availableAddressTitleOptions}
                    onChange={(value) => setAddressForm((current) => ({ ...current, label: value }))}
                  />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-500">Şehir</Label>
                    <Select
                      value={addressForm.city}
                      onValueChange={(value: string) =>
                        setAddressForm((current) => {
                          const next = { ...current, city: value }
                          return isAddressCreateMode
                            ? { ...next, branch: resolveAddressBranch(next.city, next.district, next.neighborhood) }
                            : next
                        })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-sm">
                        <SelectValue placeholder="Şehir Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cityOptions.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-500">İlçe</Label>
                    <Select
                      value={addressForm.district}
                      onValueChange={(value: string) =>
                        setAddressForm((current) => {
                          const next = { ...current, district: value }
                          return isAddressCreateMode
                            ? { ...next, branch: resolveAddressBranch(next.city, next.district, next.neighborhood) }
                            : next
                        })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-sm">
                        <SelectValue placeholder="İlçe Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {districtOptions.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-500">Mahalle</Label>
                    <Select
                      value={addressForm.neighborhood}
                      onValueChange={(value: string) =>
                        setAddressForm((current) => {
                          const next = { ...current, neighborhood: value }
                          return isAddressCreateMode
                            ? { ...next, branch: resolveAddressBranch(next.city, next.district, next.neighborhood) }
                            : next
                        })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-sm">
                        <SelectValue placeholder="Mahalle Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoodOptions.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FloatingLabelField
                    label="Telefon Numarası"
                    value={addressForm.phone}
                    placeholder="Boş bırakırsanız varsayılan kullanılır."
                    onChange={(value) => setAddressForm((current) => ({ ...current, phone: value }))}
                  />
                  {isAddressEditMode ? (
                    <FloatingLabelField
                      label="Şube"
                      value={addressForm.branch}
                      placeholder="Bağlı şube"
                      onChange={(value) => setAddressForm((current) => ({ ...current, branch: value }))}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-500">Bağlı Şube</Label>
                      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-700 shadow-sm">
                        {resolvedAddressBranch || 'Konuma göre otomatik atanacak'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block text-sm font-medium text-slate-500">Açık Adres</Label>
                  <Textarea
                    value={addressForm.line1}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
                    placeholder="Cadde, sokak, bina ve kapı numarasını girin"
                    className="min-h-32 rounded-2xl border-slate-200 bg-white px-4 py-3 shadow-sm focus-visible:ring-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {modalError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {modalError}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" className="rounded-2xl" onClick={onBack}>
            Geri
          </Button>
          <Button className="rounded-2xl" onClick={onSave}>
            {modalState.entity === 'customer' && customerCreateStep === 'type'
              ? 'Devam Et'
              : isAddressStepInCreateFlow
              ? 'Adresi Kaydet ve Seç'
              : modalState.entity === 'customer' && modalState.mode === 'create'
              ? 'Müşteriyi Kaydet ve Adrese Geç'
              : 'Kaydet ve Seç'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function AddressTitleSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left shadow-sm outline-none"
        >
          <span className={cn('truncate text-sm', value ? 'text-slate-900' : 'text-slate-400')}>
            {value || 'Adres Başlığı Seçin'}
          </span>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) rounded-2xl border-slate-200 p-0 shadow-xl">
        <Command>
          <CommandInput placeholder="Adres başlığı ara..." />
          <CommandList>
            <CommandEmpty>Adres başlığı bulunamadı.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2.5"
                >
                  <Check className={cn('size-4 text-slate-700', value === option ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function FloatingLabelField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-500">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-sm focus-visible:ring-slate-300"
      />
    </div>
  )
}
