export type SalesChannelId =
  | 'trendyol'
  | 'hepsiburada'
  | 'amazon'
  | 'n11'
  | 'shopify'
  | 'woocommerce'
  | 'ikas'
  | 'tsoft'
  | 'ideasoft'
  | 'xml-csv'

export type SalesChannelCategory = 'marketplace' | 'storefront' | 'feed'

export type SalesChannelStatus = 'connected' | 'disconnected' | 'error'

export type SalesChannelFieldType = 'text' | 'password' | 'url' | 'select'

export type SalesChannelFieldOption = {
  value: string
  label: string
}

export type SalesChannelField = {
  key: string
  label: string
  type: SalesChannelFieldType
  placeholder?: string
  hint?: string
  required?: boolean
  fullWidth?: boolean
  options?: SalesChannelFieldOption[]
}

export type SalesChannelCatalogItem = {
  id: SalesChannelId
  name: string
  category: SalesChannelCategory
  description: string
  help: string
  logoSrc: string
  accentClass: string
  initials: string
  fields: SalesChannelField[]
}

export type SalesChannelConnection = {
  status: SalesChannelStatus
  credentials: Record<string, string>
  connectedAt: string | null
  lastSyncAt: string | null
  lastTestAt: string | null
  lastError: string | null
}

export const SALES_CHANNEL_CATEGORY_LABELS: Record<SalesChannelCategory, string> = {
  marketplace: 'Pazaryeri',
  storefront: 'E-ticaret',
  feed: 'XML / CSV',
}

export const SALES_CHANNEL_STATUS_LABELS: Record<SalesChannelStatus, string> = {
  connected: 'Bağlı',
  disconnected: 'Bağlı değil',
  error: 'Hata',
}

export const EMPTY_SALES_CHANNEL_CONNECTION: SalesChannelConnection = {
  status: 'disconnected',
  credentials: {},
  connectedAt: null,
  lastSyncAt: null,
  lastTestAt: null,
  lastError: null,
}
