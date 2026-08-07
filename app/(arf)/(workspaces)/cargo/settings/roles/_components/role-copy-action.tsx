"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { copyRole } from "../_api/roles-api"
import type { RoleRecord } from "../_types"

interface Props {
  role: RoleRecord
  onCopied: () => void
}

export function RoleCopyAction({ role, onCopied }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCopy() {
    const newName = window.prompt("Yeni rol adı", `${role.name} Kopyası`)
    if (!newName?.trim()) return

    setIsLoading(true)
    try {
      const copied = await copyRole(role.id, newName.trim())
      if (!copied) {
        window.alert("Rol kopyalanamadı.")
        return
      }
      onCopied()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()} disabled={isLoading}>
      <Copy className="mr-2 size-4" />
      Kopyala
    </Button>
  )
}
