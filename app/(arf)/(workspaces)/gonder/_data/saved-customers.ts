import type { AddressDraft } from '../_types/price-calculation'

export type SavedCustomerAddress = AddressDraft & {
  id: string
  title: string
}

export type SavedCustomer = {
  id: string
  name: string
  phone?: string
  addresses: SavedCustomerAddress[]
}

export const SAVED_CUSTOMERS: SavedCustomer[] = [
  {
    id: 'cust-1',
    name: 'Moda Tekstil A.Ş.',
    phone: '0216 000 00 01',
    addresses: [
      {
        id: 'addr-1a',
        title: 'Merkez Depo',
        label: 'Caferağa Mah. Moda Cad. No:12, Kadıköy, İstanbul',
        line1: 'Caferağa Mah. Moda Cad. No:12',
        district: 'Kadıköy',
        city: 'İstanbul',
        lat: 40.9876,
        lng: 29.0254,
        placeId: 'mock-place-kadikoy',
      },
      {
        id: 'addr-1b',
        title: 'Levent Ofis',
        label: 'Levent Mah. Büyükdere Cad. No:201, Beşiktaş, İstanbul',
        line1: 'Levent Mah. Büyükdere Cad. No:201',
        district: 'Beşiktaş',
        city: 'İstanbul',
        lat: 41.0814,
        lng: 29.0111,
        placeId: 'mock-place-levent',
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Ankara Dağıtım Ltd.',
    phone: '0312 000 00 02',
    addresses: [
      {
        id: 'addr-2a',
        title: 'Çankaya Şube',
        label: 'Çankaya Mah. Atatürk Bulvarı No:88, Çankaya, Ankara',
        line1: 'Çankaya Mah. Atatürk Bulvarı No:88',
        district: 'Çankaya',
        city: 'Ankara',
        lat: 39.9208,
        lng: 32.8541,
        placeId: 'mock-place-cankaya',
      },
    ],
  },
  {
    id: 'cust-3',
    name: 'Ege Lojistik',
    phone: '0232 000 00 03',
    addresses: [
      {
        id: 'addr-3a',
        title: 'Alsancak',
        label: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:45, Konak, İzmir',
        line1: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:45',
        district: 'Konak',
        city: 'İzmir',
        lat: 38.4362,
        lng: 27.1428,
        placeId: 'mock-place-alsancak',
      },
    ],
  },
]

export function toAddressDraft(address: SavedCustomerAddress): AddressDraft {
  return {
    label: address.label,
    line1: address.line1,
    district: address.district,
    city: address.city,
    lat: address.lat,
    lng: address.lng,
    placeId: address.placeId,
  }
}
