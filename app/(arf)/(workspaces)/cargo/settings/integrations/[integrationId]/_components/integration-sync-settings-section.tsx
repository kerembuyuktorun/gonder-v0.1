"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateSyncSettings } from "../../_api/integrations-api"
import { INTEGRATION_STATUS_LABELS } from "../../_types"
import type { IntegrationLogEntry, IntegrationRecord, SyncRule, SyncSettingsRecord } from "../../_types"

interface Props {
  integration: IntegrationRecord
  logs: IntegrationLogEntry[]
  value: SyncSettingsRecord
  onChange: (next: SyncSettingsRecord) => void
}

const triggerOptions = [
  "shipment_status_delivered",
  "shipment_status_returned",
  "shipment_status_failed",
  "new_customer",
  "new_order",
  "inventory_changed",
]

const targetOptions = ["parasut", "trendyol", "twilio", "custom-webhook"]

const actionOptions = [
  "create_invoice",
  "create_refund_invoice",
  "add_note",
  "create_current_account",
  "import_order",
  "update_inventory",
]

export function IntegrationSyncSettingsSection({ integration, logs, value, onChange }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState(value)
  const [editingRule, setEditingRule] = useState<SyncRule | null>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const stats = useMemo(() => {
    const lastSuccess = logs.find((log) => log.status === "success")?.timestamp ?? integration.lastSyncAt
    const last24HoursFailures = logs.filter((log) => {
      if (log.status !== "failed") return false
      return Date.now() - new Date(log.timestamp).valueOf() <= 24 * 60 * 60 * 1000
    }).length

    return {
      lastSuccess,
      last24HoursFailures,
      totalOperations: logs.length,
    }
  }, [integration.lastSyncAt, integration.status, logs])

  const toggleRule = (id: string) => {
    const next: SyncSettingsRecord = {
      ...draft,
      syncRules: draft.syncRules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
    }
    setDraft(next)
  }

  const updateEditingRule = (patch: Partial<SyncRule>) => {
    if (!editingRule) return
    setEditingRule({ ...editingRule, ...patch })
  }

  function handleTriggerChange(value: string) {
    updateEditingRule({ trigger: value })
  }

  function handleTargetSystemChange(value: string) {
    updateEditingRule({ targetSystem: value })
  }

  function handleActionChange(value: string) {
    updateEditingRule({ action: value })
  }

  const applyRuleChanges = () => {
    if (!editingRule) return
    setDraft((current) => ({
      ...current,
      syncRules: current.syncRules.map((rule) => (rule.id === editingRule.id ? editingRule : rule)),
    }))
    setEditingRule(null)
  }

  const save = async () => {
    setIsSaving(true)
    try {
      const updated = await updateSyncSettings(draft.integrationId, draft)
      setDraft(updated)
      onChange(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Senkronizasyon Ayarları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Bağlantı Durumu</p>
            <Badge variant="outline" className="mt-2">{INTEGRATION_STATUS_LABELS[integration.status]}</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Son Başarılı Senkronizasyon</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{stats.lastSuccess ? new Date(stats.lastSuccess).toLocaleString("tr-TR") : "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Son 24 Saat Hata</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{stats.last24HoursFailures} hata</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Toplam İşlem</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{stats.totalOperations} işlem</p>
          </div>
        </div>

        {draft.syncRules.map((rule) => (
          <div key={rule.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{rule.trigger} → {rule.action}</p>
              <p className="text-xs text-slate-500">Hedef: {rule.targetSystem} • Aralık: {rule.syncInterval ?? 0} dk</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingRule(rule)}>
                Düzenle
              </Button>
              <Button type="button" variant={rule.enabled ? "default" : "outline"} size="sm" onClick={() => toggleRule(rule.id)}>
                {rule.enabled ? "Açık" : "Kapalı"}
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button type="button" onClick={() => void save()} disabled={isSaving}>{isSaving ? "Kaydediliyor..." : "Kaydet"}</Button>
        </div>

        <Drawer open={Boolean(editingRule)} onOpenChange={(open) => !open && setEditingRule(null)} direction="right">
          <DrawerContent className="w-full max-w-xl">
            <DrawerHeader>
              <DrawerTitle>Senkronizasyon Kuralını Düzenle</DrawerTitle>
              <DrawerDescription>Tetikleyici, hedef sistem, işlem ve aralık değerlerini güncelleyin.</DrawerDescription>
            </DrawerHeader>

            {editingRule ? (
              <div className="grid gap-4 px-4 pb-2">
                <div className="space-y-1.5">
                  <Label>Tetikleyici</Label>
                  <Select value={editingRule.trigger} onValueChange={handleTriggerChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Hedef Sistem</Label>
                  <Select value={editingRule.targetSystem} onValueChange={handleTargetSystemChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>İşlem</Label>
                  <Select value={editingRule.action} onValueChange={handleActionChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Senkronizasyon Aralığı (dk)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={String(editingRule.syncInterval ?? 1)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateEditingRule({ syncInterval: Number(event.target.value) || 1 })}
                  />
                </div>
              </div>
            ) : null}

            <DrawerFooter className="sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingRule(null)}>
                İptal
              </Button>
              <Button type="button" onClick={applyRuleChanges}>
                Kaydet
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}
