'use client'

import { useEffect, type ReactNode } from 'react'
import { Check, Package, Truck } from 'lucide-react'
import { StepCargo } from '../../../../../../(marketing)/siparis/_components/step-cargo'
import { StepFtl } from '../../../../../../(marketing)/siparis/_components/step-ftl'
import { StepLtl } from '../../../../../../(marketing)/siparis/_components/step-ltl'
import {
  WizardProvider,
  useWizard,
  type WizardSnapshot,
} from '../../../../../../(marketing)/siparis/_components/wizard-context'
import {
  inferLogisticsMode,
  inferServiceFromLoad,
  LOGISTICS_DESI_THRESHOLD,
} from '../../../../../../(marketing)/siparis/_lib/infer-load'
import type { Offer, OrderDraft, ServiceType } from '../../../../../../(marketing)/siparis/_lib/order-types'
import { SiparisPanelPayment } from '../../../_components/siparis-panel-payment'
import { SiparisPanelScope } from '../../../_components/siparis-panel-wizard'
import { CreateShipmentAddressSection } from './create-shipment-address-section'

function PageSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className='rounded-2xl border border-[var(--gl-border)] bg-white p-5 shadow-[0_18px_48px_-30px_rgb(25_45_50_/_0.25)] sm:p-7'
    >
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-[var(--gl-ink)] sm:text-2xl'>{title}</h2>
        {description ? (
          <p className='mt-1.5 text-sm text-[var(--gl-muted)]'>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

const SERVICE_OPTIONS: Array<{
  id: ServiceType
  title: string
  tagline: string
  bullets: string[]
  icon: typeof Package
}> = [
  {
    id: 'kargo',
    title: 'Kargo',
    tagline: 'Koli ve paket gönderileri',
    bullets: ['Kapıdan kapıya teslim', 'Desi/kg üzerinden anlık fiyat', 'Tek parçadan başlar'],
    icon: Package,
  },
  {
    id: 'lojistik',
    title: 'Lojistik',
    tagline: 'Palet, parsiyel ve komple araç',
    bullets: ['Komple (FTL) ve parsiyel (LTL)', 'Araç ve kasa tipi seçimi', 'Gerektiğinde lojistik uzmanı desteği'],
    icon: Truck,
  },
]

const LOGISTICS_MODES = [
  {
    id: 'ltl' as const,
    title: 'LTL — Parsiyel Taşımacılık',
    hint: 'Aracın bir kısmını kullanırsın, navlunu diğer yüklerle paylaşırsın. Palet ve parça bazlı yükler için uygun.',
  },
  {
    id: 'ftl' as const,
    title: 'FTL — Komple Taşımacılık',
    hint: 'Araç tamamen sana tahsis edilir. Aktarmasız, doğrudan ve en hızlı seçenek.',
  },
]

function cargoLoadSignal(draft: OrderDraft) {
  if (draft.service === 'lojistik' && draft.ltl.loadKind) {
    return {
      text: draft.ltl.description,
      unit: draft.ltl.loadKind === 'palet' ? ('palet' as const) : ('koli' as const),
      quantity: draft.ltl.quantity,
      weightKg: draft.ltl.weightKg * draft.ltl.quantity,
      widthCm: draft.ltl.widthCm,
      lengthCm: draft.ltl.lengthCm,
      heightCm: draft.ltl.heightCm,
    }
  }
  const { cargo } = draft
  return {
    text: cargo.contentNote,
    quantity: cargo.quantity,
    weightKg: cargo.weightKg * cargo.quantity,
    widthCm: cargo.widthCm,
    lengthCm: cargo.lengthCm,
    heightCm: cargo.heightCm,
  }
}

function CreateShipmentServiceSection({ logisticsForced }: { logisticsForced: boolean }) {
  const { draft, patch } = useWizard()

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2'>
        {SERVICE_OPTIONS.map((option) => {
          const Icon = option.icon
          const selected = draft.service === option.id
          const lockedKargo = logisticsForced && option.id === 'kargo'
          return (
            <button
              key={option.id}
              type='button'
              onClick={() => {
                if (lockedKargo) return
                patch({
                  service: option.id,
                  logisticsMode: option.id === 'lojistik' ? draft.logisticsMode ?? 'ltl' : null,
                })
              }}
              aria-pressed={selected}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                selected
                  ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_20px_44px_-28px_rgb(25_91_85_/_0.5)]'
                  : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
              } ${lockedKargo ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  selected ? 'bg-[var(--gl-petrol)] text-white' : 'bg-[var(--gl-subtle)] text-[var(--gl-petrol)]'
                }`}
              >
                <Icon className='size-5' aria-hidden />
              </span>
              <p className='mt-4 text-lg font-bold text-[var(--gl-ink)]'>{option.title}</p>
              <p className='text-sm text-[var(--gl-muted)]'>{option.tagline}</p>
              <ul className='mt-4 space-y-2'>
                {option.bullets.map((bullet) => (
                  <li key={bullet} className='flex items-start gap-2 text-sm text-[var(--gl-muted)]'>
                    <Check className='mt-0.5 size-4 shrink-0 text-[var(--gl-petrol)]' aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {logisticsForced ? (
        <p className='rounded-xl bg-[var(--gl-petrol-soft)] px-3 py-2 text-xs text-[var(--gl-petrol)]'>
          Yük {LOGISTICS_DESI_THRESHOLD} desi, palet veya ton eşiğini aştığı için lojistik seçildi.
        </p>
      ) : null}

      {draft.service === 'lojistik' ? (
        <div>
          <p className='gl-eyebrow'>Taşıma opsiyonu</p>
          <div className='mt-3 grid gap-4 sm:grid-cols-2'>
            {LOGISTICS_MODES.map((mode) => {
              const selected = draft.logisticsMode === mode.id
              return (
                <button
                  key={mode.id}
                  type='button'
                  onClick={() => patch({ logisticsMode: mode.id })}
                  aria-pressed={selected}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    selected
                      ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_20px_44px_-28px_rgb(25_91_85_/_0.5)]'
                      : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
                  }`}
                >
                  <p className='text-base font-bold text-[var(--gl-ink)]'>{mode.title}</p>
                  <p className='mt-1.5 text-sm leading-relaxed text-[var(--gl-muted)]'>{mode.hint}</p>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CreateShipmentDetailsSection() {
  const { draft } = useWizard()
  if (draft.service === 'kargo') return <StepCargo />
  if (draft.service === 'lojistik' && draft.logisticsMode === 'ftl') return <StepFtl />
  if (draft.service === 'lojistik' && draft.logisticsMode === 'ltl') return <StepLtl />
  if (draft.service === 'lojistik') {
    return (
      <p className='text-sm text-[var(--gl-muted)]'>Önce parsiyel veya komple araç opsiyonunu seç.</p>
    )
  }
  return <p className='text-sm text-[var(--gl-muted)]'>Hizmet tipini seçtikten sonra paket veya yük detayları açılır.</p>
}

function AutoLogisticsSync() {
  const { draft, patch } = useWizard()

  useEffect(() => {
    const signal = cargoLoadSignal(draft)
    const inferred = inferServiceFromLoad(signal)
    if (inferred === 'lojistik' && draft.service !== 'lojistik') {
      patch({
        service: 'lojistik',
        logisticsMode: inferLogisticsMode(signal, 'lojistik') ?? 'ltl',
      })
    }
  }, [draft, patch])

  return null
}

function PageBody({
  submitting,
  onSubmit,
}: {
  submitting: boolean
  onSubmit: () => void
}) {
  const { draft } = useWizard()
  const signal = cargoLoadSignal(draft)
  const logisticsForced = inferServiceFromLoad(signal) === 'lojistik'

  return (
    <div className='flex flex-col gap-4'>
      <AutoLogisticsSync />

      <PageSection
        id='adres'
        title='Nereden nereye gidecek?'
        description='Adres ara veya kayıtlı müşteriden seç. Çıkış ve varış farklı olmalı.'
      >
        <CreateShipmentAddressSection />
      </PageSection>

      <PageSection
        id='hizmet'
        title='Nasıl taşıyalım?'
        description='Yükün boyutuna göre uygun hizmeti öneririz. İstersen değiştirebilirsin.'
      >
        <CreateShipmentServiceSection logisticsForced={logisticsForced} />
      </PageSection>

      <PageSection
        id='detay'
        title='Gönderi detayı'
        description='Paket ölçüsü, yük tipi veya araç-kasa seçimi. Tahmini fiyat aralığı anlık güncellenir.'
      >
        <CreateShipmentDetailsSection />
      </PageSection>

      <PageSection
        id='odeme'
        title='Özet ve oluştur'
        description='Özeti kontrol et, fatura, cüzdan veya kart ile gönderiyi oluştur.'
      >
        <SiparisPanelPayment submitting={submitting} onSubmit={onSubmit} />
      </PageSection>
    </div>
  )
}

export function CreateShipmentPageForm({
  formKey,
  initialDraft,
  initialOffer,
  submitting,
  onChange,
  onSubmit,
}: {
  formKey: number
  initialDraft: OrderDraft
  initialOffer: Offer | null
  submitting: boolean
  onChange: (snapshot: WizardSnapshot) => void
  onSubmit: () => void
}) {
  return (
    <SiparisPanelScope>
      <WizardProvider
        key={formKey}
        variant='shipment'
        hideStepChrome
        applyLandingPrefill={false}
        initialDraft={initialDraft}
        initialOffer={initialOffer}
        onChange={onChange}
      >
        <PageBody submitting={submitting} onSubmit={onSubmit} />
      </WizardProvider>
    </SiparisPanelScope>
  )
}
