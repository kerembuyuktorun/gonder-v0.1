"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import type { LocationOption, UserRecord } from "../_types"
import { UserCreationWizard } from "./user-creation-wizard"

interface Props {
  open: boolean
  locations: LocationOption[]
  onOpenChange: (open: boolean) => void
  onCreate: (created: UserRecord) => void
}

export function CreateUserModal({ open, locations, onOpenChange, onCreate }: Props) {
  const [success, setSuccess] = useState(false)

  async function handleWizardSubmit(created: UserRecord) {
    setSuccess(true)
    onCreate(created)
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 1800)
  }

  function handleOpenChange(value: boolean) {
    if (!value) setSuccess(false)
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
          <DialogDescription>
            Sistemde yeni bir kullanıcı hesabı açın ve role göre birime zimmetleyin.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
              ✓
            </div>
            <p className="text-base font-semibold text-slate-900">Kullanıcı oluşturuldu!</p>
            <p className="text-sm text-slate-500">
              Aktivasyon e-postası kullanıcının adresine gönderiliyor.
            </p>
          </div>
        ) : (
          <UserCreationWizard
            locations={locations}
            onCancel={() => handleOpenChange(false)}
            onSubmit={handleWizardSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
