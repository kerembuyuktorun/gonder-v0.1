"use client"

import type { UpsertBankAccountPayload } from "../../_api/bank-accounts-api"
import { BankAccountFormModal, type BankAccountFormInitialValues, type BranchOption } from "../../_components/bank-account-form-modal"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: BranchOption[]
  value: BankAccountFormInitialValues
  onSave: (payload: UpsertBankAccountPayload & { id?: string }) => Promise<void>
}

export function BankAccountEditModal({ open, onOpenChange, branches, value, onSave }: Props) {
  return (
    <BankAccountFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Banka Hesabı Düzenle"
      description="Banka hesabının whitelist, entegrasyon ve kurumsal bilgilerini güncelleyin."
      submitLabel="Güncelle"
      submittingLabel="Güncelleniyor..."
      branches={branches}
      initialValues={value}
      onSubmit={onSave}
    />
  )
}
