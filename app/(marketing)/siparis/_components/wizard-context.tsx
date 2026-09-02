'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  coerceDeliverySpeed,
  createInitialOrder,
  type LogisticsMode,
  type Offer,
  type OrderDraft,
  type PlaceResult,
  type ServiceType,
} from '../_lib/order-types'
import { applyQuotePrefill, clearQuotePrefill, readQuotePrefill } from '../_lib/quote-prefill'

export type StepId = 'route' | 'service' | 'mode' | 'details' | 'offers' | 'payment' | 'success'

export type WizardVariant = 'marketing' | 'quote' | 'shipment'

export const STEP_LABELS: Record<StepId, string> = {
  route: 'Adres',
  service: 'Hizmet',
  mode: 'Opsiyon',
  details: 'Detaylar',
  offers: 'Teklif',
  payment: 'Ödeme',
  success: 'Tamamlandı',
}

export type WizardSnapshot = {
  draft: OrderDraft
  step: StepId
  selectedOffer: Offer | null
}

type WizardValue = {
  draft: OrderDraft
  setDraft: Dispatch<SetStateAction<OrderDraft>>
  patch: (partial: Partial<OrderDraft>) => void
  step: StepId
  steps: StepId[]
  goTo: (step: StepId) => void
  next: () => void
  back: () => void
  selectedOffer: Offer | null
  setSelectedOffer: Dispatch<SetStateAction<Offer | null>>
  orderRef: string | null
  setOrderRef: Dispatch<SetStateAction<string | null>>
  variant: WizardVariant
  offersNextLabel: string
}

const WizardContext = createContext<WizardValue | null>(null)

function scrollWizardSurface() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const start = document.querySelector('.gonder-landing')
  let node = start instanceof HTMLElement ? start.parentElement : null
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 4
    if (canScroll) {
      node.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    node = node.parentElement
  }
}

export function stepsForVariant(variant: WizardVariant, service: ServiceType | null): StepId[] {
  const withMode = service === 'lojistik'
  const core: StepId[] = withMode
    ? ['route', 'service', 'mode', 'details', 'offers']
    : ['route', 'service', 'details', 'offers']

  if (variant === 'quote') return core
  if (variant === 'shipment') return [...core, 'payment']
  return [...core, 'payment', 'success']
}

export function WizardProvider({
  children,
  variant = 'marketing',
  initialService = null,
  initialLogisticsMode = null,
  initialOrigin = null,
  initialDestination = null,
  initialDraft,
  initialStep,
  initialOffer = null,
  offersNextLabel = 'Teklifi Seç',
  onChange,
  onLastNext,
}: {
  children: ReactNode
  variant?: WizardVariant
  initialService?: ServiceType | null
  initialLogisticsMode?: LogisticsMode | null
  initialOrigin?: PlaceResult | null
  initialDestination?: PlaceResult | null
  initialDraft?: OrderDraft
  initialStep?: StepId
  initialOffer?: Offer | null
  offersNextLabel?: string
  onChange?: (snapshot: WizardSnapshot) => void
  onLastNext?: (snapshot: WizardSnapshot) => void
}) {
  const [draft, setDraft] = useState<OrderDraft>(
    () => {
      const initial =
        initialDraft ?? {
          ...createInitialOrder(),
          service: initialService,
          logisticsMode: initialLogisticsMode,
          origin: initialOrigin,
          destination: initialDestination,
        }
      return {
        ...initial,
        deliverySpeed: coerceDeliverySpeed(initial.service, initial.deliverySpeed),
      }
    }
  )
  const [step, setStep] = useState<StepId>(initialStep ?? 'route')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(initialOffer)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  const steps = useMemo(() => stepsForVariant(variant, draft.service), [draft.service, variant])

  const onChangeRef = useRef(onChange)
  const onLastNextRef = useRef(onLastNext)
  const snapshotRef = useRef<WizardSnapshot>({ draft, step, selectedOffer })
  onChangeRef.current = onChange
  onLastNextRef.current = onLastNext
  snapshotRef.current = { draft, step, selectedOffer }

  const patch = useCallback((partial: Partial<OrderDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial }
      return {
        ...next,
        deliverySpeed: coerceDeliverySpeed(next.service, next.deliverySpeed),
      }
    })
  }, [])

  useEffect(() => {
    const stored = readQuotePrefill()
    if (!stored) return
    setDraft((prev) => applyQuotePrefill(prev, stored))
    clearQuotePrefill()
  }, [])

  const goTo = useCallback((target: StepId) => {
    setStep(target)
    scrollWizardSurface()
  }, [])

  const next = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current)
      if (index >= steps.length - 1) {
        onLastNextRef.current?.({ ...snapshotRef.current, step: current })
        return current
      }
      const target = steps[Math.min(index + 1, steps.length - 1)] ?? current
      scrollWizardSurface()
      return target
    })
  }, [steps])

  const back = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current)
      const target = steps[Math.max(index - 1, 0)] ?? current
      scrollWizardSurface()
      return target
    })
  }, [steps])

  useEffect(() => {
    if (!steps.includes(step)) {
      setStep(steps.includes('details') ? 'details' : (steps[0] ?? 'route'))
    }
  }, [step, steps])

  useEffect(() => {
    onChangeRef.current?.({ draft, step, selectedOffer })
  }, [draft, selectedOffer, step])

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      patch,
      step,
      steps,
      goTo,
      next,
      back,
      selectedOffer,
      setSelectedOffer,
      orderRef,
      setOrderRef,
      variant,
      offersNextLabel,
    }),
    [
      back,
      draft,
      goTo,
      next,
      offersNextLabel,
      orderRef,
      patch,
      selectedOffer,
      step,
      steps,
      variant,
    ]
  )

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
