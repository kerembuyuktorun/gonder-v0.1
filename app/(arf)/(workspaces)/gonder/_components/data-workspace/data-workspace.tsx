'use client'

import type { ReactNode } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent } from '@/components/ui/card'
import { WorkspaceHeader } from './workspace-header'
import { WorkspaceTabs, type WorkspaceTab } from './workspace-tabs'
import { WorkspaceToolbar } from './workspace-toolbar'
import type { ActiveFilterChip } from './active-filter-chips'
import { BulkActionBar } from './bulk-action-bar'

type Props<TView extends string, TPrimary extends string = string> = {
  breadcrumbs: Array<{ label: string; href?: string }>
  title: string
  description?: string
  headerActions?: ReactNode
  /** Birincil sekme satırı (ör. operasyon tipi) */
  primaryTabs?: Array<WorkspaceTab<TPrimary>>
  primaryView?: TPrimary
  onPrimaryViewChange?: (view: TPrimary) => void
  /** İkincil / varsayılan sekme satırı (ör. durum görünümü) */
  tabs: Array<WorkspaceTab<TView>>
  view: TView
  onViewChange: (view: TView) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterChips?: ActiveFilterChip[]
  onClearFilters?: () => void
  onOpenFilters?: () => void
  toolbarTrailing?: ReactNode
  selectedCount?: number
  onClearSelection?: () => void
  bulkActions?: ReactNode
  children: ReactNode
}

export function DataWorkspace<TView extends string, TPrimary extends string = string>({
  breadcrumbs,
  title,
  description,
  headerActions,
  primaryTabs,
  primaryView,
  onPrimaryViewChange,
  tabs,
  view,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder,
  filterChips,
  onClearFilters,
  onOpenFilters,
  toolbarTrailing,
  selectedCount = 0,
  onClearSelection,
  bulkActions,
  children,
}: Props<TView, TPrimary>) {
  return (
    <>
      <AppHeader
        breadcrumbs={breadcrumbs}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceHeader title={title} description={description} actions={headerActions} />

        <Card className='min-w-0 gap-0 py-0 shadow-sm'>
          <CardContent className='min-w-0 space-y-3 p-3 sm:p-4'>
            <div className='space-y-1'>
              {primaryTabs && primaryView != null && onPrimaryViewChange ? (
                <WorkspaceTabs
                  tabs={primaryTabs}
                  value={primaryView}
                  onChange={onPrimaryViewChange}
                />
              ) : null}
              <WorkspaceTabs tabs={tabs} value={view} onChange={onViewChange} />
            </div>
            <WorkspaceToolbar
              search={search}
              onSearchChange={onSearchChange}
              searchPlaceholder={searchPlaceholder}
              chips={filterChips}
              onClearFilters={onClearFilters}
              onOpenFilters={onOpenFilters}
              trailing={toolbarTrailing}
            />
            {onClearSelection ? (
              <BulkActionBar selectedCount={selectedCount} onClear={onClearSelection}>
                {bulkActions}
              </BulkActionBar>
            ) : null}
            <div className='min-w-0'>{children}</div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
