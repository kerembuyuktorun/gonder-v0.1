'use client'

import type { ReactNode } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { WorkspaceHeader } from '../../_components/data-workspace'

type Props = {
  breadcrumbs: Array<{ label: string; href?: string }>
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function FinancePageShell({ breadcrumbs, title, description, actions, children }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={breadcrumbs}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />
      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceHeader title={title} description={description} actions={actions} />
        {children}
      </div>
    </>
  )
}
