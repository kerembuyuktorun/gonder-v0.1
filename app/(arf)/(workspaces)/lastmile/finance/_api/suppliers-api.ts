/**
 * Unified supplier accounts API (couriers + other vendors).
 * TODO: Remove mock/merge when backend API is ready.
 */
import { fetchDriversList } from '../../resources/couriers/_api/drivers'
import { listCourierPayouts } from '../_api/courier-cost-api'
import { classifyBalance } from '../_lib/cari-balances'
import type { SupplierAccount, SupplierKind, UpsertOtherSupplierInput } from '../_types/supplier'
import {
  createOtherSupplier,
  deleteOtherSupplier,
  getOtherSupplier,
  listOtherSuppliers,
  updateOtherSupplier,
} from '../_mock/supplier-store'

export type { UpsertOtherSupplierInput }

export async function listSupplierAccounts(filters?: {
  kind?: SupplierKind | 'all'
  search?: string
  tag?: string
}): Promise<SupplierAccount[]> {
  const kind = filters?.kind ?? 'all'
  const search = filters?.search?.trim().toLocaleLowerCase('tr-TR') ?? ''

  const accounts: SupplierAccount[] = []

  if (kind === 'all' || kind === 'diger') {
    const others = await listOtherSuppliers()
    for (const row of others) {
      const cari = classifyBalance(-row.openPayable)
      accounts.push({
        id: row.id,
        kind: 'diger',
        unvan: row.unvan,
        vkn: row.vkn,
        email: row.email,
        telefon: row.telefon,
        tags: row.tags,
        balance: cari.amount,
        balanceLabel: cari.label,
        updatedAt: row.updatedAt,
      })
    }
  }

  if (kind === 'all' || kind === 'kurye') {
    const [driversResult, payouts] = await Promise.all([
      fetchDriversList({ page: 1, pageSize: 100 }),
      listCourierPayouts(),
    ])
    const openByCourier: Record<string, number> = {}
    for (const ledger of payouts.ledgers) {
      const open = Math.max(0, ledger.amountDue - ledger.amountPaid)
      if (open <= 0) continue
      openByCourier[ledger.courierId] = (openByCourier[ledger.courierId] ?? 0) + open
    }

    if (driversResult.success) {
      for (const courier of driversResult.data.items) {
        const open = openByCourier[courier.id] ?? 0
        const cari = classifyBalance(-open)
        accounts.push({
          id: `courier:${courier.id}`,
          kind: 'kurye',
          unvan: courier.ad_soyad,
          vkn: courier.tckn ?? undefined,
          email: courier.eposta ?? undefined,
          telefon: courier.telefon,
          tags: ['KURYE', courier.istihdam === 'esnaf' ? 'ESNAF' : 'ŞİRKET'],
          courierId: courier.id,
          balance: cari.amount,
          balanceLabel: cari.label,
          updatedAt: courier.olusturulma_zamani,
        })
      }
    }
  }

  let filtered = accounts
  if (search) {
    filtered = filtered.filter((a) => {
      const hay = `${a.unvan} ${a.vkn ?? ''} ${a.email ?? ''} ${a.telefon ?? ''} ${a.tags.join(' ')}`
        .toLocaleLowerCase('tr-TR')
      return hay.includes(search)
    })
  }
  if (filters?.tag) {
    filtered = filtered.filter((a) => a.tags.includes(filters.tag!))
  }

  return filtered.sort((a, b) => a.unvan.localeCompare(b.unvan, 'tr'))
}

export {
  createOtherSupplier,
  updateOtherSupplier,
  deleteOtherSupplier,
  getOtherSupplier,
  listOtherSuppliers,
}
