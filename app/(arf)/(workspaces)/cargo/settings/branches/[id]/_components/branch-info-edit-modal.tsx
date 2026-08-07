"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BranchDetail } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: Pick<
    BranchDetail,
    "il" | "ilce" | "mahalle" | "acikAdres" | "telefon" | "eposta" | "calismaSaatleri"
  >
  onSave: (
    value: Pick<
      BranchDetail,
      "il" | "ilce" | "mahalle" | "acikAdres" | "telefon" | "eposta" | "calismaSaatleri"
    >,
  ) => void
}

export function BranchInfoEditModal({ open, onOpenChange, value, onSave }: Props) {
  const [form, setForm] = useState(value)

  useEffect(() => {
    setForm(value)
  }, [value, open])

  const updateField = (key: keyof typeof form, nextValue: string) => {
    setForm((prev) => ({ ...prev, [key]: nextValue }))
  }

  const handleInputChange = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Şube Bilgilerini Düzenle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="branch-city">İl</Label>
            <Input id="branch-city" value={form.il} onChange={handleInputChange("il")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-district">İlçe</Label>
            <Input id="branch-district" value={form.ilce} onChange={handleInputChange("ilce")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-neighborhood">Mahalle</Label>
            <Input
              id="branch-neighborhood"
              value={form.mahalle ?? ""}
              onChange={handleInputChange("mahalle")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-hours">Çalışma Saatleri</Label>
            <Input
              id="branch-hours"
              value={form.calismaSaatleri ?? ""}
              onChange={handleInputChange("calismaSaatleri")}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="branch-address">Açık Adres</Label>
            <Input
              id="branch-address"
              value={form.acikAdres ?? ""}
              onChange={handleInputChange("acikAdres")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-phone">Telefon</Label>
            <Input
              id="branch-phone"
              value={form.telefon}
              onChange={handleInputChange("telefon")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-email">E-posta</Label>
            <Input
              id="branch-email"
              value={form.eposta ?? ""}
              onChange={handleInputChange("eposta")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(form)
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
