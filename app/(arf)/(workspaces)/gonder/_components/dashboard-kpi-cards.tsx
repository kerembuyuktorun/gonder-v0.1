"use client"

import Link from 'next/link'
import { Calculator, CheckCircle2, ClipboardList, FileSpreadsheet, Link2, Plus, Quote, Truck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardKpiItem } from '../_types/dashboard'

const iconMap = {
  clipboard: ClipboardList,
  truck: Truck,
  check: CheckCircle2,
  quote: Quote,
} as const

interface Props {
  items: DashboardKpiItem[]
}

export function DashboardKpiCards({ items }: Props) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map((kpi) => {
        const Icon = iconMap[(kpi.icon as keyof typeof iconMap) ?? 'clipboard'] ?? ClipboardList

        return (
          <Link key={kpi.id} href={kpi.href} className='group block'>
            <Card className='h-full transition-colors group-hover:border-foreground/30'>
              <CardContent className='p-3'>
                <div className='flex size-8 items-center justify-center rounded-md bg-muted'>
                  <Icon className='size-4 text-muted-foreground' />
                </div>
                <div className='mt-2'>
                  <span className='text-xl font-semibold tracking-tight'>{kpi.value}</span>
                  <p className='mt-1 text-xs text-muted-foreground'>{tDashboard(kpi.labelKey)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export const quickActionIconMap = {
  plus: Plus,
  calculator: Calculator,
  fileSpreadsheet: FileSpreadsheet,
  link: Link2,
} as const
