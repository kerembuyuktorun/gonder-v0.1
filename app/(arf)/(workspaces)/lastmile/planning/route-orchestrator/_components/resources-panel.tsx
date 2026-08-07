'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CirclePlus,
  Filter,
  Search,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { VehicleStatusBadge } from '../../../resources/vehicles/_components/vehicle-status-badge'
import {
  buildSkillLabelMap,
  resolveSkillLabel,
  VEHICLE_BODY_LABELS,
  VEHICLE_CLASS_LABELS,
} from '../../../resources/vehicles/_lib/query-vehicles'
import { fetchSkillCatalog } from '../../../_api/skill-catalog'
import { FALLBACK_ORDER_SKILLS } from '../../../_lib/skill-catalog'
import type {
  VehicleOperationalStatus,
  VehicleSkill,
} from '../../../resources/vehicles/_types/vehicle'
import type { OrchestratorVehicle } from '../_types/orchestrator'

type Props = {
  vehicles: OrchestratorVehicle[]
  filteredVehicles: OrchestratorVehicle[]
  selectedIds: readonly string[]
  search: string
  statusFilter: VehicleOperationalStatus | 'all'
  formFilter: string
  skillFilter: VehicleSkill | 'all'
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: VehicleOperationalStatus | 'all') => void
  onFormFilterChange: (value: string) => void
  onSkillFilterChange: (value: VehicleSkill | 'all') => void
  onSelectAllVisible: () => void
  onClearSelection: () => void
  onToggleVehicle: (id: string) => void
}

type FilterOption = {
  value: string
  label: string
  count: number
}

