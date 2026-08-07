/**
 * Layout Kit - DashboardLayout
 * 
 * Tam özellikli dashboard layout wrapper
 * AppSidebar + AppHeader + Content + Optional Footer
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"
import { AppFooter } from "./AppFooter"
import type { DashboardLayoutProps } from "../context/types"

export function DashboardLayout({
  children,
  brand,
  brandOptions,
  brandMenuLabel,
  addBrandLabel,
  onAddBrand,
  quickActions,
  userMenuLabels,
  settingsModalConfig,
  user,
  navGroups,
  mainContentId = 'main-content',
  showSkipToContent = true,
  skipToContentLabel = 'Ana icerige gec',
  breadcrumbs,
  searchPlaceholder,
  searchCommands,
  commandTitle,
  commandDescription,
  searchEmptyMessage,
  notificationCount,
  notifications,
  notificationsMenuLabel,
  notificationsEmptyMessage,
  markAllAsReadLabel,
  onMarkAllAsRead,
  viewAllNotificationsLabel,
  onViewAllNotifications,
  showFooter = false,
  footerProps,
  onLogout,
  onSearchClick,
  onNotificationClick,
}: DashboardLayoutProps) {
  const router = useRouter()

  const resolvedSearchCommands = React.useMemo(() => {
    if (searchCommands && searchCommands.length > 0) {
      return searchCommands
    }

    return navGroups.flatMap((group, groupIndex) => {
      const groupLabel = group.label || "Navigation"

      return group.items.flatMap((item, itemIndex) => {
        const commands = [] as Array<{
          id: string
          label: string
          group: string
          keywords: string[]
          onSelect?: () => void
        }>

        if (item.url) {
          commands.push({
            id: `nav-${groupIndex}-${itemIndex}`,
            label: item.title,
            group: groupLabel,
            keywords: [item.title, item.url],
            onSelect: () => {
              router.push(item.url as string)
            },
          })
        }

        if (item.items && item.items.length > 0) {
          item.items.forEach((subItem, subIndex) => {
            commands.push({
              id: `nav-${groupIndex}-${itemIndex}-${subIndex}`,
              label: `${item.title} / ${subItem.title}`,
              group: groupLabel,
              keywords: [item.title, subItem.title, subItem.url],
              onSelect: () => {
                router.push(subItem.url)
              },
            })
          })
        }

        return commands
      })
    })
  }, [navGroups, router, searchCommands])

  return (
    <SidebarProvider>
      {showSkipToContent && (
        <a
          href={`#${mainContentId}`}
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          {skipToContentLabel}
        </a>
      )}
      <AppSidebar
        brand={brand}
        brandOptions={brandOptions}
        brandMenuLabel={brandMenuLabel}
        addBrandLabel={addBrandLabel}
        onAddBrand={onAddBrand}
        quickActions={quickActions}
        userMenuLabels={userMenuLabels}
        settingsModalConfig={settingsModalConfig}
        user={user}
        navGroups={navGroups}
        onLogout={onLogout}
      />
      <SidebarInset>
        <AppHeader
          breadcrumbs={breadcrumbs}
          searchPlaceholder={searchPlaceholder}
          searchCommands={resolvedSearchCommands}
          commandTitle={commandTitle}
          commandDescription={commandDescription}
          searchEmptyMessage={searchEmptyMessage}
          notificationCount={notificationCount}
          notifications={notifications}
          notificationsMenuLabel={notificationsMenuLabel}
          notificationsEmptyMessage={notificationsEmptyMessage}
          markAllAsReadLabel={markAllAsReadLabel}
          onMarkAllAsRead={onMarkAllAsRead}
          viewAllNotificationsLabel={viewAllNotificationsLabel}
          onViewAllNotifications={onViewAllNotifications}
          onSearchClick={onSearchClick}
          onNotificationClick={onNotificationClick}
        />
        <main id={mainContentId} tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>
        {showFooter && <AppFooter {...footerProps} />}
      </SidebarInset>
    </SidebarProvider>
  )
}
