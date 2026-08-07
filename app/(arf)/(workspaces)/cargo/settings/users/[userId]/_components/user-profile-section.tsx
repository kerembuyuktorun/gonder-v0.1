import { Mail, MapPin, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserDetail } from "../../_types"
import { USER_ROLE_LABELS } from "../../_types"
import type { UserRole } from "../../_types/user"

interface Props {
  user: UserDetail
}

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  superadmin: "bg-purple-100 text-purple-700 border-purple-200",
  hq_manager: "bg-blue-100 text-blue-700 border-blue-200",
  tm_manager: "bg-indigo-100 text-indigo-700 border-indigo-200",
  branch_manager: "bg-teal-100 text-teal-700 border-teal-200",
  courier: "bg-amber-100 text-amber-700 border-amber-200",
  operator: "bg-slate-100 text-slate-700 border-slate-200",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function UserProfileSection({ user }: Props) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <User className="size-4 text-slate-400" />
          Kullanıcı Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <section className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Ad Soyad</dt>
              <dd className="text-sm font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <Mail className="size-3" /> E-posta
              </dt>
              <dd className="text-sm font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <Phone className="size-3" /> Telefon
              </dt>
              <dd className="text-sm font-medium text-slate-900">{user.phoneNumber}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Rol</dt>
              <dd>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs ${ROLE_BADGE_CLASSES[user.role as UserRole]}`}
                >
                  {USER_ROLE_LABELS[user.role as UserRole]}
                </Badge>
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="size-3" /> Bağlı Birim
              </dt>
              <dd className="text-sm font-medium text-slate-900">
                {user.locationName ?? "Genel Merkez / Tüm Sistem"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3 pt-1">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Kayıt Zamanı</dt>
              <dd className="text-sm font-medium text-slate-900">{formatDate(user.createdAt)}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Oluşturan</dt>
              <dd className="text-sm font-medium text-slate-900">{user.createdByName}</dd>
            </div>
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}
