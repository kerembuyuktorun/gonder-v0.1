'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { REPORT_CATALOG, REPORT_GROUP_LABELS } from '../../_data/report-catalog'
import type { ReportSlug } from '../../_types/reports'
import { ReportDateRangeToolbar } from './report-date-range-toolbar'

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
  const pathname = usePathname()
  const groups = (['core', 'ops', 'finance', 'workspace'] as const).map((group) => ({
    group,
    label: REPORT_GROUP_LABELS[group],
    items: REPORT_CATALOG.filter((item) => item.group === group),
  }))

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

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-start'>
        <aside className='w-full shrink-0 space-y-3 lg:sticky lg:top-3 lg:w-56'>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-3 p-3'>
              <div>
                <p className='text-sm font-semibold'>Raporlar</p>
                <p className='text-xs text-muted-foreground'>Lojistik analitik merkezi</p>
              </div>
              {groups.map((section) => (
                <div key={section.group} className='space-y-1'>
                  <p className='px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                    {section.label}
                  </p>
                  <nav className='space-y-0.5'>
                    {section.items.map((item) => {
                      const active = pathname === item.href || slug === item.slug
                      return (
                        <Link
                          key={item.slug}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                            active
                              ? 'bg-primary/10 font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          <span className='truncate'>{item.title}</span>
                          {item.maturity === 'planned' ? (
                            <Badge variant='secondary' className='text-[9px]'>
                              Plan
                            </Badge>
                          ) : null}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className='min-w-0 flex-1 space-y-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
              {description ? (
                <p className='text-sm text-muted-foreground'>{description}</p>
              ) : null}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {headerActions}
              {showDateRange ? <ReportDateRangeToolbar /> : null}
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
