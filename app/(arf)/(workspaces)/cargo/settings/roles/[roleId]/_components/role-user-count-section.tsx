import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RoleDetail } from "../../_types"

interface Props {
  role: RoleDetail
}

export function RoleUserCountSection({ role }: Props) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Role Ait Kullanıcılar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            Bu role atanmış toplam <strong>{role.userCount}</strong> kullanıcı bulunuyor.
          </p>
          <Link
            href={`/arf/cargo/settings/users?role=${role.id}`}
            className="mt-2 inline-block text-sm font-medium text-blue-700 hover:underline"
          >
            Kullanıcıları görüntüle
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
