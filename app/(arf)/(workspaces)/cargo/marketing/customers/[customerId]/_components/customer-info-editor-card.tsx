"use client"

import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Pencil, X } from "lucide-react"

type CustomerType = "corporate" | "individual"

interface CustomerInfoEditorCardProps {
  customerType: CustomerType
  tradeName: string
  taxOffice: string
  taxNumber: string
  tcIdentityNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface EditableInfoValues {
  tradeName: string
  taxOffice: string
  taxNumber: string
  tcIdentityNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

function fallback(value: string) {
  return value.trim() || "-"
}

export function CustomerInfoEditorCard({
  customerType,
  tradeName,
  taxOffice,
  taxNumber,
  tcIdentityNumber,
  firstName,
  lastName,
  phone,
  email,
}: CustomerInfoEditorCardProps) {
  const initialValues = useMemo<EditableInfoValues>(
    () => ({
      tradeName,
      taxOffice,
      taxNumber,
      tcIdentityNumber,
      firstName,
      lastName,
      phone,
      email,
    }),
    [tradeName, taxOffice, taxNumber, tcIdentityNumber, firstName, lastName, phone, email],
  )

  const [savedValues, setSavedValues] = useState<EditableInfoValues>(initialValues)
  const [draftValues, setDraftValues] = useState<EditableInfoValues>(initialValues)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setSavedValues(initialValues)
    setDraftValues(initialValues)
    setIsEditing(false)
  }, [initialValues])

  const customerTypeLabel = customerType === "corporate" ? "Kurumsal" : "Bireysel"

  const startEdit = () => {
    setDraftValues(savedValues)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraftValues(savedValues)
    setIsEditing(false)
  }

  const saveEdit = () => {
    setSavedValues(draftValues)
    setIsEditing(false)
  }

  const setField = (field: keyof EditableInfoValues, value: string) => {
    setDraftValues((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">Müşteri Bilgileri</CardTitle>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={saveEdit}>
              <Check className="mr-2 size-4" />
              Kaydet
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X className="mr-2 size-4" />
              İptal
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Pencil className="mr-2 size-4" />
            Düzelt
          </Button>
        )}
      </CardHeader>

      <CardContent className="grid gap-3 pt-0 lg:grid-cols-2">
        <InfoCard title="Kimlik / Vergi Bilgileri">
          <ReadOnlyInfoRow label="Müşteri Tipi" value={customerTypeLabel} />

          {customerType === "corporate" ? (
            <>
              <EditableInfoRow
                label="Şirket Ünvanı"
                value={draftValues.tradeName}
                displayValue={savedValues.tradeName}
                isEditing={isEditing}
                onChange={(value) => setField("tradeName", value)}
              />
              <EditableInfoRow
                label="Vergi Dairesi"
                value={draftValues.taxOffice}
                displayValue={savedValues.taxOffice}
                isEditing={isEditing}
                onChange={(value) => setField("taxOffice", value)}
              />
              <EditableInfoRow
                label="Vergi No"
                value={draftValues.taxNumber}
                displayValue={savedValues.taxNumber}
                isEditing={isEditing}
                onChange={(value) => setField("taxNumber", value)}
              />
            </>
          ) : (
            <EditableInfoRow
              label="TC Kimlik No"
              value={draftValues.tcIdentityNumber}
              displayValue={savedValues.tcIdentityNumber}
              isEditing={isEditing}
              onChange={(value) => setField("tcIdentityNumber", value)}
            />
          )}
        </InfoCard>

        <InfoCard title="İletişim Bilgileri">
          <EditableInfoRow
            label="Ad"
            value={draftValues.firstName}
            displayValue={savedValues.firstName}
            isEditing={isEditing}
            onChange={(value) => setField("firstName", value)}
          />
          <EditableInfoRow
            label="Soyad"
            value={draftValues.lastName}
            displayValue={savedValues.lastName}
            isEditing={isEditing}
            onChange={(value) => setField("lastName", value)}
          />
          <EditableInfoRow
            label="Telefon"
            value={draftValues.phone}
            displayValue={savedValues.phone}
            isEditing={isEditing}
            onChange={(value) => setField("phone", value)}
          />
          <EditableInfoRow
            label="E-posta"
            value={draftValues.email}
            displayValue={savedValues.email}
            isEditing={isEditing}
            onChange={(value) => setField("email", value)}
          />
        </InfoCard>
      </CardContent>
    </Card>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <p className="mb-2 text-sm font-semibold text-slate-900">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function ReadOnlyInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{fallback(value)}</span>
    </div>
  )
}

function EditableInfoRow({
  label,
  value,
  displayValue,
  isEditing,
  onChange,
}: {
  label: string
  value: string
  displayValue: string
  isEditing: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      {isEditing ? (
        <Input
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          className="h-7 w-[58%] border-0 bg-transparent px-0 text-right font-medium text-slate-800 shadow-none focus-visible:ring-0"
        />
      ) : (
        <span className="text-right font-medium text-slate-800">{fallback(displayValue)}</span>
      )}
    </div>
  )
}
