/** Excel toplu gönderi import — staging-first job modeli */

export type BulkImportJobStatus =
  | 'uploading'
  | 'parsing'
  | 'mapping'
  | 'validating'
  | 'ready'
  | 'approving'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type StagingRowStatus =
  | 'pending'
  | 'valid'
  | 'invalid'
  | 'warning'
  | 'approved'
  | 'created'
  | 'failed'
  | 'skipped'

export type BulkImportView =
  | 'all'
  | 'active'
  | 'ready'
  | 'completed'
  | 'failed'

export type BulkImportFieldKey =
  | 'reference'
  | 'senderName'
  | 'senderCity'
  | 'senderDistrict'
  | 'senderAddress'
  | 'senderPhone'
  | 'receiverName'
  | 'receiverCity'
  | 'receiverDistrict'
  | 'receiverAddress'
  | 'receiverPhone'
  | 'desi'
  | 'weightKg'
  | 'pieceCount'
  | 'serviceType'
  | 'carrier'
  | 'note'

export type BulkImportFieldDef = {
  key: BulkImportFieldKey
  label: string
  required: boolean
  /** Şablon / otomatik eşleme için bilinen Excel başlıkları */
  aliases: string[]
}

export type ColumnMapping = Partial<Record<BulkImportFieldKey, string>>

export type StagingRowIssue = {
  field?: BulkImportFieldKey
  message: string
  severity: 'error' | 'warning'
}

export type StagingRowPayload = {
  reference: string
  senderName: string
  senderCity: string
  senderDistrict: string
  senderAddress: string
  senderPhone: string
  receiverName: string
  receiverCity: string
  receiverDistrict: string
  receiverAddress: string
  receiverPhone: string
  desi: number | null
  weightKg: number | null
  pieceCount: number | null
  serviceType: string
  carrier: string
  note: string
}

export type BulkImportStagingRow = {
  id: string
  jobId: string
  rowNumber: number
  status: StagingRowStatus
  payload: StagingRowPayload
  issues: StagingRowIssue[]
  createdShipmentId: string | null
  updatedAt: string
}

export type BulkImportJobCounts = {
  total: number
  valid: number
  invalid: number
  warning: number
  created: number
  failed: number
  pending: number
}

