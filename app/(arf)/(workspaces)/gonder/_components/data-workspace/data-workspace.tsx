'use client'

import type { ReactNode } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent } from '@/components/ui/card'
import { WorkspaceHeader } from './workspace-header'
import { WorkspaceTabs, type WorkspaceTab } from './workspace-tabs'
import { WorkspaceToolbar } from './workspace-toolbar'
import type { ActiveFilterChip } from './active-filter-chips'
import { BulkActionBar } from './bulk-action-bar'

type Props<TView extends string> = {
  breadcrumbs: Array<{ label: string; href?: string }>
  title: string
  description?: string
  headerActions?: ReactNode
  tabs: Array<WorkspaceTab<TView>>
  view: TView
  onViewChange: (view: TView) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterChips?: ActiveFilterChip[]
  onClearFilters?: () => void
  toolbarTrailing?: ReactNode
  selectedCount?: number
  onClearSelection?: () => void
  bulkActions?: ReactNode
  children: ReactNode
}

export function DataWorkspace<TView extends string>({
  breadcrumbs,
  title,
  description,
  headerActions,
  tabs,
  view,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder,
  filterChips,
  onClearFilters,
  toolbarTrailing,
  selectedCount = 0,
  onClearSelection,
  bulkActions,
  children,
}: Props<TView>) {
  return (
    <>
      <AppHeader
        breadcrumbs={breadcrumbs}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceHeader title={title} description={description} actions={headerActions} />

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-3 p-3'>
            <WorkspaceTabs tabs={tabs} value={view} onChange={onViewChange} />
            <WorkspaceToolbar
              search={search}
              onSearchChange={onSearchChange}
              searchPlaceholder={searchPlaceholder}
              chips={filterChips}
              onClearFilters={onClearFilters}
              trailing={toolbarTrailing}
            />
            {onClearSelection ? (
              <BulkActionBar selectedCount={selectedCount} onClear={onClearSelection}>
                {bulkActions}
              </BulkActionBar>
            ) : null}
            {children}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
