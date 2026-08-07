/* ------------------------------------------------------------------ */
/*  Taşıma Oluştur – Mock Veri                                        */
/* ------------------------------------------------------------------ */

import type { AddressRecord, ComboboxOption, CustomerRecord, DriverRecord, SelectOption, VehicleRecord } from '../_types/transport'

/* ─── Müşteri Kayıtları ─── */

export const mockCustomers: CustomerRecord[] = [
  {
    id: 'cust-1',
    customerType: 'individual',
    tradeName: 'AHMET KARAN',
    customerName: 'AHMET KARAN',
    taxNumber: '11111111111',
    taxOffice: 'Seyhan VD',
    firstName: 'Ahmet',
    lastName: 'Karan',
    email: 'ahmet@karan.com',
    contactName: 'Ahmet Karan',
    phone: '5386915511',
    city: 'Adana',
    district: 'Seyhan',
    neighborhood: 'ALİDEDE',
    branch: 'Adana Şube',
  },
  {
    id: 'cust-2',
    customerType: 'corporate',
    tradeName: 'DELTA TİCARET LTD.',
    customerName: 'DELTA TİCARET LTD.',
    taxNumber: '2222222222',
    taxOffice: 'Gebze VD',
    firstName: 'Mehmet',
    lastName: 'Demir',
    email: 'mehmet@delta.com',
    contactName: 'Mehmet Demir',
    phone: '5321234567',
    city: 'Kocaeli',
    district: 'Gebze',
    neighborhood: 'Güzeller',
    branch: 'Gebze Şube',
  },
  {
    id: 'cust-3',
    customerType: 'corporate',
    tradeName: 'YILDIZ GIDA SAN.',
    customerName: 'YILDIZ GIDA SAN.',
    taxNumber: '3333333333',
    taxOffice: 'Sincan VD',
    firstName: 'Ali',
    lastName: 'Yıldız',
    email: 'ali@yildiz.com',
    contactName: 'Ali Yıldız',
    phone: '5069876543',
    city: 'Ankara',
    district: 'Sincan',
    neighborhood: 'Fatih',
    branch: 'Ankara Şube',
  },
  {
    id: 'cust-4',
    customerType: 'corporate',
    tradeName: 'MEGA DEPOLAMA A.Ş.',
    customerName: 'MEGA DEPOLAMA A.Ş.',
    taxNumber: '4444444444',
    taxOffice: 'Kemalpaşa VD',
    firstName: 'Zeynep',
    lastName: 'Mega',
    email: 'zeynep@mega.com',
    contactName: 'Zeynep Mega',
    phone: '5451112233',
    city: 'İzmir',
    district: 'Kemalpaşa',
    neighborhood: 'Ulucak',
    branch: 'İzmir Şube',
  },
]

/* ─── Adres Kayıtları ─── */

export const mockAddresses: AddressRecord[] = [
  {
    id: 'addr-1',
    customerId: 'cust-1',
    label: 'Gönderici Merkez Adres',
    line1: 'ALİDEDE MAH KARASUKU SOK NO 37 MISIR ÇAR',
    city: 'Adana',
    district: 'Seyhan',
    neighborhood: 'ALİDEDE',
    phone: '5386915511',
    contactName: 'Ahmet Karan',
    branch: 'Adana Şube',
  },
  {
    id: 'addr-2',
    customerId: 'cust-2',
    label: 'Depo Adresi – Gebze OSB',
    line1: 'Gebze OSB Mah. 1500.Sok No:12 Gebze/Kocaeli',
    city: 'Kocaeli',
    district: 'Gebze',
    neighborhood: 'Güzeller',
    phone: '5321234567',
    contactName: 'Mehmet Demir',
    branch: 'Gebze Şube',
  },
  {
    id: 'addr-3',
    customerId: 'cust-3',
    label: 'Fabrika – Ankara Sincan',
    line1: 'Fatih Mah. Sanayi Cad. No:45 Sincan/Ankara',
    city: 'Ankara',
    district: 'Sincan',
    neighborhood: 'Fatih',
    phone: '5069876543',
    contactName: 'Ali Yıldız',
    branch: 'Ankara Şube',
  },
  {
    id: 'addr-4',
    customerId: 'cust-4',
    label: 'Şube – İzmir Kemalpaşa',
    line1: 'Ulucak Mah. Organize San. Bölgesi No:8 Kemalpaşa/İzmir',
    city: 'İzmir',
    district: 'Kemalpaşa',
    neighborhood: 'Ulucak',
    phone: '5451112233',
    contactName: 'Zeynep Mega',
    branch: 'İzmir Şube',
  },
]

/* ─── Combobox seçenekleri ─── */

