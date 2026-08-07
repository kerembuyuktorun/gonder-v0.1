"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileUser = {
  name: string
  email: string
  role?: string
}

type ChangePasswordResponse = {
  success?: boolean
  error?: string
}

export function SettingsProfilePanel({ user }: { user: ProfileUser }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tüm alanları doldurmanız gerekiyor.")
      return
    }

    if (newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalıdır.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni şifre ve şifre tekrarı aynı olmalıdır.")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as ChangePasswordResponse

      if (!response.ok || !payload.success) {
        setError(payload.error || "Şifre değişikliği şu anda tamamlanamadı.")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Şifreniz başarıyla güncellendi.")
    } catch {
      setError("Servise ulaşılamadı. Lütfen tekrar deneyin.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-base font-semibold">Profil Bilgileri</h3>
        <p className="mt-1 text-sm text-muted-foreground">Hesap bilgileriniz görüntülenir.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Ad Soyad</p>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          {user.role ? (
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-sm font-medium">{user.role}</p>
            </div>
          ) : null}
          <div className="rounded-lg border bg-muted/20 px-3 py-2 sm:col-span-2">
            <p className="text-xs text-muted-foreground">E-posta</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <form className="rounded-2xl border bg-card p-5" onSubmit={submit} noValidate>
        <h3 className="text-base font-semibold">Şifre Değiştir</h3>
        <p className="mt-1 text-sm text-muted-foreground">Şifrenizi güvenli şekilde güncelleyin.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-red-50 px-4 py-3 text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{error}</p>
            </div>
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-green-50 px-4 py-3 text-emerald-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{success}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="settings-current-password">Mevcut Şifre</Label>
            <Input
              id="settings-current-password"
              type="password"
              autoComplete="current-password"
              placeholder="Mevcut şifrenizi girin"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value)
                if (error) setError(null)
              }}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-new-password">Yeni Şifre</Label>
            <Input
              id="settings-new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Yeni şifrenizi girin"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                if (error) setError(null)
              }}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-new-password-confirm">Yeni Şifre (Tekrar)</Label>
            <Input
              id="settings-new-password-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                if (error) setError(null)
              }}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-lime-400 text-black hover:bg-lime-300"
          >
            {isSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </form>
    </div>
  )
}
