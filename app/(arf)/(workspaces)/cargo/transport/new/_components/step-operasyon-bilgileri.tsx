'use client'

import { useState } from 'react'
import { CalendarDays, ChevronDown, Info, Pencil, Plus } from 'lucide-react'
import { tr } from 'date-fns/locale'
import { format, parse } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { AddressRecord, ComboboxOption, CustomerRecord, FaturaKesimTipi, OperasyonBilgileri } from '../_types/transport'
import { StepInfoPanel } from './step-info-panel'

const STANDARD_INPUT_CLASS = 'h-11 rounded-2xl border-slate-200 bg-white px-4 shadow-sm'

interface OperasyonBilgileriStepProps {
  data: OperasyonBilgileri
  customers: CustomerRecord[]
  addresses: AddressRecord[]
  customerComboOptions: ComboboxOption[]
  getAddressOptions: (customerId: string | null) => ComboboxOption[]
  onChange: (data: OperasyonBilgileri) => void
  onCreateCustomer: (side: 'sender' | 'receiver') => void
  onCreateAddress: (side: 'sender' | 'receiver') => void
  onEditCustomer: (side: 'sender' | 'receiver') => void
  onEditAddress: (side: 'sender' | 'receiver') => void
}

export function OperasyonBilgileriStep({
  data,
  customers,
  addresses,
  customerComboOptions,
  getAddressOptions,
  onChange,
  onCreateCustomer,
  onCreateAddress,
  onEditCustomer,
  onEditAddress,
}: OperasyonBilgileriStepProps) {
  const senderCustomer = customers.find((c) => c.id === data.gondericiMusteri.customerId)
  const senderAddress = addresses.find((a) => a.id === data.cikisAdresi.addressId)
  const receiverCustomer = customers.find((c) => c.id === data.aliciMusteri.customerId)
  const receiverAddress = addresses.find((a) => a.id === data.varisAdresi.addressId)

  const senderAddressOptions = getAddressOptions(data.gondericiMusteri.customerId)
  const receiverAddressOptions = getAddressOptions(data.aliciMusteri.customerId)

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sol bilgi paneli */}
      <StepInfoPanel
        title="Operasyon Bilgileri"
        description="Taşımaya ait temel verileri içeren bu bölümde, yükleme tarihi, gönderici ve alıcı müşteri bilgileri ile varış adresi detaylarını girerek sürecin eksiksiz yönetilmesini sağlayabilirsiniz."
      />

      {/* Sağ form alanı */}
      <div className="space-y-5">
        {/* Yükleme Tarihi */}
        <DatePickerField
          label="Yükleme Tarihi"
          value={data.yuklemeTarihi}
          onChange={(dateStr) => onChange({ ...data, yuklemeTarihi: dateStr })}
        />

        {/* Gönderici + Alıcı panelleri */}
        <div className="grid gap-5 xl:grid-cols-2">
          {/* Gönderici */}
          <PartyCard
            customerLabel="Gönderici Müşteri"
            addressLabel="Çıkış Adresi"
            detailsLabel="Gönderici Özeti"
            customerOptions={customerComboOptions}
            addressOptions={senderAddressOptions}
            selectedCustomerId={data.gondericiMusteri.customerId}
            selectedAddressId={data.cikisAdresi.addressId}
            selectedCustomer={senderCustomer}
            selectedAddress={senderAddress}
            onCustomerSelect={(val) =>
              onChange({
                ...data,
                gondericiMusteri: { ...data.gondericiMusteri, customerId: val },
                cikisAdresi: { ...data.cikisAdresi, addressId: null },
              })
            }
            onAddressSelect={(val) =>
              onChange({
                ...data,
                cikisAdresi: { ...data.cikisAdresi, addressId: val },
              })
            }
            onCreateCustomer={() => onCreateCustomer('sender')}
            onCreateAddress={() => onCreateAddress('sender')}
            onEditCustomer={() => onEditCustomer('sender')}
            onEditAddress={() => onEditAddress('sender')}
          />

          {/* Alıcı */}
          <PartyCard
            customerLabel="Alıcı Müşteri"
            addressLabel="Varış Adresi"
            detailsLabel="Alıcı Özeti"
            customerOptions={customerComboOptions}
            addressOptions={receiverAddressOptions}
            selectedCustomerId={data.aliciMusteri.customerId}
            selectedAddressId={data.varisAdresi.addressId}
            selectedCustomer={receiverCustomer}
            selectedAddress={receiverAddress}
            onCustomerSelect={(val) =>
              onChange({
                ...data,
                aliciMusteri: { ...data.aliciMusteri, customerId: val },
                varisAdresi: { ...data.varisAdresi, addressId: null },
              })
            }
            onAddressSelect={(val) =>
              onChange({
                ...data,
                varisAdresi: { ...data.varisAdresi, addressId: val },
              })
            }
            onCreateCustomer={() => onCreateCustomer('receiver')}
            onCreateAddress={() => onCreateAddress('receiver')}
            onEditCustomer={() => onEditCustomer('receiver')}
            onEditAddress={() => onEditAddress('receiver')}
          />
        </div>

        {/* Fatura Kesim Yeri */}
        <FaturaKesimSection
          faturaKesimYeri={data.faturaKesimYeri}
          faturaKesimMusteriId={data.faturaKesimMusteriId}
          customerOptions={customerComboOptions}
          senderCustomer={senderCustomer}
          receiverCustomer={receiverCustomer}
          onFaturaKesimChange={(tip) =>
            onChange({
              ...data,
              faturaKesimYeri: tip,
              faturaKesimMusteriId: tip === 'other' ? data.faturaKesimMusteriId : null,
            })
          }
          onFaturaMusteriSelect={(id) =>
            onChange({ ...data, faturaKesimMusteriId: id })
          }
        />
      </div>
    </div>
  )
}

