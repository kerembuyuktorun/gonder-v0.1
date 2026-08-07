"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Accessibility,
  Bell,
  Check,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Globe,
  Home,
  Link2,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Paintbrush,
  Plus,
  Settings,
  Settings2,
  User,
  Video,
  X,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type {
  AppSidebarProps,
  BrandSwitcherItem,
  NavSubItem,
  SidebarSettingsSection,
} from "../context/types"

const DEFAULT_SETTINGS_SECTIONS: SidebarSettingsSection[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "navigation", label: "Navigation", icon: Menu },
  { id: "home", label: "Home", icon: Home },
  { id: "appearance", label: "Appearance", icon: Paintbrush },
  { id: "messages-media", label: "Messages & media", icon: MessageSquare },
  { id: "language-region", label: "Language & region", icon: Globe },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "mark-read", label: "Mark as read", icon: Check },
  { id: "audio-video", label: "Audio & video", icon: Video },
  { id: "connected-accounts", label: "Connected accounts", icon: Link2 },
  { id: "privacy-visibility", label: "Privacy & visibility", icon: Lock },
  { id: "advanced", label: "Advanced", icon: Settings2 },
] as const

export function AppSidebar({
  brand,
  brandOptions,
  brandMenuLabel = "Workspaces",
  addBrandLabel = "Add workspace",
  onAddBrand,
  quickActions = [],
  userMenuLabels,
  settingsModalConfig,
  user,
  navGroups,
  onLogout,
}: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  const profileLabel = userMenuLabels?.profile
  const settingsLabel = userMenuLabels?.settings ?? "Settings"
  const logoutLabel = userMenuLabels?.logout ?? "Log out"
  const showProfileMenuItem = Boolean(profileLabel)

  const modalTitle = settingsModalConfig?.labels?.title ?? "Settings"
  const modalRootBreadcrumb = settingsModalConfig?.labels?.rootBreadcrumb ?? "Settings"
  const modalCloseSrText = settingsModalConfig?.labels?.closeSrText ?? "Close"

  const resolvedSettingsSections = React.useMemo<SidebarSettingsSection[]>(() => {
    if (settingsModalConfig?.sections && settingsModalConfig.sections.length > 0) {
      return settingsModalConfig.sections
    }

    return DEFAULT_SETTINGS_SECTIONS
  }, [settingsModalConfig?.sections])

  const fallbackSectionId = resolvedSettingsSections[0]?.id ?? "default"
  const profileSectionId = settingsModalConfig?.profileSectionId ?? resolvedSettingsSections.find((section) => section.id === "home")?.id ?? fallbackSectionId
  const settingsSectionId = settingsModalConfig?.settingsSectionId ?? resolvedSettingsSections.find((section) => section.id === "messages-media")?.id ?? fallbackSectionId
  const defaultSettingsSectionId =
    settingsModalConfig?.defaultSectionId ?? profileSectionId ?? settingsSectionId

  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false)
  const [activeSettingsSectionId, setActiveSettingsSectionId] = React.useState<string>(
    defaultSettingsSectionId
  )

  React.useEffect(() => {
    if (!resolvedSettingsSections.some((section) => section.id === activeSettingsSectionId)) {
      setActiveSettingsSectionId(defaultSettingsSectionId)
    }
  }, [activeSettingsSectionId, defaultSettingsSectionId, resolvedSettingsSections])

  const activeSettingsSection = React.useMemo(
    () => resolvedSettingsSections.find((section) => section.id === activeSettingsSectionId) ?? resolvedSettingsSections[0],
    [activeSettingsSectionId, resolvedSettingsSections]
  )

  const openSettingsModal = React.useCallback((sectionId?: string) => {
    const nextSectionId =
      sectionId && resolvedSettingsSections.some((section) => section.id === sectionId)
        ? sectionId
        : defaultSettingsSectionId

    setActiveSettingsSectionId(nextSectionId)
    setIsSettingsModalOpen(true)
  }, [defaultSettingsSectionId, resolvedSettingsSections])

  const resolvedBrandOptions = React.useMemo<BrandSwitcherItem[]>(() => {
    if (brandOptions && brandOptions.length > 0) {
      return brandOptions
    }

    return [
      {
        id: "default-brand",
        title: brand.title,
        subtitle: brand.subtitle,
        url: brand.url,
        icon: brand.icon,
      },
    ]
  }, [brand, brandOptions])

  const handleBrandSelect = React.useCallback((item: BrandSwitcherItem) => {
    if (item.disabled) return

    if (item.onSelect) {
      item.onSelect()
      return
    }

    if (item.url) {
      router.push(item.url)
    }
  }, [router])

  const handleQuickActionSelect = React.useCallback((url?: string, onSelect?: () => void) => {
    if (onSelect) {
      onSelect()
      return
    }

    if (url) {
      router.push(url)
    }
  }, [router])

  const collapsedIconButtonClass = "group-data-[collapsible=icon]:relative group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-foreground group-data-[collapsible=icon]:transition-all group-data-[collapsible=icon]:duration-200 group-data-[collapsible=icon]:before:absolute group-data-[collapsible=icon]:before:left-0 group-data-[collapsible=icon]:before:top-2 group-data-[collapsible=icon]:before:h-[calc(100%-1rem)] group-data-[collapsible=icon]:before:w-1 group-data-[collapsible=icon]:before:rounded-full group-data-[collapsible=icon]:before:bg-sidebar-primary group-data-[collapsible=icon]:before:opacity-0 group-data-[collapsible=icon]:before:transition-opacity group-data-[collapsible=icon]:hover:border-sidebar-border group-data-[collapsible=icon]:hover:bg-sidebar-accent group-data-[collapsible=icon]:hover:text-sidebar-foreground group-data-[collapsible=icon]:hover:shadow-sm group-data-[collapsible=icon]:hover:before:opacity-100 group-data-[collapsible=icon]:data-[active=true]:border-sidebar-primary group-data-[collapsible=icon]:data-[active=true]:bg-sidebar-primary group-data-[collapsible=icon]:data-[active=true]:text-sidebar-primary-foreground group-data-[collapsible=icon]:data-[active=true]:shadow-sm group-data-[collapsible=icon]:data-[active=true]:before:opacity-0 group-data-[collapsible=icon]:[&>svg]:text-current"

  const isActive = (url?: string) => {
    if (!url) return false
    if (url === "/") return pathname === "/"
    if (url === brand.url) return pathname === url
    return pathname.startsWith(url)
  }

  const isSubActive = (items?: NavSubItem[]): boolean => {
    if (!items) return false
    return items.some((item) => isActive(item.url) || isSubActive(item.items))
  }

  const renderSubItems = (items: NavSubItem[], level = 0) => {
    return (
      <SidebarMenuSub className={cn("mr-0 pr-0", level > 0 && "ml-3")}>
        {items.map((subItem) => {
          const hasNested = !!subItem.items?.length

          if (!hasNested) {
            return (
              <SidebarMenuSubItem key={`${subItem.title}-${subItem.url}`}>
                <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} className="h-8 rounded-md">
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                    {subItem.badge && <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-semibold">{subItem.badge}</Badge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          }

          return (
            <Collapsible key={`${subItem.title}-${level}`} asChild defaultOpen={isSubActive(subItem.items)} className="group/collapsible-sub">
              <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="h-8 rounded-md">
                    <span>{subItem.title}</span>
                    {subItem.badge && <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-semibold">{subItem.badge}</Badge>}
                    <ChevronRight className="ml-2 size-3 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible-sub:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>{renderSubItems(subItem.items || [], level + 1)}</CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          )
        })}
      </SidebarMenuSub>
    )
  }

  const renderCollapsedFlyoutItems = React.useCallback((items: NavSubItem[], level = 0): React.ReactNode => {
    const collectMatchedUrls = (subItems: NavSubItem[]): string[] => {
      const matches: string[] = []

      subItems.forEach((subItem) => {
        if (subItem.url && (pathname === subItem.url || pathname.startsWith(`${subItem.url}/`))) {
          matches.push(subItem.url)
        }

        if (subItem.items?.length) {
          matches.push(...collectMatchedUrls(subItem.items))
        }
      })

      return matches
    }

    const bestMatchedUrl = collectMatchedUrls(items).sort((a, b) => b.length - a.length)[0]

    return items.map((subItem) => {
      const hasNested = !!subItem.items?.length
      const SubItemIcon = subItem.icon || FileText

      if (!hasNested) {
        const isCurrent = bestMatchedUrl === subItem.url

        return (
          <Link
            key={`${subItem.title}-${subItem.url}-${level}`}
            href={subItem.url}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "hover:bg-accent hover:text-accent-foreground flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm transition-colors",
              isCurrent && "bg-sidebar-primary/12 text-sidebar-primary",
              level > 0 && "ml-3"
            )}
          >
              <SubItemIcon className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span className="flex-1 text-sm">{subItem.title}</span>
              {subItem.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                  {subItem.badge}
                </Badge>
              )}
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" />
          </Link>
        )
      }

      return (
        <div key={`${subItem.title}-${level}`} className={cn("space-y-1", level > 0 && "ml-3 border-l border-border/60 pl-3") }>
          <div className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/85">
            {subItem.title}
          </div>
          <div className="space-y-1">{renderCollapsedFlyoutItems(subItem.items || [], level + 1)}</div>
        </div>
      )
    })
  }, [pathname])

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className={cn("min-h-12 rounded-xl", isCollapsed ? "mx-auto justify-center px-0" : "px-3") }>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-foreground to-foreground/80 text-background shadow-sm group-data-[collapsible=icon]:size-9">
                    <brand.icon className="size-4 group-data-[collapsible=icon]:size-5" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold tracking-tight">{brand.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{brand.subtitle}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl p-0" side={isMobile ? "bottom" : "right"} align="start" sideOffset={12}>
                <DropdownMenuLabel className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {brandMenuLabel}
                </DropdownMenuLabel>
                <DropdownMenuGroup className="p-2">
                  {resolvedBrandOptions.map((item) => {
                    const Icon = item.icon
                    const isActiveBrand = item.title === brand.title && item.url === brand.url
                    const isDisabled = Boolean(item.disabled)

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        disabled={isDisabled}
                        className={cn(
                          "gap-3 rounded-xl px-3 py-2.5",
                          isDisabled && "cursor-not-allowed opacity-45 focus:bg-transparent"
                        )}
                        onClick={() => handleBrandSelect(item)}
                      >
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-xl border bg-background text-foreground",
                            isActiveBrand && !isDisabled && "rounded-full border-transparent bg-lime-300 text-black",
                            isDisabled && "border-muted bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="grid flex-1 text-left leading-tight">
                          <span className={cn("truncate font-medium", isDisabled && "text-muted-foreground")}>
                            {item.title}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-xs tracking-widest text-muted-foreground">{item.shortcut}</span>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
                {onAddBrand && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <DropdownMenuItem className="gap-3 rounded-xl px-3 py-2.5 text-muted-foreground" onClick={onAddBrand}>
                        <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                          <Plus className="size-5" />
                        </div>
                        <span className="font-medium">{addBrandLabel}</span>
                      </DropdownMenuItem>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {navGroups.map((group, index) => (
          <SidebarGroup key={index} className={cn(index > 0 ? "py-4 border-t border-sidebar-border" : "py-4", isCollapsed && "px-1") }>
            {group.label && (
              <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className={cn("px-2", isCollapsed && "px-0") }>
              <SidebarMenu className={cn(isCollapsed && "items-center gap-2 py-1") }>
                {group.items.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0

                  if (hasSubItems) {
                    if (isCollapsed) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger asChild>
                              <SidebarMenuButton
                                isActive={isSubActive(item.items)}
                                className={cn("h-10 rounded-lg transition-colors", collapsedIconButtonClass)}
                              >
                                <item.icon className="size-4 group-data-[collapsible=icon]:size-5" />
                              </SidebarMenuButton>
                            </HoverCardTrigger>

                            <HoverCardContent
                              side="right"
                              align="start"
                              sideOffset={0}
                              className="min-w-72 rounded-xl border bg-popover/95 p-2 shadow-2xl backdrop-blur supports-backdrop-filter:bg-popover/85"
                            >
                              <div className="px-2 pb-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</div>
                              </div>
                              <DropdownMenuSeparator />
                              <div className="max-h-[65vh] space-y-1 overflow-y-auto py-2 pr-1">
                                {renderCollapsedFlyoutItems(item.items || [])}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </SidebarMenuItem>
                      )
                    }

                    return (
                      <Collapsible key={item.title} asChild defaultOpen={isSubActive(item.items)} className="group/collapsible">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} isActive={isSubActive(item.items)} className={cn("h-10 rounded-lg transition-colors", collapsedIconButtonClass)}>
                              <item.icon className="size-4 group-data-[collapsible=icon]:size-5" />
                              {!isCollapsed && <span className="font-medium">{item.title}</span>}
                              {item.badge && !isCollapsed && (
                                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-semibold">{item.badge}</Badge>
                              )}
                              {!isCollapsed && <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {renderSubItems(item.items || [])}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className={cn("h-10 rounded-lg transition-colors", collapsedIconButtonClass)}>
                        <Link href={item.url || "#"}>
                          <item.icon className="size-4 group-data-[collapsible=icon]:size-5" />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                          {item.badge && !isCollapsed && (
                            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-semibold">{item.badge}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <SidebarMenuItem key={action.id}>
                <SidebarMenuButton
                  tooltip={action.label}
                  className="h-9 rounded-md transition-colors group-data-[collapsible=icon]:mx-auto"
                  onClick={() => handleQuickActionSelect(action.url, action.onSelect)}
                >
                  <Icon className="size-4 group-data-[collapsible=icon]:size-5" />
                  {!isCollapsed && <span className="font-medium">{action.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className={cn("h-auto rounded-lg p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", isCollapsed && "justify-center px-0") }>
                  <Avatar className="size-8 rounded-lg ring-1 ring-sidebar-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-linear-to-br from-muted to-muted/50 text-xs font-semibold">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl" side={isCollapsed ? "right" : "top"} align="end" sideOffset={8}>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-linear-to-br from-muted to-muted/50 font-semibold">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {showProfileMenuItem ? (
                    <DropdownMenuItem className="gap-2 rounded-lg" onSelect={() => openSettingsModal(profileSectionId)}>
                      <User className="size-4" /> {profileLabel}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem className="gap-2 rounded-lg" onSelect={() => openSettingsModal()}>
                    <Settings className="size-4" /> {settingsLabel}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="gap-2 rounded-lg text-red-600 focus:text-red-600">
                  <LogOut className="size-4" /> {logoutLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      </Sidebar>

      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(90vh,720px)] max-h-[90vh] w-full max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {activeSettingsSection?.label
              ? `${modalTitle} — ${activeSettingsSection.label}`
              : modalTitle}
          </DialogDescription>

          <div className="grid min-h-0 flex-1 md:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-y-auto border-r bg-muted/25 p-3">
              <div className="space-y-1">
                {resolvedSettingsSections.map((section) => {
                  const Icon = section.icon
                  const isActive = section.id === activeSettingsSectionId

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSettingsSectionId(section.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors",
                        isActive ? "bg-background font-medium text-foreground" : "text-foreground/90 hover:bg-background/70"
                      )}
                    >
                      {Icon ? (
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Settings2 className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{section.label}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col overflow-hidden">
              <header className="flex shrink-0 items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{modalRootBreadcrumb}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{activeSettingsSection?.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                  <span className="sr-only">{modalCloseSrText}</span>
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-8">
                {activeSettingsSection && settingsModalConfig?.renderContent ? (
                  settingsModalConfig.renderContent(activeSettingsSection)
                ) : (
                  <>
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <div className="h-6 w-40 rounded-md bg-muted" />
                      <div className="mt-3 h-36 rounded-xl bg-muted/80" />
                    </div>

                    <div className="mt-4 rounded-2xl border bg-muted/20 p-4">
                      <div className="h-6 w-48 rounded-md bg-muted" />
                      <div className="mt-3 h-40 rounded-xl bg-muted/80" />
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}