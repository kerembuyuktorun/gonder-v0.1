'use client'

import Link from 'next/link'
import { ChevronRight, ClipboardList, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { tDashboard } from '../_data/dashboard-labels'

type ActionCard = {
  id: string
  titleKey: string
  descriptionKey: string
  ctaKey: string
  count: number
  href: string
  icon: typeof ClipboardList
  tone: 'warning' | 'info'
}

type Props = {
  newOrdersCount: number
  newQuotesCount: number
  ordersHref: string
  quotesHref: string
  className?: string
}

const toneStyles = {
  warning: {
    surface: 'bg-amber-500/10',
    icon: 'bg-amber-500 text-white',
    hover: 'group-hover:border-amber-500/40',
  },
  info: {
    surface: 'bg-sky-500/10',
    icon: 'bg-sky-500 text-white',
    hover: 'group-hover:border-sky-500/40',
  },
} as const

export function DashboardActionSummaries({
  newOrdersCount,
  newQuotesCount,
  ordersHref,
  quotesHref,
  className,
}: Props) {
  const cards: ActionCard[] = [
    {
      id: 'orders',
      titleKey: 'action.orders.title',
      descriptionKey: 'action.orders.description',
      ctaKey: 'action.orders.cta',
      count: newOrdersCount,
      href: ordersHref,
      icon: ClipboardList,
      tone: 'warning',
    },
    {
      id: 'quotes',
      titleKey: 'action.quotes.title',
      descriptionKey: 'action.quotes.description',
      ctaKey: 'action.quotes.cta',
      count: newQuotesCount,
      href: quotesHref,
      icon: Quote,
      tone: 'info',
    },
  ]

  return (
    <div className={cn('grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1', className)}>
      {cards.map((card) => {
        const Icon = card.icon
        const styles = toneStyles[card.tone]

        return (
          <Link key={card.id} href={card.href} className='group block min-w-0'>
            <Card
              className={cn(
                'h-full gap-0 border py-0 shadow-sm transition-all duration-200',
                styles.surface,
                'group-hover:-translate-y-0.5 group-hover:shadow-md',
                styles.hover
              )}
            >
              <CardContent className='flex h-full flex-col gap-3 p-3.5 sm:p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm',
                      styles.icon
                    )}
                  >
                    <Icon className='size-4' />
                  </div>
                  <p className='text-3xl font-semibold tabular-nums tracking-tight'>
                    {card.count}
                  </p>
                </div>
                <div className='min-w-0 space-y-1'>
                  <p className='text-sm font-semibold'>{tDashboard(card.titleKey)}</p>
                  <p className='line-clamp-1 text-xs text-muted-foreground'>
                    {tDashboard(card.descriptionKey)}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-auto h-8 justify-start gap-1 px-0 text-sm font-medium'
                  asChild
                >
                  <span>
                    {tDashboard(card.ctaKey)}
                    <ChevronRight className='size-3.5' />
                  </span>
                </Button>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