/* ─── Party Card (Gönderici / Alıcı) ─── */

function PartyCard({
  customerLabel,
  addressLabel,
  detailsLabel,
  customerOptions,
  addressOptions,
  selectedCustomerId,
  selectedAddressId,
  selectedCustomer,
  selectedAddress,
  onCustomerSelect,
  onAddressSelect,
  onCreateCustomer,
  onCreateAddress,
  onEditCustomer,
  onEditAddress,
}: {
  customerLabel: string
  addressLabel: string
  detailsLabel: string
  customerOptions: ComboboxOption[]
  addressOptions: ComboboxOption[]
  selectedCustomerId: string | null
  selectedAddressId: string | null
  selectedCustomer?: CustomerRecord
  selectedAddress?: AddressRecord
  onCustomerSelect: (val: string) => void
  onAddressSelect: (val: string) => void
  onCreateCustomer: () => void
  onCreateAddress: () => void
  onEditCustomer: () => void
  onEditAddress: () => void
}) {
  const canChooseAddress = Boolean(selectedCustomerId)
  const canShowDetails = Boolean(selectedCustomer && selectedAddress)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2.5">
        {/* Müşteri seçimi */}
        <SearchableCombobox
          label={customerLabel}
          placeholder={customerLabel}
          searchPlaceholder={`${customerLabel} ara...`}
          emptyText="Sonuç bulunamadı"
          options={customerOptions}
          selectedId={selectedCustomerId}
          onSelect={onCustomerSelect}
          onAction={selectedCustomerId ? onEditCustomer : onCreateCustomer}
        />

        {/* Adres seçimi */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            canChooseAddress ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <SearchableCombobox
            label={addressLabel}
            placeholder={canChooseAddress ? addressLabel : 'Önce müşteri seçin'}
            searchPlaceholder={`${addressLabel} ara...`}
            emptyText="Bu müşteriye bağlı adres bulunamadı"
            options={addressOptions}
            selectedId={selectedAddressId}
            onSelect={onAddressSelect}
            disabled={!canChooseAddress}
            onAction={selectedAddressId ? onEditAddress : onCreateAddress}
          />
        </div>

        {/* Detay özet kartı */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-500 ease-out',
            canShowDetails ? 'max-h-[1200px] overflow-visible opacity-100' : 'max-h-0 overflow-hidden opacity-0',
          )}
        >
          <div className="mt-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="mb-3 border-b border-slate-200/90 pb-2.5">
              <p className="text-sm font-semibold tracking-tight text-slate-700">{detailsLabel}</p>
            </div>
            <div className="grid gap-x-5 gap-y-2.5 md:grid-cols-2">
              <FloatingLabelDisplay label="VKN / TCKN" value={selectedCustomer?.taxNumber} />
              <FloatingLabelDisplay label="Telefon Numarası" value={selectedAddress?.phone} />
              <FloatingLabelDisplay label="Şube" value={selectedAddress?.branch || selectedCustomer?.branch} />
              <FloatingLabelDisplay label="İl" value={selectedAddress?.city} />
              <FloatingLabelDisplay label="İlçe" value={selectedAddress?.district} />
              <FloatingLabelDisplay label="Mahalle" value={selectedAddress?.neighborhood} />
              <div className="md:col-span-2">
                <FloatingLabelDisplay label="Açık Adres" value={selectedAddress?.line1} multiline />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Searchable Combobox ─── */

function SearchableCombobox({
  label,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  selectedId,
  onSelect,
  disabled,
  onAction,
}: {
  label: string
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  options: ComboboxOption[]
  selectedId: string | null
  onSelect: (value: string) => void
  disabled?: boolean
  onAction?: () => void
}) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((item) => item.id === selectedId)
  const isEditMode = Boolean(selectedId)

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-slate-500">{label}</Label>
      <div
        className={cn(
          'flex h-11 items-center rounded-2xl border border-slate-200 bg-white shadow-sm',
          disabled && 'bg-slate-50',
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 text-left outline-none"
            >
              <span
                className={cn(
                  'truncate text-sm',
                  selectedOption ? 'text-slate-900' : 'text-slate-400',
                )}
              >
                {selectedOption?.label || placeholder}
              </span>
              <ChevronDown className="size-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-(--radix-popover-trigger-width) rounded-2xl border-slate-200 p-0 shadow-xl"
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.description || ''} ${item.keywords || ''}`}
                      onSelect={() => {
                        onSelect(item.id)
                        setOpen(false)
                      }}
                      className="flex flex-col items-start gap-0.5 px-3 py-3"
                    >
                      <span className="font-medium text-slate-900">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-slate-500">{item.description}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-slate-200" />

        <button
          type="button"
          disabled={disabled}
          onClick={onAction}
          className="inline-flex h-full items-center gap-1.5 rounded-r-2xl px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {isEditMode ? 'Düzelt' : 'Yeni'}
        </button>
      </div>
    </div>
  )
}

/* ─── Fatura Kesim Yeri ─── */

const FATURA_KESIM_OPTIONS: { value: FaturaKesimTipi; label: string }[] = [
  { value: 'sender', label: 'Gönderici' },
  { value: 'receiver', label: 'Alıcı' },
  { value: 'other', label: 'Diğer' },
]

function FaturaKesimSection({
  faturaKesimYeri,
  faturaKesimMusteriId,
  customerOptions,
  senderCustomer,
  receiverCustomer,
  onFaturaKesimChange,
  onFaturaMusteriSelect,
}: {
  faturaKesimYeri: FaturaKesimTipi
  faturaKesimMusteriId: string | null
  customerOptions: ComboboxOption[]
  senderCustomer?: CustomerRecord
  receiverCustomer?: CustomerRecord
  onFaturaKesimChange: (tip: FaturaKesimTipi) => void
  onFaturaMusteriSelect: (id: string) => void
}) {
  const resolvedLabel =
    faturaKesimYeri === 'sender'
      ? senderCustomer?.customerName || 'Gönderici seçilmedi'
      : faturaKesimYeri === 'receiver'
        ? receiverCustomer?.customerName || 'Alıcı seçilmedi'
        : null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Info className="size-4 text-primary" />
        <p className="text-sm font-semibold text-slate-700">Fatura Kime Kesilecek?</p>
      </div>

      {/* Seçim butonları */}
      <div className="flex gap-2">
        {FATURA_KESIM_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFaturaKesimChange(opt.value)}
            className={cn(
              'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
              faturaKesimYeri === opt.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Gönderici / Alıcı seçilince bilgi notu */}
      {(faturaKesimYeri === 'sender' || faturaKesimYeri === 'receiver') && (
        <p className="mt-3 text-sm text-slate-500">
          Fatura <span className="font-semibold text-slate-700">{resolvedLabel}</span> adına kesilecektir.
        </p>
      )}

      {/* Diğer seçilince müşteri havuzundan seçim */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          faturaKesimYeri === 'other' ? 'mt-3 max-h-36 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <SearchableCombobox
          label="Fatura Müşterisi"
          placeholder="Müşteri havuzundan seçin"
          searchPlaceholder="Müşteri ara..."
          emptyText="Sonuç bulunamadı"
          options={customerOptions}
          selectedId={faturaKesimMusteriId}
          onSelect={onFaturaMusteriSelect}
        />
      </div>
    </div>
  )
}

/* ─── Date Picker ─── */

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (dateStr: string) => void
}) {
  const [open, setOpen] = useState(false)

  const parsedDate = (() => {
    try {
      const d = parse(value, 'dd.MM.yyyy', new Date())
      return Number.isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  })()

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              STANDARD_INPUT_CLASS,
              'flex w-full items-center justify-between',
              !parsedDate && 'text-slate-400',
            )}
          >
            <span className="text-sm">
              {parsedDate ? format(parsedDate, 'd MMMM yyyy', { locale: tr }) : 'Tarih seçin'}
            </span>
            <CalendarDays className="size-5 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={(date: Date | undefined) => {
              if (date) {
                onChange(format(date, 'dd.MM.yyyy'))
              }
              setOpen(false)
            }}
            locale={tr}
            showOutsideDays
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ─── Floating Label Display ─── */

function FloatingLabelDisplay({
  label,
  value,
  multiline,
}: {
  label: string
  value?: string
  multiline?: boolean
}) {
  return (
    <div
      className={cn(
        'cursor-default border-b border-slate-200/85 px-1 pt-1',
        multiline ? 'pb-3.5' : 'pb-2.5',
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-semibold text-slate-900',
          multiline
            ? 'min-h-12 whitespace-normal wrap-break-word text-[16px] leading-7'
            : 'min-h-6 text-[15px] leading-6',
          !value && 'text-slate-400',
        )}
      >
        {value || 'Henüz seçilmedi'}
      </p>
    </div>
  )
}
