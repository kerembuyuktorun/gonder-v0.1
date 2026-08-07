/**
 * Cargo layout için navigasyon verileri, marka konfigürasyonu ve kullanıcı verileri.
 * Gerçek backend bağlantısı kurulduğunda userData auth servisinden gelecek.
 */

import type { AppHeaderProps, SidebarSettingsModalConfig } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Activity,
  Banknote,
  BarChart3,
  Bike,
  Building,
  Building2,
  ClipboardList,
  CreditCard,
  Boxes,
  Factory,
  FileSignature,
  FileSpreadsheet,
  GitBranch,
  Handshake,
  Landmark,
  Map,
  MapPinned,
  Package,
  Users,
  LayoutDashboard,
  Wallet,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Route,
  Ruler,
  ScrollText,
  Send,
  Tags,
  Truck,
  Warehouse,
  PlugZap,
  Receipt,
  UserRound,
  UsersRound,
  PackagePlus,
  Search,
  List,
  PackageX,
  Layers,
  Palette,
  Wrench,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../_shared/routes'
import { SettingsProfilePanel } from '../../../_components/settings-profile-panel'

const R = ARF_ROUTES.cargo

export const brandData = {
  title: 'Kargo',
  subtitle: 'V1.0',
  url: R.root,
  icon: Package,
}

