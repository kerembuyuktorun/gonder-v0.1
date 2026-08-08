import { buildSeedOtherSuppliers } from '../../../../(arf)/(workspaces)/lastmile/finance/_data/supplier-seed'
import { createId, nowIso } from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/format'
import type {
  OtherSupplierRecord,
  UpsertOtherSupplierInput,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types/supplier'
import { readTenantJson, writeTenantJson } from './fs-json-store'

const FILES = {
  suppliers: 'other-suppliers.json',
  seeded: 'other-suppliers-seeded.json',
} as const

async function ensureSeed(tenantId: string) {
  const seeded = await readTenantJson<boolean>(tenantId, FILES.seeded, false)
  if (seeded) return

  const current = await readTenantJson<OtherSupplierRecord[]>(tenantId, FILES.suppliers, [])
  if (current.length === 0) {
    await writeTenantJson(tenantId, FILES.suppliers, buildSeedOtherSuppliers())
  }
  await writeTenantJson(tenantId, FILES.seeded, true)
}

async function getAll(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<OtherSupplierRecord[]>(tenantId, FILES.suppliers, [])
}

async function saveAll(tenantId: string, rows: OtherSupplierRecord[]) {
  await writeTenantJson(tenantId, FILES.suppliers, rows)
}

export async function listOtherSuppliers(tenantId: string): Promise<OtherSupplierRecord[]> {
  return [...(await getAll(tenantId))].sort((a, b) => a.unvan.localeCompare(b.unvan, 'tr'))
}

export async function getOtherSupplier(
  tenantId: string,
  id: string
): Promise<OtherSupplierRecord | undefined> {
  return (await getAll(tenantId)).find((s) => s.id === id)
}

export async function createOtherSupplier(
  tenantId: string,
  input: UpsertOtherSupplierInput
): Promise<OtherSupplierRecord> {
  const stamp = nowIso()
  const row: OtherSupplierRecord = {
    id: createId('sup'),
    unvan: input.unvan.trim(),
    vkn: input.vkn?.trim() || undefined,
    email: input.email?.trim() || undefined,
    telefon: input.telefon?.trim() || undefined,
    tags: input.tags ?? ['DİĞER'],
    openPayable: Math.max(0, input.openPayable ?? 0),
    notes: input.notes?.trim() || undefined,
    createdAt: stamp,
    updatedAt: stamp,
  }
  await saveAll(tenantId, [row, ...(await getAll(tenantId))])
  return row
}

export async function updateOtherSupplier(
  tenantId: string,
  id: string,
  input: UpsertOtherSupplierInput
): Promise<OtherSupplierRecord | undefined> {
  const rows = await getAll(tenantId)
  const idx = rows.findIndex((s) => s.id === id)
  if (idx < 0) return undefined
  const updated: OtherSupplierRecord = {
    ...rows[idx],
    unvan: input.unvan.trim(),
    vkn: input.vkn?.trim() || undefined,
    email: input.email?.trim() || undefined,
    telefon: input.telefon?.trim() || undefined,
    tags: input.tags ?? rows[idx].tags,
    openPayable: Math.max(0, input.openPayable ?? rows[idx].openPayable),
    notes: input.notes?.trim() || undefined,
    updatedAt: nowIso(),
  }
  const next = [...rows]
  next[idx] = updated
  await saveAll(tenantId, next)
  return updated
}

export async function deleteOtherSupplier(tenantId: string, id: string): Promise<boolean> {
  const rows = await getAll(tenantId)
  const next = rows.filter((s) => s.id !== id)
  if (next.length === rows.length) return false
  await saveAll(tenantId, next)
  return true
}
