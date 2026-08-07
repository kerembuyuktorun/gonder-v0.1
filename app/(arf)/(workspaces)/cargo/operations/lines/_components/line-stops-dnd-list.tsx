"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GripVertical, Trash2 } from "lucide-react"
import type { LineStopFormRow, StopOperationType } from "../_types"

interface Props {
  stops: LineStopFormRow[]
  getLocationOptions: (index: number) => Array<{ id: string; name: string; type: "transfer_center" | "branch" }>
  onChange: (next: LineStopFormRow[]) => void
}

const operationOptions: Array<{ value: StopOperationType; label: string }> = [
  { value: "pickup_only", label: "Sadece Yükleme" },
  { value: "dropoff_only", label: "Sadece İndirme" },
  { value: "pickup_dropoff", label: "İndirme + Yükleme" },
]

export function LineStopsDndList({ stops, getLocationOptions, onChange }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const updateStop = (index: number, patch: Partial<LineStopFormRow>) => {
    onChange(stops.map((item, idx) => (idx === index ? { ...item, ...patch } : item)))
  }

  const removeStop = (index: number) => {
    onChange(stops.filter((_, idx) => idx !== index))
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return
    const next = [...stops]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    onChange(next)
    setDragIndex(null)
  }

  return (
    <div className="space-y-3">
      {stops.map((stop, index) => {
        const locationOptions = getLocationOptions(index)
        return (
          <div
            key={stop.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-12"
          >
          <div className="md:col-span-1 flex items-center justify-center text-slate-400">
            <GripVertical className="size-4" />
          </div>

          <div className="space-y-1 md:col-span-5">
            <Label className="text-xs">Lokasyon</Label>
            <Select
              value={stop.locationId}
              onValueChange={(value: string) => {
                const loc = locationOptions.find((item) => item.id === value)
                if (!loc) return
                updateStop(index, {
                  locationId: loc.id,
                  locationName: loc.name,
                  locationType: loc.type,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lokasyon seçin" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 md:col-span-5">
            <Label className="text-xs">İşlem Tipi</Label>
            <Select
              value={stop.operationType}
              onValueChange={(value: string) => updateStop(index, { operationType: value as StopOperationType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="İşlem tipi" />
              </SelectTrigger>
              <SelectContent>
                {operationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1 flex items-center justify-center">
            <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(index)}>
              <Trash2 className="size-4 text-rose-600" />
            </Button>
          </div>
          </div>
        )
      })}
    </div>
  )
}
