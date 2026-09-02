'use client'

import type { ReactNode } from 'react'
import type { Offer, OrderDraft } from '../../../../(marketing)/siparis/_lib/order-types'
import {
  WizardProvider,
  type StepId,
  type WizardSnapshot,
  type WizardVariant,
} from '../../../../(marketing)/siparis/_components/wizard-context'
import { WizardStage, WizardStepper } from '../../../../(marketing)/siparis/_components/wizard-stage'

export type { WizardSnapshot }

export function SiparisPanelScope({ children }: { children: ReactNode }) {
  return <div className='gonder-landing min-w-0'>{children}</div>
}

export function SiparisPanelWizard({
  variant,
  initialDraft,
  initialStep,
  initialOffer,
  offersNextLabel,
  payment,
  onChange,
  onLastNext,
}: {
  variant: Exclude<WizardVariant, 'marketing'>
  initialDraft: OrderDraft
  initialStep?: StepId
  initialOffer?: Offer | null
  offersNextLabel?: string
  payment?: ReactNode
  onChange?: (snapshot: WizardSnapshot) => void
  onLastNext?: (snapshot: WizardSnapshot) => void
}) {
  return (
    <WizardProvider
      variant={variant}
      initialDraft={initialDraft}
      initialStep={initialStep}
      initialOffer={initialOffer}
      offersNextLabel={offersNextLabel}
      onChange={onChange}
      onLastNext={onLastNext}
    >
      <WizardStepper />
      <div className='mt-6 rounded-2xl border border-[var(--gl-border)] bg-white p-5 shadow-[0_18px_48px_-30px_rgb(25_45_50_/_0.25)] sm:p-7'>
        <WizardStage payment={payment} />
      </div>
    </WizardProvider>
  )
}
