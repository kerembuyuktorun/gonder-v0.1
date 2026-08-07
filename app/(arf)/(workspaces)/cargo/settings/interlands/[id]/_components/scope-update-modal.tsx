"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import { turkeyCityDistrictNeighborhoods } from "../../_mock/turkey-geography-mock-data"
import type { InterlandScopeRow } from "../../_types"

interface ScopeModalInitialValue {
  city: string
  districts: string[]
  neighborhoods: string[]
  sourceIds?: string[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  scopeRows: InterlandScopeRow[]
  initial?: ScopeModalInitialValue
  onSave: (payload: {
    city: string
    districts: string[]
    neighborhoodsByDistrict: Record<string, string[]>
    sourceIds?: string[]
  }) => Promise<void>
}

function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}

export function ScopeUpdateModal({ open, onOpenChange, scopeRows, initial, onSave }: Props) {
  const [city, setCity] = useState("")
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [districtOpen, setDistrictOpen] = useState(false)
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false)

  useEffect(() => {
    setCity(initial?.city ?? "")
    setSelectedDistricts(initial?.districts ?? [])
    setSelectedNeighborhoods(initial?.neighborhoods ?? [])
  }, [initial, open])

  const citiesFromExisting = useMemo(
    () => Array.from(new Set(scopeRows.map((item) => item.city))),
    [scopeRows],
  )
  const cityOptions = useMemo(
    () =>
      Array.from(
        new Set([...Object.keys(turkeyCityDistrictNeighborhoods), ...citiesFromExisting]),
      ).sort((a, b) => a.localeCompare(b, "tr")),
    [citiesFromExisting],
  )

  const districtsFromCityDictionary = useMemo(
    () => Object.keys(turkeyCityDistrictNeighborhoods[city] ?? {}),
    [city],
  )
  const districtsFromExisting = useMemo(
    () => Array.from(new Set(scopeRows.filter((item) => item.city === city).map((item) => item.district))),
    [city, scopeRows],
  )
  const districtOptions = useMemo(
    () =>
      Array.from(
        new Set([...districtsFromCityDictionary, ...districtsFromExisting]),
      ).sort((a, b) => a.localeCompare(b, "tr")),
    [districtsFromCityDictionary, districtsFromExisting],
  )

  const primaryDistrict = selectedDistricts[0] ?? ""

  const neighborhoodOptions = useMemo(
    () =>
      Array.from(
        new Set(
          selectedDistricts.flatMap((selectedDistrict) => {
            const neighborhoodsFromDictionary = turkeyCityDistrictNeighborhoods[city]?.[selectedDistrict] ?? []
            const neighborhoodsFromExisting = scopeRows
              .filter((item) => item.city === city && item.district === selectedDistrict)
              .map((item) => item.neighborhood)

            return [...neighborhoodsFromDictionary, ...neighborhoodsFromExisting]
          }),
        ),
      ).sort((a, b) => a.localeCompare(b, "tr")),
    [city, scopeRows, selectedDistricts],
  )

  const isMultiDistrictSelection = selectedDistricts.length > 1

  const allNeighborhoodsForSelectedDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          selectedDistricts.flatMap((selectedDistrict) => {
            const fromDictionary = turkeyCityDistrictNeighborhoods[city]?.[selectedDistrict] ?? []
            const fromExisting = scopeRows
              .filter((item) => item.city === city && item.district === selectedDistrict)
              .map((item) => item.neighborhood)

            return [...fromDictionary, ...fromExisting]
          }),
        ),
      ).sort((a, b) => a.localeCompare(b, "tr")),
    [city, scopeRows, selectedDistricts],
  )

  useEffect(() => {
    if (isMultiDistrictSelection) {
      setSelectedNeighborhoods((prev) =>
        areStringArraysEqual(prev, allNeighborhoodsForSelectedDistricts)
          ? prev
          : allNeighborhoodsForSelectedDistricts,
      )
    }
  }, [allNeighborhoodsForSelectedDistricts, isMultiDistrictSelection])

  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setSelectedNeighborhoods((prev) => (prev.length === 0 ? prev : []))
      return
    }

    if (selectedDistricts.length === 1) {
      setSelectedNeighborhoods((prev) => {
        const next = prev.filter((item) => neighborhoodOptions.includes(item))
        return areStringArraysEqual(prev, next) ? prev : next
      })
    }
  }, [neighborhoodOptions, selectedDistricts])

  const toggleNeighborhood = (name: string) => {
    if (isMultiDistrictSelection) {
      return
    }

    setSelectedNeighborhoods((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    )
  }

  const allNeighborhoodsSelected =
    neighborhoodOptions.length > 0 && selectedNeighborhoods.length === neighborhoodOptions.length

  const allDistrictsSelected =
    districtOptions.length > 0 && selectedDistricts.length === districtOptions.length

  const toggleDistrict = (name: string) => {
    setSelectedDistricts((prev) => {
      const next = prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
      return next.sort((a, b) => a.localeCompare(b, "tr"))
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Kapsam Satırı Düzenle" : "Kapsam Satırı Ekle"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-1 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Şehir</Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                  {city || "Şehir seçin"}
                  <ChevronDown className="ml-2 size-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command filter={(value: string, search: string) => (normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0)}>
                  <CommandInput placeholder="Şehir ara..." />
                  <CommandList>
                    <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {cityOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => {
                            setCity(option)
                            setSelectedDistricts([])
                            setSelectedNeighborhoods([])
                            setCityOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 size-4", city === option ? "opacity-100" : "opacity-0")} />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label>İlçe</Label>
            <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={!city}
                  className="w-full justify-between font-normal"
                >
                  {selectedDistricts.length === 0
                    ? "İlçe seçin"
                    : selectedDistricts.length === 1
                      ? selectedDistricts[0]
                      : `${selectedDistricts.length} ilçe seçildi`}
                  <ChevronDown className="ml-2 size-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command filter={(value: string, search: string) => (normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0)}>
                  <CommandInput placeholder="İlçe ara..." />
                  <CommandList>
                    <CommandEmpty>İlçe bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="Tümünü Seç"
                        onSelect={() => {
                          if (allDistrictsSelected) {
                            setSelectedDistricts([])
                            setSelectedNeighborhoods([])
                            return
                          }
                          setSelectedDistricts(districtOptions)
                        }}
                      >
                        <Checkbox checked={allDistrictsSelected} className="mr-2" />
                        Tümünü Seç
                      </CommandItem>
                      {districtOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => {
                            toggleDistrict(option)
                          }}
                        >
                          <Checkbox checked={selectedDistricts.includes(option)} className="mr-2" />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Mahalle</Label>
            <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!city || selectedDistricts.length === 0 || isMultiDistrictSelection}
                  className="w-full justify-between font-normal"
                >
                  {selectedDistricts.length === 0
                    ? "Mahalle seçin"
                    : isMultiDistrictSelection
                      ? "Tümü seçildi"
                      : selectedNeighborhoods.length === 0
                        ? "Mahalle seçin"
                        : selectedNeighborhoods.length === 1
                          ? selectedNeighborhoods[0]
                          : `${selectedNeighborhoods.length} mahalle seçildi`}
                  <ChevronDown className="ml-2 size-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command filter={(value: string, search: string) => (normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0)}>
                  <CommandInput placeholder="Mahalle ara..." />
                  <CommandList className="max-h-72">
                    <CommandEmpty>Mahalle bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="Tümünü Seç"
                        onSelect={() => {
                          if (allNeighborhoodsSelected) {
                            setSelectedNeighborhoods([])
                            return
                          }
                          setSelectedNeighborhoods(neighborhoodOptions)
                        }}
                      >
                        <Checkbox checked={allNeighborhoodsSelected} className="mr-2" />
                        Tümünü Seç
                      </CommandItem>
                      {neighborhoodOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => toggleNeighborhood(option)}
                        >
                          <Checkbox checked={selectedNeighborhoods.includes(option)} className="mr-2" />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={!city.trim() || selectedDistricts.length === 0 || selectedNeighborhoods.length === 0 || isSubmitting}
            onClick={async () => {
              if (!city.trim() || selectedDistricts.length === 0 || selectedNeighborhoods.length === 0) {
                return
              }

              const neighborhoodsByDistrict = Object.fromEntries(
                selectedDistricts.map((selectedDistrict) => {
                  const districtNeighborhoods = Array.from(
                    new Set([
                      ...(turkeyCityDistrictNeighborhoods[city]?.[selectedDistrict] ?? []),
                      ...scopeRows
                        .filter((item) => item.city === city && item.district === selectedDistrict)
                        .map((item) => item.neighborhood),
                    ]),
                  ).sort((a, b) => a.localeCompare(b, "tr"))

                  return [
                    selectedDistrict,
                    isMultiDistrictSelection
                      ? districtNeighborhoods
                      : selectedDistrict === primaryDistrict
                        ? selectedNeighborhoods
                        : districtNeighborhoods,
                  ]
                }),
              )

              setIsSubmitting(true)
              try {
                await onSave({
                  city: city.trim(),
                  districts: selectedDistricts,
                  neighborhoodsByDistrict,
                  sourceIds: initial?.sourceIds,
                })
                onOpenChange(false)
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