export const mockCustomerComboOptions: ComboboxOption[] = mockCustomers.map((c) => ({
  id: c.id,
  label: c.tradeName,
  description: `${c.taxNumber} – ${c.city}`,
  keywords: `${c.contactName} ${c.phone}`,
}))

export const getAddressComboOptions = (customerId: string | null): ComboboxOption[] =>
  mockAddresses
    .filter((a) => a.customerId === customerId)
    .map((a) => ({
      id: a.id,
      label: a.label,
      description: `${a.city} / ${a.district}`,
    }))

/* ─── Taşıma Carisi ─── */

export const mockTasimaCarisiOptions: ComboboxOption[] = [
  { id: 'carrier-2', label: 'DELTA TEDARİK', description: 'Tedarikçi', keywords: 'delta tedarik' },
  { id: 'carrier-3', label: 'MARS LOJİSTİK', description: 'Tedarikçi', keywords: 'mars lojistik' },
  { id: 'carrier-4', label: 'STAR TAŞIMACILIK', description: 'Tedarikçi', keywords: 'star taşımacılık' },
]

/* ─── Araçlar (firmaya bağlı) ─── */

export const mockVehicles: VehicleRecord[] = [
  { id: 'veh-1', carrierId: 'carrier-2', plaka: '34 ABC 123', aracTipi: 'Tır', kasaTipi: 'Tenteli', kapasite: 25 },
  { id: 'veh-2', carrierId: 'carrier-2', plaka: '34 DEF 456', aracTipi: 'Kamyon', kasaTipi: 'Açık', kapasite: 12 },
  { id: 'veh-3', carrierId: 'carrier-3', plaka: '06 GHI 789', aracTipi: 'Tır', kasaTipi: 'Tenteli', kapasite: 25 },
  { id: 'veh-4', carrierId: 'carrier-3', plaka: '06 JKL 012', aracTipi: 'Kamyonet', kasaTipi: 'Kapalı Kasa', kapasite: 5 },
  { id: 'veh-5', carrierId: 'carrier-4', plaka: '35 MNO 345', aracTipi: 'Frigorifik', kasaTipi: 'Frigo', kapasite: 20 },
  { id: 'veh-6', carrierId: 'carrier-4', plaka: '35 PRS 678', aracTipi: 'Tır', kasaTipi: 'Tanker', kapasite: 30 },
]

/* ─── Sürücüler (firmaya bağlı) ─── */

export const mockDrivers: DriverRecord[] = [
  { id: 'drv-1', carrierId: 'carrier-2', fullName: 'Ahmet Yılmaz', phone: '532 111 2233' },
  { id: 'drv-2', carrierId: 'carrier-2', fullName: 'Mehmet Demir', phone: '533 222 3344' },
  { id: 'drv-3', carrierId: 'carrier-3', fullName: 'Ali Kaya', phone: '534 333 4455' },
  { id: 'drv-4', carrierId: 'carrier-3', fullName: 'Hasan Çelik', phone: '535 444 5566' },
  { id: 'drv-5', carrierId: 'carrier-4', fullName: 'Emre Koç', phone: '536 555 6677' },
  { id: 'drv-6', carrierId: 'carrier-4', fullName: 'Osman Şen', phone: '537 666 7788' },
]

/* ─── Araç Tipi ─── */

export const mockAracTipiOptions: SelectOption[] = [
  { value: 'arac-1', label: 'Tır', icon: '🚛' },
  { value: 'arac-2', label: 'Kamyon', icon: '🚚' },
  { value: 'arac-3', label: 'Kamyonet', icon: '🚐' },
  { value: 'arac-4', label: 'Frigorifik', icon: '❄️' },
]

/* ─── Yük Tipi ─── */

export const mockYukTipiOptions: SelectOption[] = [
  { value: 'yuk-1', label: 'Palet' },
  { value: 'yuk-2', label: 'Koli' },
  { value: 'yuk-3', label: 'IBC' },
  { value: 'yuk-4', label: 'Bidon' },
  { value: 'yuk-5', label: 'Dökme' },
]

/* ─── Kasa Tipi ─── */

export const mockKasaTipiOptions: SelectOption[] = [
  { value: 'kasa-1', label: 'Açık Kasa' },
  { value: 'kasa-2', label: 'Kapalı Kasa' },
  { value: 'kasa-3', label: 'Tenteli' },
  { value: 'kasa-4', label: 'Frigorifik' },
]

/* ─── KDV Oranları ─── */

export const mockKdvOptions: SelectOption[] = [
  { value: '1', label: 'KDV (%1)' },
  { value: '10', label: 'KDV (%10)' },
  { value: '20', label: 'KDV (%20)' },
]
