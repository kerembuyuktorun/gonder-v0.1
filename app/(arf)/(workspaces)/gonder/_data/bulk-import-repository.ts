import { shipmentsListRepository } from './shipments-list-repository'
import {
  mapRawRowToPayload,
  suggestColumnMapping,
  validateStagingPayload,
} from '../_lib/bulk-import'
import {
  BULK_IMPORT_VIEW_STATUSES,
  EMPTY_STAGING_PAYLOAD,
  type BulkImportJob,
  type BulkImportJobCounts,
  type BulkImportJobStatus,
  type BulkImportStagingRow,
  type BulkImportView,
  type ColumnMapping,
  type StagingRowPayload,
  type StagingRowStatus,
} from '../_types/bulk-import'

export type BulkImportJobsQuery = {
  view?: BulkImportView
  status?: BulkImportJobStatus | null
  search?: string
}

export type BulkImportJobsResult = {
  items: BulkImportJob[]
  total: number
  viewCounts: Record<BulkImportView, number>
}

export type StagingRowsQuery = {
  status?: StagingRowStatus | null
  search?: string
}

export type StagingRowsResult = {
  items: BulkImportStagingRow[]
  total: number
}

export type CreateBulkImportJobInput = {
  fileName: string
  fileSizeBytes: number
  detectedHeaders: string[]
  /** Küçük dosyalarda client seed; büyük dosyalarda boş → backend job simülasyonu */
  rawRows?: Record<string, unknown>[]
  parseMode: 'client_seed' | 'backend_job'
}

export type ApproveRowsResult = {
  job: BulkImportJob
  createdCount: number
  failedCount: number
  shipmentIds: string[]
}

/**
 * Production kontratı: upload → async parse job → staging → validate → approve.
 * Mock stateful; API bağlanınca aynı arayüz korunur.
 */
export interface BulkImportRepository {
  listJobs(query?: BulkImportJobsQuery): Promise<BulkImportJobsResult>
  getJob(id: string): Promise<BulkImportJob | null>
  listRows(jobId: string, query?: StagingRowsQuery): Promise<StagingRowsResult>
  createJob(input: CreateBulkImportJobInput): Promise<BulkImportJob>
  updateColumnMapping(jobId: string, mapping: ColumnMapping): Promise<BulkImportJob>
  validateJob(jobId: string): Promise<BulkImportJob>
  updateRow(
    jobId: string,
    rowId: string,
    payload: Partial<StagingRowPayload>
  ): Promise<BulkImportStagingRow>
  skipRows(jobId: string, rowIds: string[]): Promise<BulkImportJob>
  approveValidRows(jobId: string, rowIds?: string[]): Promise<ApproveRowsResult>
  cancelJob(jobId: string): Promise<BulkImportJob>
}

