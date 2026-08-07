/**
 * Lastmile layout için navigasyon verileri, marka konfigürasyonu ve kullanıcı verileri.
 */

import type { AppHeaderProps, SidebarSettingsModalConfig } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Activity,
  Bike,
  Boxes,
  Building2,
  Car,
  ClipboardList,
  Contact,
  FileText,
  GitBranch,
  Globe,
  Handshake,
  LayoutDashboard,
  Link2,
  Map,
  MapPinned,
  Package,
  PackagePlus,
  Palette,
  Radio,
  Route,
  Settings,
  ShieldCheck,
  Send,
  Tags,
  Truck,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../_shared/routes'
import { SettingsProfilePanel } from '../../../_components/settings-profile-panel'

const R = ARF_ROUTES.lastmile

export const brandData = {
  title: 'Last Mile',
  subtitle: 'V1.0',
  url: R.root,
  icon: Route,
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
    url: R.root,
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

export const userData = {
  name: 'Kullanıcı',
  email: '',
  avatar: '',
  role: '',
}

export type SearchCommandFactory = (push: (url: string) => void) => NonNullable<AppHeaderProps['searchCommands']>

export const createLastmileHeaderSearchCommands: SearchCommandFactory = (push) => [
  {
    id: 'go-order-list',
    label: 'Sipariş Listesine Git',
    group: 'Gezinme',
    keywords: ['sipariş', 'liste', 'lastmile'],
    shortcut: 'S',
    onSelect: () => push(R.orders.list),
  },
  {
    id: 'create-order',
    label: 'Sipariş Oluştur',
    group: 'Hızlı İşlemler',
    keywords: ['sipariş', 'oluştur', 'yeni'],
    shortcut: 'O',
    onSelect: () => push(R.orders.create),
  },
  {
    id: 'go-route-list',
    label: 'Rota Listesine Git',
    group: 'Gezinme',
    keywords: ['rota', 'planlama', 'liste'],
    onSelect: () => push(R.planning.routes),
  },
  {
    id: 'go-finance',
    label: 'Finans Özeti',
    group: 'Finans',
    keywords: ['finans', 'ücret', 'fiyat', 'tahsilat'],
    onSelect: () => push(R.finance.root),
  },
  {
    id: 'go-price-lists',
    label: 'Fiyat Listeleri',
    group: 'Finans',
    keywords: ['fiyat', 'liste', 'tarife', 'ücretlendirme'],
    onSelect: () => push(R.finance.priceLists.list),
  },
  {
    id: 'go-price-zones',
    label: 'Fiyat Bölgeleri',
    group: 'Finans',
    keywords: ['bölge', 'zone', 'fiyat', 'ilçe'],
    onSelect: () => push(R.finance.zones.list),
  },
  {
    id: 'go-collections',
    label: 'Tahsilatlar',
    group: 'Finans',
    keywords: ['tahsilat', 'ödeme', 'vade', 'cari'],
    onSelect: () => push(R.finance.collections.list),
  },
  {
    id: 'go-courier-cost-lists',
    label: 'Kurye Ücret Listeleri',
    group: 'Finans',
    keywords: ['kurye', 'ücret', 'maliyet', 'maaş', 'prim', 'tarife', 'tedarikçi'],
    onSelect: () => push(R.finance.courierCostLists.list),
  },
  {
    id: 'go-courier-payouts',
    label: 'Kurye Ödemeleri / Hakediş',
    group: 'Finans',
    keywords: ['kurye', 'hakediş', 'ödeme', 'maaş', 'payout'],
    onSelect: () => push(R.finance.courierPayouts.list),
  },
]

export const lastmileHeaderInitialNotifications: NonNullable<AppHeaderProps['notifications']> = [
  {
    id: 'lastmile-notif-1',
    title: 'Dağıtım vardiyası başladı',
    description: 'Canlı izleme panelinden aktif kuryeleri takip edebilirsiniz.',
    timeLabel: 'Az önce',
    isRead: false,
  },
  {
    id: 'lastmile-notif-2',
    title: 'Rota optimizasyonu tamamlandı',
    description: 'Planlama ekranında güncel rota önerisini inceleyin.',
    timeLabel: '5 dk önce',
    isRead: false,
  },
  {
    id: 'lastmile-notif-3',
    title: 'Kullanıcı yetki talebi',
    description: 'Roller ve Yetkiler ekranında bekleyen talep var.',
    timeLabel: '18 dk önce',
    isRead: true,
  },
]

export const supportTopics = [
  'Canlı izleme ekranında kurye lokasyonu nasıl yenilenir?',
  'Rota Orkestratörü ile dağıtım önceliği nasıl belirlenir?',
  'Sipariş detayında teslimat notları nereden düzenlenir?',
  'Kurye ekleme modalı için gerekli alanlar nelerdir?',
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
          { title: 'KPI Metrikler', url: R.dashboard.kpi, icon: Activity },
          { title: 'Canlı İzleme', url: R.dashboard.live, icon: Radio },
        ],
      },
      {
        title: 'Sipariş Yönetimi',
        url: R.orders.list,
        icon: Package,
        items: [
          { title: 'Sipariş Oluştur', url: R.orders.create, icon: PackagePlus },
          { title: 'Sipariş Listesi', url: R.orders.list, icon: ClipboardList },
        ],
      },
      {
        title: 'Planlama',
        url: R.planning.orchestrator,
        icon: GitBranch,
        items: [
          { title: 'Orkestratör', url: R.planning.orchestrator, icon: Route },
          { title: 'Rota Listesi', url: R.planning.routes, icon: Map },
        ],
      },
      {
        title: 'İlişki Yönetimi',
        url: R.customers.list,
        icon: Handshake,
        items: [
          { title: 'Müşteri Listesi', url: R.customers.list, icon: Users },
          { title: 'Bağlantı Listesi', url: R.connections.list, icon: Link2 },
        ],
      },
      {
        title: 'Kaynaklar',
        url: R.resources.vehicles.list,
        icon: Boxes,
        items: [
          { title: 'Araç Listesi', url: R.resources.vehicles.list, icon: Car },
          { title: 'Kurye Listesi', url: R.resources.couriers.list, icon: Bike },
        ],
      },
      {
        title: 'Kullanıcılar',
        url: R.users.list,
        icon: UsersRound,
        items: [{ title: 'Kullanıcı Listesi', url: R.users.list, icon: Contact }],
      },
    ],
  },
  {
    label: 'Finans',
    items: [
      {
        title: 'Finans Özeti',
        url: R.finance.root,
        icon: Wallet,
      },
      {
        title: 'Fiyat Listeleri',
        url: R.finance.priceLists.list,
        icon: Tags,
      },
      {
        title: 'Fiyat Bölgeleri',
        url: R.finance.zones.list,
        icon: MapPinned,
      },
      {
        title: 'Tahsilatlar',
        url: R.finance.collections.list,
        icon: Wallet,
      },
      {
        title: 'Kurye Ücret Listeleri',
        url: R.finance.courierCostLists.list,
        icon: Bike,
      },
      {
        title: 'Kurye Ödemeleri / Hakediş',
        url: R.finance.courierPayouts.list,
        icon: Handshake,
      },
    ],
  },
  {
    items: [
      {
        title: 'Raporlar',
        url: R.reports.root,
        icon: FileText,
      },
      {
        title: 'Ayarlar',
        url: R.settings.roles.list,
        icon: Settings,
        items: [
          { title: 'Roller ve Yetkiler', url: R.settings.roles.list, icon: ShieldCheck },
          { title: 'Global Operasyon Bölgeleri', url: R.settings.globalOperationRegions, icon: Globe },
          { title: 'Tanımlamalar', url: R.settings.definitions, icon: Building2 },
        ],
      },
    ],
  },
]
