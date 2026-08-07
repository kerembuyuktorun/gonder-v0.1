import { SAVED_CUSTOMERS } from './saved-customers'
import type {
  AddressSuggestion,
  LocationSuggestResult,
  LocationSuggestion,
  PriceCalculationLocation,
} from '../_types/price-calculation'

/**
 * Google Places / Maps client için interface.
 * Gerçek entegrasyonda GooglePlacesRepository bağlanır.
 */
export interface PlacesRepository {
  search(query: string): Promise<AddressSuggestion[]>
  suggestForPrice(query: string): Promise<LocationSuggestResult>
  recordRecent(location: PriceCalculationLocation): void
  getRecent(): PriceCalculationLocation[]
}

const MOCK_PLACES: AddressSuggestion[] = [
  {
    id: 'tr-ist-kadikoy',
    primary: 'Caferağa Mah. Moda Cad. No:12',
    secondary: 'Kadıköy, İstanbul',
    line1: 'Caferağa Mah. Moda Cad. No:12',
    district: 'Kadıköy',
    city: 'İstanbul',
    lat: 40.9876,
    lng: 29.0254,
    placeId: 'mock-place-kadikoy',
  },
  {
    id: 'tr-ist-besiktas',
    primary: 'Levent Mah. Büyükdere Cad. No:201',
    secondary: 'Beşiktaş, İstanbul',
    line1: 'Levent Mah. Büyükdere Cad. No:201',
    district: 'Beşiktaş',
    city: 'İstanbul',
    lat: 41.0814,
    lng: 29.0111,
    placeId: 'mock-place-levent',
  },
  {
    id: 'tr-ank-cankaya',
    primary: 'Çankaya Mah. Atatürk Bulvarı No:88',
    secondary: 'Çankaya, Ankara',
    line1: 'Çankaya Mah. Atatürk Bulvarı No:88',
    district: 'Çankaya',
    city: 'Ankara',
    lat: 39.9208,
    lng: 32.8541,
    placeId: 'mock-place-cankaya',
  },
  {
    id: 'tr-izm-konak',
    primary: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:45',
    secondary: 'Konak, İzmir',
    line1: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:45',
    district: 'Konak',
    city: 'İzmir',
    lat: 38.4362,
    lng: 27.1428,
    placeId: 'mock-place-alsancak',
  },
  {
    id: 'tr-bur-nilufer',
    primary: 'Özlüce Mah. FSM Bulvarı No:17',
    secondary: 'Nilüfer, Bursa',
    line1: 'Özlüce Mah. FSM Bulvarı No:17',
    district: 'Nilüfer',
    city: 'Bursa',
    lat: 40.2111,
    lng: 28.9869,
    placeId: 'mock-place-nilufer',
  },
  {
    id: 'tr-ant-muratpasa',
    primary: 'Fener Mah. Lara Cad. No:9',
    secondary: 'Muratpaşa, Antalya',
    line1: 'Fener Mah. Lara Cad. No:9',
    district: 'Muratpaşa',
    city: 'Antalya',
    lat: 36.8841,
    lng: 30.7056,
    placeId: 'mock-place-lara',
  },
  {
    id: 'tr-gaz-sehitkamil',
    primary: 'İbrahimli Mah. 85063. Sok. No:3',
    secondary: 'Şehitkamil, Gaziantep',
    line1: 'İbrahimli Mah. 85063. Sok. No:3',
    district: 'Şehitkamil',
    city: 'Gaziantep',
    lat: 37.0662,
    lng: 37.3833,
    placeId: 'mock-place-gaziantep',
  },
]

