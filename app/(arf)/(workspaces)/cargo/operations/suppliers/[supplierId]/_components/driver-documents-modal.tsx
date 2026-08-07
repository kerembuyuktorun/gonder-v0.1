"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui"
import { FileText } from "lucide-react"
import type { SupplierDriver } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: SupplierDriver | null
}

export function DriverDocumentsModal({ open, onOpenChange, driver }: Props) {
  const documents = driver?.documents ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            {driver ? `${driver.firstName} ${driver.lastName} — Sürücü Evrakları` : "Sürücü Evrakları"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Bu sürücüye ait yüklü evrak bulunamadı.
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-800">{doc.label}</p>
                      {doc.fileName && (
                        <p className="text-xs text-slate-500">{doc.fileName}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("tr-TR") : "Tarih yok"}
                      </p>
                    </div>
                    {doc.fileUrl ? (
                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
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
