/** Örnek veri — gerçek servis bağlantısı yok. */
export const TURKEY_CITIES = [
  'Adana',
  'Ankara',
  'Antalya',
  'Bursa',
  'Denizli',
  'Diyarbakır',
  'Eskişehir',
  'Gaziantep',
  'İstanbul',
  'İzmir',
  'Kayseri',
  'Kocaeli',
  'Konya',
  'Mersin',
  'Samsun',
  'Trabzon',
] as const

export type TurkeyCity = (typeof TURKEY_CITIES)[number]

/** Harita noktaları — yüzde konum (örnek). */
export const CITY_MAP_COORDS: Record<string, { x: number; y: number }> = {
  İstanbul: { x: 28, y: 22 },
  Bursa: { x: 24, y: 30 },
  Ankara: { x: 42, y: 34 },
  İzmir: { x: 12, y: 42 },
  Antalya: { x: 30, y: 58 },
  Konya: { x: 38, y: 48 },
  Gaziantep: { x: 62, y: 52 },
  Trabzon: { x: 68, y: 18 },
  Samsun: { x: 58, y: 24 },
  Adana: { x: 52, y: 56 },
  Kocaeli: { x: 30, y: 24 },
  Mersin: { x: 48, y: 58 },
  Eskişehir: { x: 32, y: 32 },
  Kayseri: { x: 50, y: 40 },
  Denizli: { x: 22, y: 46 },
  Diyarbakır: { x: 72, y: 46 },
}

export const SAMPLE_DISTRICTS: Record<string, string[]> = {
  İstanbul: ['Kadıköy', 'Ataşehir', 'Başakşehir', 'Pendik', 'Ümraniye'],
  Ankara: ['Çankaya', 'Yenimahalle', 'Sincan', 'Keçiören'],
  İzmir: ['Konak', 'Bornova', 'Karşıyaka', 'Çiğli'],
  Bursa: ['Nilüfer', 'Osmangazi', 'Yıldırım'],
  Antalya: ['Muratpaşa', 'Kepez', 'Alanya'],
}
