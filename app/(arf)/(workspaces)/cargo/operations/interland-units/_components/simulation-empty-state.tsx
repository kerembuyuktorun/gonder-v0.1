import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchCheck } from "lucide-react"

export function SimulationEmptyState() {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-800">
          <SearchCheck className="size-4 text-slate-500" />
          Sonuç Kartı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Gönderici ve alıcı adreslerini seçip Göster butonuna basarak hangi şubelerin kullanılacağını görüntüleyin.
        </p>
      </CardContent>
    </Card>
  )
}
