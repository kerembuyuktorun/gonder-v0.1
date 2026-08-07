"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui"
import { FileText } from "lucide-react"
import type { SupplierVehicle } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: SupplierVehicle | null
}

export function VehicleDocumentsModal({ open, onOpenChange, vehicle }: Props) {
  const documents = vehicle?.documents ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Araç Evrakları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Bu araca ait yüklü evrak bulunamadı.
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => (
                <li key={document.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-800">{document.label}</p>
                      <p className="text-xs text-slate-500">
                        {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString("tr-TR") : "Tarih yok"}
                      </p>
                    </div>
                    {document.fileUrl ? (
                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <a href={document.fileUrl} target="_blank" rel="noreferrer">
                          Görüntüle
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
