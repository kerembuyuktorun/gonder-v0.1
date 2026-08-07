"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserRecord } from "../_types"
import { USER_ROLE_LABELS } from "../_types"
import type { UserRole } from "../_types/user"

interface Props {
  rows: UserRecord[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR")
}

function statusLabel(status: UserRecord["status"]): string {
  const map: Record<UserRecord["status"], string> = {
    active: "Aktif",
    passive: "Pasif",
    suspended: "Askıda",
  }
  return map[status]
}

export function ExportUsersAction({ rows }: Props) {
  function handleExport() {
    const headers = ["Ad", "Soyad", "E-posta", "Telefon", "Rol", "Birim", "Durum", "Kayıt Tarihi"]

    const csvRows = rows.map((u) =>
      [
        u.firstName,
        u.lastName,
        u.email,
        u.phoneNumber,
        USER_ROLE_LABELS[u.role as UserRole] ?? u.role,
        u.locationName ?? "",
        statusLabel(u.status),
        formatDate(u.createdAt),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )

    const csvContent = [headers.join(","), ...csvRows].join("\n")
    const bom = "\uFEFF"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kullanicilar_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 size-4" />
      Dışa Aktar
    </Button>
  )
}
