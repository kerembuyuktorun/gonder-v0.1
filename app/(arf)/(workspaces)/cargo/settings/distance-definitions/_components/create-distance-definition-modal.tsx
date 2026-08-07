"use client"

import type { UpsertDistanceDefinitionPayload } from "../_api/distance-definitions-api"
import { DistanceDefinitionFormModal } from "./distance-definition-form-modal"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UpsertDistanceDefinitionPayload) => Promise<void>
}

export function CreateDistanceDefinitionModal({ open, onOpenChange, onSubmit }: Props) {
  return (
    <DistanceDefinitionFormModal
      open={open}
      mode="create"
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  )
}
