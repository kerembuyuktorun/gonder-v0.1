"use client"

import { Button } from "@/components/ui/button"

interface Props {
  isLoading: boolean
  disabled?: boolean
  onClick: () => void
}

export function TestConnectionAction({ isLoading, disabled, onClick }: Props) {
  return (
    <Button type="button" variant="outline" disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
    </Button>
  )
}
