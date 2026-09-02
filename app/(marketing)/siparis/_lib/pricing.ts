import { findBody, findVehicle } from './catalog'
import { roadDistanceKm } from './address-search'
import type { Offer, OrderDraft } from './order-types'

export type PriceLine = {
  label: string
  detail?: string
  amount: number
}

export type PriceBreakdown = {
  distanceKm: number
  chargeableLabel: string
  lines: PriceLine[]
  subtotal: number
  vat: number
  total: number
}

const VAT_RATE = 0.2

function round(value: number): number {
  return Math.round(value / 5) * 5
}

export function calcDesi(widthCm: number, lengthCm: number, heightCm: number, quantity: number): number {
  return Math.round(((widthCm * lengthCm * heightCm) / 3000) * quantity * 100) / 100
}

function extrasLines(draft: OrderDraft, base: number): PriceLine[] {
  const lines: PriceLine[] = []
  const { extras } = draft

  if (extras.temperatureControl) {
    lines.push({ label: 'Isı kontrollü taşıma', detail: 'Soğuk zincir', amount: round(base * 0.12) })
  }
  if (extras.fragile) {
    lines.push({ label: 'Kırılabilir yük özeni', detail: 'Ek ambalaj ve istifleme', amount: round(base * 0.06) })
  }
  if (extras.forklift) {
    lines.push({ label: 'Forklift / yükleme desteği', detail: 'Çıkış ve varışta', amount: 850 })
  }
  if (extras.insurance && extras.declaredValue > 0) {
    lines.push({
      label: 'Yük sigortası',
      detail: `Beyan değeri ${new Intl.NumberFormat('tr-TR').format(extras.declaredValue)} ₺`,
      amount: round(Math.max(120, extras.declaredValue * 0.004)),
    })
  }

  return lines
}

function finalize(distanceKm: number, chargeableLabel: string, lines: PriceLine[]): PriceBreakdown {
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const vat = Math.round(subtotal * VAT_RATE)
  return { distanceKm, chargeableLabel, lines, subtotal, vat, total: subtotal + vat }
}

export function buildBreakdown(draft: OrderDraft): PriceBreakdown | null {
  const { origin, destination, service } = draft
  if (!origin || !destination || !service) return null

  const distanceKm = Math.max(12, roadDistanceKm(origin, destination))

  if (service === 'kargo') {
    const { cargo } = draft
    const desi = calcDesi(cargo.widthCm, cargo.lengthCm, cargo.heightCm, cargo.quantity)
    const weight = Math.round(cargo.weightKg * cargo.quantity * 100) / 100
    const chargeable = Math.max(desi, weight)

    const base = round(65 + distanceKm * 0.28 + chargeable * 7.5)
    const lines: PriceLine[] = [
      { label: 'Kargo taşıma bedeli', detail: `${distanceKm} km · ${cargo.quantity} parça`, amount: base },
    ]
    if (cargo.quantity > 1) {
      lines.push({ label: 'Ek parça işlem bedeli', detail: `${cargo.quantity - 1} ek parça`, amount: (cargo.quantity - 1) * 25 })
    }
    lines.push(...extrasLines(draft, base))

    return finalize(distanceKm, `${chargeable.toFixed(2)} desi/kg (ücrete esas)`, lines)
  }

  if (draft.logisticsMode === 'ftl') {
    const lines: PriceLine[] = []
    let vehicleTotal = 0

    for (const row of draft.ftl.rows) {
      const vehicle = findVehicle(row.vehicleTypeId)
      const body = findBody(row.bodyTypeId)
      if (!vehicle || !body) continue

      const perVehicle = round(Math.max(vehicle.minPrice, distanceKm * vehicle.ratePerKm) * body.multiplier)
      const amount = perVehicle * row.count
      vehicleTotal += amount

      lines.push({
        label: `${vehicle.label} · ${body.label}`,
        detail: `${row.count} araç × ${distanceKm} km`,
        amount,
      })
    }

    if (lines.length === 0) return null
    lines.push(...extrasLines(draft, vehicleTotal))

    const totalVehicles = draft.ftl.rows.reduce((sum, row) => sum + (row.vehicleTypeId ? row.count : 0), 0)
    return finalize(distanceKm, `${totalVehicles} araç (komple)`, lines)
  }

  const { ltl } = draft
  const desi = calcDesi(ltl.widthCm, ltl.lengthCm, ltl.heightCm, ltl.quantity)
  const weight = Math.round(ltl.weightKg * ltl.quantity * 100) / 100
  const chargeable = Math.max(desi / 3, weight)

  const base = round(950 + distanceKm * 2.1 + chargeable * 2.4)
  const lines: PriceLine[] = [
    { label: 'Parsiyel taşıma bedeli', detail: `${distanceKm} km · ${ltl.quantity} parça`, amount: base },
  ]
  if (!ltl.stackable) {
    lines.push({ label: 'İstiflenemez yük farkı', detail: 'Araçta tam yükseklik rezervi', amount: round(base * 0.15) })
  }
  lines.push(...extrasLines(draft, base))

  return finalize(distanceKm, `${weight.toFixed(0)} kg · ${desi.toFixed(0)} desi`, lines)
}

