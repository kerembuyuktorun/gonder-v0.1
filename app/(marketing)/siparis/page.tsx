import type { Metadata } from 'next'
import { OrderWizard } from './_components/order-wizard'
import { WizardProvider } from './_components/wizard-context'
import { searchPlaces } from './_lib/address-search'
import type { LogisticsMode, PlaceResult, ServiceType } from './_lib/order-types'

export const metadata: Metadata = {
  title: 'Sipariş Oluştur — Gönder',
  description:
    'Çıkış ve varış adresini seç, kargo veya lojistik talebini oluştur, Gönder uygun taşıma seçeneklerini bulsun.',
}

/** Landing'den gelen şehir adını demo adres veritabanındaki bir noktaya bağlar. */
function resolveCity(city?: string): PlaceResult | null {
  if (!city) return null
  return searchPlaces(city)[0] ?? null
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string; mod?: string; from?: string; to?: string }>
}) {
  const params = await searchParams

  const initialService: ServiceType | null =
    params.tip === 'kargo' || params.tip === 'lojistik' ? params.tip : null
  const initialMode: LogisticsMode | null =
    params.mod === 'ftl' || params.mod === 'ltl' ? params.mod : null

  return (
    <WizardProvider
      initialService={initialService}
      initialLogisticsMode={initialService === 'lojistik' ? initialMode : null}
      initialOrigin={resolveCity(params.from)}
      initialDestination={resolveCity(params.to)}
    >
      <OrderWizard />
    </WizardProvider>
  )
}
