"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import type { CreateIntegrationPayload, IntegrationPlatform } from "../_types"
import { IntegrationWizard } from "./integration-wizard"

interface Props {
  open: boolean
  platforms: IntegrationPlatform[]
  initialPlatformId?: string
  onOpenChange: (open: boolean) => void
  onCreate: (payload: CreateIntegrationPayload) => Promise<void>
}

export function CreateIntegrationModal({ open, platforms, initialPlatformId, onOpenChange, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entegrasyon Oluştur / Bağla</DialogTitle>
          <DialogDescription>
            3 adımda platform seçin, kimlik bilgilerini doğrulayın ve bağlantıyı kaydedin.
          </DialogDescription>
        </DialogHeader>

        <IntegrationWizard
          platforms={platforms}
          initialPlatformId={initialPlatformId}
          onCancel={() => onOpenChange(false)}
          onCreate={async (payload) => {
            await onCreate(payload)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
