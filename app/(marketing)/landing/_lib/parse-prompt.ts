import { findPlacesInText, type TextPlaceHit } from '../../siparis/_lib/address-search'
import {
  inferCargoPreset,
  inferFtlConfig,
  inferLogisticsMode,
  inferServiceFromLoad,
  type LoadSignal,
} from '../../siparis/_lib/infer-load'
import type { LogisticsMode, PackagePresetId, ServiceType } from '../../siparis/_lib/order-types'

export type ParsedPrompt = {
  service: ServiceType
  /** Lojistikte komple mi parsiyel mi */
  subtype?: LogisticsMode
  origin?: string
  destination?: string
  originLabel?: string
  destinationLabel?: string
  quantity?: number
  unit?: 'palet' | 'koli'
  /** Toplam ağırlık (kg). Formda parça başına çevrilir. */
  weightKg?: number
  loadingDate?: string
  description?: string
  stackable?: boolean
  widthCm?: number
  lengthCm?: number
  heightCm?: number
  cargoPreset?: PackagePresetId
  vehicleTypeId?: string
  bodyTypeId?: string
  /** Teklif için hâlâ gereken alanlar */
  missing: string[]
}

export type ChatDraft = Omit<ParsedPrompt, 'missing'>

function lower(value: string) {
  return value.toLocaleLowerCase('tr-TR')
}

function fold(value: string) {
  return lower(value)
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
}

function suffixAfter(haystack: string, index: number, length: number) {
  return haystack.slice(index + length, index + length + 12)
}

function uniqueRoutePlaces(places: TextPlaceHit[]): TextPlaceHit[] {
  const unique: TextPlaceHit[] = []
  for (const place of places) {
    const overlaps = unique.some(
      (hit) => place.index < hit.index + hit.length && hit.index < place.index + place.length
    )
    if (overlaps) continue
    unique.push(place)
  }
  return unique
}

