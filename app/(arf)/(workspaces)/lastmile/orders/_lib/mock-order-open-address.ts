import type { LastmileOrder } from '../_types/order'

const NAMED_OPEN_ADDRESSES: Record<string, string> = {
  'A101 Merkez Depo': 'Caferağa Mah. Moda Cad. No:45, Kadıköy/İstanbul',
  'Ümraniye Aktarma': 'Parseller Mah. Necip Fazıl Bulvarı No:88, Ümraniye/İstanbul',
  'Tuzla Merkez Depo': 'Aydınlı Mah. Tersane Cad. No:12, Tuzla/İstanbul',
  'Kartal Depo': 'Yakacık Mah. Sanayi Cad. No:34, Kartal/İstanbul',
  'Pendik Depo': 'Bahçelievler Mah. E-5 Yan Yol No:56, Pendik/İstanbul',
  'Maslak Depo': 'Maslak Mah. Büyükdere Cad. No:201, Sarıyer/İstanbul',
  'Şişli A101 Depo': 'Halaskargazi Cad. No:102, Şişli/İstanbul',
  'Ataşehir A101 Depo': 'Barbaros Mah. Mor Sümbül Sok. No:7, Ataşehir/İstanbul',
  'Levent Soğuk Depo': 'Levent Mah. Büyükdere Cad. No:185, Beşiktaş/İstanbul',
  'Yenibosna İade Merkezi': 'Yenibosna Merkez Mah. Ladin Sok. No:3, Bahçelievler/İstanbul',
  'Moda Gel-Al': 'Moda Cad. No:78, Kadıköy/İstanbul',
  'Bostancı Gel-Al': 'Bağdat Cad. No:412, Bostancı/Kadıköy/İstanbul',
  'Beşiktaş Gel-Al Noktası': 'Sinanpaşa Mah. Barbaros Bulvarı No:9, Beşiktaş/İstanbul',
  'Kadıköy Şube': 'Caferağa Mah. Moda Cad. No:22, Kadıköy/İstanbul',
  'Kadıköy Anlaşmalı Bakkal': 'Göztepe Mah. Bağdat Cad. No:156, Kadıköy/İstanbul',
  'Restoran Şubesi': 'Osmanağa Mah. Serasker Cad. No:18, Kadıköy/İstanbul',
  'Ümraniye Merkez Depo': 'Parseller Mah. Necip Fazıl Bulvarı No:88, Ümraniye/İstanbul',
}

const GENERIC_LABELS = new Set(['Ev', 'Ofis', 'İşyeri', 'Mağaza', 'Şube', 'Teslimat Noktası'])

function fallbackOpenAddress(label: string, bolge: string): string {
  const district = bolge.trim() || 'İstanbul'
  if (GENERIC_LABELS.has(label)) {
    return `${district} Mah. Örnek Sok. No:12 D:4, ${district}/İstanbul`
  }
  if (label.includes('Depo') || label.includes('Gel-Al') || label.includes('Merkez')) {
    return `${label}, ${district}/İstanbul`
  }
  return `${label}, ${district} Mah., ${district}/İstanbul`
}

export function resolveMockOpenAddress(label: string, bolge: string): string {
  const trimmed = label.trim()
  if (!trimmed) return ''
  return NAMED_OPEN_ADDRESSES[trimmed] ?? fallbackOpenAddress(trimmed, bolge)
}

export function enrichMockOrderOpenAddresses(
  order: Omit<LastmileOrder, 'alis_acik_adres' | 'varis_acik_adres'> &
    Partial<Pick<LastmileOrder, 'alis_acik_adres' | 'varis_acik_adres'>>
): LastmileOrder {
  return {
    ...order,
    alis_acik_adres: order.alis_acik_adres || resolveMockOpenAddress(order.alis_noktasi, order.bolge),
    varis_acik_adres: order.varis_acik_adres || resolveMockOpenAddress(order.varis_noktasi, order.bolge),
  }
}
