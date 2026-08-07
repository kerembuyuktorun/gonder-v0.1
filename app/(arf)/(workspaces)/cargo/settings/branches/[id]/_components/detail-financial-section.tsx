"use client"

import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DetailFinancialSection() {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <Construction className="size-10" />
        <p className="text-sm font-medium text-slate-600">Finansal</p>
        <p className="text-xs">Bu bölüm yakında kullanıma açılacaktır.</p>
      </CardContent>
    </Card>
  )
}
