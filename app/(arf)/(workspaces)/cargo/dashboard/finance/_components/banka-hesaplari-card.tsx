"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import type { BankaHesapOzet } from "../_types/finans-dashboard"

const accountTypeLabels: Record<BankaHesapOzet["accountType"], string> = {
  collection: "Tahsilat",
  expense: "Gider",
}

const accountTypeColors: Record<BankaHesapOzet["accountType"], string> = {
  collection: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  expense: "border-amber-500/20 bg-amber-500/10 text-amber-600",
}

interface Props {
  accounts: BankaHesapOzet[]
}

export function BankaHesaplariCard({ accounts }: Props) {
  const totalTRY = accounts
    .filter((a) => a.currency === "TRY" && a.status === "active")
    .reduce((s, a) => s + a.balance, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Banka Hesapları
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Toplam: ₺{totalTRY.toLocaleString("tr-TR")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {account.bankName}
                </span>
                <Badge
                  variant="outline"
                  className={accountTypeColors[account.accountType]}
                >
                  <span className="text-[10px]">
                    {accountTypeLabels[account.accountType]}
                  </span>
                </Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {account.iban}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-semibold tabular-nums">
                {account.currency === "TRY" ? "₺" : account.currency === "USD" ? "$" : "€"}
                {account.balance.toLocaleString("tr-TR")}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
