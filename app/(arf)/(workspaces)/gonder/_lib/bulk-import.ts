import * as XLSX from 'xlsx'
import {
  BULK_IMPORT_FIELDS,
  EMPTY_STAGING_PAYLOAD,
  type BulkImportFieldKey,
  type ColumnMapping,
  type StagingRowIssue,
  type StagingRowPayload,
  type StagingRowStatus,
} from '../_types/bulk-import'

/** Demo / küçük dosyalar için tarayıcı parse üst sınırı. Production’da büyük dosyalar backend job’a gider. */
export const BULK_IMPORT_CLIENT_MAX_ROWS = 200
export const BULK_IMPORT_CLIENT_MAX_SIZE_MB = 2

export function downloadBulkImportTemplate() {
  const headers = BULK_IMPORT_FIELDS.map((field) => field.aliases[0] ?? field.label)
  const sample = [
    [
      'SIP-9001',
      'ARF Depo',
      'İstanbul',
      'Pendik',
      'Sanayi Cad. No:12',
      '02161234567',
      'Ayşe Yılmaz',
      'Ankara',
      'Çankaya',
      'Atatürk Bulvarı No:5',
      '05321234567',
      '8',
      '4.2',
      '1',
      'Express',
      'ARF Parcel',
      '',
    ],
    [
      'SIP-9002',
      'ARF Depo',
      'İstanbul',
      'Pendik',
      'Sanayi Cad. No:12',
      '02161234567',
      'Mehmet Demir',
      'İzmir',
      'Konak',
      'Kıbrıs Şehitleri Cad. 10',
      '05339876543',
      '3',
      '1.5',
      '2',
      'Standart',
      'ARF Parcel',
      'Kapıda ödeme yok',
    ],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Gönderiler')
  XLSX.writeFile(wb, 'gonder-toplu-sablon.xlsx')
}

export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const normalized = headers.map((header) => ({
    raw: header,
    norm: header.trim().toLocaleLowerCase('tr-TR'),
  }))

  for (const field of BULK_IMPORT_FIELDS) {
    const match = normalized.find((header) =>
      field.aliases.some(
        (alias) => alias.trim().toLocaleLowerCase('tr-TR') === header.norm
      )
    )
    if (match) mapping[field.key] = match.raw
  }

  return mapping
}

function cell(row: Record<string, unknown>, header: string | undefined): string {
  if (!header) return ''
  const value = row[header]
  if (value == null) return ''
  return String(value).trim()
}

function toNumber(value: string): number | null {
  if (!value) return null
  const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function mapRawRowToPayload(
  row: Record<string, unknown>,
  mapping: ColumnMapping
): StagingRowPayload {
  return {
    reference: cell(row, mapping.reference),
    senderName: cell(row, mapping.senderName),
    senderCity: cell(row, mapping.senderCity),
    senderDistrict: cell(row, mapping.senderDistrict),
    senderAddress: cell(row, mapping.senderAddress),
    senderPhone: cell(row, mapping.senderPhone),
    receiverName: cell(row, mapping.receiverName),
    receiverCity: cell(row, mapping.receiverCity),
    receiverDistrict: cell(row, mapping.receiverDistrict),
    receiverAddress: cell(row, mapping.receiverAddress),
    receiverPhone: cell(row, mapping.receiverPhone),
    desi: toNumber(cell(row, mapping.desi)),
    weightKg: toNumber(cell(row, mapping.weightKg)),
    pieceCount: toNumber(cell(row, mapping.pieceCount)),
    serviceType: cell(row, mapping.serviceType) || 'Standart',
    carrier: cell(row, mapping.carrier) || 'ARF Parcel',
    note: cell(row, mapping.note),
  }
}

export function validateStagingPayload(payload: StagingRowPayload): {
  status: Extract<StagingRowStatus, 'valid' | 'invalid' | 'warning'>
  issues: StagingRowIssue[]
} {
  const issues: StagingRowIssue[] = []

  const requireText = (field: BulkImportFieldKey, value: string, label: string) => {
    if (!value.trim()) {
      issues.push({ field, message: `${label} zorunlu`, severity: 'error' })
    }
  }

  requireText('senderName', payload.senderName, 'Gönderici adı')
  requireText('senderCity', payload.senderCity, 'Gönderici şehir')
  requireText('senderAddress', payload.senderAddress, 'Gönderici adres')
  requireText('receiverName', payload.receiverName, 'Alıcı adı')
  requireText('receiverCity', payload.receiverCity, 'Alıcı şehir')
  requireText('receiverAddress', payload.receiverAddress, 'Alıcı adres')

  if (payload.desi == null || payload.desi <= 0) {
    issues.push({ field: 'desi', message: 'Desi pozitif olmalı', severity: 'error' })
  }
  if (payload.weightKg == null || payload.weightKg <= 0) {
    issues.push({ field: 'weightKg', message: 'Ağırlık pozitif olmalı', severity: 'error' })
  }
  if (payload.pieceCount != null && payload.pieceCount < 1) {
    issues.push({ field: 'pieceCount', message: 'Parça adedi en az 1 olmalı', severity: 'error' })
  }
  if (!payload.receiverPhone && !payload.senderPhone) {
    issues.push({
      message: 'En az bir telefon numarası önerilir',
      severity: 'warning',
    })
  }

  const hasError = issues.some((issue) => issue.severity === 'error')
  const hasWarning = issues.some((issue) => issue.severity === 'warning')

  if (hasError) return { status: 'invalid', issues }
  if (hasWarning) return { status: 'warning', issues }
  return { status: 'valid', issues: [] }
}

export type ParsedWorkbookPreview = {
  headers: string[]
  rows: Record<string, unknown>[]
  parseMode: 'client_seed' | 'backend_job'
}

export async function peekOrParseWorkbook(file: File): Promise<ParsedWorkbookPreview> {
  const tooLarge =
    file.size > BULK_IMPORT_CLIENT_MAX_SIZE_MB * 1024 * 1024

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: '',
        })

        const headers =
          json.length > 0
            ? Object.keys(json[0])
            : (() => {
                const aoa = XLSX.utils.sheet_to_json<string[]>(ws, {
                  header: 1,
                  defval: '',
                }) as string[][]
                return (aoa[0] ?? []).map(String).filter(Boolean)
              })()

        if (tooLarge || json.length > BULK_IMPORT_CLIENT_MAX_ROWS) {
          resolve({
            headers,
            rows: [],
            parseMode: 'backend_job',
          })
          return
        }

        resolve({
          headers,
          rows: json,
          parseMode: 'client_seed',
        })
      } catch {
        reject(new Error('Dosya okunamadı. Geçerli bir .xlsx veya .csv yükleyin.'))
      }
    }
    reader.onerror = () => reject(new Error('Dosya okuma hatası.'))
    reader.readAsArrayBuffer(file)
  })
}

export function emptyPayload(): StagingRowPayload {
  return { ...EMPTY_STAGING_PAYLOAD }
}
