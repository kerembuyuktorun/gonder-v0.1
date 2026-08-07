'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ARF_ROUTES } from '../../../../_shared/routes'

type Props = {
  title: string
  description: string
  roadmap?: string[]
}

export function ReportPlannedState({ title, description, roadmap = [] }: Props) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='space-y-1 px-4 pt-4 pb-2'>
        <CardTitle className='text-base'>{title}</CardTitle>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </CardHeader>
      <CardContent className='space-y-3 px-4 pb-4'>
        {roadmap.length ? (
          <ul className='list-inside list-disc space-y-1 text-sm text-muted-foreground'>
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <Button asChild size='sm' variant='outline'>
          <Link href={ARF_ROUTES.gonder.reports.overview}>Genel bakışa dön</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
