/**
 * Layout Kit - Public API
 * 
 * Dashboard layout modülü barrel export
 * Sadece public API'yi expose eder
 */

// ========== Components ==========
export { AppHeader } from './components/AppHeader'
export { AppSidebar } from './components/AppSidebar'
export { AppFooter } from './components/AppFooter'
export { DashboardLayout } from './components/DashboardLayout'
export { ThemeProvider } from './components/ThemeProvider'
export { AppHeaderDefaultsProvider, useAppHeaderDefaults } from './context/app-header-defaults-context'

// ========== Types ==========
export type {
  // AppHeader
  BreadcrumbData,
  AppHeaderProps,
  HeaderNotificationItem,
  
  // AppSidebar
  NavSubItem,
  NavItem,
  NavGroup,
  UserData,
  BrandData,
  BrandSwitcherItem,
  SidebarQuickActionItem,
  SidebarUserMenuLabels,
  SidebarSettingsModalLabels,
  SidebarSettingsSection,
  SidebarSettingsModalConfig,
  AppSidebarProps,
  
  // AppFooter
  FooterLink,
  FooterLinkGroup,
  FooterSocialLink,
  AppFooterProps,
  
  // DashboardLayout
  DashboardLayoutProps,
  
  // ThemeProvider
  ThemeProviderProps,
} from './context/types'

// ========== Utils ==========
export {
  createExampleBrandData,
  exampleBrandData,
  createExampleBrandOptions,
  exampleBrandOptions,
  createExampleUserData,
  exampleUserData,
  createBasicNavGroups,
  basicNavGroups,
  createTestNavGroups,
  testNavGroups,
  createEcommerceNavGroups,
  ecommerceNavGroups,
  createCargoNavGroups,
  cargoNavGroups,
  createNestedNavGroups,
  nestedNavGroups,
} from './utils'
export type { LayoutKitExampleLocale } from './utils'