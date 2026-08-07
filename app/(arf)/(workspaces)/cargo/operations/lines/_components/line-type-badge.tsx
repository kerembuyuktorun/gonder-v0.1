import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LineType } from "../_types"

interface Props {
  type: LineType
}

const config: Record<LineType, { label: string; className: string }> = {
  main: {
    label: "Ana Hat",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  hub: {
    label: "Merkez Hat",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  feeder: {
    label: "Ara Hat",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
}

export function LineTypeBadge({ type }: Props) {
  const item = config[type]
  return (
    <Badge variant="outline" className={cn("text-xs", item.className)}>
      {item.label}
    </Badge>
  )
}
