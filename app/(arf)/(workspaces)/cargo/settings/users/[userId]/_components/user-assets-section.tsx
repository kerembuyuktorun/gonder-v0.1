import { Package, Smartphone, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserAssetKind, UserDetail } from "../../_types"
import type { UserRole } from "../../_types/user"

const ASSET_ROLES: UserRole[] = ["courier", "branch_manager", "tm_manager"]

interface Props {
  user: UserDetail
}

const ASSET_KIND_LABELS: Record<UserAssetKind, string> = {
  phone: "Telefon",
  computer: "Bilgisayar",
  tablet: "Tablet",
  simcard: "Simkart",
  car: "Araba",
  house: "Ev",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function UserAssetsSection({ user }: Props) {
  const hasAssetRole = ASSET_ROLES.includes(user.role as UserRole)

  if (!hasAssetRole) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-10 text-sm text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <Package className="size-8 text-slate-300" />
            Bu rol için zimmet bilgisi bulunmamaktadır.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user.asset) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-10 text-sm text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <Package className="size-8 text-slate-300" />
            Henüz zimmet kaydı oluşturulmamış.
          </div>
        </CardContent>
      </Card>
    )
  }

  const { asset } = user

  if (asset.entries && asset.entries.length > 0) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Package className="size-4 text-slate-400" />
            Zimmet Kalemleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {asset.entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-xs text-slate-500">Tür</div>
                  <div className="text-sm font-medium text-slate-900">{ASSET_KIND_LABELS[entry.kind]}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Varlık Adı</div>
                  <div className="text-sm font-medium text-slate-900">{entry.assetName || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Marka / Model</div>
                  <div className="text-sm font-medium text-slate-900">{entry.brandModel || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Zimmet No</div>
                  <div className="text-sm font-medium text-slate-900">{entry.assignmentNumber || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Seri No</div>
                  <div className="text-sm font-medium text-slate-900">{entry.serialNumber || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">IMEI</div>
                  <div className="text-sm font-medium text-slate-900">{entry.imei || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Teslim Tarihi</div>
                  <div className="text-sm font-medium text-slate-900">{entry.providedAt ? formatDate(entry.providedAt) : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Not</div>
                  <div className="text-sm font-medium text-slate-900">{entry.notes || "-"}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {asset.vehiclePlate && (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Truck className="size-4 text-slate-400" />
              Araç Zimmeti
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-500">Plaka</dt>
                <dd className="font-mono text-sm font-semibold text-slate-900">
                  {asset.vehiclePlate}
                </dd>
              </div>
              {asset.assignedTerritory && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">Zimmetli Bölge</dt>
                  <dd className="text-sm font-medium text-slate-900">{asset.assignedTerritory}</dd>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-500">Zimmeti Veren</dt>
                <dd className="text-sm font-medium text-slate-900">{asset.assignedByName}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-500">Zimmet Tarihi</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {formatDate(asset.assignedAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {asset.deviceId && (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Smartphone className="size-4 text-slate-400" />
              Cihaz Zimmeti
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-500">Cihaz ID</dt>
                <dd className="font-mono text-sm font-medium text-slate-900">{asset.deviceId}</dd>
              </div>
              {asset.deviceSerialNumber && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">Seri Numarası</dt>
                  <dd className="font-mono text-sm font-medium text-slate-900">
                    {asset.deviceSerialNumber}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
