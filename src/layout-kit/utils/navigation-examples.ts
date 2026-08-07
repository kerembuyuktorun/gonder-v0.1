/**
 * Layout Kit - Navigation Examples
 *
 * Sidebar ve navigation yapılandırması için örnek data setleri.
 * Public sabitler İngilizce varsayılanlarla üretilir; locale-aware factory
 * fonksiyonları ile uygulama katmanı içerikleri özelleştirebilir.
 */

import {
  Home,
  LifeBuoy,
  Package,
  Send,
  Users,
  Building2,
  BarChart3,
  Wallet,
  Settings,
  TestTube2,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Bell,
  Table,
  Palette,
} from 'lucide-react'
import type {
  BrandData,
  BrandSwitcherItem,
  SidebarQuickActionItem,
  UserData,
  NavGroup,
} from '../context/types'

export type LayoutKitExampleLocale = 'en' | 'tr'

interface LayoutKitExampleDictionary {
  basic: {
    mainMenu: string
    home: string
    pages: string
    documents: string
    notifications: string
    settings: string
  }
  test: {
    mainMenu: string
    development: string
    authKitTest: string
    signInStandard: string
    signInSplit: string
    otpVerification: string
    forgotPassword: string
    resetPassword: string
    layoutKitTest: string
    dataTableKitTest: string
    formKitTest: string
    componentGallery: string
    formExamples: string
    settings: string
  }
  ecommerce: {
    menu: string
    home: string
    products: string
    allProducts: string
    addProduct: string
    categories: string
    inventory: string
    customers: string
    customerList: string
    orders: string
    analytics: string
    reports: string
    finance: string
    settings: string
  }
  cargo: {
    menu: string
    home: string
    shipments: string
    allShipments: string
    newShipment: string
    trackShipment: string
    management: string
    customers: string
    branches: string
    analytics: string
    reports: string
    finance: string
    development: string
    authKitTest: string
    signInStandard: string
    signInSplit: string
    otpVerification: string
    forgotPassword: string
    resetPassword: string
    componentGallery: string
    settings: string
  }
  nested: {
    mainMenu: string
    modules: string
  }
}

