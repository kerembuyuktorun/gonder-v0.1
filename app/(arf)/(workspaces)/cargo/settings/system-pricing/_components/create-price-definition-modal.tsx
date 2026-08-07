"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import type { UpsertPriceDefinitionInput } from "../_api/price-definitions-api"
import type { PriceDefinitionDetail } from "../_types"
import { PriceDefinitionWizard } from "./price-definition-wizard"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: PriceDefinitionDetail
  onSubmit: (payload: UpsertPriceDefinitionInput & { id?: string }) => Promise<void>
}

export function CreatePriceDefinitionModal({ open, onOpenChange, initialValue, onSubmit }: Props) {
  const isEdit = Boolean(initialValue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px]! xl:max-w-[1320px]!">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">{isEdit ? "Fiyat Tarifesini Düzenle" : "Fiyat Oluştur"}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <PriceDefinitionWizard
            title={isEdit ? "Fiyatlandırma Kimliği Düzenle" : "Fiyatlandırma Kimliği Oluştur"}
            submitLabel={isEdit ? "Güncelle" : "Kaydet"}
            submittingLabel={isEdit ? "Güncelleniyor..." : "Kaydediliyor..."}
            initialValue={initialValue}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (payload) => {
              await onSubmit(payload)
              onOpenChange(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
