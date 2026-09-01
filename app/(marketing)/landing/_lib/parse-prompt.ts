import type { KargoDraft, LogisticsDraft, QuoteDraft } from './quote-types'
import { TURKEY_CITIES } from './turkey-cities'

export type PromptPatch = {
  mode?: QuoteDraft['mode']
  kargo?: Partial<KargoDraft>
  lojistik?: Partial<LogisticsDraft>
}

export type ParsedPrompt = {
  patch: PromptPatch
  origin?: string
  destination?: string
  quantity?: number
  unit?: 'palet' | 'koli'
  weightKg?: number
  /** Cevaplanması gereken eksik alanlar */
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

  let mode: QuoteDraft['mode'] = 'kargo'
  if (wantsFullTruck || wantsPartial || heavy) mode = 'lojistik'
  else if (wantsParcel) mode = 'kargo'

  const missing: string[] = []
  if (!origin) missing.push('çıkış ili')
  if (!destination) missing.push('varış ili')

  if (mode === 'kargo') {
    if (!quantity) missing.push('parça adedi')
    if (!weightKg) missing.push('ağırlık')

    const patch: PromptPatch = {
      mode: 'kargo',
      kargo: {
        ...(origin ? { origin: { city: origin, district: '' } } : {}),
        ...(destination ? { destination: { city: destination, district: '' } } : {}),
      },
    }
    return { patch, origin, destination, quantity, unit, weightKg, missing }
  }

  const subtype: LogisticsDraft['subtype'] = wantsFullTruck || heavy ? 'ftl' : 'ltl'
  if (subtype === 'ltl' && !quantity) missing.push('parça adedi')
  if (!weightKg) missing.push('tahmini ağırlık')
  missing.push('yükleme tarihi')

  const patch: PromptPatch = {
    mode: 'lojistik',
    lojistik: {
      subtype,
      ...(unit ? { loadUnit: unit } : {}),
      ...(quantity ? { pieceCount: quantity } : {}),
      ...(weightKg ? { weightKg } : {}),
      ...(origin ? { origin: { city: origin, district: '' } } : {}),
      ...(destination ? { destination: { city: destination, district: '' } } : {}),
    },
  }

  return { patch, origin, destination, quantity, unit, weightKg, missing }
}

/** Ayrıştırma sonucundan okunabilir asistan yanıtları üretir. */
export function buildReplies(parsed: ParsedPrompt): string[] {
  const { origin, destination, quantity, unit, weightKg, patch, missing } = parsed
  const bits: string[] = []

  if (origin && destination) bits.push(`${origin} → ${destination}`)
  else if (origin) bits.push(`Çıkış: ${origin}`)

  if (quantity) bits.push(`${quantity} ${unit ?? 'parça'}`)
  if (weightKg) bits.push(`~${weightKg.toLocaleString('tr-TR')} kg`)

  const modeLabel =
    patch.mode === 'kargo'
      ? 'Kargo'
      : patch.lojistik?.subtype === 'ftl'
        ? 'Lojistik · Komple araç'
        : 'Lojistik · Parsiyel'

  const replies: string[] = [
    bits.length > 0
      ? `Anladım: ${modeLabel} · ${bits.join(' · ')}.`
      : `${modeLabel} olarak ilerleyelim. Yükünü biraz daha tarif eder misin?`,
  ]

  if (missing.length > 0) {
    replies.push(`Teklif için şunlar gerekli: ${missing.slice(0, 3).join(', ')}.`)
  }

  replies.push('Aşağıdaki özeti düzenleyip teklif formuna aktarabilirsin.')
  return replies
}
