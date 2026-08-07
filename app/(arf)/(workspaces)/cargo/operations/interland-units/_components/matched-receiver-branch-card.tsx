import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InterlandAddressMatchResult } from "../_types"

interface Props {
  result: InterlandAddressMatchResult
}

const LEVEL_LABELS = {
  city_neighborhood: "Tam Eşleşme",
  city_district: "İlçe Bazlı Eşleşme",
  city: "İl Bazlı Eşleşme",
  none: "Eşleşme Yok",
} as const

const STATUS_CLASS_MAP = {
  matched: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  not_found: "border-slate-200 bg-slate-100 text-slate-600",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
} as const

export function MatchedReceiverBranchCard({ result }: Props) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">Alıcı Şube</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Badge variant="outline" className={STATUS_CLASS_MAP[result.meta.status]}>
          {LEVEL_LABELS[result.meta.matchedLevel]}
        </Badge>

        {result.branch ? (
          <div className="space-y-1.5">
            <p className="font-medium text-slate-800">{result.branch.branchName}</p>
            <p className="text-slate-600">Şube Kodu: {result.branch.branchCode}</p>
            <p className="text-slate-600">{result.branch.city} / {result.branch.district}</p>
            <p className="text-slate-600">Transfer Merkezi: {result.branch.transferCenterName ?? "-"}</p>
          </div>
        ) : (
          <p className="text-slate-600">Alıcı adres için eşleşen şube bulunamadı.</p>
        )}

        {result.meta.reason ? <p className="text-xs text-slate-500">{result.meta.reason}</p> : null}
      </CardContent>
    </Card>
  )
}
