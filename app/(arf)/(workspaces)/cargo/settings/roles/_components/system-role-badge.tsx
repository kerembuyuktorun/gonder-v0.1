import { SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Props {
  isSystem: boolean
}

export function SystemRoleBadge({ isSystem }: Props) {
  return (
    <Badge
      variant="outline"
      className="h-6 rounded-full border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600"
    >
      <SlidersHorizontal className="mr-1.5 size-3.5" />
      {isSystem ? "Sistem Rolü" : "Özel Rol"}
    </Badge>
  )
}