function extractRoute(text: string): {
  origin?: string
  destination?: string
  originLabel?: string
  destinationLabel?: string
} {
  const places = uniqueRoutePlaces(findPlacesInText(text))
  const haystack = fold(text)

  if (places.length >= 2) {
    const first = places[0]!
    const second = places[1]!
    const between = haystack.slice(first.index + first.length, second.index)
    const afterSecond = suffixAfter(haystack, second.index, second.length)
    const firstLooksDest =
      /(?:^|\s)(?:['’]?(?:ya|ye|a|e))\b/.test(suffixAfter(haystack, first.index, first.length)) &&
      !/(?:^|\s)(?:['’]?(?:dan|den))\b/.test(suffixAfter(haystack, first.index, first.length))
    const ordered =
      between.includes('dan') || between.includes('den') || /(?:ya|ye)\b/.test(afterSecond)
        ? [first, second]
        : firstLooksDest
          ? [second, first]
          : [first, second]
    return {
      origin: ordered[0].city,
      destination: ordered[1].city,
      originLabel: ordered[0].label,
      destinationLabel: ordered[1].label,
    }
  }

  if (places.length === 1) {
    const place = places[0]!
    const after = suffixAfter(haystack, place.index, place.length)
    const isOrigin = /(?:^|\s)(?:['’]?(?:dan|den))\b/.test(after)
    const isDest = /(?:^|\s)(?:['’]?(?:ya|ye|a|e))\b/.test(after)
    if (isDest && !isOrigin) {
      return { destination: place.city, destinationLabel: place.label }
    }
    return { origin: place.city, originLabel: place.label }
  }

  return {}
}

function turkeyToday(now = new Date()): Date {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, (month ?? 1) - 1, day, 12))
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function nextWeekday(today: Date, weekday: number): Date {
  const current = today.getUTCDay()
  const delta = weekday === current ? 0 : (weekday - current + 7) % 7
  return addDays(today, delta)
}

const MONTHS: Record<string, number> = {
  ocak: 0,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  agustos: 7,
  eylul: 8,
  ekim: 9,
  kasim: 10,
  aralik: 11,
}

const WEEKDAYS: Record<string, number> = {
  pazar: 0,
  pazartesi: 1,
  sali: 2,
  carsamba: 3,
  persembe: 4,
  cuma: 5,
  cumartesi: 6,
}

/** Serbest metinden yükleme tarihini ISO (YYYY-MM-DD) olarak çıkarır. */
export function parseLoadingDate(text: string, now = new Date()): string | undefined {
  const folded = fold(text)
  const today = turkeyToday(now)

  if (/\bbugun\b/.test(folded)) return toIsoDate(today)
  if (/\byarin\b/.test(folded)) return toIsoDate(addDays(today, 1))
  if (/\bobur gun\b|\boburgun\b/.test(folded)) return toIsoDate(addDays(today, 2))

  const isoMatch = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

  const named = folded.match(
    /\b(\d{1,2})\s*(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)(?:\s+(\d{4}))?\b/
  )
  if (named) {
    const day = Number(named[1])
    const month = MONTHS[named[2]!] ?? 0
    let year = named[3] ? Number(named[3]) : today.getFullYear()
    let date = new Date(Date.UTC(year, month, day, 12))
    if (!named[3] && date < today) date = new Date(Date.UTC(year + 1, month, day, 12))
    return toIsoDate(date)
  }

  const dmy = folded.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      let year = dmy[3] ? Number(dmy[3]) : today.getFullYear()
      if (year < 100) year += 2000
      let date = new Date(Date.UTC(year, month - 1, day, 12))
      if (!dmy[3] && date < today) date = new Date(Date.UTC(year + 1, month - 1, day, 12))
      return toIsoDate(date)
    }
  }

  for (const [name, weekday] of Object.entries(WEEKDAYS)) {
    if (new RegExp(`\\b${name}\\b`).test(folded)) {
      return toIsoDate(nextWeekday(today, weekday))
    }
  }

  return undefined
}

const COMMODITIES: Array<{ needle: string; label: string }> = [
  { needle: 'seramik', label: 'seramik' },
  { needle: 'gida', label: 'gıda' },
  { needle: 'tekstil', label: 'tekstil' },
  { needle: 'elektronik', label: 'elektronik' },
  { needle: 'mobilya', label: 'mobilya' },
  { needle: 'cimento', label: 'çimento' },
  { needle: 'demir', label: 'demir' },
  { needle: 'cam', label: 'cam' },
  { needle: 'plastik', label: 'plastik' },
  { needle: 'kimyasal', label: 'kimyasal' },
  { needle: 'kagit', label: 'kağıt' },
]

function extractDescription(text: string): string | undefined {
  const folded = fold(text)
  const hit = COMMODITIES.find((item) => folded.includes(item.needle))
  return hit?.label
}

function extractStackable(text: string): boolean | undefined {
  const folded = fold(text).trim()
  if (/istiflenemez|istif olmaz|ustune konmaz/.test(folded)) return false
  if (/istiflenebilir|istif edilir/.test(folded)) return true
  if (/^(evet|olur)\.?$/.test(folded)) return true
  if (/^(hayir|olmaz)\.?$/.test(folded)) return false
  return undefined
}

function extractDimensions(text: string): { widthCm?: number; lengthCm?: number; heightCm?: number } {
  const match = fold(text).match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/)
  if (!match) return {}
  return {
    widthCm: Number(match[1]!.replace(',', '.')),
    lengthCm: Number(match[2]!.replace(',', '.')),
    heightCm: Number(match[3]!.replace(',', '.')),
  }
}

function missingFields(parsed: Omit<ParsedPrompt, 'missing'>): string[] {
  const missing: string[] = []
  if (!parsed.origin) missing.push('çıkış adresi')
  if (!parsed.destination) missing.push('varış adresi')
  if (parsed.origin && parsed.destination && !parsed.loadingDate) missing.push('yükleme tarihi')
  return missing
}

function toLoadSignal(text: string, draft: Omit<ParsedPrompt, 'missing' | 'service'> & { service?: ServiceType }): LoadSignal {
  return {
    text,
    unit: draft.unit,
    quantity: draft.quantity,
    weightKg: draft.weightKg,
    widthCm: draft.widthCm,
    lengthCm: draft.lengthCm,
    heightCm: draft.heightCm,
  }
}

function hasCargoSignal(parsed: Partial<ChatDraft>): boolean {
  return Boolean(parsed.quantity || parsed.weightKg || parsed.unit)
}

/** Serbest metinden taşıma türü, güzergâh ve yük bilgisini çıkarır. */
export function parsePrompt(text: string, now = new Date()): ParsedPrompt {
  const normalized = lower(text)
  const route = extractRoute(text)
  const dims = extractDimensions(text)

  const unitMatch = normalized.match(/(\d+)\s*(palet|koli|paket|parça|kutu)/)
  const quantity = unitMatch ? Number(unitMatch[1]) : undefined
  const rawUnit = unitMatch?.[2]
  const unit: 'palet' | 'koli' | undefined = rawUnit === 'palet' ? 'palet' : rawUnit ? 'koli' : undefined

  const tonMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*ton/)
  const kgMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*kg/)
  const weightKg = tonMatch
    ? Number(tonMatch[1]!.replace(',', '.')) * 1000
    : kgMatch
      ? Number(kgMatch[1]!.replace(',', '.'))
      : undefined

  const loadingDate = parseLoadingDate(text, now)
  const description = extractDescription(text)
  const stackable = extractStackable(text)
  const cargoPreset = inferCargoPreset(text)

  const signal = toLoadSignal(text, { ...route, quantity, unit, weightKg, ...dims })
  const service = inferServiceFromLoad(signal)
  const subtype = inferLogisticsMode(signal, service)
  const ftl = service === 'lojistik' && subtype === 'ftl' ? inferFtlConfig(signal) : undefined

  const base: ChatDraft = {
    service,
    subtype,
    origin: route.origin,
    destination: route.destination,
    originLabel: route.originLabel,
    destinationLabel: route.destinationLabel,
    quantity,
    unit,
    weightKg,
    loadingDate,
    description,
    stackable,
    widthCm: dims.widthCm,
    lengthCm: dims.lengthCm,
    heightCm: dims.heightCm,
    cargoPreset,
    vehicleTypeId: ftl?.vehicleTypeId,
    bodyTypeId: ftl?.bodyTypeId,
  }

  return { ...base, missing: missingFields(base) }
}

export function mergePrompt(base: ChatDraft | null | undefined, incoming: ParsedPrompt): ParsedPrompt {
  let origin = incoming.origin ?? base?.origin
  let originLabel = incoming.originLabel ?? base?.originLabel
  let destination = incoming.destination ?? base?.destination
  let destinationLabel = incoming.destinationLabel ?? base?.destinationLabel

  if (
    incoming.origin &&
    !incoming.destination &&
    base?.origin &&
    !base.destination &&
    incoming.origin !== base.origin
  ) {
    origin = base.origin
    originLabel = base.originLabel
    destination = incoming.origin
    destinationLabel = incoming.originLabel
  }

  const quantity = incoming.quantity ?? base?.quantity
  const unit = incoming.unit ?? base?.unit
  const weightKg = incoming.weightKg ?? base?.weightKg
  const widthCm = incoming.widthCm ?? base?.widthCm
  const lengthCm = incoming.lengthCm ?? base?.lengthCm
  const heightCm = incoming.heightCm ?? base?.heightCm
  const description = incoming.description ?? base?.description
  const cargoPreset = incoming.cargoPreset ?? base?.cargoPreset

  const mergedSignal: LoadSignal = {
    text: [description, unit, quantity ? `${quantity} ${unit ?? ''}` : '', weightKg ? `${weightKg} kg` : '']
      .filter(Boolean)
      .join(' '),
    unit,
    quantity,
    weightKg,
    widthCm,
    lengthCm,
    heightCm,
  }

  const incomingCargo = hasCargoSignal(incoming)
  const service = incomingCargo
    ? inferServiceFromLoad({ ...mergedSignal, text: `${mergedSignal.text} ${incoming.unit ?? ''}`.trim() })
    : (base?.service ?? incoming.service)
  const subtype = incomingCargo
    ? inferLogisticsMode({ ...mergedSignal, text: incoming.unit ?? base?.unit ?? '' }, service)
    : (incoming.subtype ?? base?.subtype ?? inferLogisticsMode(mergedSignal, service))

  const ftl =
    service === 'lojistik' && subtype === 'ftl'
      ? inferFtlConfig(mergedSignal)
      : undefined

  const merged: ChatDraft = {
    service,
    subtype,
    origin,
    destination,
    originLabel,
    destinationLabel,
    quantity,
    unit,
    weightKg,
    loadingDate: incoming.loadingDate ?? base?.loadingDate,
    description,
    stackable: incoming.stackable ?? base?.stackable,
    widthCm,
    lengthCm,
    heightCm,
    cargoPreset,
    vehicleTypeId: incoming.vehicleTypeId ?? base?.vehicleTypeId ?? ftl?.vehicleTypeId,
    bodyTypeId: incoming.bodyTypeId ?? base?.bodyTypeId ?? ftl?.bodyTypeId,
  }

  return { ...merged, missing: missingFields(merged) }
}

function formatKg(weightKg: number) {
  return `~${weightKg.toLocaleString('tr-TR')} kg`
}

function formatTrDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function summaryLine(parsed: ParsedPrompt): string {
  const parts: string[] = [
    parsed.service === 'kargo'
      ? 'Kargo'
      : parsed.subtype === 'ftl'
        ? 'Lojistik · Komple araç'
        : 'Lojistik · Parsiyel',
  ]

  const origin = parsed.originLabel ?? parsed.origin
  const destination = parsed.destinationLabel ?? parsed.destination
  if (origin && destination) parts.push(`${origin} → ${destination}`)
  else if (origin) parts.push(`Çıkış: ${origin}`)
  else if (destination) parts.push(`Varış: ${destination}`)

  if (parsed.quantity) parts.push(`${parsed.quantity} ${parsed.unit ?? 'parça'}`)
  if (parsed.weightKg) parts.push(formatKg(parsed.weightKg))
  if (parsed.description) parts.push(parsed.description)
  if (parsed.loadingDate) parts.push(formatTrDate(parsed.loadingDate))

  return parts.join(' · ')
}

export type FollowUpKey = 'route' | 'origin' | 'destination' | 'loadingDate' | 'stackable' | 'packageSize'

export function nextFollowUp(parsed: ParsedPrompt): FollowUpKey | null {
  if (!parsed.origin && !parsed.destination) return 'route'
  if (parsed.origin && !parsed.destination) return 'origin'
  if (!parsed.origin && parsed.destination) return 'destination'
  if (!parsed.loadingDate) return 'loadingDate'
  if (parsed.service === 'kargo' && !parsed.cargoPreset && !parsed.widthCm) return 'packageSize'
  if (parsed.service === 'lojistik' && parsed.subtype !== 'ftl' && parsed.stackable === undefined) {
    return 'stackable'
  }
  return null
}

const FORM_HINT = 'İstersen formdan da devam edebilirsin.'

export function buildChatReply(parsed: ParsedPrompt): string {
  const origin = parsed.originLabel ?? parsed.origin
  const destination = parsed.destinationLabel ?? parsed.destination
  const followUp = nextFollowUp(parsed)

  if (followUp === 'route') {
    return 'Yük nereden nereye gidecek? Örneğin: İstanbul’dan Ankara’ya.'
  }
  if (followUp === 'origin') {
    return `Varış ${destination}. Nereden çıkacak?`
  }
  if (followUp === 'destination') {
    return `${origin} çıkışını aldım. Nereye gidecek?`
  }

  const extras: string[] = []
  if (parsed.quantity) extras.push(`${parsed.quantity} ${parsed.unit ?? 'parça'}`)
  if (parsed.weightKg) extras.push(formatKg(parsed.weightKg))
  if (parsed.description) extras.push(parsed.description)
  const extra = extras.length > 0 ? ` ${extras.join(', ')}.` : ''
  const route = `Güzergâh: ${origin} → ${destination}.${extra}`

  if (followUp === 'loadingDate') {
    return `${route} Yükleme gününü yazabilirsin; istersen formdan da devam edebilirsin.`
  }

  const dated = parsed.loadingDate ? ` Yükleme: ${formatTrDate(parsed.loadingDate)}.` : ''

  if (followUp === 'packageSize') {
    return `${route}${dated} Paket kabaca hangi boyutta — küçük, orta, büyük? ${FORM_HINT}`
  }
  if (followUp === 'stackable') {
    return `${route}${dated} Yük istiflenebilir mi? ${FORM_HINT}`
  }

  return `${route}${dated} Taslağı hazır. Sohbette ek bilgi verebilir veya teklif formuna geçebilirsin.`
}

/** Ayrıştırma sonucundan okunabilir asistan yanıtları üretir. */
export function buildReplies(parsed: ParsedPrompt): string[] {
  return [buildChatReply(parsed)]
}

/** Sipariş sihirbazına taşınacak sorgu dizesini üretir. */
export function toOrderQuery(parsed: ParsedPrompt): string {
  const params = new URLSearchParams({ tip: parsed.service })
  if (parsed.subtype) params.set('mod', parsed.subtype)
  if (parsed.originLabel) params.set('from', parsed.originLabel)
  else if (parsed.origin) params.set('from', parsed.origin)
  if (parsed.destinationLabel) params.set('to', parsed.destinationLabel)
  else if (parsed.destination) params.set('to', parsed.destination)
  if (parsed.loadingDate) params.set('tarih', parsed.loadingDate)
  if (parsed.quantity) params.set('adet', String(parsed.quantity))
  if (parsed.weightKg) params.set('kg', String(parsed.weightKg))
  if (parsed.description) params.set('aciklama', parsed.description)
  if (parsed.unit) params.set('birim', parsed.unit)
  if (parsed.stackable === false) params.set('istif', 'hayir')
  if (parsed.stackable === true) params.set('istif', 'evet')
  if (parsed.cargoPreset) params.set('olcu', parsed.cargoPreset)
  return params.toString()
}

export function hasRoute(parsed: Pick<ParsedPrompt, 'origin' | 'destination'>): boolean {
  return Boolean(parsed.origin && parsed.destination)
}

export function toQuotePrefill(parsed: ChatDraft | ParsedPrompt): ChatDraft {
  const { missing: _missing, ...draft } = parsed as ParsedPrompt
  return draft
}
