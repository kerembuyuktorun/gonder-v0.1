'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import {
  fetchCities,
  fetchDistricts,
  fetchNeighborhoods,
  type GeoItem,
} from '../../_api/geography'
import type { OperationScopeRow } from '../_types/customer-detail'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: OperationScopeRow | null
  existingKeys: string[]
  onSave: (row: OperationScopeRow) => void
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

export function OperationScopeRowModal({
  open,
  onOpenChange,
  initial = null,
  existingKeys,
  onSave,
}: Props) {
  const [cities, setCities] = useState<GeoItem[]>([])
  const [districts, setDistricts] = useState<GeoItem[]>([])
  const [neighborhoods, setNeighborhoods] = useState<GeoItem[]>([])
  const [cityId, setCityId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [il, setIl] = useState('')
  const [ilce, setIlce] = useState('')
  const [mahalleler, setMahalleler] = useState<string[]>([])
  const [ilOpen, setIlOpen] = useState(false)
  const [ilceOpen, setIlceOpen] = useState(false)
  const [mahalleOpen, setMahalleOpen] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setIl(initial?.il ?? '')
    setIlce(initial?.ilce ?? '')
    setMahalleler(initial?.tum_mahalleler ? [] : (initial?.mahalleler ?? []))
    setCityId('')
    setDistrictId('')
    setDistricts([])
    setNeighborhoods([])
    setGeoError(null)

    let cancelled = false
    async function loadCities() {
      setLoadingCities(true)
      // BE: GET /cities — ülke adımı yok
      const result = await fetchCities()
      if (cancelled) return
      if (!result.success) {
        setGeoError(result.error || 'İl listesi alınamadı.')
        setLoadingCities(false)
        return
      }
      if (result.data.length === 0) {
        setGeoError('İl listesi boş döndü.')
        setLoadingCities(false)
        return
      }
      setCities(result.data)
      if (initial?.il) {
        const match = result.data.find(
          (item) => item.name.toLocaleLowerCase('tr-TR') === initial.il.toLocaleLowerCase('tr-TR')
        )
        if (match) setCityId(match.id)
      }
      setLoadingCities(false)
    }

    void loadCities()
    return () => {
      cancelled = true
    }
  }, [initial, open])

  useEffect(() => {
    if (!open || !cityId) {
      setDistricts([])
      return
    }

    let cancelled = false
    async function loadDistricts() {
      setLoadingDistricts(true)
      const result = await fetchDistricts(cityId)
      if (cancelled) return
      if (!result.success) {
        setGeoError(result.error)
        setLoadingDistricts(false)
        return
      }
      setDistricts(result.data)
      if (ilce) {
        const match = result.data.find(
          (item) => item.name.toLocaleLowerCase('tr-TR') === ilce.toLocaleLowerCase('tr-TR')
        )
        if (match) setDistrictId(match.id)
      }
      setLoadingDistricts(false)
    }

    void loadDistricts()
    return () => {
      cancelled = true
    }
  }, [cityId, ilce, open])

  useEffect(() => {
    if (!open || !districtId) {
      setNeighborhoods([])
      return
    }

    let cancelled = false
    async function loadNeighborhoods() {
      setLoadingNeighborhoods(true)
      const result = await fetchNeighborhoods(districtId)
      if (cancelled) return
      if (!result.success) {
        setGeoError(result.error)
        setLoadingNeighborhoods(false)
        return
      }
      setNeighborhoods(result.data)
      if (initial?.tum_mahalleler) {
        setMahalleler(result.data.map((item) => item.name))
      }
      setLoadingNeighborhoods(false)
    }

    void loadNeighborhoods()
    return () => {
      cancelled = true
    }
  }, [districtId, initial?.tum_mahalleler, open])

  const mahalleOptions = useMemo(
    () => [...neighborhoods.map((item) => item.name)].sort((a, b) => a.localeCompare(b, 'tr')),
    [neighborhoods]
  )

  const allMahallelerSelected =
    mahalleOptions.length > 0 && mahalleler.length === mahalleOptions.length

  const duplicateKey = il && ilce ? `${il}::${ilce}` : ''
  const isDuplicate =
    Boolean(duplicateKey) &&
    existingKeys.includes(duplicateKey) &&
    duplicateKey !== (initial ? `${initial.il}::${initial.ilce}` : '')

  const canSave = il.trim() && ilce.trim() && !isDuplicate && mahalleler.length > 0

  function toggleMahalle(name: string) {
    setMahalleler((previous) =>
      previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg rounded-2xl'>
        <DialogHeader>
          <DialogTitle>{initial ? 'Kapsam Satırını Düzenle' : 'Kapsam Satırı Ekle'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-1'>
          {geoError ? <p className='text-xs text-rose-600'>{geoError}</p> : null}

          <div className='space-y-1.5'>
            <Label>İl</Label>
            <Popover open={ilOpen} onOpenChange={setIlOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' role='combobox' className='w-full justify-between font-normal'>
                  {loadingCities ? (
                    <span className='inline-flex items-center gap-2'>
                      <Loader2 className='size-3.5 animate-spin' />
                      Yükleniyor…
                    </span>
                  ) : (
                    il || 'İl seçin'
                  )}
                  <ChevronDown className='ml-2 size-4 opacity-60' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                <Command
                  filter={(value, search) =>
                    normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0
                  }
                >
                  <CommandInput placeholder='İl ara…' />
                  <CommandList>
                    <CommandEmpty>İl bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {cities.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => {
                            setCityId(option.id)
                            setIl(option.name)
                            setDistrictId('')
                            setIlce('')
                            setMahalleler([])
                            setNeighborhoods([])
                            setIlOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              cityId === option.id ? 'opacity-100' : 'opacity-0'
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

          <div className='space-y-1.5'>
            <Label>İlçe</Label>
            <Popover open={ilceOpen} onOpenChange={setIlceOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  disabled={!cityId || loadingDistricts}
                  className='w-full justify-between font-normal'
                >
                  {loadingDistricts ? (
                    <span className='inline-flex items-center gap-2'>
                      <Loader2 className='size-3.5 animate-spin' />
                      Yükleniyor…
                    </span>
                  ) : (
                    ilce || 'İlçe seçin'
                  )}
                  <ChevronDown className='ml-2 size-4 opacity-60' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                <Command
                  filter={(value, search) =>
                    normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0
                  }
                >
                  <CommandInput placeholder='İlçe ara…' />
                  <CommandList>
                    <CommandEmpty>İlçe bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {districts.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => {
                            setDistrictId(option.id)
                            setIlce(option.name)
                            setMahalleler([])
                            setIlceOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              districtId === option.id ? 'opacity-100' : 'opacity-0'
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

          <div className='space-y-1.5'>
            <Label>Mahalle</Label>
            <Popover open={mahalleOpen} onOpenChange={setMahalleOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  disabled={!districtId || loadingNeighborhoods}
                  className='w-full justify-between font-normal'
                >
                  {loadingNeighborhoods
                    ? 'Yükleniyor…'
                    : mahalleler.length === 0
                      ? 'Mahalle seçin'
                      : allMahallelerSelected
                        ? 'Tüm mahalleler'
                        : mahalleler.length === 1
                          ? mahalleler[0]
                          : `${mahalleler.length} mahalle seçildi`}
                  <ChevronDown className='ml-2 size-4 opacity-60' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                <Command
                  filter={(value, search) =>
                    normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0
                  }
                >
                  <CommandInput placeholder='Mahalle ara…' />
                  <CommandList className='max-h-72'>
                    <CommandEmpty>Mahalle bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value='Tümünü Seç'
                        onSelect={() => {
                          if (allMahallelerSelected) {
                            setMahalleler([])
                            return
                          }
                          setMahalleler(mahalleOptions)
                        }}
                      >
                        <Checkbox checked={allMahallelerSelected} className='mr-2' />
                        Tümünü Seç
                      </CommandItem>
                      {mahalleOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => toggleMahalle(option)}
                        >
                          <Checkbox checked={mahalleler.includes(option)} className='mr-2' />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {isDuplicate ? (
            <p className='text-xs text-rose-600'>Bu il / ilçe kapsamı zaten listede.</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type='button'
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return
              onSave({
                id: initial?.id ?? `scope-${Date.now()}`,
                il: il.trim(),
                ilce: ilce.trim(),
                mahalleler: allMahallelerSelected ? [] : [...mahalleler],
                tum_mahalleler: allMahallelerSelected,
              })
              onOpenChange(false)
            }}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
