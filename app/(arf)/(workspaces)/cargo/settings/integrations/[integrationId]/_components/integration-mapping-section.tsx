"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateParameterMappings } from "../../_api/integrations-api"
import type { ParameterMapping } from "../../_types"

interface Props {
  integrationId: string
  value: ParameterMapping[]
  onChange: (next: ParameterMapping[]) => void
}

export function IntegrationMappingSection({ integrationId, value, onChange }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [draftMappings, setDraftMappings] = useState(value)

  useEffect(() => {
    setDraftMappings(value)
  }, [value])

  const localFieldOptions = ["tax_rate_20", "customer_type_retail", "shipment_status_paid", "account_code_7100"]
  const externalFieldOptions = ["TAX_20", "RETAIL", "PAID", "7100"]

  const updateRow = (id: string, patch: Partial<ParameterMapping>) => {
    setDraftMappings((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function handleLocalFieldChange(id: string) {
    return (value: string) => {
      updateRow(id, { localField: value })
    }
  }

  function handleExternalFieldChange(id: string) {
    return (value: string) => {
      updateRow(id, { externalField: value })
    }
  }

  const addRow = () => {
    const next: ParameterMapping = {
      id: `map-${Date.now()}`,
      integrationId,
      localField: "",
      externalField: "",
      mappingType: "direct",
    }
    setDraftMappings((current) => [next, ...current])
  }

  const save = async () => {
    setIsSaving(true)
    try {
      const updated = await updateParameterMappings(integrationId, draftMappings)
      onChange(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Parametre Eşleştirme</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>+ Yeni Eşleştirme Ekle</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {draftMappings.map((row) => (
          <div key={row.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-4">
            <Select value={row.localField || undefined} onValueChange={handleLocalFieldChange(row.id)}>
              <SelectTrigger>
                <SelectValue placeholder="Lokal alan" />
              </SelectTrigger>
              <SelectContent>
                {localFieldOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={row.externalField || undefined} onValueChange={handleExternalFieldChange(row.id)}>
              <SelectTrigger>
                <SelectValue placeholder="Dış alan" />
              </SelectTrigger>
              <SelectContent>
                {externalFieldOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={row.mappingType} onValueChange={(val: "direct" | "lookup") => updateRow(row.id, { mappingType: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="lookup">Lookup</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={Object.entries(row.mappingValues ?? {}).map(([source, target]) => `${source} → ${target}`).join(", ")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateRow(row.id, {
                mappingValues: event.target.value
                  ? { [row.localField || "value"]: event.target.value }
                  : undefined,
              })}
              placeholder="Eşleştirme değeri"
            />
          </div>
        ))}

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline">🤖 Otomatik Eşleştir</Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setDraftMappings(value)}>İptal</Button>
            <Button type="button" onClick={() => void save()} disabled={isSaving}>{isSaving ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
