"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import type { RoleDetail } from "../_types"
import { RoleCreationWizard } from "./role-creation-wizard"

interface Props {
  open: boolean
  mode?: "create" | "edit"
  initialRole?: RoleDetail
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function CreateRoleModal({
  open,
  mode = "create",
  initialRole,
  onOpenChange,
  onSaved,
}: Props) {
  const [success, setSuccess] = useState(false)

  const title = useMemo(() => (mode === "edit" ? "Rol Düzenle" : "Yeni Rol Oluştur"), [mode])

  async function handleSaved() {
    setSuccess(true)
    onSaved()
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Rol oluşturun sonrasında detay kısmından yetkilerini ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700">
              Rol başarıyla kaydedildi.
            </div>
          </div>
        ) : (
          <RoleCreationWizard
            mode={mode}
            initialRole={initialRole}
            onCancel={() => onOpenChange(false)}
            onSaved={handleSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
