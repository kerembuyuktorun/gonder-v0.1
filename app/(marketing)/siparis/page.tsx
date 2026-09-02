import type { Metadata } from 'next'
import { OrderWizard } from './_components/order-wizard'
import { WizardProvider } from './_components/wizard-context'
import { searchPlaces } from './_lib/address-search'
import type { LogisticsMode, PackagePresetId, PlaceResult, ServiceType } from './_lib/order-types'
import { createOrderFromPrefill, type QuotePrefill } from './_lib/quote-prefill'

export const metadata: Metadata = {
  title: 'Sipariş Oluştur — Gönder',
  description:
    'Çıkış ve varış adresini seç, kargo veya lojistik talebini oluştur, Gönder uygun taşıma seçeneklerini bulsun.',
}

/** Landing'den gelen şehir veya ilçe adını adres kaydına bağlar. */
function resolveCity(city?: string): PlaceResult | null {
  if (!city) return null
  return searchPlaces(city)[0] ?? null
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    tip?: string
    mod?: string
    from?: string
    to?: string
    tarih?: string
    adet?: string
    kg?: string
    aciklama?: string
    birim?: string
    istif?: string
    olcu?: string
  }>
}) {
  const params = await searchParams

  const initialService: ServiceType | null =
    params.tip === 'kargo' || params.tip === 'lojistik' ? params.tip : null
  const initialMode: LogisticsMode | null =
    params.mod === 'ftl' || params.mod === 'ltl' ? params.mod : null
  const origin = resolveCity(params.from)
  const destination = resolveCity(params.to)

  const prefill: QuotePrefill = {
    service: initialService ?? undefined,
    subtype: initialMode ?? undefined,
    originLabel: params.from,
    destinationLabel: params.to,
    loadingDate: params.tarih,
    quantity: parseNumber(params.adet),
    weightKg: parseNumber(params.kg),
    description: params.aciklama,
    unit: params.birim === 'palet' || params.birim === 'koli' ? params.birim : undefined,
    stackable: params.istif === 'hayir' ? false : params.istif === 'evet' ? true : undefined,
    cargoPreset:
      params.olcu === 'zarf' ||
      params.olcu === 'kucuk' ||
      params.olcu === 'orta' ||
      params.olcu === 'buyuk' ||
      params.olcu === 'xl' ||
      params.olcu === 'custom'
        ? (params.olcu as PackagePresetId)
        : undefined,
  }

  const initialDraft = createOrderFromPrefill(prefill, origin, destination)

  return (
    <WizardProvider initialDraft={initialDraft}>
      <OrderWizard />
    </WizardProvider>
  )
}
