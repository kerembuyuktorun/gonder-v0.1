"use client"

import * as React from "react"
import { Bell, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { AppHeaderProps, HeaderNotificationItem } from "../context/types"
import { useAppHeaderDefaults } from "../context/app-header-defaults-context"

const DEFAULT_COMMAND_GROUP = "Commands"
const NON_CLICKABLE_GROUP_BREADCRUMBS = new Set([
  "Dashboard",
  "Kargo İşlemleri",
  "Taşıma İşlemleri",
  "Operasyon İşlemleri",
  "Satış & Pazarlama",
  "Finans & Muhasebe",
  "Ayarlar",
])

const NON_CLICKABLE_BREADCRUMB_HREFS = new Set([
  "/arf/cargo/finance",
  "/arf/cargo/finance/head-office",
  "/arf/cargo/finance/headquarters",
  "/arf/cargo/finance/branch-transfer-center",
  "/arf/cargo/operations",
  "/arf/cargo/settings",
  "/arf/cargo/settings",
  "/cargo/finance",
  "/cargo/finance/head-office",
  "/cargo/finance/headquarters",
  "/cargo/finance/branch-transfer-center",
  "/cargo/operations",
  "/cargo/settings",
  "/cargo/settings",
])

export function AppHeader(props: AppHeaderProps) {
  const headerDefaults = useAppHeaderDefaults()
  const router = useRouter()

  const {
    breadcrumbs,
    searchPlaceholder,
    searchShortcut,
    searchCommands,
    commandTitle,
    commandDescription,
    searchEmptyMessage,
    notificationCount,
    notificationsLabel,
    notifications,
    notificationsMenuLabel,
    notificationsEmptyMessage,
    markAllAsReadLabel,
    onMarkAllAsRead,
    viewAllNotificationsLabel,
    onViewAllNotifications,
    onSearchClick,
    onNotificationClick,
  } = props

  const resolvedBreadcrumbs = breadcrumbs ?? headerDefaults.breadcrumbs ?? []
  const normalizedBreadcrumbs = React.useMemo(
    () =>
      resolvedBreadcrumbs.map((crumb) => {
        if (crumb.label === "Ana Sayfa" && crumb.href === "/") {
          return { ...crumb, href: "/cargo" }
        }

        if (NON_CLICKABLE_GROUP_BREADCRUMBS.has(crumb.label)) {
          return { ...crumb, href: undefined }
        }

        if (crumb.href && NON_CLICKABLE_BREADCRUMB_HREFS.has(crumb.href)) {
          return { ...crumb, href: undefined }
        }

        return crumb
      }),
    [resolvedBreadcrumbs],
  )
  const resolvedSearchPlaceholder = searchPlaceholder ?? headerDefaults.searchPlaceholder ?? "Search..."
  const resolvedSearchShortcut = searchShortcut ?? headerDefaults.searchShortcut
  const resolvedCommandTitle = commandTitle ?? headerDefaults.commandTitle ?? "Search commands"
  const resolvedCommandDescription =
    commandDescription ?? headerDefaults.commandDescription ?? "Search for an action to run."
  const resolvedSearchEmptyMessage =
    searchEmptyMessage ?? headerDefaults.searchEmptyMessage ?? "No result found."
  const resolvedNotificationsLabel = notificationsLabel ?? headerDefaults.notificationsLabel ?? "Notifications"
  const resolvedNotificationsMenuLabel =
    notificationsMenuLabel ?? headerDefaults.notificationsMenuLabel ?? "Notifications"
  const resolvedNotificationsEmptyMessage =
    notificationsEmptyMessage ?? headerDefaults.notificationsEmptyMessage ?? "No notifications yet."
  const resolvedMarkAllAsReadLabel =
    markAllAsReadLabel ?? headerDefaults.markAllAsReadLabel ?? "Mark all as read"
  const resolvedViewAllNotificationsLabel =
    viewAllNotificationsLabel ?? headerDefaults.viewAllNotificationsLabel ?? "View all notifications"
  const resolvedOnSearchClick = onSearchClick ?? headerDefaults.onSearchClick
  const resolvedOnNotificationClick = onNotificationClick ?? headerDefaults.onNotificationClick
  const resolvedOnMarkAllAsRead = onMarkAllAsRead ?? headerDefaults.onMarkAllAsRead
  const resolvedOnViewAllNotifications = onViewAllNotifications ?? headerDefaults.onViewAllNotifications

  const [isCommandOpen, setIsCommandOpen] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)

  const resolvedSearchCommands = React.useMemo(() => {
    if (searchCommands && searchCommands.length > 0) {
      return searchCommands
    }

    return headerDefaults.searchCommands ?? []
  }, [headerDefaults.searchCommands, searchCommands])

  const resolvedNotifications = React.useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications
    }

    return headerDefaults.notifications ?? []
  }, [headerDefaults.notifications, notifications])

  const resolvedNotificationCount = React.useMemo(() => {
    if (typeof notificationCount === "number") {
      return notificationCount
    }

    if (typeof headerDefaults.notificationCount === "number") {
      return headerDefaults.notificationCount
    }

    return resolvedNotifications.filter((item) => !item.isRead).length
  }, [headerDefaults.notificationCount, notificationCount, resolvedNotifications])

  const groupedCommands = React.useMemo(() => {
    const groups = new Map<string, typeof resolvedSearchCommands>()

    resolvedSearchCommands.forEach((item) => {
      const groupKey = item.group?.trim() || DEFAULT_COMMAND_GROUP
      const existingGroup = groups.get(groupKey)

      if (existingGroup) {
        existingGroup.push(item)
      } else {
        groups.set(groupKey, [item])
      }
    })

    return Array.from(groups.entries()).map(([group, items]) => ({ group, items }))
  }, [resolvedSearchCommands])

  const openCommand = React.useCallback(() => {
    resolvedOnSearchClick?.()
    setIsCommandOpen(true)
  }, [resolvedOnSearchClick])

  const handleCommandSelect = React.useCallback((onSelect?: () => void) => {
    onSelect?.()
    setIsCommandOpen(false)
  }, [])

  const handleNotificationItemSelect = React.useCallback((item: HeaderNotificationItem) => {
    if (!item) {
      return
    }

    if (item.onSelect) {
      item.onSelect()
      setIsNotificationsOpen(false)
      return
    }

    if (item.href) {
      router.push(item.href)
    }

    setIsNotificationsOpen(false)
  }, [router])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setIsCommandOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <SidebarTrigger className="-ml-1 size-8" />
        <Separator orientation="vertical" className="h-4" />

        {/* Breadcrumbs */}
        {normalizedBreadcrumbs.length > 0 && (
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {normalizedBreadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index < normalizedBreadcrumbs.length - 1 ? (
                      crumb.href ? (
                        <BreadcrumbLink 
                          href={crumb.href}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-normal text-muted-foreground">{crumb.label}</BreadcrumbPage>
                      )
                    ) : (
                      <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < normalizedBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search Button (Desktop) */}
        <Button 
          variant="outline" 
          onClick={openCommand}
          className="hidden h-9 w-64 justify-start gap-2 px-3 text-sm text-muted-foreground md:flex"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">{resolvedSearchPlaceholder}</span>
          {resolvedSearchShortcut && (
            <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              {resolvedSearchShortcut}
            </kbd>
          )}
        </Button>

        {/* Mobile Search */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={openCommand}
          className="size-8 md:hidden"
        >
          <Search className="size-4" />
          <span className="sr-only">{resolvedSearchPlaceholder}</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu
          open={isNotificationsOpen}
          onOpenChange={(open: boolean) => {
            setIsNotificationsOpen(open)
            if (open) {
              resolvedOnNotificationClick?.()
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8"
            >
              <Bell className="size-4" />
              {resolvedNotificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {resolvedNotificationCount > 99 ? "99+" : resolvedNotificationCount}
                </Badge>
              )}
              <span className="sr-only">{resolvedNotificationsLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="w-[360px] rounded-xl p-0">
            <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-semibold">{resolvedNotificationsMenuLabel}</span>
              {resolvedNotifications.length > 0 && resolvedOnMarkAllAsRead && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    resolvedOnMarkAllAsRead?.()
                  }}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {resolvedMarkAllAsReadLabel}
                </button>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {resolvedNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">{resolvedNotificationsEmptyMessage}</div>
            ) : (
              <div className="max-h-[340px] overflow-y-auto p-1.5">
                {resolvedNotifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => handleNotificationItemSelect(item)}
                    className="items-start gap-3 rounded-lg px-2.5 py-2.5"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.icon ? (
                        <span className="text-muted-foreground">{item.icon}</span>
                      ) : (
                        <span
                          className={[
                            "mt-1 block size-2 rounded-full",
                            item.isRead ? "bg-slate-300" : "bg-blue-500",
                          ].join(" ")}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                      )}
                      {item.timeLabel && <p className="mt-1 text-[11px] text-muted-foreground">{item.timeLabel}</p>}
                    </div>
                    {!item.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />}
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            {resolvedOnViewAllNotifications && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="h-9 w-full justify-center text-sm"
                    onClick={() => {
                      resolvedOnViewAllNotifications()
                      setIsNotificationsOpen(false)
                    }}
                  >
                    {resolvedViewAllNotificationsLabel}
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        title={resolvedCommandTitle}
        description={resolvedCommandDescription}
      >
        <CommandInput placeholder={resolvedSearchPlaceholder} />
        <CommandList>
          <CommandEmpty>{resolvedSearchEmptyMessage}</CommandEmpty>

          {groupedCommands.map(({ group, items }, groupIndex) => (
            <React.Fragment key={group}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    keywords={item.keywords}
                    onSelect={() => handleCommandSelect(item.onSelect)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}