"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock3, Pencil, PowerOff, Settings2, ShieldCheck, Trash2, User, Users2 } from "lucide-react"
import { deleteRole, suspendRole, updateRole } from "../../_api/roles-api"
import type { RoleDetail } from "../../_types"

interface Props {
  role: RoleDetail
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function RoleProfileSection({ role }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [editName, setEditName] = useState(role.name)
  const [editDesc, setEditDesc] = useState(role.description ?? "")

  const statusClass =
    role.status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-100 text-slate-600"

  async function handleSuspend() {
    if (!confirm(`"${role.name}" rolünü pasife almak istediğinizden emin misiniz?`)) return
    setIsBusy(true)
    try {
      await suspendRole(role.id)
      router.refresh()
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return
    setIsBusy(true)
    try {
      const result = await deleteRole(role.id)
      if (!result.ok) {
        alert(result.reason ?? "Rol silinemedi.")
        return
      }
      router.push("/arf/cargo/settings/roles")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] px-0 py-0">

          {/* Üst bant */}
          <div className="flex flex-col gap-4 px-6 pt-6 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Rol Profili</p>
              <CardTitle className="text-2xl font-semibold text-slate-900">{role.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusClass}>
                  <ShieldCheck className="mr-1.5 size-3.5" />
                  {role.status === "active" ? "Aktif Rol" : "Pasif Rol"}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-600">
                  <Settings2 className="mr-1.5 size-3.5" />
                  {role.roleType === "system" ? "Sistem Rolü" : "Özel Rol"}
                </Badge>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-600">
                  <Users2 className="size-4 text-slate-400" />
                  <span>
                    <strong className="font-semibold text-slate-900">{role.userCount}</strong> kullanıcı atanmış
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <Button
                asChild
                variant="outline"
                className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Link href="/arf/cargo/settings/roles">Listeye Dön</Link>
              </Button>
              {role.roleType === "custom" && (
                <>
                  {role.status === "active" && (
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                      onClick={() => void handleSuspend()}
                      disabled={isBusy}
                    >
                      <PowerOff className="mr-1.5 size-3.5" />
                      Pasif Yap
                    </Button>
                  )}
                  <Button
                    className="h-9 rounded-xl px-4 text-sm"
                    onClick={() => {
                      setEditName(role.name)
                      setEditDesc(role.description ?? "")
                      setEditOpen(true)
                    }}
                    disabled={isBusy}
                  >
                    <Pencil className="mr-1.5 size-3.5" />
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-red-200 bg-white px-4 text-sm text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700"
                    onClick={() => void handleDelete()}
                    disabled={isBusy}
                  >
                    <Trash2 className="mr-1.5 size-3.5" />
                    Sil
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Alt bant — açıklama + tarih + oluşturan */}
          <div className="grid gap-0 border-t border-slate-200 md:grid-cols-3">
            <div className="border-slate-200 px-6 py-4 md:col-span-1 md:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Açıklama</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{role.description || "—"}</p>
            </div>
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock3 className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Oluşturulma Zamanı</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">{formatDate(role.createdAt)}</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Oluşturan</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">{role.createdBy || "—"}</p>
            </div>
          </div>

        </CardHeader>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rol Profili Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Rol Adı *</label>
              <Input
                value={editName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                placeholder="Rol adı"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Açıklama</label>
              <Textarea
                value={editDesc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDesc(e.target.value)}
                rows={3}
                placeholder="Rolün sorumluluğunu tanımlayın"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isBusy}>
                Vazgeç
              </Button>
              <Button
                disabled={isBusy || !editName.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    await updateRole(role.id, { name: editName.trim(), description: editDesc.trim() })
                    setEditOpen(false)
                    router.refresh()
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                {isBusy ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
