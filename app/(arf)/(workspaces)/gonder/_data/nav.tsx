/**
 * Gönder layout için navigasyon verileri, marka konfigürasyonu ve kullanıcı verileri.
 */

import type { AppHeaderProps, NavGroup, SidebarSettingsModalConfig } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  Calculator,
  CalendarClock,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Link2,
  Package,
  PackagePlus,
  Palette,
  Quote,
  Receipt,
  Route,
  Scale,
  Send,
  Truck,
  Undo2,
  UserRound,
  Wallet,
  Warehouse,
  Boxes,
  Wrench,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../_shared/routes'
import { SettingsProfilePanel } from '../../../_components/settings-profile-panel'
import { canGonder, GONDER_PERMISSIONS } from '../_lib/gonder-permissions'

const R = ARF_ROUTES.gonder

export const brandData = {
  title: 'Gönder',
  subtitle: 'V1.0',
  url: R.root,
  icon: Send,
}

export const brandOptions = [
  {
    id: 'cargo',
    title: 'Kargo',
    subtitle: 'V1.0',
    url: ARF_ROUTES.cargo.root,
    icon: Package,
    shortcut: '1',
  },
  {
    id: 'lastmile',
    title: 'Last Mile',
    subtitle: 'V1.0',
    url: ARF_ROUTES.lastmile.root,
    icon: Route,
    shortcut: '2',
  },
  {
    id: 'gonder',
    title: 'Gönder',
    subtitle: 'V1.0',
    url: R.root,
    icon: Send,
    shortcut: '3',
  },
  {
    id: 'logistics',
    title: 'Lojistik',
    subtitle: 'Yakında',
    url: ARF_ROUTES.root,
    icon: Truck,
    shortcut: '4',
  },
  {
    id: 'fleet',
    title: 'Filo',
    subtitle: 'Yakında',
    url: ARF_ROUTES.root,
    icon: Boxes,
    shortcut: '5',
  },
  {
    id: 'warehouse',
    title: 'Depo Yönetimi',
    subtitle: 'Yakında',
    url: ARF_ROUTES.root,
    icon: Warehouse,
    shortcut: '6',
  },
  {
    id: 'test',
    title: 'Test',
    subtitle: 'V1.0',
    url: '/test/auth',
    icon: Wrench,
    shortcut: '7',
  },
]

export const userData = {
  name: 'Kullanıcı',
  email: '',
  avatar: '',
  role: '',
}

export type SearchCommandFactory = (
  push: (url: string) => void
) => NonNullable<AppHeaderProps['searchCommands']>

export const createGonderHeaderSearchCommands: SearchCommandFactory = (push) => [
  {
    id: 'go-gonder-dashboard',
    label: 'Dashboard’a Git',
    group: 'Gezinme',
    keywords: ['dashboard', 'gönder', 'gonder'],
    shortcut: 'D',
    onSelect: () => push(R.dashboard.root),
  },
  {
    id: 'create-shipment',
    label: 'Yeni Gönderi Oluştur',
    group: 'Hızlı İşlemler',
    keywords: ['gönderi', 'oluştur', 'sipariş'],
    shortcut: 'N',
    onSelect: () => push(R.shipments.create),
  },
  {
    id: 'price-calculation',
    label: 'Teklif al',
    group: 'Hızlı İşlemler',
    keywords: ['fiyat', 'hesap', 'teklif'],
    onSelect: () => push(R.priceCalculation),
  },
  {
    id: 'results',
    label: 'Teklifler',
    group: 'Gezinme',
    keywords: ['sonuç', 'teklif', 'quotes', 'results'],
    onSelect: () => push(R.quotes.list),
  },
  {
    id: 'returns',
    label: 'İadeler',
    group: 'Gezinme',
    keywords: ['iade', 'returns'],
    onSelect: () => push(R.returns.list),
  },
  {
    id: 'desi-control',
    label: 'Desi Kontrol',
    group: 'Gezinme',
    keywords: ['desi', 'ölçüm', 'fark'],
    onSelect: () => push(R.desiControl.list),
  },
  {
    id: 'sales-channels',
    label: 'Satış Kanalları',
    group: 'Gezinme',
    keywords: ['entegrasyon', 'kanal', 'trendyol', 'shopify', 'pazaryeri'],
    onSelect: () => push(R.integrations.root),
  },
]

export const gonderHeaderInitialNotifications: NonNullable<AppHeaderProps['notifications']> = [
  {
    id: 'gonder-notif-1',
    title: 'Gönder paneli hazır',
    description: 'Foundation kabuğu aktif. Sonraki dilimlerde ekranlar eklenecek.',
    timeLabel: 'Az önce',
    isRead: false,
  },
]

export const supportTopics = [
  'Gönder panelinde yeni talep nasıl oluşturulur?',
  'Sipariş durumları nereden takip edilir?',
  'Entegrasyon ayarlarına nasıl erişilir?',
]

export const sidebarUserMenuLabels = {
  settings: 'Kişisel Ayarlar',
  logout: 'Çıkış Yap',
}

export const sidebarSettingsModalBase = {
  labels: {
    title: 'Kişisel Ayarlar',
    rootBreadcrumb: 'Kişisel Ayarlar',
    closeSrText: 'Kapat',
  },
  sections: [
    { id: 'profile', label: 'Profil', icon: UserRound },
    { id: 'theme', label: 'Tema', icon: Palette },
  ],
  defaultSectionId: 'profile',
  profileSectionId: 'profile',
  settingsSectionId: 'theme',
} satisfies Omit<SidebarSettingsModalConfig, 'renderContent'>

