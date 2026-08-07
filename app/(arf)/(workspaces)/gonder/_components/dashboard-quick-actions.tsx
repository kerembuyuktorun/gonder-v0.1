'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardQuickAction, QuickActionTone } from '../_types/dashboard'
import { quickActionIconMap } from './dashboard-kpi-cards'

const toneStyles: Record<
  QuickActionTone,
  { surface: string; badge: string; icon: string; hoverBorder: string }
> = {
  brand: {
    surface: 'bg-primary/10',
    badge: 'bg-primary text-primary-foreground',
    icon: 'text-primary-foreground',
    hoverBorder: 'group-hover:border-primary/40',
  },
  success: {
    surface: 'bg-emerald-500/10',
    badge: 'bg-emerald-500 text-white',
    icon: 'text-white',
    hoverBorder: 'group-hover:border-emerald-500/40',
  },
  warning: {
    surface: 'bg-amber-500/10',
    badge: 'bg-amber-500 text-white',
    icon: 'text-white',
    hoverBorder: 'group-hover:border-amber-500/40',
  },
  info: {
    surface: 'bg-sky-500/10',
    badge: 'bg-sky-500 text-white',
    icon: 'text-white',
    hoverBorder: 'group-hover:border-sky-500/40',
  },
  neutral: {
    surface: 'bg-muted/60',
    badge: 'bg-muted-foreground text-background',
    icon: 'text-background',
    hoverBorder: 'group-hover:border-foreground/30',
  },
}

interface Props {
  actions: DashboardQuickAction[]
}

export function DashboardQuickActions({ actions }: Props) {
  return (
    <div className='grid gap-3 md:grid-cols-3'>
      {actions.map((action) => {
        const Icon =
          quickActionIconMap[(action.icon as keyof typeof quickActionIconMap) ?? 'plus'] ??
          quickActionIconMap.plus
        const styles = toneStyles[action.tone] ?? toneStyles.neutral
        const description = action.descriptionKey
          ? tDashboard(action.descriptionKey)
          : null
        const badge = action.badgeKey ? tDashboard(action.badgeKey) : null

        const card = (
          <Card
            className={cn(
              'h-full min-h-[140px] gap-0 border py-0 shadow-sm transition-all duration-200',
              styles.surface,
              action.disabled
                ? 'cursor-not-allowed opacity-50'
                : cn(
                    'group-hover:-translate-y-0.5 group-hover:shadow-md',
                    styles.hoverBorder
                  )
            )}
          >
            <CardContent className='flex h-full flex-col gap-4 p-4 sm:p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full shadow-sm',
                    styles.badge
                  )}
                >
                  <Icon className={cn('size-5', styles.icon)} />
                </div>
                {badge ? (
                  <Badge variant='secondary' className='text-[10px]'>
                    {badge}
                  </Badge>
                ) : null}
              </div>
              <div className='mt-auto min-w-0 space-y-1'>
                <p className='text-base font-semibold tracking-tight'>
                  {tDashboard(action.titleKey)}
                </p>
                {description ? (
                  <p className='line-clamp-1 text-sm text-muted-foreground'>{description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )

        if (action.disabled) {
          return (
            <div key={action.id} className='block' aria-disabled>
              {card}
            </div>
          )
        }

        return (
          <Link key={action.id} href={action.href} className='group block'>
            {card}
          </Link>
        )
      })}
    </div>
  )
}