function transitDays(distanceKm: number): number {
  if (distanceKm < 200) return 1
  if (distanceKm < 600) return 2
  if (distanceKm < 1000) return 3
  return 4
}

export function buildOffers(draft: OrderDraft, breakdown: PriceBreakdown): Offer[] {
  const base = breakdown.total
  const days = transitDays(breakdown.distanceKm)

  if (draft.service === 'kargo') {
    return [
      {
        id: 'kargo-economy',
        plan: 'economy',
        title: 'Ekonomik',
        description: 'Bütçe dostu, standart teslim ağı üzerinden.',
        carrier: 'Gönder Ekonomi',
        price: round(base * 0.86),
        comparePrice: base,
        etaLabel: `${days + 2}–${days + 4} iş günü`,
        perks: ['Kapıdan kapıya', 'Online takip'],
        badge: 'En uygun',
      },
      {
        id: 'kargo-standard',
        plan: 'instant',
        title: 'Standart',
        description: 'Fiyat ve hız dengesi. Anında onaylanır.',
        carrier: 'Gönder Standart',
        price: base,
        etaLabel: `${days + 1}–${days + 2} iş günü`,
        perks: ['Kapıdan kapıya', 'Online takip', 'SMS bildirim'],
        badge: 'Önerilen',
      },
      {
        id: 'kargo-express',
        plan: 'express',
        title: 'Hızlı',
        description: 'Öncelikli hat, en kısa teslim süresi.',
        carrier: 'Gönder Express',
        price: round(base * 1.38),
        etaLabel: `${days} iş günü`,
        perks: ['Öncelikli işlem', 'Online takip', 'SMS bildirim'],
      },
    ]
  }

  return [
    {
      id: 'loj-instant',
      plan: 'instant',
      title: 'Anında Onay',
      description: 'Aracın hemen ayrılır, tarih garantili yükleme.',
      carrier: 'Gönder Navlun Ağı',
      price: base,
      etaLabel: `${days} gün içinde teslim`,
      perks: ['Belirttiğin tarihte yükleme', 'Araç anında tahsis', 'Tam takip'],
      badge: 'Önerilen',
    },
    {
      id: 'loj-flexible',
      plan: 'flexible',
      title: 'Esnek Tarih',
      description: 'Yükleme tarihini 3 güne kadar esnetirsen navlun düşer.',
      carrier: 'Gönder Navlun Ağı',
      price: round(base * 0.87),
      comparePrice: base,
      etaLabel: `${days + 2}–${days + 3} gün içinde teslim`,
      perks: ['±3 gün yükleme aralığı', 'Uygun araç çıkınca planlanır', 'Tam takip'],
      badge: '%13 tasarruf',
    },
    {
      id: 'loj-backload',
      plan: 'backload',
      title: 'Dönüş Yükü Bekle',
      description: 'Bu hatta dönüş yapan boş araç çıkarsa en düşük navlunu yakalarsın.',
      carrier: 'Gönder Navlun Ağı',
      price: round(base * 0.74),
      comparePrice: base,
      etaLabel: 'Eşleşme sonrası 1–2 gün',
      perks: ['En düşük navlun', 'Eşleşince bildirim gelir', 'Onaylamazsan ücret yok'],
      requiresMatching: true,
      badge: '%26 tasarruf',
    },
  ]
}
