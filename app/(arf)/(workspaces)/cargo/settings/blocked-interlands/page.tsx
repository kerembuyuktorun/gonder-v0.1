import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { blockedInterlandStore } from "../interlands/_mock/interlands-mock-data"

export default function BlockedInterlandsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Yasakli Interlandlar" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Yasakli Interlandlar</CardTitle>
            <CardDescription>Interland kısıt kayıtları burada listelenir.</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedInterlandStore.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Henuz yasakli interland kaydi bulunmuyor.
              </div>
            ) : (
              <ul className="space-y-2">
                {blockedInterlandStore.map((item, index) => (
                  <li key={`${item.id}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    {item.name} - {item.branchName}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
