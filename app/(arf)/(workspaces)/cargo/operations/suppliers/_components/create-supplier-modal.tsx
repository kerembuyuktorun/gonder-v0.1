"use client"

import { createSupplier } from "../_api/suppliers-list-api"
import type { SupplierDocument } from "../[supplierId]/_types"
import type { SupplierRecord } from "../_types"
import {
  buildEmptySupplierFormValues,
  SupplierFormModal,
  type SupplierFormValues,
} from "./supplier-form-modal"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (supplier: SupplierRecord) => void
}

function normalizeDocuments(values: SupplierFormValues): SupplierDocument[] {
  return values.documents.map((doc) => ({
    id: doc.id,
    documentType: doc.documentType,
    label: doc.label,
    fileUrl: doc.fileUrl,
    uploadedAt: doc.uploadedAt,
    expiryDate: doc.expiryDate,
    isExpired: doc.isExpired,
    isExpiringSoon: doc.isExpiringSoon,
  }))
}

export function CreateSupplierModal({ open, onOpenChange, onCreated }: Props) {
  return (
    <SupplierFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Tedarikçi Ekle"
      submitLabel="Tedarikçiyi Ekle"
      submitPendingLabel="Ekleniyor..."
      initialValues={buildEmptySupplierFormValues()}
      onSubmit={async (values) => {
        if (!values.supplierType || !values.contractType) {
          throw new Error("Tedarikçi türü ve sözleşme türü zorunludur")
        }

        const newSupplier = await createSupplier({
          supplierType: values.supplierType,
          name: values.name.trim(),
          status: "active",
          contractType: values.contractType,
          contactPerson: values.contactPerson || undefined,
          contactPersonTitle: values.contactPersonTitle || undefined,
          contactPhone: values.contactPhone || undefined,
          contactEmail: values.contactEmail || undefined,
          city: values.city || undefined,
          officialAddress: values.officialAddress || undefined,
          taxOffice: values.taxOffice || undefined,
          taxNumber: values.taxNumber || undefined,
          paymentTermDays: values.paymentTermDays ? Number(values.paymentTermDays) : undefined,
          pricePerTrip: values.pricePerTrip ? Number(values.pricePerTrip) : undefined,
          pricePerDesi: values.pricePerDesi ? Number(values.pricePerDesi) : undefined,
          iban: values.iban || undefined,
          accountHolder: values.accountHolder || undefined,
          documents: normalizeDocuments(values),
          createdBy: "Kullanıcı",
        })
        onCreated(newSupplier)
      }}
    />
  )
}
