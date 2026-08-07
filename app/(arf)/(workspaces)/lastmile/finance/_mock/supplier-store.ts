/**
 * Other-supplier mock store (non-courier vendors).
 */
import { buildSeedOtherSuppliers } from '../_data/supplier-seed'
import { createId, nowIso } from '../_lib/format'
import { readJson, writeJson } from '../_lib/storage'
import type { OtherSupplierRecord, UpsertOtherSupplierInput } from '../_types/supplier'

const KEY = 'arf:lastmile:pricing:v1:other-suppliers'
const SEEDED = 'arf:lastmile:pricing:v1:other-suppliers-seeded'

function ensureSeed() {
  if (typeof window === 'undefined') return
  if (readJson(SEEDED, false)) return
  writeJson(KEY, buildSeedOtherSuppliers())
  writeJson(SEEDED, true)
}

function delay<T>(value: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function getAll(): OtherSupplierRecord[] {
  ensureSeed()
  return readJson<OtherSupplierRecord[]>(KEY, [])
}

function saveAll(rows: OtherSupplierRecord[]) {
  writeJson(KEY, rows)
}

export async function listOtherSuppliers(): Promise<OtherSupplierRecord[]> {
  return delay([...getAll()].sort((a, b) => a.unvan.localeCompare(b.unvan, 'tr')))
}

export async function getOtherSupplier(id: string): Promise<OtherSupplierRecord | undefined> {
  return delay(getAll().find((s) => s.id === id))
}

export async function createOtherSupplier(
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
  saveAll([row, ...getAll()])
  return delay(row)
}

export async function updateOtherSupplier(
  id: string,
  input: UpsertOtherSupplierInput
): Promise<OtherSupplierRecord | undefined> {
  const rows = getAll()
  const idx = rows.findIndex((s) => s.id === id)
  if (idx < 0) return delay(undefined)
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
  saveAll(next)
  return delay(updated)
}

export async function deleteOtherSupplier(id: string): Promise<boolean> {
  const rows = getAll()
  const next = rows.filter((s) => s.id !== id)
  if (next.length === rows.length) return delay(false)
  saveAll(next)
  return delay(true)
}
