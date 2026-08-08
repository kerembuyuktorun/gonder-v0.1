import { NextResponse } from 'next/server'
import { listCourierPayouts } from '../_lib/finance/courier-cost-service'
import { listOtherSuppliers } from '../_lib/finance/supplier-service'
import { requireFinanceAuth } from '../_lib/finance/tenant'
import { lastmileRest, unwrapListItems } from '../_lib/lastmile-bff'
import { classifyBalance } from '../../../(arf)/(workspaces)/lastmile/finance/_lib/cari-balances'
import type {
  SupplierAccount,
  SupplierKind,
} from '../../../(arf)/(workspaces)/lastmile/finance/_types/supplier'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function mapDriverToAccount(
  row: Record<string, unknown>,
  openPayable: number
): SupplierAccount {
  const id = asString(row.id)
  const unvan = asString(row.ad_soyad || row.fullName || row.unvan, id || '—')
  const istihdam = asString(row.istihdam || row.employmentType).toLowerCase()
  const cari = classifyBalance(-openPayable)
  return {
    id: `courier:${id}`,
    kind: 'kurye',
    unvan,
    vkn: asString(row.tckn) || undefined,
    email: asString(row.eposta || row.email) || undefined,
    telefon: asString(row.telefon || row.phone) || undefined,
    tags: ['KURYE', istihdam === 'esnaf' || istihdam === 'freelancer' ? 'ESNAF' : 'ŞİRKET'],
    courierId: id,
    balance: cari.amount,
    balanceLabel: cari.label,
    updatedAt: asString(row.olusturulma_zamani || row.createdAt || row.updatedAt, new Date().toISOString()),
  }
}

export async function GET(request: Request) {
  const auth = await requireFinanceAuth(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const kind = (searchParams.get('kind') as SupplierKind | 'all' | null) ?? 'all'
  const search = searchParams.get('search')?.trim().toLocaleLowerCase('tr-TR') ?? ''
  const tag = searchParams.get('tag')?.trim()

  const accounts: SupplierAccount[] = []

  if (kind === 'all' || kind === 'diger') {
    const others = await listOtherSuppliers(auth.tenantId)
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
    const payouts = await listCourierPayouts(auth.tenantId)
    const openByCourier: Record<string, number> = {}
    for (const ledger of payouts.ledgers) {
      const open = Math.max(0, ledger.amountDue - ledger.amountPaid)
      if (open <= 0) continue
      openByCourier[ledger.courierId] = (openByCourier[ledger.courierId] ?? 0) + open
    }

    try {
      const upstream = await lastmileRest<unknown>(
        'api/v1/drivers?page=1&pageSize=100',
        { method: 'GET' },
        auth.accessToken
      )
      if (upstream.ok) {
        const items = unwrapListItems(upstream.data)
        for (const item of items) {
          const row = asRecord(item)
          const id = asString(row.id)
          if (!id) continue
          accounts.push(mapDriverToAccount(row, openByCourier[id] ?? 0))
        }
      }
    } catch {
      // drivers upstream failed — still return diger (+ empty kurye)
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
  if (tag) {
    filtered = filtered.filter((a) => a.tags.includes(tag))
  }

  const items = filtered.sort((a, b) => a.unvan.localeCompare(b.unvan, 'tr'))
  return NextResponse.json({ success: true, data: { items } })
}
