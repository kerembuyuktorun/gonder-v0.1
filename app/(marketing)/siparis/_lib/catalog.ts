import type { LoadKindId, PackagePresetId } from './order-types'

export type PackagePreset = {
  id: Exclude<PackagePresetId, 'custom'>
  label: string
  hint: string
  widthCm: number
  lengthCm: number
  heightCm: number
  weightKg: number
}

export const PACKAGE_PRESETS: PackagePreset[] = [
  { id: 'zarf', label: 'Zarf / Doküman', hint: 'Evrak, sözleşme', widthCm: 22, lengthCm: 31, heightCm: 2, weightKg: 0.5 },
  { id: 'kucuk', label: 'Küçük Paket', hint: 'Telefon, kitap', widthCm: 20, lengthCm: 30, heightCm: 10, weightKg: 1 },
  { id: 'orta', label: 'Orta Koli', hint: 'Ayakkabı, tekstil', widthCm: 30, lengthCm: 40, heightCm: 30, weightKg: 5 },
  { id: 'buyuk', label: 'Büyük Koli', hint: 'Küçük ev aleti', widthCm: 40, lengthCm: 60, heightCm: 40, weightKg: 15 },
  { id: 'xl', label: 'XL Koli', hint: 'Mobilya parçası', widthCm: 60, lengthCm: 80, heightCm: 60, weightKg: 30 },
]

export type VehicleType = {
  id: string
  label: string
  capacity: string
  maxDesi: number
  /** Kilometre başına baz navlun */
  ratePerKm: number
  minPrice: number
}

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'kamyonet',
    label: 'Kamyonet',
    capacity: 'Maks. 1,5 ton / 4 palet',
    maxDesi: 4000,
    ratePerKm: 11,
    minPrice: 3500,
  },
  {
    id: 'kamyon-6',
    label: '6 Teker Kamyon',
    capacity: 'Maks. 5 ton / 8 palet',
    maxDesi: 9000,
    ratePerKm: 17,
    minPrice: 6500,
  },
  {
    id: 'kamyon-10',
    label: '10 Teker Kamyon',
    capacity: 'Maks. 12 ton / 14 palet',
    maxDesi: 15000,
    ratePerKm: 24,
    minPrice: 10500,
  },
  {
    id: 'kirkayak',
    label: 'Kırkayak Kamyon',
    capacity: 'Maks. 15 ton / 18 palet',
    maxDesi: 18000,
    ratePerKm: 29,
    minPrice: 13500,
  },
  {
    id: 'tir',
    label: 'Tır',
    capacity: 'Maks. 25 ton / 33 palet',
    maxDesi: 25000,
    ratePerKm: 36,
    minPrice: 18000,
  },
]

export type BodyType = {
  id: string
  label: string
  hint: string
  /** Navlun çarpanı */
  multiplier: number
}

export const BODY_TYPES: BodyType[] = [
  { id: 'tenteli', label: 'Tenteli Kasa', hint: 'Yandan ve üstten yükleme', multiplier: 1 },
  { id: 'kapali', label: 'Kapalı Kasa', hint: 'Hava koşullarına tam koruma', multiplier: 1.08 },
  { id: 'frigo', label: 'Frigorifik', hint: 'Soğuk zincir, ısı kontrollü', multiplier: 1.38 },
  { id: 'acik', label: 'Açık Kasa', hint: 'Vinçle üstten yükleme', multiplier: 0.94 },
  { id: 'lowbed', label: 'Lowbed', hint: 'İş makinesi, gabari dışı', multiplier: 1.45 },
  { id: 'silobas', label: 'Silobas', hint: 'Dökme kuru yük', multiplier: 1.22 },
]

export type LoadKind = {
  id: LoadKindId
  label: string
  hint: string
}

export const LOAD_KINDS: LoadKind[] = [
  { id: 'palet', label: 'Palet', hint: 'Standart veya özel palet' },
  { id: 'koli', label: 'Koli', hint: 'Karton kutu, paket' },
  { id: 'boru', label: 'Boru', hint: 'Uzun profil, boru' },
  { id: 'cuval', label: 'Çuval', hint: 'Big-bag, dökme torba' },
  { id: 'varil', label: 'Varil', hint: 'Sıvı, kimyasal fıçı' },
  { id: 'diger', label: 'Diğer', hint: 'Ölçüyü kendin gir' },
]

export type PalletType = {
  id: string
  label: string
  widthCm: number
  lengthCm: number
}

export const PALLET_TYPES: PalletType[] = [
  { id: 'euro', label: 'Standart Palet (80×120)', widthCm: 80, lengthCm: 120 },
  { id: 'amerikan', label: 'Amerikan Palet (100×120)', widthCm: 100, lengthCm: 120 },
  { id: 'yarim', label: 'Yarım Palet (60×80)', widthCm: 60, lengthCm: 80 },
  { id: 'diger', label: 'Diğer', widthCm: 0, lengthCm: 0 },
]

export function findVehicle(id: string | null) {
  return VEHICLE_TYPES.find((v) => v.id === id) ?? null
}

export function findBody(id: string | null) {
  return BODY_TYPES.find((b) => b.id === id) ?? null
}

export function findPreset(id: PackagePresetId | null) {
  return PACKAGE_PRESETS.find((p) => p.id === id) ?? null
}

export function findLoadKind(id: LoadKindId | null) {
  return LOAD_KINDS.find((l) => l.id === id) ?? null
}

export function findPallet(id: string | null) {
  return PALLET_TYPES.find((p) => p.id === id) ?? null
}
