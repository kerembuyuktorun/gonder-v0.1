export type CarrierProfile = {
  id: string
  name: string
  initials: string
  /** Tailwind-safe hex for lettermark */
  bg: string
  fg: string
}

export const CARRIERS: CarrierProfile[] = [
  { id: 'arf-parcel', name: 'ARF Parcel', initials: 'AP', bg: '#195b55', fg: '#ffffff' },
  { id: 'hizli-kargo', name: 'HızlıKargo', initials: 'HK', bg: '#c44a2d', fg: '#ffffff' },
  { id: 'eko-gonder', name: 'EkoGönder', initials: 'EG', bg: '#2f6b3a', fg: '#ffffff' },
  { id: 'city-kurye', name: 'CityKurye', initials: 'CK', bg: '#1d4e89', fg: '#ffffff' },
  { id: 'motojet', name: 'MotoJet', initials: 'MJ', bg: '#9a3412', fg: '#ffffff' },
  { id: 'sehir-ici', name: 'Şehir İçi Express', initials: 'ŞE', bg: '#0f766e', fg: '#ffffff' },
  { id: 'lojistik-merkez', name: 'Lojistik Merkez', initials: 'LM', bg: '#334155', fg: '#ffffff' },
  { id: 'lojistik-pro', name: 'LojistikPro', initials: 'LP', bg: '#1e3a5f', fg: '#ffffff' },
  { id: 'anadolu-filo', name: 'Anadolu Filo', initials: 'AF', bg: '#7c4a1e', fg: '#ffffff' },
  { id: 'express-lojistik', name: 'Express Lojistik', initials: 'EL', bg: '#5b21b6', fg: '#ffffff' },
  { id: 'gonder-ekonomi', name: 'Gönder Ekonomi', initials: 'GE', bg: '#2f6b3a', fg: '#ffffff' },
  { id: 'gonder-standart', name: 'Gönder Standart', initials: 'GS', bg: '#195b55', fg: '#ffffff' },
  { id: 'gonder-express', name: 'Gönder Express', initials: 'GX', bg: '#c44a2d', fg: '#ffffff' },
  { id: 'gonder-navlun', name: 'Gönder Navlun Ağı', initials: 'GN', bg: '#192d32', fg: '#e8ce87' },
]

function initialsFrom(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toLocaleUpperCase('tr-TR')
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toLocaleUpperCase('tr-TR')
}

export function resolveCarrier(name: string): CarrierProfile {
  const normalized = name.trim().toLocaleLowerCase('tr-TR')
  const hit = CARRIERS.find(
    (carrier) =>
      carrier.name.toLocaleLowerCase('tr-TR') === normalized ||
      normalized.includes(carrier.name.toLocaleLowerCase('tr-TR'))
  )
  if (hit) return hit
  return {
    id: `carrier-${normalized.replace(/\s+/g, '-')}`,
    name,
    initials: initialsFrom(name),
    bg: '#195b55',
    fg: '#ffffff',
  }
}
