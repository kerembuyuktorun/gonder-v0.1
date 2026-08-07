import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Card, CardContent } from "@/components/ui/card"

export default function AddressDefinitionsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Adres Tanımları" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
              Adres Tanımları ekranı şimdilik boş bırakıldı.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}