function renderThemeSettings() {
  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border bg-card p-5'>
        <h3 className='text-base font-semibold'>Tema Tercihi</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          Uygulama görünümünü kişisel tercihinize göre ayarlayın.
        </p>
        <div className='mt-4 grid gap-2 sm:grid-cols-3'>
          <button type='button' className='rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-sm font-medium'>
            Açık
          </button>
          <button type='button' className='rounded-lg border px-3 py-2 text-sm'>
            Koyu
          </button>
          <button type='button' className='rounded-lg border px-3 py-2 text-sm'>
            Sistem
          </button>
        </div>
      </div>
      <div className='rounded-2xl border bg-card p-5'>
        <h3 className='text-base font-semibold'>Görünüm Ayarları</h3>
        <div className='mt-4 space-y-4'>
          <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
            <div>
              <p className='text-sm font-medium'>Kompakt Liste Görünümü</p>
              <p className='text-xs text-muted-foreground'>Tablolarda daha fazla satır gösterir.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
            <div>
              <p className='text-sm font-medium'>Animasyonları Azalt</p>
              <p className='text-xs text-muted-foreground'>Geçiş efektlerini sadeleştirir.</p>
            </div>
            <Switch />
          </div>
        </div>
        <div className='mt-4 flex justify-end'>
          <Button className='bg-lime-400 text-black hover:bg-lime-300'>Tema Ayarlarını Kaydet</Button>
        </div>
      </div>
    </div>
  )
}

export function createSidebarSettingsModalConfig(user: {
  name: string
  email: string
  role?: string
}): SidebarSettingsModalConfig {
  return {
    ...sidebarSettingsModalBase,
    renderContent: (activeSection) => {
      if (activeSection.id === 'theme') {
        return renderThemeSettings()
      }

      return <SettingsProfilePanel user={user} />
    },
  }
}

/** @deprecated Prefer createSidebarSettingsModalConfig(user) with live /auth/me data */
export const sidebarSettingsModalConfig: SidebarSettingsModalConfig =
  createSidebarSettingsModalConfig(userData)

export type GonderNavBadges = {
  returnsActiveCount?: number
  desiUnreviewedCount?: number
  quotesActionCount?: number
  upcomingPaymentsCount?: number
}

export function createGonderNavGroups(badges: GonderNavBadges = {}): NavGroup[] {
  return [
    {
      label: 'Genel',
      items: [
        {
          title: 'Dashboard',
          url: R.dashboard.root,
          icon: LayoutDashboard,
        },
        {
          title: 'Fiyat Hesaplama',
          url: R.priceCalculation,
          icon: Calculator,
        },
      ],
    },
    {
      label: 'Kargo / Gönderi',
      items: [
        {
          title: 'Siparişler',
          url: R.orders.list,
          icon: ClipboardList,
        },
        ...(canGonder(GONDER_PERMISSIONS.quotesRead)
          ? [
              {
                title: 'Teklifler',
                url: R.quotes.list,
                icon: Quote,
                badge:
                  typeof badges.quotesActionCount === 'number' && badges.quotesActionCount > 0
                    ? String(badges.quotesActionCount)
                    : undefined,
              },
            ]
          : []),
        {
          title: 'Gönderiler',
          url: R.shipments.list,
          icon: Package,
        },
        {
          title: 'Yeni Gönderi',
          url: R.shipments.create,
          icon: PackagePlus,
        },
        {
          title: 'Excel İçe Aktarım',
          url: R.bulkCreate.root,
          icon: FileSpreadsheet,
        },
        ...(canGonder(GONDER_PERMISSIONS.returnsRead)
          ? [
              {
                title: 'İadeler',
                url: R.returns.list,
                icon: Undo2,
                badge:
                  typeof badges.returnsActiveCount === 'number' && badges.returnsActiveCount > 0
                    ? String(badges.returnsActiveCount)
                    : undefined,
              },
            ]
          : []),
        ...(canGonder(GONDER_PERMISSIONS.desiRead)
          ? [
              {
                title: 'Desi Kontrol',
                url: R.desiControl.list,
                icon: Scale,
                badge:
                  typeof badges.desiUnreviewedCount === 'number' && badges.desiUnreviewedCount > 0
                    ? String(badges.desiUnreviewedCount)
                    : undefined,
              },
            ]
          : []),
      ],
    },
    {
      label: 'Fiyatlandırma',
      items: [
        {
          title: 'Raporlar',
          url: R.reports.root,
          icon: BarChart3,
        },
      ],
    },
    {
      label: 'Finans',
      items: [
        {
          title: 'Özet',
          url: R.finance.root,
          icon: Receipt,
        },
        {
          title: 'Hareketler',
          url: R.finance.transactions.list,
          icon: History,
        },
        {
          title: 'Yaklaşan ödemeler',
          url: R.finance.upcoming.list,
          icon: CalendarClock,
          badge:
            typeof badges.upcomingPaymentsCount === 'number' && badges.upcomingPaymentsCount > 0
              ? String(badges.upcomingPaymentsCount)
              : undefined,
        },
        {
          title: 'Faturalar',
          url: R.finance.invoices.list,
          icon: FileText,
        },
        {
          title: 'Cüzdan',
          url: R.finance.wallet.root,
          icon: Wallet,
        },
      ],
    },
    {
      label: 'Entegrasyonlar',
      items: [
        {
          title: 'Satış Kanalları',
          url: R.integrations.root,
          icon: Link2,
        },
        {
          title: 'Import Geçmişi',
          url: R.bulkCreate.imports,
          icon: History,
        },
      ],
    },
  ]
}

/** @deprecated Prefer createGonderNavGroups(badges) for live badge counts */
export const navGroups = createGonderNavGroups()

