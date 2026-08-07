"use client"

import { updateSupplierDetail } from "../_api/supplier-detail-api"
import type { SupplierDetail } from "../_types"
import type { SupplierDocument } from "../_types"
import { SupplierFormModal, type SupplierFormValues } from "../../_components/supplier-form-modal"

interface Props {
  supplier: SupplierDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (updated: SupplierDetail) => void
}

function buildInitialValues(supplier: SupplierDetail): SupplierFormValues {
  return {
    supplierType: supplier.supplierType,
    name: supplier.name,
    city: supplier.city ?? "",
    officialAddress: supplier.officialAddress ?? "",
    taxOffice: supplier.taxOffice ?? "",
    taxNumber: supplier.taxNumber ?? "",
    contactPerson: supplier.contactPerson ?? "",
    contactPersonTitle: supplier.contactPersonTitle ?? "",
    contactPhone: supplier.contactPhone ?? "",
    contactEmail: supplier.contactEmail ?? "",
    contractType: supplier.contractType,
    paymentTermDays: supplier.paymentTermDays != null ? String(supplier.paymentTermDays) : "",
    pricePerTrip: supplier.pricePerTrip != null ? String(supplier.pricePerTrip) : "",
    pricePerDesi: supplier.pricePerDesi != null ? String(supplier.pricePerDesi) : "",
    iban: supplier.iban ?? "",
    accountHolder: supplier.accountHolder ?? "",
    documents: supplier.documents.map((doc) => ({
      ...doc,
      fileName: doc.label,
      uploadedBy: supplier.createdBy,
    })),
  }
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

export function SupplierEditModal({ supplier, open, onOpenChange, onUpdated }: Props) {
  return (
    <SupplierFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Tedarikçi Düzenle"
      submitLabel="Güncellemeleri Kaydet"
      submitPendingLabel="Kaydediliyor..."
      initialValues={buildInitialValues(supplier)}
      onSubmit={async (values) => {
        const updated = await updateSupplierDetail(supplier.id, {
          supplierType: values.supplierType || undefined,
          name: values.name.trim(),
          city: values.city || undefined,
          officialAddress: values.officialAddress || undefined,
          taxOffice: values.taxOffice || undefined,
          taxNumber: values.taxNumber || undefined,
          contactPerson: values.contactPerson || undefined,
          contactPersonTitle: values.contactPersonTitle || undefined,
          contactPhone: values.contactPhone || undefined,
          contactEmail: values.contactEmail || undefined,
          contractType: values.contractType || undefined,
          paymentTermDays: values.paymentTermDays ? Number(values.paymentTermDays) : undefined,
          pricePerTrip: values.pricePerTrip ? Number(values.pricePerTrip) : undefined,
          pricePerDesi: values.pricePerDesi ? Number(values.pricePerDesi) : undefined,
          iban: values.iban || undefined,
          accountHolder: values.accountHolder || undefined,
          documents: normalizeDocuments(values),
        })
        onUpdated(updated)
      }}
    />
  )
}
