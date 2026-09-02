import type { PlaceResult } from './order-types'

type DistrictSeed = {
  city: string
  district: string
  lat: number
  lng: number
  aliases?: string[]
}

const DISTRICTS: DistrictSeed[] = [
  { city: 'İstanbul', district: 'Kadıköy', lat: 40.9903, lng: 29.0292 },
  { city: 'İstanbul', district: 'Beşiktaş', lat: 41.0428, lng: 29.0075 },
  { city: 'İstanbul', district: 'Şişli', lat: 41.0602, lng: 28.9877 },
  { city: 'İstanbul', district: 'Bakırköy', lat: 40.9819, lng: 28.8772 },
  { city: 'İstanbul', district: 'Ümraniye', lat: 41.0165, lng: 29.1248 },
  { city: 'İstanbul', district: 'Tuzla', lat: 40.8155, lng: 29.3003 },
  { city: 'İstanbul', district: 'Hadımköy', lat: 41.1361, lng: 28.6842, aliases: ['hadimkoy osb'] },
  { city: 'İstanbul', district: 'Pendik', lat: 40.8775, lng: 29.2333 },
  { city: 'İstanbul', district: 'Ataşehir', lat: 40.9923, lng: 29.1244 },
  { city: 'Ankara', district: 'Çankaya', lat: 39.9208, lng: 32.8541 },
  { city: 'Ankara', district: 'Yenimahalle', lat: 39.9727, lng: 32.7644 },
  { city: 'Ankara', district: 'Sincan', lat: 39.9667, lng: 32.5806 },
  { city: 'Ankara', district: 'Ostim', lat: 39.9789, lng: 32.7529, aliases: ['ostim osb'] },
  { city: 'İzmir', district: 'Konak', lat: 38.4189, lng: 27.1287 },
  { city: 'İzmir', district: 'Bornova', lat: 38.4695, lng: 27.2168 },
  { city: 'İzmir', district: 'Çiğli', lat: 38.4967, lng: 27.0664 },
  { city: 'İzmir', district: 'Torbalı', lat: 38.1553, lng: 27.3603 },
  { city: 'İzmir', district: 'Kemalpaşa', lat: 38.4261, lng: 27.4172, aliases: ['kemalpasa osb'] },
  { city: 'Bursa', district: 'Nilüfer', lat: 40.2137, lng: 28.9772 },
  { city: 'Bursa', district: 'Osmangazi', lat: 40.1955, lng: 29.0608 },
  { city: 'Bursa', district: 'İnegöl', lat: 40.078, lng: 29.5133 },
  { city: 'Bursa', district: 'Gemlik', lat: 40.4311, lng: 29.1556 },
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
  { city: 'Kocaeli', district: 'Dilovası', lat: 40.7856, lng: 29.5411, aliases: ['dilovasi osb'] },
  { city: 'Denizli', district: 'Merkezefendi', lat: 37.7838, lng: 29.0669 },
  { city: 'Denizli', district: 'Acıpayam', lat: 37.4256, lng: 29.3489 },
  { city: 'Manisa', district: 'Yunusemre', lat: 38.6193, lng: 27.4265, aliases: ['manisa merkez'] },
  { city: 'Manisa', district: 'Şehzadeler', lat: 38.6156, lng: 27.4378 },
  { city: 'Manisa', district: 'Manisa OSB', lat: 38.651, lng: 27.389, aliases: ['manisa organize', 'osb manisa'] },
  { city: 'Manisa', district: 'Akhisar', lat: 38.9186, lng: 27.8378 },
  { city: 'Manisa', district: 'Soma', lat: 39.1855, lng: 27.6094 },
  { city: 'Manisa', district: 'Salihli', lat: 38.4826, lng: 28.1393 },
  { city: 'Manisa', district: 'Alaşehir', lat: 38.3508, lng: 28.5172 },
  { city: 'Manisa', district: 'Turgutlu', lat: 38.4953, lng: 27.6997 },
  { city: 'Manisa', district: 'Saruhanlı', lat: 38.7344, lng: 27.5667 },
  { city: 'Manisa', district: 'Kırkağaç', lat: 39.1064, lng: 27.6692 },
  { city: 'Manisa', district: 'Ahmetli', lat: 38.5197, lng: 27.9386 },
  { city: 'Manisa', district: 'Gölmarmara', lat: 38.7139, lng: 27.9142 },
  { city: 'Manisa', district: 'Küplüce', lat: 38.6191, lng: 27.4289 },
  { city: 'Balıkesir', district: 'Savaştepe', lat: 39.3833, lng: 27.6564, aliases: ['savastepe', 'savas tepe'] },
  { city: 'Balıkesir', district: 'Altıeylül', lat: 39.6484, lng: 27.8826, aliases: ['balikesir merkez'] },
  { city: 'Balıkesir', district: 'Karesi', lat: 39.6556, lng: 27.8903 },
  { city: 'Balıkesir', district: 'Bandırma', lat: 40.3522, lng: 27.9767 },
  { city: 'Balıkesir', district: 'Edremit', lat: 39.5961, lng: 27.0244 },
  { city: 'Balıkesir', district: 'Gönen', lat: 40.1047, lng: 27.654 },
  { city: 'Balıkesir', district: 'Ayvalık', lat: 39.319, lng: 26.6954 },
  { city: 'Balıkesir', district: 'Burhaniye', lat: 39.5004, lng: 26.9725 },
  { city: 'Balıkesir', district: 'Bigadiç', lat: 39.3925, lng: 28.1311 },
  { city: 'Balıkesir', district: 'Susurluk', lat: 39.9136, lng: 28.1578 },
  { city: 'Balıkesir', district: 'İvrindi', lat: 39.5836, lng: 27.4864 },
  { city: 'Kayseri', district: 'Melikgazi', lat: 38.7333, lng: 35.4833 },
  { city: 'Mersin', district: 'Tarsus', lat: 36.9178, lng: 34.8956 },
  { city: 'Mersin', district: 'Akdeniz', lat: 36.7969, lng: 34.6236 },
  { city: 'Samsun', district: 'İlkadım', lat: 41.2867, lng: 36.33 },
  { city: 'Trabzon', district: 'Ortahisar', lat: 41.0027, lng: 39.7168 },
  { city: 'Eskişehir', district: 'Tepebaşı', lat: 39.7767, lng: 30.5206 },
  { city: 'Eskişehir', district: 'Odunpazarı', lat: 39.7667, lng: 30.5256 },
  { city: 'Sakarya', district: 'Adapazarı', lat: 40.7808, lng: 30.4033 },
  { city: 'Sakarya', district: 'Hendek', lat: 40.7994, lng: 30.7481 },
  { city: 'Diyarbakır', district: 'Kayapınar', lat: 37.9333, lng: 40.1833 },
  { city: 'Hatay', district: 'İskenderun', lat: 36.5875, lng: 36.1731 },
  { city: 'Tekirdağ', district: 'Çorlu', lat: 41.1592, lng: 27.8 },
  { city: 'Tekirdağ', district: 'Çerkezköy', lat: 41.2858, lng: 28.0003, aliases: ['cerkezkoy osb'] },
  { city: 'Tekirdağ', district: 'Süleymanpaşa', lat: 40.9781, lng: 27.5117 },
  { city: 'Kırklareli', district: 'Lüleburgaz', lat: 41.4039, lng: 27.3552 },
  { city: 'Aydın', district: 'Efeler', lat: 37.8481, lng: 27.8456 },
  { city: 'Aydın', district: 'Nazilli', lat: 37.9125, lng: 28.3206 },
  { city: 'Uşak', district: 'Merkez', lat: 38.6823, lng: 29.4082 },
  { city: 'Afyonkarahisar', district: 'Merkez', lat: 38.7569, lng: 30.5387, aliases: ['afyon'] },
  { city: 'Kütahya', district: 'Merkez', lat: 39.4242, lng: 29.9833 },
  { city: 'Yalova', district: 'Merkez', lat: 40.655, lng: 29.2769 },
  { city: 'Düzce', district: 'Merkez', lat: 40.8438, lng: 31.1565 },
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

const STOP_WORDS = new Set([
  'palet',
  'koli',
  'paket',
  'parca',
  'kutu',
  'ton',
  'kg',
  'seramik',
  'gida',
  'yuk',
  'gonder',
  'gonderecegim',
  'adet',
  'dan',
  'den',
  'dan',
  'ya',
  'ye',
  'ile',
  'icin',
  've',
  'bir',
  'kadar',
])

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

function tokensOf(query: string): string[] {
  return normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token))
}

