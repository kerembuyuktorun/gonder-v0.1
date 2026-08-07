'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { REPORT_CATALOG } from '../../_data/report-catalog'
import type { ReportMaturity } from '../../_types/reports'

type Props = {
  maturity?: ReportMaturity | 'all'
}

export function ReportCatalogGrid({ maturity = 'all' }: Props) {
  const items =
    maturity === 'all'
      ? REPORT_CATALOG
      : REPORT_CATALOG.filter((item) => item.maturity === maturity)

  return (
    <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map((item) => (
        <Link key={item.slug} href={item.href} className='group block'>
          <Card className='h-full gap-0 border py-0 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md'>
            <CardHeader className='flex flex-row items-start justify-between gap-2 space-y-0 px-3 pt-3 pb-1'>
              <CardTitle className='text-sm font-semibold'>{item.title}</CardTitle>
              <Badge variant={item.maturity === 'mvp' ? 'outline' : 'secondary'} className='text-[10px]'>
                {item.maturity === 'mvp' ? 'MVP' : 'Planlı'}
              </Badge>
            </CardHeader>
            <CardContent className='px-3 pb-3'>
              <p className='text-xs text-muted-foreground'>{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
