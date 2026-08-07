"use client"

import { useCallback } from "react"
import type { BranchDetail } from "../[id]/_types"
import { BranchDetailEditModal } from "../[id]/_components/branch-detail-edit-modal"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchesCreateModal({ open, onOpenChange }: Props) {
  const handleSave = useCallback((branch: BranchDetail) => {
    // TODO: API call to create branch
    void branch
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <BranchDetailEditModal
      open={open}
      onOpenChange={onOpenChange}
      branch={undefined}
      onSave={handleSave}
      mode="create"
    />
  )
}
