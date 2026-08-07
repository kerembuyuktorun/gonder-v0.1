'use client'

import { useState } from 'react'
import { ChevronDown, Info, Pencil, Plus } from 'lucide-react'
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
import type { ComboboxOption, SevkBilgileri, VehicleRecord, DriverRecord } from '../_types/transport'
import { StepInfoPanel } from './step-info-panel'

interface SevkBilgileriStepProps {
  data: SevkBilgileri
  tasimaciFirmaOptions: ComboboxOption[]
  vehicles: VehicleRecord[]
  drivers: DriverRecord[]
  onChange: (data: SevkBilgileri) => void
  onCreateCarisi?: () => void
  onEditCarisi?: () => void
}

export function SevkBilgileriStep({
  data,
  tasimaciFirmaOptions,
  vehicles,
  drivers,
  onChange,
  onCreateCarisi,
  onEditCarisi,
}: SevkBilgileriStepProps) {
  const selectedFirma = tasimaciFirmaOptions.find((c) => c.id === data.tasimaciFirmaId)

  /* Seçili firmaya göre araç & sürücü filtreleme */
  const vehicleOptions: ComboboxOption[] = vehicles
    .filter((v) => v.carrierId === data.tasimaciFirmaId)
    .map((v) => ({
      id: v.id,
      label: v.plaka,
      description: v.aracTipi,
      keywords: `${v.plaka} ${v.aracTipi}`,
    }))

  const driverOptions: ComboboxOption[] = drivers
    .filter((d) => d.carrierId === data.tasimaciFirmaId)
    .map((d) => ({
      id: d.id,
      label: d.fullName,
      description: d.phone,
      keywords: `${d.fullName} ${d.phone}`,
    }))

  const handleFirmaSelect = (firmaId: string) => {
    onChange({
      ...data,
      tasimaciFirmaId: firmaId,
      aracPlakaId: null,
      surucuId: null,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sol bilgi paneli */}
      <StepInfoPanel
        title="Sevk Bilgileri"
        description="Bu taşımayı hangi firma yapacak? Taşımacı firma, araç plakası ve sürücü bilgilerini girerek sevkiyatın takibini kolayca yapabilirsiniz."
      />

      {/* Sağ form alanı */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Taşımacı Firma, Araç Plakası, Sürücü */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Taşımacı Firma</Label>
            <SearchableCombobox
              placeholder="Taşımacı firma seçin"
              searchPlaceholder="Taşımacı firma ara..."
              emptyText="Sonuç bulunamadı"
              options={tasimaciFirmaOptions}
              selectedId={data.tasimaciFirmaId}
              onSelect={handleFirmaSelect}
              onAction={data.tasimaciFirmaId ? onEditCarisi : onCreateCarisi}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn('text-sm font-medium', data.tasimaciFirmaId ? 'text-slate-700' : 'text-slate-400')}>
              Araç Plakası
            </Label>
            <SearchableCombobox
              placeholder="Araç plakası seçin"
              searchPlaceholder="Plaka ara..."
              emptyText={data.tasimaciFirmaId ? 'Araç bulunamadı' : 'Önce firma seçin'}
              options={vehicleOptions}
              selectedId={data.aracPlakaId}
              onSelect={(val) => onChange({ ...data, aracPlakaId: val })}
              disabled={!data.tasimaciFirmaId}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn('text-sm font-medium', data.tasimaciFirmaId ? 'text-slate-700' : 'text-slate-400')}>
              Sürücü
            </Label>
            <SearchableCombobox
              placeholder="Sürücü seçin"
              searchPlaceholder="Sürücü ara..."
              emptyText={data.tasimaciFirmaId ? 'Sürücü bulunamadı' : 'Önce firma seçin'}
              options={driverOptions}
              selectedId={data.surucuId}
              onSelect={(val) => onChange({ ...data, surucuId: val })}
              disabled={!data.tasimaciFirmaId}
            />
          </div>
        </div>

        {/* Bilgi notları */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Bu taşımayı gerçekleştirecek firmayı seçiniz.</span>
          </div>
          {selectedFirma && (
            <div className="flex items-start gap-2 text-sm text-slate-500">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Araç ve sürücü bilgileri seçili firmaya göre listelenir.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Searchable Combobox ─── */

function SearchableCombobox({
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  selectedId,
  onSelect,
  onAction,
  disabled,
}: {
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  options: ComboboxOption[]
  selectedId: string | null
  onSelect: (value: string) => void
  onAction?: () => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((item) => item.id === selectedId)
  const isEditMode = Boolean(selectedId)

  return (
    <div
      className={cn(
        'flex h-11 items-center rounded-2xl border border-slate-200 bg-white shadow-sm',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
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

      {onAction && (
        <>
          <div className="h-6 w-px bg-slate-200" />
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-full items-center gap-1.5 rounded-r-2xl px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {isEditMode ? 'Düzelt' : 'Yeni'}
          </button>
        </>
      )}
    </div>
  )
}