export type TextPlaceHit = {
  city: string
  district?: string
  label: string
  index: number
  length: number
}

const PLACE_ALIASES: Array<{ needle: string; city: string; district?: string; label: string }> = [
  { needle: 'antep', city: 'Gaziantep', label: 'Gaziantep' },
  { needle: 'izmit', city: 'Kocaeli', district: 'İzmit', label: 'İzmit, Kocaeli' },
  { needle: 'afyon', city: 'Afyonkarahisar', district: 'Merkez', label: 'Afyonkarahisar' },
  { needle: 'savastepe', city: 'Balıkesir', district: 'Savaştepe', label: 'Savaştepe, Balıkesir' },
]

function placeTokens(): Array<{ needle: string; city: string; district?: string; label: string }> {
  const cities = [...new Set(DISTRICTS.map((d) => d.city))]
  const fromDistricts = DISTRICTS.flatMap((d) => {
    const base = [
      {
        needle: normalize(d.district),
        city: d.city,
        district: d.district,
        label: `${d.district}, ${d.city}`,
      },
    ]
    const aliases = (d.aliases ?? []).map((alias) => ({
      needle: normalize(alias).replace(/\s+/g, ''),
      city: d.city,
      district: d.district,
      label: `${d.district}, ${d.city}`,
    }))
    return [...base, ...aliases]
  })

  return [
    ...fromDistricts,
    ...cities.map((city) => ({
      needle: normalize(city),
      city,
      label: city,
    })),
    ...PLACE_ALIASES,
  ].sort((a, b) => b.needle.length - a.needle.length)
}

