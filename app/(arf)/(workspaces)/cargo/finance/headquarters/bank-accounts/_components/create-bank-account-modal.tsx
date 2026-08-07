"use client"

import type { UpsertBankAccountPayload } from "../_api/bank-accounts-api"
import { BankAccountFormModal, type BranchOption } from "./bank-account-form-modal"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: BranchOption[]
  onCreate: (payload: UpsertBankAccountPayload) => Promise<void>
}

export function CreateBankAccountModal({ open, onOpenChange, branches, onCreate }: Props) {
  return (
    <BankAccountFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Banka Hesabı Oluştur"
      description="Yeni whitelist banka hesabını finansal doğrulamalarla birlikte sisteme ekleyin."
      submitLabel="Kaydet"
      submittingLabel="Kaydediliyor..."
      branches={branches}
      onSubmit={onCreate}
    />
  )
}
