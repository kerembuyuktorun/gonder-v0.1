"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import type { UserDetail, UserDocument, UserDocumentType } from "../../_types"

const DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  employment_contract: "İş Sözleşmesi",
  cv: "CV",
  identity: "Kimlik Belgesi",
  other: "Diğer",
}

const INITIAL_DOCUMENTS_BY_USER_ID: Record<string, UserDocument[]> = {
  "usr-007": [
    {
      id: "doc-usr-007-contract",
      type: "employment_contract",
      fileName: "havva-yildiz-is-sozlesmesi.pdf",
      fileSize: 483200,
      uploadedAt: "2026-03-20T09:45:00Z",
      uploadedBy: "Mehmet Kaya",
      url: "/mock/files/havva-yildiz-is-sozlesmesi.pdf",
    },
    {
      id: "doc-usr-007-cv",
      type: "cv",
      fileName: "havva-yildiz-cv.pdf",
      fileSize: 235520,
      uploadedAt: "2026-03-20T09:47:00Z",
      uploadedBy: "Mehmet Kaya",
      url: "/mock/files/havva-yildiz-cv.pdf",
    },
  ],
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UserDocumentsSection({ user }: { user: UserDetail }) {
  const [documents, setDocuments] = useState<UserDocument[]>(() => user.documents ?? INITIAL_DOCUMENTS_BY_USER_ID[user.id] ?? [])

  useEffect(() => {
    setDocuments(user.documents ?? INITIAL_DOCUMENTS_BY_USER_ID[user.id] ?? [])
  }, [user.id, user.documents])

  useEffect(() => {
    return () => {
      for (const doc of documents) {
        if (doc.url.startsWith("blob:")) {
          URL.revokeObjectURL(doc.url)
        }
      }
    }
  }, [documents])

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FileText className="size-4 text-slate-400" />
          Kullanıcı Dosyaları
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <FileText className="size-8" />
            <p className="text-sm">Henüz dosya yüklenmemiş</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => (
              <li key={document.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800">{DOCUMENT_TYPE_LABELS[document.type]}</p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(document.fileSize)} • {new Date(document.uploadedAt).toLocaleDateString("tr-TR")} • {document.uploadedBy}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <a href={document.url} target="_blank" rel="noreferrer">
                      <Download className="mr-1 size-3.5" />
                      İndir
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
