import { Badge } from "@/components/ui/badge"
import type { TripStatus } from "../_types"
import { TRIP_STATUS_CLASSES, TRIP_STATUS_LABELS } from "../_lib/trip-status-helpers"

interface Props {
  status: TripStatus
}

export function TripStatusBadge({ status }: Props) {
  return (
    <Badge variant="outline" className={`text-xs ${TRIP_STATUS_CLASSES[status]}`}>
      {TRIP_STATUS_LABELS[status]}
    </Badge>
  )
}
