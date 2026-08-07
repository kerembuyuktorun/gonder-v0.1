"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InterlandDetail } from "../../_types"

interface BranchOption {
  id: string
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: Pick<InterlandDetail, "name" | "branchId" | "branchName">
  branches: BranchOption[]
  onSave: (value: Pick<InterlandDetail, "name" | "branchId" | "branchName">) => void
}

export function InterlandEditModal({ open, onOpenChange, value, branches, onSave }: Props) {
  const [name, setName] = useState(value.name)
  const [branchId, setBranchId] = useState(value.branchId)

  useEffect(() => {
    setName(value.name)
    setBranchId(value.branchId)
  }, [open, value])

  const selectedBranch = branches.find((branch) => branch.id === branchId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>İnterland Düzenle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">İnterland Adı</Label>
            <Input id="edit-name" value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Bağlı Şube</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Şube seçin" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!name.trim() || !selectedBranch) {
                return
              }
              onSave({
                name: name.trim(),
                branchId: selectedBranch.id,
                branchName: selectedBranch.name,
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