export const brandOptions = [
  {
    id: 'cargo',
    title: 'Kargo',
    subtitle: 'V1.0',
    url: R.root,
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
    url: ARF_ROUTES.gonder.root,
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

// Fallback when session /auth/me is not available yet
export const userData = {
  name: 'Kullanıcı',
  email: '',
  avatar: '',
  role: '',
}

export type SearchCommandFactory = (push: (url: string) => void) => NonNullable<AppHeaderProps['searchCommands']>

export const createCargoHeaderSearchCommands: SearchCommandFactory = (push) => [
  {
    id: 'open-drafts',
    label: 'Taslakları Aç',
    group: 'Hızlı İşlemler',
    keywords: ['taslak', 'kayıt', 'devam'],
    shortcut: 'T',
    onSelect: () => push(R.shipments.new),
  },
  {
    id: 'save-draft',
    label: 'Taslak Olarak Kaydet',
    group: 'Hızlı İşlemler',
    keywords: ['taslak', 'kaydet', 'kargo'],
    shortcut: 'K',
    onSelect: () => push(R.shipments.new),
  },
  {
    id: 'go-pieces',
    label: 'Parça Listesine Git',
    group: 'Gezinme',
    keywords: ['parça', 'liste', 'kargolar'],
    onSelect: () => push(R.shipments.pieces),
  },
  {
    id: 'go-pricing',
    label: 'Fiyatlandırmaya Git',
    group: 'Gezinme',
    keywords: ['fiyat', 'ücret', 'hesapla'],
    onSelect: () => push(R.settings.system.systemPricing),
  },
]

export const cargoHeaderInitialNotifications: NonNullable<AppHeaderProps['notifications']> = [
  {
    id: 'fallback-notif-1',
    title: 'Taslak kaydı güncellendi',
    description: 'Son düzenlemeler yeni kargo taslağına işlendi.',
    timeLabel: 'Az önce',
    isRead: false,
  },
  {
    id: 'fallback-notif-2',
    title: 'Parça listesi hazır',
    description: 'Kayda devam etmek için fiyatlandırma bölümüne geçebilirsiniz.',
    timeLabel: '2 dk önce',
    isRead: false,
  },
  {
    id: 'fallback-notif-3',
    title: 'Hızlı işlem ipucu',
    description: 'Cmd/Ctrl + K ile hızlı komut penceresini açabilirsiniz.',
    timeLabel: '10 dk önce',
    isRead: true,
  },
]

export const supportTopics = [
  'Parça teslim durumunu nasıl güncellerim?',
  'Kargo iptal süreci nasıl ilerler?',
  'Teslimat Bilgi sekmesindeki uyarılar ne anlama geliyor?',
  'Takip numarasıyla hızlı sorgulama nasıl yapılır?',
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
          <button type='button' className='rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-sm font-medium'>Açık</button>
          <button type='button' className='rounded-lg border px-3 py-2 text-sm'>Koyu</button>
          <button type='button' className='rounded-lg border px-3 py-2 text-sm'>Sistem</button>
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

export function createSidebarSettingsModalConfig(
  user: { name: string; email: string; role?: string }
): SidebarSettingsModalConfig {
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

export const navGroups = [
  {
    items: [
      {
        title: 'Dashboard',
        url: R.root,
        icon: LayoutDashboard,
        items: [
          { title: 'Genel', url: R.dashboard.genel, icon: LayoutDashboard },
          { title: 'Kargo', url: R.dashboard.kargo, icon: Package },
          { title: 'Operasyon', url: R.dashboard.operasyon, icon: Truck },
          { title: 'Finans', url: R.dashboard.finans, icon: Wallet },
        ],
      },
      {
        title: 'Kargo İşlemleri',
        url: R.shipments.list,
        icon: Package,
        items: [
          { title: 'Yeni Kargo', url: R.shipments.new, icon: PackagePlus },
          { title: 'Kargo Sorgula', url: R.shipments.track, icon: Search },
          { title: 'Kargo Listesi', url: R.shipments.list, icon: List },
          { title: 'İptal Kargo Listesi', url: R.shipments.canceled, icon: PackageX },
          { title: 'Parça Listesi', url: R.shipments.pieces, icon: Layers },
        ],
      },
      {
        title: 'Taşıma İşlemleri',
        url: R.transport.list,
        icon: Truck,
        items: [
          { title: 'Taşıma Oluştur', url: R.transport.new, icon: PackagePlus },
          { title: 'Taşıma Sorgula', url: R.transport.track, icon: Search },
          { title: 'Taşıma Listesi', url: R.transport.list, icon: List },
        ],
      },
      {
        title: 'Operasyon İşlemleri',
        icon: Activity,
        items: [
          { title: 'Sefer Listesi', url: R.operations.trips, icon: Route },
          { title: 'Hat Listesi', url: R.operations.lines, icon: GitBranch },
          { title: 'KTF Listesi', url: R.operations.ktf, icon: ClipboardList },
          { title: 'Tedarikçi Listesi', url: R.operations.suppliers, icon: Factory },
          { title: 'İnterland Birimleri', url: R.operations.interlandUnits, icon: Building2 },
        ],
      },
      {
        title: 'Satış & Pazarlama',
        icon: Users,
        items: [
          { title: 'Müşteriler', url: R.sales.customers, icon: UsersRound },
          { title: 'Sözleşmeler', url: R.sales.contracts, icon: FileSignature },
          { title: 'Fiyat Listesi', url: R.sales.priceLists, icon: Tags },
        ],
      },

      {
        title: 'Finans & Muhasebe',
        icon: Wallet,
        items: [
          {
            title: 'Şube',
            url: R.finance.branchTransferCenter.root,
            items: [
              { title: 'Şube Kasası', url: R.finance.branchTransferCenter.branchCash, icon: Wallet },
            ],
          },
          {
            title: 'Genel Merkez',
            url: R.finance.headOffice.root,
            items: [
              {
                title: 'Satışlar',
                url: R.finance.headOffice.root,
                icon: BarChart3,
                items: [
                  { title: 'Müşteri Kasaları', url: R.finance.headOffice.customerCash, icon: Banknote },
                  { title: 'Şube Kasaları', url: R.finance.headOffice.branchCashes, icon: Building },
                  { title: 'Onay Kuyruğu', url: R.finance.headOffice.approvalQueue, icon: ClipboardList },
                  { title: 'Banka Hesapları', url: R.finance.headquarters.bankAccounts, icon: CreditCard },
                  { title: 'Faturalar', url: R.finance.headquarters.invoices, icon: Receipt },
                ],
              },
              {
                title: 'Giderler',
                url: R.finance.headquarters.root,
                icon: ScrollText,
                items: [
                  { title: 'Gider Listesi', url: R.finance.headquarters.expenseList, icon: ScrollText },
                  { title: 'Gelen E-Faturalar', url: R.finance.headquarters.incomingEInvoices, icon: FileSignature },
                ],
              },
              {
                title: 'Hakedişler',
                url: R.finance.headquarters.root,
                icon: Landmark,
                items: [
                  { title: 'Şube Hakediş Listesi', url: R.finance.headquarters.branchEntitlementList, icon: Landmark },
                  { title: 'T.M. Hakediş Listesi', url: R.finance.headquarters.transferCenterEntitlementList, icon: FileSpreadsheet },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Ayarlar',
        icon: Settings,
        items: [
          { title: 'Transfer Merkezleri', url: R.settings.system.transferCenters, icon: Landmark },
          { title: 'Şubeler', url: R.settings.system.branches, icon: Building2 },
          { title: 'İnterlandlar', url: R.settings.system.interlands, icon: MapPinned },
          { title: 'Fiyatlar', url: R.settings.system.systemPricing, icon: SlidersHorizontal },
          { title: 'Adresler', url: R.settings.system.neighborhoods, icon: Map },
          { title: 'Mesafeler', url: R.settings.system.distances, icon: Ruler },
          { title: 'Kullanıcılar', url: R.settings.system.users, icon: UsersRound },
          { title: 'Roller', url: R.settings.system.roles, icon: ShieldCheck },
          { title: 'Entegrasyonlar', url: R.settings.system.integrations, icon: PlugZap },
        ],
      },
    ],
  },
]
