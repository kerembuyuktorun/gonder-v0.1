/** Birleşik tedarikçi cari hesabı (kurye + diğer). */

export type SupplierKind = 'kurye' | 'diger'

export type SupplierAccount = {
  id: string
  kind: SupplierKind
  unvan: string
  vkn?: string
  email?: string
  telefon?: string
  tags: string[]
  /** kind=kurye iken kaynak kurye id */
  courierId?: string
  /** Açık bakiye tutarı (mutlak) */
  balance: number
  balanceLabel: 'odenecek' | 'tahsil_edilecek' | 'sifir'
  updatedAt: string
}

export type OtherSupplierRecord = {
  id: string
  unvan: string
  vkn?: string
  email?: string
  telefon?: string
  tags: string[]
  /** Pozitif = ödenecek */
  openPayable: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type UpsertOtherSupplierInput = {
  unvan: string
  vkn?: string
  email?: string
  telefon?: string
  tags?: string[]
  openPayable?: number
  notes?: string
}

export const SUPPLIER_KIND_LABELS: Record<SupplierKind, string> = {
  kurye: 'Kurye',
  diger: 'Diğer',
}
