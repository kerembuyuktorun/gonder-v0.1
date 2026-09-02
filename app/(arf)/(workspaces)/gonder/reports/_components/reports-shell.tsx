'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { REPORT_CATALOG, REPORT_GROUP_LABELS } from '../../_data/report-catalog'
import type { ReportCatalogItem, ReportSlug } from '../../_types/reports'
import { ReportDateRangeToolbar } from './report-date-range-toolbar'

const REPORT_NAV_GROUPS = (['core', 'ops', 'finance', 'workspace'] as const).map((group) => ({
  group,
  label: REPORT_GROUP_LABELS[group],
  items: REPORT_CATALOG.filter((item) => item.group === group),
}))

type Props = {
  title: string
  description?: string
  slug: ReportSlug
  children: React.ReactNode
  /** Planned sayfalarda tarih filtresi gizlenebilir */
  showDateRange?: boolean
  headerActions?: React.ReactNode
}

export function ReportsShell({
  title,
  description,
  slug,
  children,
  showDateRange = true,
  headerActions,
}: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: ARF_ROUTES.gonder.root },
          { label: 'Raporlar', href: ARF_ROUTES.gonder.reports.root },
          { label: title },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between'>
          <div className='min-w-0 space-y-1'>
            <h1 className='truncate text-xl font-semibold tracking-tight sm:text-2xl'>
              {title}
            </h1>
            {description ? (
              <p className='text-sm text-muted-foreground'>{description}</p>
            ) : null}
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {headerActions}
            {showDateRange ? <ReportDateRangeToolbar /> : null}
          </div>
        </div>

        <ReportsTabBar slug={slug} />

        <div className='min-w-0'>{children}</div>
      </div>
    </>
  )
}

function ReportsTabBar({ slug }: { slug: ReportSlug }) {
  const pathname = usePathname()

  return (
    <div className='-mx-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <nav
        className='flex w-max min-w-full items-stretch gap-3 border-b px-1'
        aria-label='Raporlar'
      >
        {REPORT_NAV_GROUPS.map((section, index) => (
          <div
            key={section.group}
            className={cn(
              'flex min-w-0 flex-col',
              index > 0 && 'border-l border-border pl-3'
            )}
          >
            <p className='px-2.5 pt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              {section.label}
            </p>
            <div className='flex'>
              {section.items.map((item) => (
                <ReportsTabLink
                  key={item.slug}
                  item={item}
                  active={pathname === item.href || slug === item.slug}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

function ReportsTabLink({
  item,
  active,
}: {
  item: ReportCatalogItem
  active: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!active) return
    ref.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [active])

  return (
    <Link
      ref={ref}
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors sm:px-3',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      <span className='max-w-[11rem] truncate sm:max-w-none'>{item.title}</span>
      {item.maturity === 'planned' ? (
        <Badge variant='secondary' className='text-[9px]'>
          Plan
        </Badge>
      ) : null}
    </Link>
  )
}
