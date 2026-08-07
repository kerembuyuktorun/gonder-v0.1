"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, Package, User2 } from "lucide-react"
import type { TasimaDetayRecord } from "../_types/transport-detail"

/* ─── Tab Component ─── */

export function TabTransportStatus({ data }: { data: TasimaDetayRecord }) {
  const [showAllSteps, setShowAllSteps] = useState(false)
  const activeStep = data.adimlar.find((a) => a.aktif)

  return (
    <div className="space-y-3">
      {/* ─── Current Step Indicator ─── */}
      {activeStep && (
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-3 p-3.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-white">
                  {activeStep.adimNo}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{data.mevcutAdim}/{data.toplamAdim} Adım</p>
                  <p className="text-base font-semibold text-slate-900">{activeStep.baslik}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{activeStep.aciklama}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-9 rounded-xl">
                  <User2 className="size-4" />
                </Button>
                <Button variant="outline" className="h-9 rounded-lg px-3.5 text-sm font-semibold">
                  Vazgeç
                </Button>
                <Button className="h-9 rounded-lg px-3.5 text-sm font-semibold">
                  Devam et
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Progress + Steps ─── */}
      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-3 p-3.5">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Package className="size-14 text-secondary/60" />
            </div>
            <div className="flex-1">
              <Button
                variant="outline"
                className="h-9 w-full rounded-lg text-sm font-semibold"
                onClick={() => setShowAllSteps(!showAllSteps)}
              >
                Tüm Adımlar
                {showAllSteps ? <ChevronUp className="ml-2 size-4" /> : <ChevronDown className="ml-2 size-4" />}
              </Button>
            </div>
          </div>

          {/* Timeline */}
          {showAllSteps && (
            <div className="space-y-0">
              {data.adimlar.map((adim) => (
                <div key={adim.adimNo} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        adim.tamamlandi
                          ? "bg-primary text-primary-foreground"
                          : adim.aktif
                            ? "bg-secondary text-white"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {adim.tamamlandi ? <Check className="size-4" /> : adim.adimNo}
                    </div>
                    {adim.adimNo < data.toplamAdim && (
                      <div className={cn("min-h-6 w-0.5 flex-1", adim.tamamlandi ? "bg-primary/30" : "bg-slate-200")} />
                    )}
                  </div>
                  <div className="pb-4 pt-1">
                    <p className={cn("text-sm font-semibold", adim.tamamlandi ? "text-slate-900" : adim.aktif ? "text-secondary" : "text-slate-500")}>
                      {adim.baslik}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{adim.aciklama}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
