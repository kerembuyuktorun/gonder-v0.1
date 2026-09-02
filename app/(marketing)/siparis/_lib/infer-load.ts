import type { LogisticsMode, PackagePresetId, ServiceType } from './order-types'

function calcDesi(widthCm: number, lengthCm: number, heightCm: number, quantity: number): number {
  return Math.round(((widthCm * lengthCm * heightCm) / 3000) * quantity * 100) / 100
}

/** Kargo üst sınırı — bu desi ve üzeri lojistiğe yönlendirilir. */
export const LOGISTICS_DESI_THRESHOLD = 120

/** Bu toplam ağırlık ve üzeri lojistik kabul edilir. */
export const LOGISTICS_WEIGHT_KG = 3000

/** Palet ölçüsü belirtilmezse kullanılan tipik euro palet. */
export const TYPICAL_PALLET_CM = { widthCm: 80, lengthCm: 120, heightCm: 150 } as const

export type LoadSignal = {
  text?: string
  unit?: 'palet' | 'koli'
  quantity?: number
  weightKg?: number
  widthCm?: number
  lengthCm?: number
  heightCm?: number
}

function lower(value: string) {
  return value.toLocaleLowerCase('tr-TR')
}

export function estimateChargeableDesi(signal: LoadSignal): number | undefined {
  const quantity = Math.max(1, signal.quantity ?? 1)
  if (signal.widthCm && signal.lengthCm && signal.heightCm) {
    return calcDesi(signal.widthCm, signal.lengthCm, signal.heightCm, quantity)
  }
  if (signal.unit === 'palet') {
    return calcDesi(
      TYPICAL_PALLET_CM.widthCm,
      TYPICAL_PALLET_CM.lengthCm,
      TYPICAL_PALLET_CM.heightCm,
      signal.quantity ?? 1
    )
  }
  return undefined
}

export function inferServiceFromLoad(signal: LoadSignal): ServiceType {
  const text = signal.text ?? ''
  const normalized = lower(text)
  const wantsFullTruck = /komple|tır|tir\b|kamyon|dorse|araç dolusu/.test(normalized)
  const wantsPartial = /parsiyel|palet/.test(normalized)
  const explicitLogistics = /lojistik/.test(normalized)
  const heavy = (signal.weightKg ?? 0) >= LOGISTICS_WEIGHT_KG
  const desi = estimateChargeableDesi(signal) ?? 0

  if (wantsFullTruck || wantsPartial || explicitLogistics || heavy || desi >= LOGISTICS_DESI_THRESHOLD) {
    return 'lojistik'
  }

  return 'kargo'
}

export function inferLogisticsMode(signal: LoadSignal, service: ServiceType): LogisticsMode | undefined {
  if (service !== 'lojistik') return undefined
  const text = lower(signal.text ?? '')
  const wantsFullTruck = /komple|tır|tir\b|kamyon|dorse|araç dolusu/.test(text)
  const wantsPartial = /parsiyel|palet/.test(text)
  if (wantsFullTruck && !wantsPartial) return 'ftl'
  if (wantsPartial || signal.unit === 'palet') return 'ltl'
  if ((signal.weightKg ?? 0) >= LOGISTICS_WEIGHT_KG) return 'ftl'
  return 'ltl'
}

export type FtlAiConfig = {
  vehicleTypeId: string
  bodyTypeId: string
  ai: boolean
}

/** Yük tanımından FTL araç + kasa önerir. Sohbette sorulmaz. */
export function inferFtlConfig(signal: LoadSignal): FtlAiConfig {
  const text = lower(signal.text ?? '')
  const palets = signal.unit === 'palet' ? (signal.quantity ?? 0) : 0
  const weightKg = signal.weightKg ?? 0

  let vehicleTypeId = 'tir'
  if (/kamyonet/.test(text)) vehicleTypeId = 'kamyonet'
  else if (/kırkayak|kirkayak/.test(text)) vehicleTypeId = 'kirkayak'
  else if (/10\s*teker/.test(text)) vehicleTypeId = 'kamyon-10'
  else if (/6\s*teker/.test(text)) vehicleTypeId = 'kamyon-6'
  else if (/\btır\b|\btir\b/.test(text)) vehicleTypeId = 'tir'
  else if (weightKg >= 7000 || palets >= 10) vehicleTypeId = 'tir'
  else if (weightKg >= 5000 || palets >= 8) vehicleTypeId = 'kamyon-10'
  else if (weightKg >= 1500 || palets >= 4) vehicleTypeId = 'kamyon-6'
  else if (weightKg > 0 || palets > 0) vehicleTypeId = 'kamyonet'

  let bodyTypeId = 'tenteli'
  if (/frigo|soğuk|soguk|ısı kontrol|isi kontrol/.test(text)) bodyTypeId = 'frigo'
  else if (/lowbed|iş makinesi|is makinesi/.test(text)) bodyTypeId = 'lowbed'
  else if (/silobas|dökme|dokme/.test(text)) bodyTypeId = 'silobas'
  else if (/kapalı kasa|kapali kasa/.test(text)) bodyTypeId = 'kapali'
  else if (/açık kasa|acik kasa/.test(text)) bodyTypeId = 'acik'

  return { vehicleTypeId, bodyTypeId, ai: true }
}

export function inferCargoPreset(text: string): PackagePresetId | undefined {
  const normalized = lower(text)
  if (/zarf|evrak|doküman|dokuman/.test(normalized)) return 'zarf'
  if (/\bxl\b|çok büyük|cok buyuk/.test(normalized)) return 'xl'
  if (/büyük koli|buyuk koli|büyük paket|buyuk paket/.test(normalized)) return 'buyuk'
  if (/orta koli|orta paket|\borta\b/.test(normalized)) return 'orta'
  if (/küçük|kucuk/.test(normalized)) return 'kucuk'
  if (/büyük|buyuk/.test(normalized)) return 'buyuk'
  return undefined
}