const layoutKitExampleDictionaries: Record<LayoutKitExampleLocale, LayoutKitExampleDictionary> = {
  en: {
    basic: {
      mainMenu: 'Main Menu',
      home: 'Home',
      pages: 'Pages',
      documents: 'Documents',
      notifications: 'Notifications',
      settings: 'Settings',
    },
    test: {
      mainMenu: 'Main Menu',
      development: 'Test & Development',
      authKitTest: 'Auth Kit Test',
      signInStandard: 'Sign In (Standard)',
      signInSplit: 'Sign In 2 (Split)',
      otpVerification: 'OTP Verification',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      layoutKitTest: 'Layout Kit Test',
      dataTableKitTest: 'DataTable Kit Test',
      formKitTest: 'Form Kit Test',
      componentGallery: 'Component Gallery',
      formExamples: 'Form Examples',
      settings: 'Settings',
    },
    ecommerce: {
      menu: 'Menu',
      home: 'Home',
      products: 'Products',
      allProducts: 'All Products',
      addProduct: 'Add Product',
      categories: 'Categories',
      inventory: 'Inventory Management',
      customers: 'Customers',
      customerList: 'Customer List',
      orders: 'Orders',
      analytics: 'Analytics',
      reports: 'Reports',
      finance: 'Finance',
      settings: 'Settings',
    },
    cargo: {
      menu: 'Menu',
      home: 'Home',
      shipments: 'Shipments',
      allShipments: 'All Shipments',
      newShipment: 'New Shipment',
      trackShipment: 'Track Shipment',
      management: 'Management',
      customers: 'Customers',
      branches: 'Branches',
      analytics: 'Analytics',
      reports: 'Reports',
      finance: 'Finance',
      development: 'Test & Development',
      authKitTest: 'Auth Kit Test',
      signInStandard: 'Sign In (Standard)',
      signInSplit: 'Sign In 2 (Split)',
      otpVerification: 'OTP Verification',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      componentGallery: 'Component Gallery',
      settings: 'Settings',
    },
    nested: {
      mainMenu: 'Main Menu',
      modules: 'Modules',
    },
  },
  tr: {
    basic: {
      mainMenu: 'Ana Menü',
      home: 'Ana Sayfa',
      pages: 'Sayfalar',
      documents: 'Dokümanlar',
      notifications: 'Bildirimler',
      settings: 'Ayarlar',
    },
    test: {
      mainMenu: 'Ana Menü',
      development: 'Test & Geliştirme',
      authKitTest: 'Auth Kit Test',
      signInStandard: 'Sign In (Standart)',
      signInSplit: 'Sign In 2 (Split)',
      otpVerification: 'OTP Doğrulama',
      forgotPassword: 'Şifremi Unuttum',
      resetPassword: 'Şifre Sıfırlama',
      layoutKitTest: 'Layout Kit Test',
      dataTableKitTest: 'DataTable Kit Test',
      formKitTest: 'Form Kit Test',
      componentGallery: 'Component Gallery',
      formExamples: 'Form Examples',
      settings: 'Ayarlar',
    },
    ecommerce: {
      menu: 'Menü',
      home: 'Ana Sayfa',
      products: 'Ürünler',
      allProducts: 'Tüm Ürünler',
      addProduct: 'Yeni Ürün Ekle',
      categories: 'Kategoriler',
      inventory: 'Stok Yönetimi',
      customers: 'Müşteriler',
      customerList: 'Müşteri Listesi',
      orders: 'Siparişler',
      analytics: 'Analiz',
      reports: 'Raporlar',
      finance: 'Finans',
      settings: 'Ayarlar',
    },
    cargo: {
      menu: 'Menü',
      home: 'Ana Sayfa',
      shipments: 'Kargolar',
      allShipments: 'Tüm Kargolar',
      newShipment: 'Yeni Kargo',
      trackShipment: 'Kargo Sorgula',
      management: 'Yönetim',
      customers: 'Müşteriler',
      branches: 'Şubeler',
      analytics: 'Analiz',
      reports: 'Raporlar',
      finance: 'Finans',
      development: 'Test & Geliştirme',
      authKitTest: 'Auth Kit Test',
      signInStandard: 'Sign In (Standart)',
      signInSplit: 'Sign In 2 (Split)',
      otpVerification: 'OTP Doğrulama',
      forgotPassword: 'Şifremi Unuttum',
      resetPassword: 'Şifre Sıfırlama',
      componentGallery: 'Component Gallery',
      settings: 'Ayarlar',
    },
    nested: {
      mainMenu: 'Ana Menü',
      modules: 'Modüller',
    },
  },
}

function getDictionary(locale: LayoutKitExampleLocale = 'en'): LayoutKitExampleDictionary {
  return layoutKitExampleDictionaries[locale]
}

export const createExampleBrandData = (): BrandData => ({
  title: 'ARF UI Kit',
  subtitle: 'Component Library v1.0',
  url: '/',
  icon: LayoutDashboard,
})

export const exampleBrandData: BrandData = createExampleBrandData()

export const createExampleBrandOptions = (): BrandSwitcherItem[] => [
  {
    id: 'arf-ui-kit',
    title: 'ARF UI Kit',
    subtitle: 'Component Library',
    url: '/',
    icon: LayoutDashboard,
    shortcut: '⌘1',
  },
  {
    id: 'cargo-ops',
    title: 'Cargo Ops',
    subtitle: 'Operations Workspace',
    url: '/cargo',
    icon: Package,
    shortcut: '⌘2',
  },
  {
    id: 'test-hub',
    title: 'Test Hub',
    subtitle: 'Playground & Docs',
    url: '/test',
    icon: TestTube2,
    shortcut: '⌘3',
  },
]

