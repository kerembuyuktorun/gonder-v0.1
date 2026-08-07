import type { AddressSuggestion } from '../_types/price-calculation'

/**
 * Google Places / Maps client için interface.
 * Gerçek entegrasyonda bu sınıfın Google Places implementasyonu kullanılır.
 */
export interface PlacesRepository {
  search(query: string): Promise<AddressSuggestion[]>
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

export class MockPlacesRepository implements PlacesRepository {
  async search(query: string): Promise<AddressSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 180))
    const q = query.trim().toLocaleLowerCase('tr-TR')
    if (q.length < 2) return []

    return MOCK_PLACES.filter((place) => {
      const haystack = `${place.primary} ${place.secondary ?? ''} ${place.city ?? ''} ${place.district ?? ''}`
        .toLocaleLowerCase('tr-TR')
      return haystack.includes(q)
    }).slice(0, 6)
  }
}

/** Gerçek Google Places client için placeholder implementasyon noktası */
export class GooglePlacesRepository implements PlacesRepository {
  async search(_query: string): Promise<AddressSuggestion[]> {
    throw new Error('Google Places client henüz bağlanmadı. MockPlacesRepository kullanın.')
  }
}

export const placesRepository: PlacesRepository = new MockPlacesRepository()