export type BulkImportJob = {
  id: string
  reference: string
  fileName: string
  fileSizeBytes: number
  status: BulkImportJobStatus
  detectedHeaders: string[]
  columnMapping: ColumnMapping
  counts: BulkImportJobCounts
  errorMessage: string | null
  /** Production: backend parse job; mock’ta simüle edilir */
  parseMode: 'client_seed' | 'backend_job'
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export const BULK_IMPORT_FIELDS: BulkImportFieldDef[] = [
  {
    key: 'reference',
    label: 'Referans / Sipariş No',
    required: false,
    aliases: ['Referans', 'Sipariş No', 'Order No', 'Reference'],
  },
  {
    key: 'senderName',
    label: 'Gönderici Adı',
    required: true,
    aliases: ['Gönderici Adı', 'Gönderici', 'Sender Name'],
  },
  {
    key: 'senderCity',
    label: 'Gönderici Şehir',
    required: true,
    aliases: ['Gönderici Şehir', 'Çıkış Şehir', 'Origin City'],
  },
  {
    key: 'senderDistrict',
    label: 'Gönderici İlçe',
    required: false,
    aliases: ['Gönderici İlçe', 'Çıkış İlçe'],
  },
  {
    key: 'senderAddress',
    label: 'Gönderici Adres',
    required: true,
    aliases: ['Gönderici Adres', 'Çıkış Adres', 'Origin Address'],
  },
  {
    key: 'senderPhone',
    label: 'Gönderici Telefon',
    required: false,
    aliases: ['Gönderici Telefon', 'Gönderici Tel'],
  },
  {
    key: 'receiverName',
    label: 'Alıcı Adı',
    required: true,
    aliases: ['Alıcı Adı', 'Alıcı', 'Receiver Name'],
  },
  {
    key: 'receiverCity',
    label: 'Alıcı Şehir',
    required: true,
    aliases: ['Alıcı Şehir', 'Varış Şehir', 'Destination City'],
  },
  {
    key: 'receiverDistrict',
    label: 'Alıcı İlçe',
    required: false,
    aliases: ['Alıcı İlçe', 'Varış İlçe'],
  },
  {
    key: 'receiverAddress',
    label: 'Alıcı Adres',
    required: true,
    aliases: ['Alıcı Adres', 'Varış Adres', 'Destination Address'],
  },
  {
    key: 'receiverPhone',
    label: 'Alıcı Telefon',
    required: false,
    aliases: ['Alıcı Telefon', 'Alıcı Tel'],
  },
  {
    key: 'desi',
    label: 'Desi',
    required: true,
    aliases: ['Desi', 'Hacimsel Ağırlık'],
  },
  {
    key: 'weightKg',
    label: 'Ağırlık (kg)',
    required: true,
    aliases: ['Ağırlık', 'Ağırlık (kg)', 'Weight'],
  },
  {
    key: 'pieceCount',
    label: 'Parça Adedi',
    required: false,
    aliases: ['Parça', 'Parça Adedi', 'Pieces'],
  },
  {
    key: 'serviceType',
    label: 'Hizmet',
    required: false,
    aliases: ['Hizmet', 'Servis', 'Service'],
  },
  {
    key: 'carrier',
    label: 'Taşıyıcı',
    required: false,
    aliases: ['Taşıyıcı', 'Kargo Firması', 'Carrier'],
  },
  {
    key: 'note',
    label: 'Not',
    required: false,
    aliases: ['Not', 'Açıklama', 'Note'],
  },
]

export const BULK_IMPORT_STATUS_LABELS: Record<BulkImportJobStatus, string> = {
  uploading: 'Yükleniyor',
  parsing: 'Ayrıştırılıyor',
  mapping: 'Eşleştirme',
  validating: 'Doğrulanıyor',
  ready: 'Onaya hazır',
  approving: 'Onaylanıyor',
  completed: 'Tamamlandı',
  failed: 'Hatalı',
  cancelled: 'İptal',
}

export const STAGING_ROW_STATUS_LABELS: Record<StagingRowStatus, string> = {
  pending: 'Bekliyor',
  valid: 'Geçerli',
  invalid: 'Hatalı',
  warning: 'Uyarı',
  approved: 'Onaylandı',
  created: 'Oluşturuldu',
  failed: 'Başarısız',
  skipped: 'Atlandı',
}

export const BULK_IMPORT_STATUS_BADGE: Record<BulkImportJobStatus, string> = {
  uploading: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  parsing: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  mapping: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  validating: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  ready: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  approving: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  failed: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  cancelled: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
}

export const STAGING_ROW_STATUS_BADGE: Record<StagingRowStatus, string> = {
  pending: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  valid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  invalid: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  approved: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  created: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  failed: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  skipped: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
}

export const BULK_IMPORT_VIEW_STATUSES: Record<BulkImportView, BulkImportJobStatus[] | null> = {
  all: null,
  active: ['uploading', 'parsing', 'mapping', 'validating', 'ready', 'approving'],
  ready: ['ready'],
  completed: ['completed'],
  failed: ['failed', 'cancelled'],
}

export const EMPTY_STAGING_PAYLOAD: StagingRowPayload = {
  reference: '',
  senderName: '',
  senderCity: '',
  senderDistrict: '',
  senderAddress: '',
  senderPhone: '',
  receiverName: '',
  receiverCity: '',
  receiverDistrict: '',
  receiverAddress: '',
  receiverPhone: '',
  desi: null,
  weightKg: null,
  pieceCount: null,
  serviceType: '',
  carrier: '',
  note: '',
}
