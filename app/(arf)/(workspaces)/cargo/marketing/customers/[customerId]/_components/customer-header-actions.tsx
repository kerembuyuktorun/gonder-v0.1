"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Power, Share2 } from "lucide-react"
import { toast } from "sonner"

interface CustomerHeaderActionsProps {
  initialStatus: "active" | "passive"
  sharePath: string
}

export function CustomerHeaderActions({ initialStatus, sharePath }: CustomerHeaderActionsProps) {
  const [isActive, setIsActive] = useState(initialStatus === "active")

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return sharePath
    }

    return `${window.location.origin}${sharePath}`
  }, [sharePath])

  const handleStatusToggle = (checked: boolean) => {
    setIsActive(checked)
    toast.success(checked ? "Müşteri aktif olarak işaretlendi." : "Müşteri pasif olarak işaretlendi.")
  }

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Müşteri Detay",
          text: "Müşteri detay linki",
          url: shareUrl,
        })
        return
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Müşteri linki kopyalandı.")
        return
      }

      toast.error("Paylaşım desteklenmiyor.")
    } catch {
      toast.error("Paylaşım işlemi tamamlanamadı.")
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Button size="sm" variant="outline" onClick={() => handleStatusToggle(!isActive)}>
        <Power className="mr-2 size-4" />
        {isActive ? "Pasif Yap" : "Aktif Yap"}
      </Button>

      <Button size="sm" variant="outline" onClick={() => void handleShare()}>
        <Share2 className="mr-2 size-4" />
        Paylaş
      </Button>
    </div>
  )
}
