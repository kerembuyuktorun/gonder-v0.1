import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(process.cwd(), '.data', 'lastmile-finance')

function tenantDir(tenantId: string) {
  const safe = tenantId.replace(/[^a-zA-Z0-9._-]/g, '_')
  return path.join(ROOT, safe)
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function readTenantJson<T>(tenantId: string, file: string, fallback: T): Promise<T> {
  const full = path.join(tenantDir(tenantId), file)
  try {
    const raw = await fs.readFile(full, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function writeTenantJson<T>(tenantId: string, file: string, value: T): Promise<void> {
  const dir = tenantDir(tenantId)
  await ensureDir(dir)
  const full = path.join(dir, file)
  const tmp = `${full}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8')
  await fs.rename(tmp, full)
}