export const exampleBrandOptions: BrandSwitcherItem[] = createExampleBrandOptions()

export const createExampleQuickActions = (): SidebarQuickActionItem[] => [
  {
    id: 'support',
    label: 'Support',
    url: '/support',
    icon: LifeBuoy,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    url: '/feedback',
    icon: Send,
  },
]

export const exampleQuickActions: SidebarQuickActionItem[] = createExampleQuickActions()

export const createExampleUserData = (): UserData => ({
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '',
  role: 'Admin',
})

export const exampleUserData: UserData = createExampleUserData()

export function createBasicNavGroups(locale: LayoutKitExampleLocale = 'en'): NavGroup[] {
  const t = getDictionary(locale).basic

  return [
    {
      label: t.mainMenu,
      items: [
        {
          title: t.home,
          url: '/',
          icon: Home,
        },
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t.pages,
      items: [
        {
          title: t.documents,
          url: '/documents',
          icon: FileText,
        },
        {
          title: t.notifications,
          url: '/notifications',
          icon: Bell,
          badge: '5',
        },
      ],
    },
    {
      items: [
        {
          title: t.settings,
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ]
}

export const basicNavGroups: NavGroup[] = createBasicNavGroups()

export function createTestNavGroups(locale: LayoutKitExampleLocale = 'en'): NavGroup[] {
  const t = getDictionary(locale).test
  const basic = getDictionary(locale).basic

  return [
    {
      label: t.mainMenu,
      items: [
        {
          title: basic.home,
          url: '/',
          icon: Home,
        },
      ],
    },
    {
      label: t.development,
      items: [
        {
          title: t.authKitTest,
          icon: ShieldCheck,
          items: [
            { title: t.signInStandard, url: '/auth/signin' },
            { title: t.signInSplit, url: '/auth/signin2' },
            { title: t.otpVerification, url: '/auth/otp' },
            { title: t.forgotPassword, url: '/auth/forgot-password' },
            { title: t.resetPassword, url: '/auth/reset-password?token=demo' },
          ],
        },
        {
          title: t.layoutKitTest,
          icon: LayoutDashboard,
          items: [
            { title: 'Dashboard Layout', url: '/test/layout/dashboard' },
            { title: 'Header Variants', url: '/test/layout/header' },
            { title: 'Sidebar Variants', url: '/test/layout/sidebar' },
            { title: 'Footer Variants', url: '/test/layout/footer' },
          ],
        },
        {
          title: t.dataTableKitTest,
          icon: Table,
          items: [
            { title: 'Basic DataTable', url: '/test/datatable/basic' },
            { title: 'Advanced Features', url: '/test/datatable/advanced' },
            { title: 'Server-Side', url: '/test/datatable/server-side' },
          ],
        },
        {
          title: t.formKitTest,
          icon: FileText,
          items: [
            { title: t.formExamples, url: '/test/form' },
          ],
        },
        {
          title: t.componentGallery,
          url: '/gallery',
          icon: Palette,
          badge: '45+',
        },
      ],
    },
    {
      items: [
        {
          title: t.settings,
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ]
}

export const testNavGroups: NavGroup[] = createTestNavGroups()

export function createEcommerceNavGroups(locale: LayoutKitExampleLocale = 'en'): NavGroup[] {
  const t = getDictionary(locale).ecommerce

  return [
    {
      label: t.menu,
      items: [
        {
          title: t.home,
          url: '/',
          icon: Home,
        },
        {
          title: t.products,
          icon: Package,
          items: [
            { title: t.allProducts, url: '/products' },
            { title: t.addProduct, url: '/products/new' },
            { title: t.categories, url: '/products/categories' },
            { title: t.inventory, url: '/products/inventory' },
          ],
        },
      ],
    },
    {
      label: t.customers,
      items: [
        {
          title: t.customerList,
          url: '/customers',
          icon: Users,
          badge: '234',
        },
        {
          title: t.orders,
          url: '/orders',
          icon: Package,
          badge: '12',
        },
      ],
    },
    {
      label: t.analytics,
      items: [
        {
          title: t.reports,
          url: '/reports',
          icon: BarChart3,
        },
        {
          title: t.finance,
          url: '/finance',
          icon: Wallet,
        },
      ],
    },
    {
      items: [
        {
          title: t.settings,
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ]
}

export const ecommerceNavGroups: NavGroup[] = createEcommerceNavGroups()

export function createCargoNavGroups(locale: LayoutKitExampleLocale = 'en'): NavGroup[] {
  const t = getDictionary(locale).cargo

  return [
    {
      label: t.menu,
      items: [
        {
          title: t.home,
          url: '/',
          icon: Home,
        },
        {
          title: t.shipments,
          icon: Package,
          badge: '12',
          items: [
            { title: t.allShipments, url: '/shipments' },
            { title: t.newShipment, url: '/shipments/new' },
            { title: t.trackShipment, url: '/shipments/track' },
          ],
        },
      ],
    },
    {
      label: t.management,
      items: [
        {
          title: t.customers,
          url: '/customers',
          icon: Users,
        },
        {
          title: t.branches,
          url: '/branches',
          icon: Building2,
        },
      ],
    },
    {
      label: t.analytics,
      items: [
        {
          title: t.reports,
          url: '/reports',
          icon: BarChart3,
        },
        {
          title: t.finance,
          url: '/finance',
          icon: Wallet,
        },
      ],
    },
    {
      label: t.development,
      items: [
        {
          title: t.authKitTest,
          icon: ShieldCheck,
          items: [
            { title: t.signInStandard, url: '/auth/signin' },
            { title: t.signInSplit, url: '/auth/signin2' },
            { title: t.otpVerification, url: '/auth/otp' },
            { title: t.forgotPassword, url: '/auth/forgot-password' },
            { title: t.resetPassword, url: '/auth/reset-password?token=demo' },
          ],
        },
        {
          title: t.componentGallery,
          url: '/gallery',
          icon: TestTube2,
        },
      ],
    },
    {
      items: [
        {
          title: t.settings,
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ]
}

export const cargoNavGroups: NavGroup[] = createCargoNavGroups()

export function createNestedNavGroups(locale: LayoutKitExampleLocale = 'en'): NavGroup[] {
  const t = getDictionary(locale).nested

  return [
    {
      label: t.mainMenu,
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: Home,
        },
      ],
    },
    {
      label: t.modules,
      items: [
        {
          title: 'Auth Kit',
          icon: ShieldCheck,
          items: [
            { title: 'Components', url: '/modules/auth/components' },
            { title: 'Pages', url: '/modules/auth/pages' },
            { title: 'Context', url: '/modules/auth/context' },
            { title: 'Utils', url: '/modules/auth/utils' },
          ],
        },
        {
          title: 'Layout Kit',
          icon: LayoutDashboard,
          items: [
            { title: 'Dashboard', url: '/modules/layout/dashboard' },
            { title: 'Header', url: '/modules/layout/header' },
            { title: 'Sidebar', url: '/modules/layout/sidebar' },
            { title: 'Footer', url: '/modules/layout/footer' },
          ],
        },
        {
          title: 'Form Kit',
          icon: FileText,
          items: [
            {
              title: 'Field Types',
              url: '/modules/form/fields',
              items: [
                { title: 'Text Fields', url: '/modules/form/text' },
                { title: 'Select Fields', url: '/modules/form/select' },
                { title: 'Array Fields', url: '/modules/form/array' },
              ],
            },
            { title: 'Validation', url: '/modules/form/validation' },
          ],
        },
      ],
    },
  ]
}

export const nestedNavGroups: NavGroup[] = createNestedNavGroups()
