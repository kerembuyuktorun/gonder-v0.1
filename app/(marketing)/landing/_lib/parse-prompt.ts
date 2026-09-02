import { TURKEY_CITIES } from './turkey-cities'

export type ParsedPrompt = {
  service: 'kargo' | 'lojistik'
  /** Lojistikte komple mi parsiyel mi */
  subtype?: 'ftl' | 'ltl'
  origin?: string
  destination?: string
  quantity?: number
  unit?: 'palet' | 'koli'
  weightKg?: number
  /** Teklif için hâlâ gereken alanlar */
  missing: string[]
}

function lower(value: string) {
  return value.toLocaleLowerCase('tr-TR')
}

function findCities(text: string): { origin?: string; destination?: string } {
  const haystack = lower(text)
  const hits: Array<{ city: string; index: number }> = []

  for (const city of TURKEY_CITIES) {
    const index = haystack.indexOf(lower(city))
    if (index >= 0) hits.push({ city, index })
  }

  hits.sort((a, b) => a.index - b.index)
  return { origin: hits[0]?.city, destination: hits[1]?.city }
}

/** Serbest metinden taşıma türü, güzergâh ve yük bilgisini çıkarır. */
export function parsePrompt(text: string): ParsedPrompt {
  const normalized = lower(text)
  const { origin, destination } = findCities(text)

  const unitMatch = normalized.match(/(\d+)\s*(palet|koli|paket|parça|kutu)/)
  const quantity = unitMatch ? Number(unitMatch[1]) : undefined
  const rawUnit = unitMatch?.[2]
  const unit: 'palet' | 'koli' | undefined =
    rawUnit === 'palet' ? 'palet' : rawUnit ? 'koli' : undefined

  const tonMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*ton/)
  const kgMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*kg/)
  const weightKg = tonMatch
    ? Number(tonMatch[1].replace(',', '.')) * 1000
    : kgMatch
      ? Number(kgMatch[1].replace(',', '.'))
      : undefined

  const wantsFullTruck = /komple|tır|tir\b|kamyon|dorse|araç dolusu/.test(normalized)
  const wantsPartial = /parsiyel|palet/.test(normalized)
  const wantsParcel = /kargo|koli|paket|kutu/.test(normalized)
  const heavy = (weightKg ?? 0) >= 3000

  const service: ParsedPrompt['service'] =
    wantsFullTruck || wantsPartial || heavy ? 'lojistik' : wantsParcel ? 'kargo' : 'kargo'

  const missing: string[] = []
  if (!origin) missing.push('çıkış adresi')
  if (!destination) missing.push('varış adresi')

  if (service === 'kargo') {
    if (!quantity) missing.push('parça adedi')
    if (!weightKg) missing.push('ağırlık')
    return { service, origin, destination, quantity, unit, weightKg, missing }
  }

  const subtype: 'ftl' | 'ltl' = wantsFullTruck || heavy ? 'ftl' : 'ltl'
  if (subtype === 'ltl' && !quantity) missing.push('parça adedi')
  if (!weightKg) missing.push('tahmini ağırlık')
  missing.push('yükleme tarihi')

  return { service, subtype, origin, destination, quantity, unit, weightKg, missing }
}

export function summaryLine(parsed: ParsedPrompt): string {
  const parts: string[] = [
    parsed.service === 'kargo'
      ? 'Kargo'
      : parsed.subtype === 'ftl'
        ? 'Lojistik · Komple araç'
        : 'Lojistik · Parsiyel',
  ]

  if (parsed.origin && parsed.destination) parts.push(`${parsed.origin} → ${parsed.destination}`)
  else if (parsed.origin) parts.push(`Çıkış: ${parsed.origin}`)

  if (parsed.quantity) parts.push(`${parsed.quantity} ${parsed.unit ?? 'parça'}`)
  if (parsed.weightKg) parts.push(`~${parsed.weightKg.toLocaleString('tr-TR')} kg`)

  return parts.join(' · ')
}

/** Ayrıştırma sonucundan okunabilir asistan yanıtları üretir. */
export function buildReplies(parsed: ParsedPrompt): string[] {
  const headline = summaryLine(parsed)
  const replies: string[] = [
    parsed.origin || parsed.quantity || parsed.weightKg
      ? `Anladım: ${headline}.`
      : `${headline} olarak ilerleyelim. Yükünü biraz daha tarif eder misin?`,
  ]

  if (parsed.missing.length > 0) {
    replies.push(`Teklif için şunlar gerekli: ${parsed.missing.slice(0, 3).join(', ')}.`)
  }

  replies.push('Sipariş sayfasında bu bilgilerle devam edip teklifleri görebilirsin.')
  return replies
}

/** Sipariş sihirbazına taşınacak sorgu dizesini üretir. */
export function toOrderQuery(parsed: ParsedPrompt): string {
  const params = new URLSearchParams({ tip: parsed.service })
  if (parsed.subtype) params.set('mod', parsed.subtype)
  if (parsed.origin) params.set('from', parsed.origin)
  if (parsed.destination) params.set('to', parsed.destination)
  return params.toString()
}
