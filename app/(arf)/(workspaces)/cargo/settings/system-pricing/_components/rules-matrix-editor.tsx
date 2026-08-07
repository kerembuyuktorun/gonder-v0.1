"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PriceRuleRow, RegionType, ShipmentType, UnitType } from "../_types"
import { CopyPlus, Plus, Trash2 } from "lucide-react"

interface Props {
  rows: PriceRuleRow[]
  onAdd: () => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onChange: <K extends keyof PriceRuleRow>(index: number, key: K, value: PriceRuleRow[K]) => void
}

const regionOptions: Array<{ value: RegionType; label: string }> = [
  { value: "city_inner", label: "Şehir İçi (0-50 km)" },
  { value: "city_outer", label: "Şehir Dışı (51+ km)" },
  { value: "all_turkey", label: "Tüm Türkiye" },
  { value: "line_based", label: "Hat Bazlı" },
]

export function RulesMatrixEditor({ rows, onAdd, onDuplicate, onRemove, onChange }: Props) {
  const [openDynamicRows, setOpenDynamicRows] = useState<Set<string>>(new Set())

  const toggleDynamicRow = (rowId: string, index: number) => {
    setOpenDynamicRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
        onChange(index, "incrementalPrice", 0)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1.5 size-4" />
          Satır Ekle
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Birim</Label>
                <Select value={row.unitType} onValueChange={(value: UnitType) => onChange(index, "unitType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desi">Desi</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Gönderi Tipi</Label>
                <Select
                  value={row.shipmentType}
                  onValueChange={(value: ShipmentType) => onChange(index, "shipmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koli">Koli</SelectItem>
                    <SelectItem value="zarf">Zarf</SelectItem>
                    <SelectItem value="palet">Palet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Mesafe</Label>
                <Select
                  value={row.regionType}
                  onValueChange={(value: RegionType) => {
                    const selected = regionOptions.find((item) => item.value === value)
                    onChange(index, "regionType", value)
                    onChange(index, "regionLabel", selected?.label ?? "")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Başlangıç</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={row.rangeStart}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(index, "rangeStart", Number(event.target.value || 0))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Bitiş</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={row.rangeEnd}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(index, "rangeEnd", Number(event.target.value || 0))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{openDynamicRows.has(row.id) ? "Taban Fiyat (TL)" : "Fiyat (TL)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={row.basePrice}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(index, "basePrice", Number(event.target.value || 0))
                  }
                />
              </div>

              {openDynamicRows.has(row.id) && (
                <div className="space-y-1.5">
                  <Label>+ Fiyat Dinamik</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.incrementalPrice}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(index, "incrementalPrice", Number(event.target.value || 0))
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant={openDynamicRows.has(row.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDynamicRow(row.id, index)}
              >
                + Fiyat Dinamik
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => onDuplicate(index)}>
                <CopyPlus className="mr-1.5 size-4" />
                Çoğalt
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => onRemove(index)} disabled={rows.length <= 1}>
                <Trash2 className="mr-1.5 size-4" />
                Sil
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