/** Serbest metindeki il / ilçe adlarını soldan sağa döner. */
export function findPlacesInText(text: string): TextPlaceHit[] {
  const haystack = normalize(text).replace(/\s+/g, ' ')
  const compact = haystack.replace(/\s+/g, '')
  if (haystack.length < 3) return []

  const hits: TextPlaceHit[] = []
  const occupied = new Array<boolean>(haystack.length).fill(false)

  for (const token of placeTokens()) {
    if (token.needle.length < 3) continue
    let from = 0
    const source = token.needle.includes(' ') ? haystack : haystack
    while (from < source.length) {
      const index = source.indexOf(token.needle, from)
      if (index < 0) {
        if (!token.needle.includes(' ') && compact.includes(token.needle.replace(/\s+/g, ''))) {
          const compactIndex = compact.indexOf(token.needle.replace(/\s+/g, ''))
          const already = hits.some(
            (h) =>
              (h.city === token.city && h.district === token.district) ||
              (compactIndex >= 0 && compactIndex < occupied.length && occupied[compactIndex])
          )
          if (!already && compactIndex >= 0 && (occupied[compactIndex] !== true)) {
            hits.push({
              city: token.city,
              district: token.district,
              label: token.label,
              index: Math.min(compactIndex, haystack.length - 1),
              length: token.needle.length,
            })
          }
        }
        break
      }
      const end = index + token.needle.length
      const overlaps = occupied.slice(index, end).some(Boolean)
      if (!overlaps) {
        hits.push({
          city: token.city,
          district: token.district,
          label: token.label,
          index,
          length: token.needle.length,
        })
        occupied.fill(true, index, end)
      }
      from = index + 1
    }
  }

  return hits.sort((a, b) => a.index - b.index)
}

function pickStreet(seed: string, offset: number): string {
  let sum = offset
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i)
  return STREETS[sum % STREETS.length]
}

function haystackOf(d: DistrictSeed): string {
  return normalize([d.district, d.city, ...(d.aliases ?? [])].join(' '))
}

function scorePlace(d: DistrictSeed, query: string, tokens: string[]): number {
  const district = normalize(d.district)
  const city = normalize(d.city)
  const combined = `${district} ${city}`
  const aliases = (d.aliases ?? []).map((alias) => normalize(alias))
  const haystack = haystackOf(d)
  let score = 0

  if (district === query || city === query) score += 120
  if (combined === query || combined.replace(/\s+/g, '') === query.replace(/\s+/g, '')) score += 110
  if (aliases.some((alias) => alias === query || alias.replace(/\s+/g, '') === query.replace(/\s+/g, ''))) score += 115
  if (district.startsWith(query) || city.startsWith(query)) score += 80
  if (haystack.includes(query) || query.includes(district) || query.includes(city)) score += 55

  for (const token of tokens) {
    if (district === token || city === token) score += 40
    else if (district.startsWith(token) || city.startsWith(token)) score += 28
    else if (district.includes(token) || city.includes(token)) score += 18
    if (aliases.some((alias) => alias.includes(token) || token.includes(alias.replace(/\s+/g, '')))) score += 36
  }

  if (tokens.length >= 2) {
    const joined = tokens.join(' ')
    if (haystack.includes(joined) || aliases.some((alias) => alias.includes(joined))) score += 50
  }

  if (city === query && (aliases.some((alias) => alias.includes('merkez')) || /merkez|yunusemre|sehzadeler|altieylul/.test(district))) {
    score += 25
  }

  return score
}

function toResult(d: DistrictSeed, query: string, index: number): PlaceResult {
  const street = pickStreet(`${d.district}${query}`, index)
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
}

export function searchPlaces(query: string): PlaceResult[] {
  const q = normalize(query)
  if (q.length < 2) return []

  const tokens = tokensOf(query)
  const ranked = DISTRICTS.map((d) => ({ d, score: scorePlace(d, q, tokens) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.d.district.localeCompare(b.d.district, 'tr'))

  const pool = ranked.length > 0 ? ranked.map((row) => row.d) : DISTRICTS.filter((d) => normalize(d.city).startsWith(q.slice(0, 3)))

  return pool.slice(0, 8).map((d, index) => toResult(d, q, index))
}

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

export function roadDistanceKm(a: PlaceResult, b: PlaceResult): number {
  return Math.round(haversineKm(a, b) * 1.28)
}

export function estimateDriveHours(km: number): number {
  return Math.max(1, Math.round((km / 68) * 10) / 10)
}
