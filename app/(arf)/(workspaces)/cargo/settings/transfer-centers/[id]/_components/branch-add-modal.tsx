"use client"

import { useState, type ChangeEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type AddBranchInput = {
  branchCode: string
  branchName: string
  city: string
  district: string
  managerName: string
  phone: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (payload: AddBranchInput) => void
}

const initialState: AddBranchInput = {
  branchCode: "",
  branchName: "",
  city: "",
  district: "",
  managerName: "",
  phone: "",
}

export function BranchAddModal({ open, onOpenChange, onAdd }: Props) {
  const [form, setForm] = useState<AddBranchInput>(initialState)

  const updateField = (key: keyof AddBranchInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isValid =
    form.branchCode.trim() &&
    form.branchName.trim() &&
    form.city.trim() &&
    form.district.trim() &&
    form.managerName.trim() &&
    form.phone.trim()

  const handleSubmit = () => {
    if (!isValid) return
    onAdd({
      branchCode: form.branchCode.trim().toUpperCase(),
      branchName: form.branchName.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      managerName: form.managerName.trim(),
      phone: form.phone.trim(),
    })
    setForm(initialState)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Şube Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="branch-code">Şube Kodu</Label>
            <Input
              id="branch-code"
              value={form.branchCode}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("branchCode", e.target.value)}
              placeholder="KNY-03"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-name">Şube Adı</Label>
            <Input
              id="branch-name"
              value={form.branchName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("branchName", e.target.value)}
              placeholder="Konya Meram Şubesi"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-city">İl</Label>
            <Input
              id="branch-city"
              value={form.city}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("city", e.target.value)}
              placeholder="Konya"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-district">İlçe</Label>
            <Input
              id="branch-district"
              value={form.district}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("district", e.target.value)}
              placeholder="Meram"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-manager">Yönetici</Label>
            <Input
              id="branch-manager"
              value={form.managerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("managerName", e.target.value)}
              placeholder="Ayşe Ak"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-phone">Telefon</Label>
            <Input
              id="branch-phone"
              value={form.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("phone", e.target.value)}
              placeholder="0555 555 55 55"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Şubeyi Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
