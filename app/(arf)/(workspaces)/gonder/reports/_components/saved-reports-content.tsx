'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSavedReportViews } from '../../_hooks/use-reports-analytics'
import { ReportsShell } from './reports-shell'
import { ReportPlannedState } from './report-planned-state'

export function SavedReportsContent() {
  const { data, isLoading } = useSavedReportViews()

  return (
    <ReportsShell
      slug='saved'
      title='Kayıtlı görünümler'
      description='Kaydedilmiş filtre ve rapor kısayolları (planlı workspace)'
      showDateRange={false}
    >
      <ReportPlannedState
        title='Kayıtlı görünümler genişletilecek'
        description='Paylaşılan filtreler, zamanlanmış export ve ekip favorileri sonraki dilimde.'
        roadmap={[
          'Kişisel / ekip kayıtlı filtreler',
          'Zamanlanmış Excel export',
          'Dashboard’a pinleme',
        ]}
      />
      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Yükleniyor…</p>
      ) : (
        <div className='grid gap-2 sm:grid-cols-2'>
          {(data ?? []).map((item) => (
            <Link key={item.id} href={item.href} className='block'>
              <Card className='gap-0 border py-0 shadow-sm transition-colors hover:border-primary/30'>
                <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1'>
                  <CardTitle className='text-sm font-semibold'>{item.title}</CardTitle>
                  <Badge variant='secondary' className='text-[10px]'>
                    {item.reportSlug}
                  </Badge>
                </CardHeader>
                <CardContent className='px-3 pb-3 text-xs text-muted-foreground'>
                  {new Intl.DateTimeFormat('tr-TR').format(new Date(item.createdAt))}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </ReportsShell>
  )
}
