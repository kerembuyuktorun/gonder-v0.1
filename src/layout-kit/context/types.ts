/**
 * Layout Kit - Type Definitions
 * 
 * Tüm layout bileşenleri için merkezi type tanımları
 */

import * as React from 'react'

// ========== AppHeader Types ==========

/**
 * Breadcrumb navigasyon verisi
 */
export interface BreadcrumbData {
  label: string
  href?: string
}

/**
 * AppHeader command palette item
 */
export interface HeaderCommandItem {
  id: string
  label: string
  group?: string
  keywords?: string[]
  shortcut?: string
  icon?: React.ReactNode
  onSelect?: () => void
}

/**
 * AppHeader bildirim menüsü öğesi
 */
export interface HeaderNotificationItem {
  id: string
  title: string
  description?: string
  timeLabel?: string
  isRead?: boolean
  icon?: React.ReactNode
  href?: string
  onSelect?: () => void
}

/**
 * AppHeader bileşeni props'ları
 */
export interface AppHeaderProps {
  breadcrumbs?: BreadcrumbData[]
  searchPlaceholder?: string
  searchShortcut?: React.ReactNode
  searchCommands?: HeaderCommandItem[]
  commandTitle?: string
  commandDescription?: string
  searchEmptyMessage?: string
  notificationCount?: number
  notifications?: HeaderNotificationItem[]
  notificationsMenuLabel?: string
  notificationsEmptyMessage?: string
  markAllAsReadLabel?: string
  onMarkAllAsRead?: () => void
  viewAllNotificationsLabel?: string
  onViewAllNotifications?: () => void
  notificationsLabel?: string
  onSearchClick?: () => void
  onNotificationClick?: () => void
}

// ========== AppSidebar Types ==========

/**
 * Sidebar alt menü öğesi
 */
export interface NavSubItem {
  title: string
  url: string
  icon?: React.ElementType
  badge?: string
  items?: NavSubItem[]
}

/**
 * Sidebar menü öğesi
 */
export interface NavItem {
  title: string
  url?: string
  icon: React.ElementType
  badge?: string
  items?: NavSubItem[]
}

/**
 * Sidebar menü grubu
 */
export interface NavGroup {
  label?: string
  items: NavItem[]
}

/**
 * Kullanıcı profil verisi
 */
export interface UserData {
  name: string
  email: string
  avatar: string
  role: string
}

/**
 * Marka/Logo verisi
 */
export interface BrandData {
  title: string
  subtitle: string
  url: string
  icon: React.ElementType
}

/**
 * Sidebar header switcher item
 */
export interface BrandSwitcherItem extends BrandData {
  id: string
  shortcut?: string
  onSelect?: () => void
  /** When true, item is dimmed and not selectable */
  disabled?: boolean
}

/**
 * Sidebar footer quick action item
 */
export interface SidebarQuickActionItem {
  id: string
  label: string
  url?: string
  icon: React.ElementType
  onSelect?: () => void
}

/**
 * Kullanıcı açılır menüsü etiketleri
 */
export interface SidebarUserMenuLabels {
  profile?: string
  settings?: string
  logout?: string
}

/**
 * Ayarlar modalı etiketleri
 */
export interface SidebarSettingsModalLabels {
  title?: string
  rootBreadcrumb?: string
  closeSrText?: string
}

/**
 * Ayarlar modalı bölüm tanımı
 */
export interface SidebarSettingsSection {
  id: string
  label: string
  icon?: React.ElementType
}

/**
 * Ayarlar modalı konfigürasyonu
 */
export interface SidebarSettingsModalConfig {
  sections?: SidebarSettingsSection[]
  defaultSectionId?: string
  profileSectionId?: string
  settingsSectionId?: string
  labels?: SidebarSettingsModalLabels
  renderContent?: (activeSection: SidebarSettingsSection) => React.ReactNode
}

/**
 * AppSidebar bileşeni props'ları
 */
export interface AppSidebarProps {
  brand: BrandData
  brandOptions?: BrandSwitcherItem[]
  brandMenuLabel?: string
  addBrandLabel?: string
  onAddBrand?: () => void
  quickActions?: SidebarQuickActionItem[]
  userMenuLabels?: SidebarUserMenuLabels
  settingsModalConfig?: SidebarSettingsModalConfig
  user: UserData
  navGroups: NavGroup[]
  onLogout?: () => void
}

// ========== AppFooter Types ==========

/**
 * Footer link verisi
 */
export interface FooterLink {
  label: string
  href: string
}

/**
 * Footer link grubu
 */
export interface FooterLinkGroup {
  title: string
  links: FooterLink[]
}

/**
 * Footer sosyal medya linki
 */
export interface FooterSocialLink {
  label: string
  href: string
  icon: React.ElementType
}

/**
 * AppFooter bileşeni props'ları
 */
export interface AppFooterProps {
  brandName?: string
  copyright?: string
  description?: string
  linkGroups?: FooterLinkGroup[]
  socialLinks?: FooterSocialLink[]
  className?: string
}

// ========== DashboardLayout Types ==========

/**
 * DashboardLayout bileşeni props'ları
 */
export interface DashboardLayoutProps {
  children: React.ReactNode
  brand: BrandData
  brandOptions?: BrandSwitcherItem[]
  brandMenuLabel?: string
  addBrandLabel?: string
  onAddBrand?: () => void
  quickActions?: SidebarQuickActionItem[]
  userMenuLabels?: SidebarUserMenuLabels
  settingsModalConfig?: SidebarSettingsModalConfig
  user: UserData
  navGroups: NavGroup[]
  mainContentId?: string
  showSkipToContent?: boolean
  skipToContentLabel?: string
  breadcrumbs?: BreadcrumbData[]
  searchPlaceholder?: string
  searchCommands?: HeaderCommandItem[]
  commandTitle?: string
  commandDescription?: string
  searchEmptyMessage?: string
  notificationCount?: number
  notifications?: HeaderNotificationItem[]
  notificationsMenuLabel?: string
  notificationsEmptyMessage?: string
  markAllAsReadLabel?: string
  onMarkAllAsRead?: () => void
  viewAllNotificationsLabel?: string
  onViewAllNotifications?: () => void
  showFooter?: boolean
  footerProps?: Omit<AppFooterProps, 'className'>
  onLogout?: () => void
  onSearchClick?: () => void
  onNotificationClick?: () => void
}

// ========== ThemeProvider Types ==========

/**
 * Theme provider props (re-exported from next-themes)
 */
export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  enableColorScheme?: boolean
}
