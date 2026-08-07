'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import {
  fetchCities,
  fetchDistricts,
  fetchNeighborhoods,
  type GeoItem,
} from '../_api/geography'

export type GeoCascadeValue = {
  cityId: string
  districtId: string
  neighbourId: string
  il: string
  ilce: string
  mahalle: string
}

type Props = {
  value: GeoCascadeValue
  onChange: (value: GeoCascadeValue) => void
  className?: string
}

function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
}

type SelectProps = {
  label: string
  placeholder: string
  valueId: string
  valueLabel: string
  options: GeoItem[]
  loading: boolean
  disabled?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: GeoItem) => void
}

function GeoSelect({
  label,
  placeholder,
  valueId,
  valueLabel,
  options,
  loading,
  disabled,
  open,
  onOpenChange,
  onSelect,
}: SelectProps) {
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            disabled={disabled || loading}
            className='w-full justify-between font-normal'
          >
            {loading ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2 className='size-3.5 animate-spin' />
                Yükleniyor…
              </span>
            ) : (
              valueLabel || placeholder
            )}
            <ChevronDown className='ml-2 size-4 opacity-60' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
          <Command
            filter={(optionValue, search) =>
              normalizeForSearch(optionValue).includes(normalizeForSearch(search)) ? 1 : 0
            }
          >
            <CommandInput placeholder={`${label} ara…`} />
            <CommandList>
              <CommandEmpty>{label} bulunamadı.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      onSelect(option)
                      onOpenChange(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        valueId === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function GeoCascadeFields({ value, onChange, className }: Props) {
  const [cities, setCities] = useState<GeoItem[]>([])
  const [districts, setDistricts] = useState<GeoItem[]>([])
  const [neighborhoods, setNeighborhoods] = useState<GeoItem[]>([])
  const [cityOpen, setCityOpen] = useState(false)
  const [districtOpen, setDistrictOpen] = useState(false)
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadCities() {
      setLoadingCities(true)
      setError(null)
      const result = await fetchCities()
      if (cancelled) return
      if (!result.success) {
        setError(result.error || 'İl listesi alınamadı.')
        setLoadingCities(false)
        return
      }
      setCities(result.data)
      // Edit: yalnızca name varsa id’yi eşle
      if (!value.cityId && value.il) {
        const match = result.data.find(
          (item) => item.name.toLocaleLowerCase('tr-TR') === value.il.toLocaleLowerCase('tr-TR')
        )
        if (match) {
          onChange({ ...value, cityId: match.id, il: match.name })
        }
      }
      setLoadingCities(false)
    }
    void loadCities()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca mount
  }, [])

  useEffect(() => {
    if (!value.cityId) {
      setDistricts([])
      return
    }
    let cancelled = false
    async function loadDistricts() {
      setLoadingDistricts(true)
      const result = await fetchDistricts(value.cityId)
      if (cancelled) return
      if (!result.success) {
        setError(result.error)
        setLoadingDistricts(false)
        return
      }
      setDistricts(result.data)
      if (!value.districtId && value.ilce) {
        const match = result.data.find(
          (item) => item.name.toLocaleLowerCase('tr-TR') === value.ilce.toLocaleLowerCase('tr-TR')
        )
        if (match) {
          onChange({ ...value, districtId: match.id, ilce: match.name })
        }
      }
      setLoadingDistricts(false)
    }
    void loadDistricts()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.cityId])

  useEffect(() => {
    if (!value.districtId) {
      setNeighborhoods([])
      return
    }
    let cancelled = false
    async function loadNeighborhoods() {
      setLoadingNeighborhoods(true)
      const result = await fetchNeighborhoods(value.districtId)
      if (cancelled) return
      if (!result.success) {
        setError(result.error)
        setLoadingNeighborhoods(false)
        return
      }
      setNeighborhoods(result.data)
      if (!value.neighbourId && value.mahalle) {
        const match = result.data.find(
          (item) =>
            item.name.toLocaleLowerCase('tr-TR') === value.mahalle.toLocaleLowerCase('tr-TR')
        )
        if (match) {
          onChange({ ...value, neighbourId: match.id, mahalle: match.name })
        }
      }
      setLoadingNeighborhoods(false)
    }
    void loadNeighborhoods()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.districtId])

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {error ? <p className='text-xs text-rose-600 sm:col-span-3'>{error}</p> : null}

      <GeoSelect
        label='İl'
        placeholder='İl seçin'
        valueId={value.cityId}
        valueLabel={value.il}
        options={cities}
        loading={loadingCities}
        open={cityOpen}
        onOpenChange={setCityOpen}
        onSelect={(item) =>
          onChange({
            cityId: item.id,
            districtId: '',
            neighbourId: '',
            il: item.name,
            ilce: '',
            mahalle: '',
          })
        }
      />

      <GeoSelect
        label='İlçe'
        placeholder='İlçe seçin'
        valueId={value.districtId}
        valueLabel={value.ilce}
        options={districts}
        loading={loadingDistricts}
        disabled={!value.cityId}
        open={districtOpen}
        onOpenChange={setDistrictOpen}
        onSelect={(item) =>
          onChange({
            ...value,
            districtId: item.id,
            neighbourId: '',
            ilce: item.name,
            mahalle: '',
          })
        }
      />

      <GeoSelect
        label='Mahalle'
        placeholder='Mahalle seçin'
        valueId={value.neighbourId}
        valueLabel={value.mahalle}
        options={neighborhoods}
        loading={loadingNeighborhoods}
        disabled={!value.districtId}
        open={neighborhoodOpen}
        onOpenChange={setNeighborhoodOpen}
        onSelect={(item) =>
          onChange({
            ...value,
            neighbourId: item.id,
            mahalle: item.name,
          })
        }
      />
    </div>
  )
}
