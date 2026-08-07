"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ARF_ROUTES } from "../../../../../_shared/routes"

type ChangePasswordResponse = {
  success?: boolean
  error?: string
}

export default function ChangePasswordPage() {
  const router = useRouter()
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
      setError("Tum alanlari doldurmaniz gerekiyor.")
      return
    }

    if (newPassword.length < 8) {
      setError("Yeni sifre en az 8 karakter olmalidir.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni sifre ve sifre tekrari ayni olmalidir.")
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
        setError(payload.error || "Sifre degisikligi su anda tamamlanamadi.")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Sifreniz basariyla guncellendi.")
    } catch {
      setError("Servise ulasilamadi. Lutfen tekrar deneyin.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <Button
            variant="ghost"
            className="mb-2 w-fit px-0 text-muted-foreground"
            onClick={() => router.push(ARF_ROUTES.cargo.settings.root)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Ayarlara Don
          </Button>
          <CardTitle>Sifre Degistir</CardTitle>
          <CardDescription>
            Hesap guvenliginiz icin sifrenizi duzenli araliklarla guncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Sifre</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Sifre</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Sifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSaving}
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Guncelleniyor..." : "Sifreyi Guncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