function nowIso() {
  return new Date().toISOString()
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyCounts(): BulkImportJobCounts {
  return {
    total: 0,
    valid: 0,
    invalid: 0,
    warning: 0,
    created: 0,
    failed: 0,
    pending: 0,
  }
}

function recomputeCounts(rows: BulkImportStagingRow[]): BulkImportJobCounts {
  const counts = emptyCounts()
  counts.total = rows.length
  for (const row of rows) {
    if (row.status === 'valid') counts.valid += 1
    else if (row.status === 'invalid') counts.invalid += 1
    else if (row.status === 'warning') counts.warning += 1
    else if (row.status === 'created') counts.created += 1
    else if (row.status === 'failed') counts.failed += 1
    else if (row.status === 'pending' || row.status === 'approved') counts.pending += 1
  }
  return counts
}

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const BACKEND_DEMO_ROWS: Record<string, unknown>[] = [
  {
    Referans: 'SIP-B001',
    'Gönderici Adı': 'ARF Depo',
    'Gönderici Şehir': 'İstanbul',
    'Gönderici İlçe': 'Pendik',
    'Gönderici Adres': 'Sanayi Cad. No:12',
    'Gönderici Telefon': '02161234567',
    'Alıcı Adı': 'Caner Akar',
    'Alıcı Şehir': 'Bursa',
    'Alıcı İlçe': 'Nilüfer',
    'Alıcı Adres': 'Özlüce Mah. 14. Sok. 3',
    'Alıcı Telefon': '05331112233',
    Desi: 5,
    'Ağırlık (kg)': 2.1,
    'Parça Adedi': 1,
    Hizmet: 'Express',
    Taşıyıcı: 'ARF Parcel',
    Not: '',
  },
  {
    Referans: 'SIP-B002',
    'Gönderici Adı': 'ARF Depo',
    'Gönderici Şehir': 'İstanbul',
    'Gönderici İlçe': 'Pendik',
    'Gönderici Adres': 'Sanayi Cad. No:12',
    'Gönderici Telefon': '',
    'Alıcı Adı': '',
    'Alıcı Şehir': 'Antalya',
    'Alıcı İlçe': 'Muratpaşa',
    'Alıcı Adres': 'Lara Cad. No:8',
    'Alıcı Telefon': '05334445566',
    Desi: 0,
    'Ağırlık (kg)': 3,
    'Parça Adedi': 1,
    Hizmet: 'Standart',
    Taşıyıcı: 'ARF Parcel',
    Not: 'Eksik alıcı',
  },
  {
    Referans: 'SIP-B003',
    'Gönderici Adı': 'ARF Depo',
    'Gönderici Şehir': 'İstanbul',
    'Gönderici İlçe': 'Pendik',
    'Gönderici Adres': 'Sanayi Cad. No:12',
    'Gönderici Telefon': '02161234567',
    'Alıcı Adı': 'Zeynep Kaya',
    'Alıcı Şehir': 'Gaziantep',
    'Alıcı İlçe': 'Şahinbey',
    'Alıcı Adres': 'İbrahimli Mah. 22',
    'Alıcı Telefon': '',
    Desi: 12,
    'Ağırlık (kg)': 6.5,
    'Parça Adedi': 2,
    Hizmet: 'Ekonomik',
    Taşıyıcı: 'Express Lojistik',
    Not: '',
  },
]

class MockBulkImportRepository implements BulkImportRepository {
  private jobs: BulkImportJob[] = []
  private rowsByJob = new Map<string, BulkImportStagingRow[]>()
  private rawByJob = new Map<string, Record<string, unknown>[]>()
  private jobSeq = 120

  constructor() {
    this.seedHistory()
  }

  private seedHistory() {
    const createdAt = '2026-08-06T14:00:00.000Z'
    const job: BulkImportJob = {
      id: 'imp-100',
      reference: 'IMP-100',
      fileName: 'ornek-toplu.xlsx',
      fileSizeBytes: 18_400,
      status: 'completed',
      detectedHeaders: Object.keys(BACKEND_DEMO_ROWS[0]),
      columnMapping: suggestColumnMapping(Object.keys(BACKEND_DEMO_ROWS[0])),
      counts: {
        total: 2,
        valid: 0,
        invalid: 0,
        warning: 0,
        created: 2,
        failed: 0,
        pending: 0,
      },
      errorMessage: null,
      parseMode: 'client_seed',
      createdAt,
      updatedAt: '2026-08-06T14:12:00.000Z',
      completedAt: '2026-08-06T14:12:00.000Z',
    }
    this.jobs.push(job)
    this.rowsByJob.set(job.id, [
      {
        id: 'row-seed-1',
        jobId: job.id,
        rowNumber: 2,
        status: 'created',
        payload: {
          ...EMPTY_STAGING_PAYLOAD,
          reference: 'SIP-8801',
          senderName: 'ARF Depo',
          senderCity: 'İstanbul',
          senderDistrict: 'Pendik',
          senderAddress: 'Sanayi Cad. No:12',
          senderPhone: '02161234567',
          receiverName: 'Demo Alıcı',
          receiverCity: 'Ankara',
          receiverDistrict: 'Çankaya',
          receiverAddress: 'Kızılay Cad. 1',
          receiverPhone: '05320001122',
          desi: 4,
          weightKg: 2,
          pieceCount: 1,
          serviceType: 'Express',
          carrier: 'ARF Parcel',
          note: '',
        },
        issues: [],
        createdShipmentId: 'sh-excel-1',
        updatedAt: createdAt,
      },
      {
        id: 'row-seed-2',
        jobId: job.id,
        rowNumber: 3,
        status: 'created',
        payload: {
          ...EMPTY_STAGING_PAYLOAD,
          reference: 'SIP-8802',
          senderName: 'ARF Depo',
          senderCity: 'İstanbul',
          senderDistrict: 'Pendik',
          senderAddress: 'Sanayi Cad. No:12',
          senderPhone: '02161234567',
          receiverName: 'Demo Alıcı 2',
          receiverCity: 'İzmir',
          receiverDistrict: 'Konak',
          receiverAddress: 'Alsancak 4',
          receiverPhone: '05320003344',
          desi: 6,
          weightKg: 3.2,
          pieceCount: 1,
          serviceType: 'Standart',
          carrier: 'ARF Parcel',
          note: '',
        },
        issues: [],
        createdShipmentId: 'sh-excel-2',
        updatedAt: createdAt,
      },
    ])
  }

  private getJobOrThrow(id: string) {
    const job = this.jobs.find((item) => item.id === id)
    if (!job) throw new Error('Import işi bulunamadı')
    return job
  }

  private touchJob(job: BulkImportJob, patch: Partial<BulkImportJob>) {
    Object.assign(job, patch, { updatedAt: nowIso() })
    return job
  }

  private buildStagingFromRaw(
    jobId: string,
    rawRows: Record<string, unknown>[],
    mapping: ColumnMapping
  ): BulkImportStagingRow[] {
    return rawRows.map((raw, index) => {
      const payload = mapRawRowToPayload(raw, mapping)
      return {
        id: uid('row'),
        jobId,
        rowNumber: index + 2,
        status: 'pending' as const,
        payload,
        issues: [],
        createdShipmentId: null,
        updatedAt: nowIso(),
      }
    })
  }

  async listJobs(query: BulkImportJobsQuery = {}): Promise<BulkImportJobsResult> {
    await delay()
    const view = query.view ?? 'all'
    const allowed = BULK_IMPORT_VIEW_STATUSES[view]
    const search = query.search?.trim().toLocaleLowerCase('tr-TR') ?? ''

    let items = [...this.jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (allowed) items = items.filter((job) => allowed.includes(job.status))
    if (query.status) items = items.filter((job) => job.status === query.status)
    if (search) {
      items = items.filter(
        (job) =>
          job.reference.toLocaleLowerCase('tr-TR').includes(search) ||
          job.fileName.toLocaleLowerCase('tr-TR').includes(search)
      )
    }

    const viewCounts: Record<BulkImportView, number> = {
      all: this.jobs.length,
      active: 0,
      ready: 0,
      completed: 0,
      failed: 0,
    }
    for (const job of this.jobs) {
      for (const key of Object.keys(viewCounts) as BulkImportView[]) {
        if (key === 'all') continue
        const statuses = BULK_IMPORT_VIEW_STATUSES[key]
        if (statuses?.includes(job.status)) viewCounts[key] += 1
      }
    }

    return { items, total: items.length, viewCounts }
  }

  async getJob(id: string): Promise<BulkImportJob | null> {
    await delay(80)
    return this.jobs.find((job) => job.id === id) ?? null
  }

  async listRows(jobId: string, query: StagingRowsQuery = {}): Promise<StagingRowsResult> {
    await delay(80)
    let items = [...(this.rowsByJob.get(jobId) ?? [])]
    if (query.status) items = items.filter((row) => row.status === query.status)
    const search = query.search?.trim().toLocaleLowerCase('tr-TR') ?? ''
    if (search) {
      items = items.filter((row) => {
        const p = row.payload
        return (
          p.reference.toLocaleLowerCase('tr-TR').includes(search) ||
          p.receiverName.toLocaleLowerCase('tr-TR').includes(search) ||
          p.receiverCity.toLocaleLowerCase('tr-TR').includes(search) ||
          p.senderCity.toLocaleLowerCase('tr-TR').includes(search)
        )
      })
    }
    return { items, total: items.length }
  }

  async createJob(input: CreateBulkImportJobInput): Promise<BulkImportJob> {
    await delay(220)
    this.jobSeq += 1
    const id = uid('imp')
    const reference = `IMP-${this.jobSeq}`
    const mapping = suggestColumnMapping(input.detectedHeaders)

    const job: BulkImportJob = {
      id,
      reference,
      fileName: input.fileName,
      fileSizeBytes: input.fileSizeBytes,
      status: input.parseMode === 'backend_job' ? 'parsing' : 'mapping',
      detectedHeaders: input.detectedHeaders,
      columnMapping: mapping,
      counts: emptyCounts(),
      errorMessage: null,
      parseMode: input.parseMode,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    }

    this.jobs.unshift(job)

    if (input.parseMode === 'client_seed' && input.rawRows?.length) {
      this.rawByJob.set(id, input.rawRows)
      const rows = this.buildStagingFromRaw(id, input.rawRows, mapping)
      this.rowsByJob.set(id, rows)
      this.touchJob(job, { counts: recomputeCounts(rows), status: 'mapping' })
      return { ...job }
    }

    // Backend job simülasyonu: kısa süre parsing, sonra demo satırlar
    this.rawByJob.set(id, BACKEND_DEMO_ROWS)
    void this.simulateBackendParse(id)
    return { ...job }
  }

  private async simulateBackendParse(jobId: string) {
    await delay(900)
    const job = this.jobs.find((item) => item.id === jobId)
    if (!job || job.status === 'cancelled') return
    const raw = this.rawByJob.get(jobId) ?? BACKEND_DEMO_ROWS
    const headers = Object.keys(raw[0] ?? {})
    const mapping = suggestColumnMapping(headers.length ? headers : job.detectedHeaders)
    const rows = this.buildStagingFromRaw(jobId, raw, mapping)
    this.rowsByJob.set(jobId, rows)
    this.touchJob(job, {
      status: 'mapping',
      detectedHeaders: headers.length ? headers : job.detectedHeaders,
      columnMapping: mapping,
      counts: recomputeCounts(rows),
    })
  }

  async updateColumnMapping(jobId: string, mapping: ColumnMapping): Promise<BulkImportJob> {
    await delay()
    const job = this.getJobOrThrow(jobId)
    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new Error('Tamamlanmış işte eşleme değiştirilemez')
    }

    const raw = this.rawByJob.get(jobId) ?? []
    const rows = this.buildStagingFromRaw(jobId, raw, mapping)
    this.rowsByJob.set(jobId, rows)
    return {
      ...this.touchJob(job, {
        columnMapping: mapping,
        counts: recomputeCounts(rows),
        status: 'mapping',
      }),
    }
  }

  async validateJob(jobId: string): Promise<BulkImportJob> {
    await delay(250)
    const job = this.getJobOrThrow(jobId)
    this.touchJob(job, { status: 'validating' })

    const rows = this.rowsByJob.get(jobId) ?? []
    for (const row of rows) {
      if (row.status === 'created' || row.status === 'skipped') continue
      const result = validateStagingPayload(row.payload)
      row.status = result.status
      row.issues = result.issues
      row.updatedAt = nowIso()
    }

    const counts = recomputeCounts(rows)
    return {
      ...this.touchJob(job, {
        counts,
        status: 'ready',
      }),
    }
  }

  async updateRow(
    jobId: string,
    rowId: string,
    payload: Partial<StagingRowPayload>
  ): Promise<BulkImportStagingRow> {
    await delay(100)
    const job = this.getJobOrThrow(jobId)
    const rows = this.rowsByJob.get(jobId) ?? []
    const row = rows.find((item) => item.id === rowId)
    if (!row) throw new Error('Satır bulunamadı')
    if (row.status === 'created') throw new Error('Oluşturulmuş satır düzenlenemez')

    row.payload = { ...row.payload, ...payload }
    const result = validateStagingPayload(row.payload)
    row.status = result.status
    row.issues = result.issues
    row.updatedAt = nowIso()

    this.touchJob(job, {
      counts: recomputeCounts(rows),
      status: job.status === 'completed' ? job.status : 'ready',
    })

    return { ...row }
  }

  async skipRows(jobId: string, rowIds: string[]): Promise<BulkImportJob> {
    await delay(100)
    const job = this.getJobOrThrow(jobId)
    const rows = this.rowsByJob.get(jobId) ?? []
    const selected = new Set(rowIds)
    for (const row of rows) {
      if (!selected.has(row.id)) continue
      if (row.status === 'created') continue
      row.status = 'skipped'
      row.updatedAt = nowIso()
    }
    return {
      ...this.touchJob(job, { counts: recomputeCounts(rows) }),
    }
  }

  async approveValidRows(jobId: string, rowIds?: string[]): Promise<ApproveRowsResult> {
    await delay(320)
    const job = this.getJobOrThrow(jobId)
    const rows = this.rowsByJob.get(jobId) ?? []
    this.touchJob(job, { status: 'approving' })

    const selected = rowIds?.length ? new Set(rowIds) : null
    let createdCount = 0
    let failedCount = 0
    const shipmentIds: string[] = []

    for (const row of rows) {
      if (selected && !selected.has(row.id)) continue
      if (row.status !== 'valid' && row.status !== 'warning') continue

      try {
        const shipment = await shipmentsListRepository.create({
          reference: row.payload.reference || `GND-X-${row.rowNumber}`,
          orderNumber: row.payload.reference || null,
          carrier: row.payload.carrier || 'ARF Parcel',
          serviceLabel: row.payload.serviceType || 'Standart',
          serviceType: 'parcel',
          operationType: 'parcel',
          logisticsMode: null,
          originCity: row.payload.senderCity,
          destinationCity: row.payload.receiverCity,
          status: 'label_ready',
          desi: row.payload.desi ?? 1,
          weightKg: row.payload.weightKg ?? 1,
          amountTry: null,
        })
        row.status = 'created'
        row.createdShipmentId = shipment.id
        row.issues = []
        row.updatedAt = nowIso()
        createdCount += 1
        shipmentIds.push(shipment.id)
      } catch {
        row.status = 'failed'
        row.issues = [{ message: 'Gönderi oluşturulamadı', severity: 'error' }]
        row.updatedAt = nowIso()
        failedCount += 1
      }
    }

    const counts = recomputeCounts(rows)
    const remaining =
      counts.valid + counts.warning + counts.pending + counts.invalid > 0 &&
      counts.created + counts.failed + rows.filter((r) => r.status === 'skipped').length <
        counts.total

    this.touchJob(job, {
      counts,
      status: remaining && createdCount === 0 && failedCount === 0 ? 'ready' : 'completed',
      completedAt: nowIso(),
    })

    // If there are still actionable rows left, keep ready
    const actionable = rows.some(
      (row) => row.status === 'valid' || row.status === 'warning' || row.status === 'invalid'
    )
    if (actionable && (createdCount > 0 || failedCount > 0)) {
      this.touchJob(job, { status: 'ready', completedAt: null })
    } else if (!actionable) {
      this.touchJob(job, { status: 'completed', completedAt: nowIso() })
    }

    return {
      job: { ...job },
      createdCount,
      failedCount,
      shipmentIds,
    }
  }

  async cancelJob(jobId: string): Promise<BulkImportJob> {
    await delay(100)
    const job = this.getJobOrThrow(jobId)
    if (job.status === 'completed') throw new Error('Tamamlanan iş iptal edilemez')
    return { ...this.touchJob(job, { status: 'cancelled', completedAt: nowIso() }) }
  }
}

export const bulkImportRepository: BulkImportRepository = new MockBulkImportRepository()
