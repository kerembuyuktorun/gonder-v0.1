import type { PlaceResult } from './order-types'

type DistrictSeed = {
  city: string
  district: string
  lat: number
  lng: number
}

/**
 * Demo yer veritabanı. Gerçek entegrasyonda burası Google Places
 * Autocomplete + Place Details çağrısıyla değiştirilir.
 */
const DISTRICTS: DistrictSeed[] = [
  { city: 'İstanbul', district: 'Kadıköy', lat: 40.9903, lng: 29.0292 },
  { city: 'İstanbul', district: 'Beşiktaş', lat: 41.0428, lng: 29.0075 },
  { city: 'İstanbul', district: 'Şişli', lat: 41.0602, lng: 28.9877 },
  { city: 'İstanbul', district: 'Bakırköy', lat: 40.9819, lng: 28.8772 },
  { city: 'İstanbul', district: 'Ümraniye', lat: 41.0165, lng: 29.1248 },
  { city: 'İstanbul', district: 'Tuzla', lat: 40.8155, lng: 29.3003 },
  { city: 'İstanbul', district: 'Hadımköy', lat: 41.1361, lng: 28.6842 },
  { city: 'Ankara', district: 'Çankaya', lat: 39.9208, lng: 32.8541 },
  { city: 'Ankara', district: 'Yenimahalle', lat: 39.9727, lng: 32.7644 },
  { city: 'Ankara', district: 'Sincan', lat: 39.9667, lng: 32.5806 },
  { city: 'Ankara', district: 'Ostim', lat: 39.9789, lng: 32.7529 },
  { city: 'İzmir', district: 'Konak', lat: 38.4189, lng: 27.1287 },
  { city: 'İzmir', district: 'Bornova', lat: 38.4695, lng: 27.2168 },
  { city: 'İzmir', district: 'Çiğli', lat: 38.4967, lng: 27.0664 },
  { city: 'İzmir', district: 'Torbalı', lat: 38.1553, lng: 27.3603 },
  { city: 'Bursa', district: 'Nilüfer', lat: 40.2137, lng: 28.9772 },
  { city: 'Bursa', district: 'Osmangazi', lat: 40.1955, lng: 29.0608 },
  { city: 'Bursa', district: 'İnegöl', lat: 40.078, lng: 29.5133 },
  { city: 'Antalya', district: 'Muratpaşa', lat: 36.8841, lng: 30.7056 },
  { city: 'Antalya', district: 'Kepez', lat: 36.9236, lng: 30.6903 },
  { city: 'Adana', district: 'Seyhan', lat: 36.9914, lng: 35.3308 },
  { city: 'Adana', district: 'Ceyhan', lat: 37.0247, lng: 35.8175 },
  { city: 'Konya', district: 'Selçuklu', lat: 38.0231, lng: 32.5136 },
  { city: 'Konya', district: 'Karatay', lat: 37.8853, lng: 32.5364 },
  { city: 'Gaziantep', district: 'Şehitkamil', lat: 37.0908, lng: 37.3564 },
  { city: 'Gaziantep', district: 'Şahinbey', lat: 37.0439, lng: 37.3781 },
  { city: 'Kocaeli', district: 'Gebze', lat: 40.8028, lng: 29.4306 },
  { city: 'Kocaeli', district: 'İzmit', lat: 40.7654, lng: 29.9408 },
  { city: 'Kocaeli', district: 'Çayırova', lat: 40.8272, lng: 29.375 },
  { city: 'Denizli', district: 'Merkezefendi', lat: 37.7838, lng: 29.0669 },
  { city: 'Denizli', district: 'Acıpayam', lat: 37.4256, lng: 29.3489 },
  { city: 'Manisa', district: 'Küplüce', lat: 38.6191, lng: 27.4289 },
  { city: 'Manisa', district: 'Turgutlu', lat: 38.4939, lng: 27.6961 },
  { city: 'Kayseri', district: 'Melikgazi', lat: 38.7333, lng: 35.4833 },
  { city: 'Mersin', district: 'Tarsus', lat: 36.9178, lng: 34.8956 },
  { city: 'Mersin', district: 'Akdeniz', lat: 36.7969, lng: 34.6236 },
  { city: 'Samsun', district: 'İlkadım', lat: 41.2867, lng: 36.33 },
  { city: 'Trabzon', district: 'Ortahisar', lat: 41.0027, lng: 39.7168 },
  { city: 'Eskişehir', district: 'Tepebaşı', lat: 39.7767, lng: 30.5206 },
  { city: 'Sakarya', district: 'Adapazarı', lat: 40.7808, lng: 30.4033 },
  { city: 'Diyarbakır', district: 'Kayapınar', lat: 37.9333, lng: 40.1833 },
  { city: 'Hatay', district: 'İskenderun', lat: 36.5875, lng: 36.1731 },
]

const STREETS = [
  'Organize Sanayi Bölgesi 3. Cadde',
  'Atatürk Bulvarı',
  'Fatih Sultan Mehmet Caddesi',
  'İstiklal Sokak',
  'Sanayi Mahallesi 12. Sokak',
  'Cumhuriyet Caddesi',
  'Depo Yolu Sokak',
]

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .trim()
}

/** Basit deterministik seçim — aynı arama aynı sonuçları döndürsün diye. */
function pickStreet(seed: string, offset: number): string {
  let sum = offset
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i)
  return STREETS[sum % STREETS.length]
}

export function searchPlaces(query: string): PlaceResult[] {
  const q = normalize(query)
  if (q.length < 2) return []

  const matches = DISTRICTS.filter((d) => {
    const haystack = normalize(`${d.district} ${d.city}`)
    return haystack.includes(q)
  })

  // Eşleşme yoksa şehir adının başlangıcına göre gevşek arama
  const pool = matches.length > 0 ? matches : DISTRICTS.filter((d) => normalize(d.city).startsWith(q.slice(0, 3)))

  return pool.slice(0, 6).map((d, index) => {
    const street = pickStreet(`${d.district}${q}`, index)
    const no = ((normalize(d.district).charCodeAt(0) + index * 7) % 90) + 1
    return {
      id: `${d.city}-${d.district}-${index}`,
      title: `${d.district}, ${d.city}`,
      subtitle: `${street} No:${no}, ${d.district}/${d.city}`,
      city: d.city,
      district: d.district,
      lat: d.lat,
      lng: d.lng,
    }
  })
}

/** Ağ gecikmesini taklit eden arama. */
export function searchPlacesAsync(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(searchPlaces(query)), 260)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })
}

const EARTH_RADIUS_KM = 6371

export function haversineKm(a: PlaceResult, b: PlaceResult): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Kuş uçuşu mesafeyi karayolu mesafesine yaklaştırır. */
export function roadDistanceKm(a: PlaceResult, b: PlaceResult): number {
  return Math.round(haversineKm(a, b) * 1.28)
}

export function estimateDriveHours(km: number): number {
  return Math.max(1, Math.round((km / 68) * 10) / 10)
}
