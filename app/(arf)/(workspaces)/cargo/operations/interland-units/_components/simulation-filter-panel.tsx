"use client"

import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddressSelection, CityOption, InterlandUnitsSimulationInput } from "../_types"

interface Props {
  cityOptions: CityOption[]
  isSubmitting: boolean
  onSubmit: (payload: InterlandUnitsSimulationInput) => Promise<void>
  onClear: () => void
}

const formSchema = z.object({
  senderAddress: z.object({
    city: z.string().min(1, "Gönderici il zorunludur."),
    district: z.string().min(1, "Gönderici ilçe zorunludur."),
    neighborhood: z.string().min(1, "Gönderici mahalle zorunludur."),
  }),
  receiverAddress: z.object({
    city: z.string().min(1, "Alıcı il zorunludur."),
    district: z.string().min(1, "Alıcı ilçe zorunludur."),
    neighborhood: z.string().min(1, "Alıcı mahalle zorunludur."),
  }),
})

type SimulationFormValues = z.infer<typeof formSchema>

function getDistricts(cityOptions: CityOption[], city: string) {
  if (!city) return []
  return cityOptions.find((item) => item.name === city)?.districts ?? []
}

function getNeighborhoods(cityOptions: CityOption[], city: string, district: string) {
  if (!city || !district) return []
  const districts = getDistricts(cityOptions, city)
  return districts.find((item) => item.name === district)?.neighborhoods ?? []
}

function AddressFieldGroup({
  prefix,
  title,
  cityOptions,
  values,
  setValue,
  errors,
}: {
  prefix: "senderAddress" | "receiverAddress"
  title: string
  cityOptions: CityOption[]
  values: AddressSelection
  setValue: (
    name: `${"senderAddress" | "receiverAddress"}.${"city" | "district" | "neighborhood"}`,
    value: string,
  ) => void
  errors?: {
    city?: { message?: string }
    district?: { message?: string }
    neighborhood?: { message?: string }
  }
}) {
  const districtOptions = useMemo(() => getDistricts(cityOptions, values.city), [cityOptions, values.city])
  const neighborhoodOptions = useMemo(
    () => getNeighborhoods(cityOptions, values.city, values.district),
    [cityOptions, values.city, values.district],
  )

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>İl</Label>
          <Select
            value={values.city}
            onValueChange={(value: string) => {
              setValue(`${prefix}.city`, value)
              setValue(`${prefix}.district`, "")
              setValue(`${prefix}.neighborhood`, "")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="İl seçin" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.city?.message ? <p className="text-xs text-rose-600">{errors.city.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label>İlçe</Label>
          <Select
            value={values.district}
            onValueChange={(value: string) => {
              setValue(`${prefix}.district`, value)
              setValue(`${prefix}.neighborhood`, "")
            }}
            disabled={!values.city}
          >
            <SelectTrigger>
              <SelectValue placeholder="İlçe seçin" />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map((district) => (
                <SelectItem key={district.name} value={district.name}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.district?.message ? <p className="text-xs text-rose-600">{errors.district.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label>Mahalle</Label>
          <Select
            value={values.neighborhood}
            onValueChange={(value: string) => setValue(`${prefix}.neighborhood`, value)}
            disabled={!values.district}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mahalle seçin" />
            </SelectTrigger>
            <SelectContent>
              {neighborhoodOptions.map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.neighborhood?.message ? <p className="text-xs text-rose-600">{errors.neighborhood.message}</p> : null}
        </div>
      </div>
    </div>
  )
}

export function SimulationFilterPanel({ cityOptions, isSubmitting, onSubmit, onClear }: Props) {
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SimulationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderAddress: { city: "", district: "", neighborhood: "" },
      receiverAddress: { city: "", district: "", neighborhood: "" },
    },
  })

  const senderAddress = watch("senderAddress")
  const receiverAddress = watch("receiverAddress")

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">İnterland Birimleri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <AddressFieldGroup
            prefix="senderAddress"
            title="Gönderici Adres"
            cityOptions={cityOptions}
            values={senderAddress}
            setValue={setValue}
            errors={errors.senderAddress}
          />

          <AddressFieldGroup
            prefix="receiverAddress"
            title="Alıcı Adres"
            cityOptions={cityOptions}
            values={receiverAddress}
            setValue={setValue}
            errors={errors.receiverAddress}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Eşleştiriliyor..." : "Göster"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onClear()
              }}
              disabled={isSubmitting}
            >
              Temizle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