function FilterPicker({
  label,
  searchPlaceholder,
  value,
  options,
  onChange,
}: {
  label: string
  searchPlaceholder: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn(
            'h-8 min-w-0 flex-1 justify-start rounded-full border-dashed px-2 text-xs',
            selected && 'border-amber-400 bg-amber-50 text-amber-900'
          )}
        >
          <CirclePlus className='size-3.5 shrink-0' />
          <span className='truncate'>{selected?.label ?? label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={6}
        className='w-52 overflow-hidden rounded-lg p-0 shadow-lg'
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className='h-8 py-2 text-xs'
          />
          <CommandList className='max-h-56 p-1.5'>
            <CommandEmpty>Sonuç bulunamadı</CommandEmpty>
            {options.map((option) => {
              const active = option.value === value
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(active ? 'all' : option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'mb-0.5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5',
                    active && 'bg-amber-50 text-amber-900'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-amber-300',
                      active && 'border-amber-400'
                    )}
                  >
                    {active ? <span className='size-2 rounded-full bg-amber-400' /> : null}
                  </span>
                  <span className='min-w-0 flex-1 truncate text-xs'>{option.label}</span>
                  <span className='text-[11px] tabular-nums text-muted-foreground'>
                    {option.count}
                  </span>
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Prefer display name from planning-vehicles (assignedCourierName).
 * If only id is present, fall back to "Kurye atanmış" — never "atanmamış".
 */
function courierAssignmentLabel(vehicle: OrchestratorVehicle): string {
  if (vehicle.zimmetli_surucu) return vehicle.zimmetli_surucu
  const noDriver =
    !vehicle.zimmetli_surucu_id ||
    vehicle.disabledReason === 'Bu aracın atanmış bir sürücüsü bulunmamakta'
  return noDriver ? 'Kurye atanmamış' : 'Kurye atanmış'
}

function VehicleCard({
  vehicle,
  selected,
  onToggle,
  cardRef,
  skillLabelMap,
}: {
  vehicle: OrchestratorVehicle
  selected: boolean
  onToggle: () => void
  cardRef?: (node: HTMLDivElement | null) => void
  skillLabelMap: Record<string, string>
}) {
  const disabled = !vehicle.selectable

  return (
    <div
      ref={cardRef}
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-vehicle-id={vehicle.id}
      data-selected={selected ? 'true' : 'false'}
      onClick={() => {
        if (!disabled) onToggle()
      }}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        'w-full rounded-lg border p-2.5 text-left transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        selected && !disabled
          ? 'border-sky-300 bg-sky-50/70 shadow-sm'
          : 'border-border bg-card',
        !disabled && !selected && 'hover:border-slate-300 hover:bg-slate-50/60'
      )}
    >
      <div className='flex items-start gap-2'>
        <Checkbox
          checked={selected}
          disabled={disabled}
          onCheckedChange={() => {
            if (!disabled) onToggle()
          }}
          onClick={(e) => e.stopPropagation()}
          className='mt-0.5'
          aria-label={`${vehicle.plaka} seç`}
        />
        <div className='min-w-0 flex-1 space-y-1.5'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='text-sm font-semibold tracking-tight'>{vehicle.plaka}</span>
            <VehicleStatusBadge
              status={vehicle.durum}
              routeLabel={vehicle.aktif_rota_label}
            />
          </div>

          <div className='flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500'>
            <Truck className='size-3 shrink-0' />
            <span className='truncate'>
              {VEHICLE_CLASS_LABELS[vehicle.arac_tipi]}
              {vehicle.kasa_tipi
                ? ` · ${VEHICLE_BODY_LABELS[vehicle.kasa_tipi]}`
                : ''}
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500'>
            <span className='flex min-w-0 items-center gap-1'>
              <UserRound className='size-3 shrink-0' />
              <span className='truncate'>{courierAssignmentLabel(vehicle)}</span>
            </span>
            <span>
              {vehicle.vardiya_baslangic}–{vehicle.vardiya_bitis}
            </span>
          </div>

          {vehicle.yetenekler.length > 0 ? (
            <div className='flex flex-wrap gap-1'>
              {vehicle.yetenekler.map((skill) => (
                <Badge
                  key={skill}
                  variant='outline'
                  className='h-5 px-1.5 text-[9px] text-slate-600'
                >
                  {resolveSkillLabel(skill, skillLabelMap)}
                </Badge>
              ))}
            </div>
          ) : null}

          {disabled && vehicle.disabledReason ? (
            <p className='flex items-start gap-1 text-[11px] text-rose-700'>
              <AlertTriangle className='mt-0.5 size-3 shrink-0' />
              {vehicle.disabledReason}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ResourcesPanel({
  vehicles,
  filteredVehicles,
  selectedIds,
  search,
  statusFilter,
  formFilter,
  skillFilter,
  onSearchChange,
  onStatusFilterChange,
  onFormFilterChange,
  onSkillFilterChange,
  onSelectAllVisible,
  onClearSelection,
  onToggleVehicle,
}: Props) {
  const [toolbarMode, setToolbarMode] = useState<'actions' | 'filters' | 'search'>(
    'actions'
  )
  const [vehicleSkillCatalog, setVehicleSkillCatalog] = useState(FALLBACK_ORDER_SKILLS)
  const selectedCardNodes = useRef(new Map<string, HTMLDivElement>())
  const prevSelectedKeyRef = useRef('')
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  useEffect(() => {
    let cancelled = false
    fetchSkillCatalog('vehicle').then((result) => {
      if (cancelled || !result.success || result.data.length === 0) return
      setVehicleSkillCatalog(result.data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const skillLabelMap = useMemo(
    () => buildSkillLabelMap(vehicleSkillCatalog),
    [vehicleSkillCatalog]
  )

  const visibleVehicles = useMemo(() => {
    if (selectedIds.length === 0) return filteredVehicles
    const selected: OrchestratorVehicle[] = []
    const rest: OrchestratorVehicle[] = []
    for (const vehicle of filteredVehicles) {
      if (selectedIdSet.has(vehicle.id)) selected.push(vehicle)
      else rest.push(vehicle)
    }
    return [...selected, ...rest]
  }, [filteredVehicles, selectedIds, selectedIdSet])

  useEffect(() => {
    const key = selectedIds.join('|')
    if (key === prevSelectedKeyRef.current) return
    prevSelectedKeyRef.current = key
    if (selectedIds.length === 0) return
    const focusId = selectedIds[selectedIds.length - 1]!
    const frame = window.requestAnimationFrame(() => {
      selectedCardNodes.current.get(focusId)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedIds])
  const statusOptions: FilterOption[] = [
    { value: 'bos_ta', label: 'Boşta', count: vehicles.filter((v) => v.durum === 'bos_ta').length },
    { value: 'yolda', label: 'Yolda', count: vehicles.filter((v) => v.durum === 'yolda').length },
    { value: 'pasif', label: 'Pasif', count: vehicles.filter((v) => v.durum === 'pasif').length },
  ]
  const formOptions: FilterOption[] = [
    ...Object.entries(VEHICLE_CLASS_LABELS).map(([value, label]) => ({
      value: `class:${value}`,
      label,
      count: vehicles.filter((vehicle) => vehicle.arac_tipi === value).length,
    })),
    ...Object.entries(VEHICLE_BODY_LABELS).map(([value, label]) => ({
      value: `body:${value}`,
      label,
      count: vehicles.filter((vehicle) => vehicle.kasa_tipi === value).length,
    })),
  ]
  const skillOptions: FilterOption[] = useMemo(() => {
    const codes = new Set<string>()
    for (const item of vehicleSkillCatalog) codes.add(item.code)
    for (const vehicle of vehicles) {
      for (const skill of vehicle.yetenekler) codes.add(skill)
    }
    return Array.from(codes).map((value) => ({
      value,
      label: resolveSkillLabel(value, skillLabelMap),
      count: vehicles.filter((vehicle) => vehicle.yetenekler.includes(value as VehicleSkill)).length,
    }))
  }, [vehicles, vehicleSkillCatalog, skillLabelMap])

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='shrink-0 space-y-3 border-b border-border p-3'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='flex items-center gap-2 text-sm font-semibold'>
            <Truck className='size-4 text-amber-600' />
            Kaynaklar
          </h2>
          <Badge variant='outline' className='tabular-nums'>
            {filteredVehicles.length}
          </Badge>
        </div>

        {toolbarMode === 'actions' ? (
          <div className='flex items-center gap-1.5'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={() => setToolbarMode('filters')}
            >
              <Filter className='size-3.5' />
              Filtreler
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={() => setToolbarMode('search')}
            >
              <Search className='size-3.5' />
              Ara
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={onSelectAllVisible}
            >
              Görünenleri Seç
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={onClearSelection}
              disabled={selectedIds.length === 0}
            >
              Temizle
            </Button>
          </div>
        ) : null}

        {toolbarMode === 'filters' ? (
          <div className='flex items-center gap-1'>
            <FilterPicker
              label='Durum'
              searchPlaceholder='Durum ara'
              value={statusFilter}
              options={statusOptions}
              onChange={(value) =>
                onStatusFilterChange(value as VehicleOperationalStatus | 'all')
              }
            />
            <FilterPicker
              label='Araç / Kasa'
              searchPlaceholder='Araç veya kasa ara'
              value={formFilter}
              options={formOptions}
              onChange={onFormFilterChange}
            />
            <FilterPicker
              label='Yetenek'
              searchPlaceholder='Yetenek ara'
              value={skillFilter}
              options={skillOptions}
              onChange={(value) =>
                onSkillFilterChange(value as VehicleSkill | 'all')
              }
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              onClick={() => setToolbarMode('actions')}
              aria-label='Filtreleri kapat'
              title='Filtreleri kapat'
            >
              <X className='size-4' />
            </Button>
          </div>
        ) : null}

        {toolbarMode === 'search' ? (
          <div className='flex items-center gap-1.5'>
            <div className='relative min-w-0 flex-1'>
              <Search className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder='Plaka, kurye, bölge…'
                className='h-8 pl-8 text-xs'
                autoFocus
              />
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              onClick={() => {
                onSearchChange('')
                setToolbarMode('actions')
              }}
              aria-label='Aramayı kapat'
              title='Aramayı kapat'
            >
              <X className='size-4' />
            </Button>
          </div>
        ) : null}
      </div>

      <div className='min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3'>
        {visibleVehicles.length === 0 ? (
          <p className='rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground'>
            Filtreye uyan araç yok
          </p>
        ) : (
          visibleVehicles.map((vehicle) => {
            const selected = selectedIdSet.has(vehicle.id)
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                selected={selected}
                skillLabelMap={skillLabelMap}
                onToggle={() => onToggleVehicle(vehicle.id)}
                cardRef={(node) => {
                  if (node) selectedCardNodes.current.set(vehicle.id, node)
                  else selectedCardNodes.current.delete(vehicle.id)
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