/** Manual city / district fallback entries */
const CITY_DISTRICT_FALLBACK: Array<{
  id: string
  city: string
  district?: string
  lat?: number
  lng?: number
}> = [
  { id: 'city-istanbul', city: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { id: 'city-ankara', city: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { id: 'city-izmir', city: 'İzmir', lat: 38.4237, lng: 27.1428 },
  { id: 'city-bursa', city: 'Bursa', lat: 40.1885, lng: 29.061 },
  { id: 'city-antalya', city: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { id: 'city-gaziantep', city: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
  { id: 'city-kocaeli', city: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
  { id: 'dist-kadikoy', city: 'İstanbul', district: 'Kadıköy', lat: 40.9876, lng: 29.0254 },
  { id: 'dist-besiktas', city: 'İstanbul', district: 'Beşiktaş', lat: 41.0422, lng: 29.0067 },
  { id: 'dist-cankaya', city: 'Ankara', district: 'Çankaya', lat: 39.9208, lng: 32.8541 },
  { id: 'dist-konak', city: 'İzmir', district: 'Konak', lat: 38.4192, lng: 27.1287 },
  { id: 'dist-nilufer', city: 'Bursa', district: 'Nilüfer', lat: 40.2111, lng: 28.9869 },
  { id: 'dist-muratpasa', city: 'Antalya', district: 'Muratpaşa', lat: 36.8841, lng: 30.7056 },
  {
    id: 'dist-sehitkamil',
    city: 'Gaziantep',
    district: 'Şehitkamil',
    lat: 37.0662,
    lng: 37.3833,
  },
]

const RECENT_STORAGE_KEY = 'gonder-price-recent-locations-v1'
const MAX_RECENT = 8

function normalizeTr(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

function savedTagFromTitle(title: string): string | undefined {
  const t = normalizeTr(title)
  if (t.includes('depo')) return 'Depo'
  if (t.includes('şube') || t.includes('sube')) return 'Şube'
  if (t.includes('merkez')) return 'Merkez'
  if (t.includes('ofis')) return 'Ofis'
  return title.split(/\s+/).pop()
}

function locationKey(location: PriceCalculationLocation) {
  return (
    location.savedAddressId ||
    location.placeId ||
    `${location.label}|${location.city}|${location.district ?? ''}`
  )
}

function readRecentFromStorage(): PriceCalculationLocation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PriceCalculationLocation[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function writeRecentToStorage(items: PriceCalculationLocation[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)))
  } catch {
    /* ignore quota */
  }
}

function toSuggestionFromPlace(
  place: AddressSuggestion,
  group: LocationSuggestion['group']
): LocationSuggestion {
  const label = place.secondary ? `${place.primary}, ${place.secondary}` : place.primary
  return {
    id: `${group}-${place.id}`,
    label,
    city: place.city ?? '',
    district: place.district,
    country: 'TR',
    placeId: place.placeId ?? place.id,
    lat: place.lat,
    lng: place.lng,
    group,
  }
}

function toSuggestionFromLocation(
  location: PriceCalculationLocation,
  group: LocationSuggestion['group'],
  extras?: Partial<LocationSuggestion>
): LocationSuggestion {
  return {
    id: `${group}-${locationKey(location)}`,
    label: location.label,
    city: location.city,
    district: location.district,
    country: location.country || 'TR',
    placeId: location.placeId,
    lat: location.lat,
    lng: location.lng,
    savedAddressId: location.savedAddressId,
    group,
    ...extras,
  }
}

function buildSavedSuggestions(): LocationSuggestion[] {
  return SAVED_CUSTOMERS.flatMap((customer) =>
    customer.addresses.map((address) =>
      toSuggestionFromLocation(
        {
          label: address.label,
          city: address.city ?? '',
          district: address.district,
          country: 'TR',
          placeId: address.placeId,
          lat: address.lat,
          lng: address.lng,
          savedAddressId: address.id,
        },
        'saved',
        {
          id: `saved-${address.id}`,
          savedTag: savedTagFromTitle(address.title),
          customerName: customer.name,
        }
      )
    )
  )
}

function matchesQuery(haystack: string, query: string) {
  if (!query) return true
  return normalizeTr(haystack).includes(query)
}

function filterByQuery<T extends { label: string; city: string; district?: string; customerName?: string }>(
  items: T[],
  query: string
): T[] {
  if (!query) return items
  return items.filter((item) =>
    matchesQuery(
      `${item.label} ${item.city} ${item.district ?? ''} ${item.customerName ?? ''}`,
      query
    )
  )
}

function cityDistrictSearch(query: string): LocationSuggestion[] {
  if (!query) return []
  return CITY_DISTRICT_FALLBACK.filter((item) =>
    matchesQuery(`${item.city} ${item.district ?? ''}`, query)
  )
    .slice(0, 6)
    .map((item) => {
      const label = item.district ? `${item.district}, ${item.city}` : item.city
      return {
        id: `search-${item.id}`,
        label,
        city: item.city,
        district: item.district,
        country: 'TR',
        lat: item.lat,
        lng: item.lng,
        placeId: item.id,
        group: 'search' as const,
      }
    })
}

export class MockPlacesRepository implements PlacesRepository {
  private recent: PriceCalculationLocation[] = []
  private hydrated = false

  private ensureHydrated() {
    if (this.hydrated) return
    this.recent = readRecentFromStorage()
    this.hydrated = true
  }

  async search(query: string): Promise<AddressSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 180))
    const q = normalizeTr(query)
    if (q.length < 2) return []

    return MOCK_PLACES.filter((place) => {
      const haystack = `${place.primary} ${place.secondary ?? ''} ${place.city ?? ''} ${place.district ?? ''}`
      return matchesQuery(haystack, q)
    }).slice(0, 6)
  }

  async suggestForPrice(query: string): Promise<LocationSuggestResult> {
    this.ensureHydrated()
    await new Promise((resolve) => setTimeout(resolve, 120))
    const q = normalizeTr(query)

    const recent = filterByQuery(
      this.recent.map((item) => toSuggestionFromLocation(item, 'recent')),
      q
    ).slice(0, 5)

    const saved = filterByQuery(buildSavedSuggestions(), q).slice(0, 6)

    let search: LocationSuggestion[] = []
    if (q.length >= 2) {
      const placeHits = MOCK_PLACES.filter((place) => {
        const haystack = `${place.primary} ${place.secondary ?? ''} ${place.city ?? ''} ${place.district ?? ''}`
        return matchesQuery(haystack, q)
      })
        .slice(0, 6)
        .map((place) => toSuggestionFromPlace(place, 'search'))

      const fallback = cityDistrictSearch(q)
      const seen = new Set(placeHits.map((item) => normalizeTr(item.label)))
      search = [
        ...placeHits,
        ...fallback.filter((item) => !seen.has(normalizeTr(item.label))),
      ].slice(0, 8)
    }

    return { recent, saved, search }
  }

  recordRecent(location: PriceCalculationLocation): void {
    this.ensureHydrated()
    const key = locationKey(location)
    this.recent = [
      location,
      ...this.recent.filter((item) => locationKey(item) !== key),
    ].slice(0, MAX_RECENT)
    writeRecentToStorage(this.recent)
  }

  getRecent(): PriceCalculationLocation[] {
    this.ensureHydrated()
    return [...this.recent]
  }
}

/** Gerçek Google Places client için placeholder implementasyon noktası */
export class GooglePlacesRepository implements PlacesRepository {
  async search(_query: string): Promise<AddressSuggestion[]> {
    throw new Error('Google Places client henüz bağlanmadı. MockPlacesRepository kullanın.')
  }

  async suggestForPrice(_query: string): Promise<LocationSuggestResult> {
    throw new Error('Google Places client henüz bağlanmadı. MockPlacesRepository kullanın.')
  }

  recordRecent(_location: PriceCalculationLocation): void {
    throw new Error('Google Places client henüz bağlanmadı. MockPlacesRepository kullanın.')
  }

  getRecent(): PriceCalculationLocation[] {
    throw new Error('Google Places client henüz bağlanmadı. MockPlacesRepository kullanın.')
  }
}

export const placesRepository: PlacesRepository = new MockPlacesRepository()

export function suggestionToLocation(suggestion: LocationSuggestion): PriceCalculationLocation {
  return {
    label: suggestion.label,
    city: suggestion.city,
    district: suggestion.district,
    country: suggestion.country || 'TR',
    placeId: suggestion.placeId,
    lat: suggestion.lat,
    lng: suggestion.lng,
    savedAddressId: suggestion.savedAddressId,
  }
}
