import type { OtherSupplierRecord } from '../_types/supplier'

const now = '2026-08-07T12:00:00.000Z'

export function buildSeedOtherSuppliers(): OtherSupplierRecord[] {
  return [
    {
      id: 'sup_yakit_1',
      unvan: 'Anadolu Akaryakıt A.Ş.',
      vkn: '1234567890',
      email: 'fatura@anadoluakaryakit.example',
      telefon: '0212 555 0101',
      tags: ['YAKIT'],
      openPayable: 18450.5,
      notes: 'Filo yakıt anlaşması',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sup_kiralama_1',
      unvan: 'Marmara Filo Kiralama Ltd.',
      vkn: '9876543210',
      email: 'muhasebe@marmarafilo.example',
      telefon: '0216 444 2020',
      tags: ['KİRALAMA', 'LOJİSTİK'],
      openPayable: 649111.43,
      notes: 'Aylık araç kiralama',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sup_servis_1',
      unvan: 'Hızlı Bakım Otomotiv',
      vkn: '1122334455',
      telefon: '0532 111 2233',
      tags: ['DİĞER'],
      openPayable: 0,
      createdAt: now,
      updatedAt: now,
    },
  ]
}
