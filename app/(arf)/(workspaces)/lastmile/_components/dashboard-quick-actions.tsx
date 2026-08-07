'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Route,
  Radio,
  Wallet,
  ChevronRight,
  AlertTriangle,
  Info,
  Siren,
} from 'lucide-react'
import Link from 'next/link'
import type { OpsAlert, QuickAction } from '../_types/dashboard'

const actionIcons = [Plus, Route, Radio, Wallet]

const severityConfig = {
  critical: {
    icon: Siren,
    className: 'bg-red-500/10 text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-500/10 text-amber-600',
  },
  info: {
    icon: Info,
    className: 'bg-sky-500/10 text-sky-600',
  },
} as const

interface Props {
  actions: QuickAction[]
  alerts: OpsAlert[]
}

export function DashboardQuickActions({ actions, alerts }: Props) {
  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='text-base font-medium'>Hızlı İşlemler</CardTitle>
          <CardDescription className='text-sm'>Sık kullanılan ekranlar</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-2'>
          {actions.map((action, i) => {
            const Icon = actionIcons[i % actionIcons.length]
            return (
              <Link
                key={action.title}
                href={action.href}
                className='flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-muted/50'
              >
                <div className='flex size-9 items-center justify-center rounded-md bg-primary/10'>
                  <Icon className='size-4 text-primary' />
                </div>
                <div>
                  <p className='text-sm font-medium'>{action.title}</p>
                  <p className='text-xs text-muted-foreground'>{action.description}</p>
                </div>
                <ChevronRight className='ml-auto size-4 text-muted-foreground' />
              </Link>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='text-base font-medium'>Operasyon Uyarıları</CardTitle>
          <CardDescription className='text-sm'>Dikkat gerektiren konular</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity]
            const Icon = cfg.icon
            return (
              <div key={alert.id} className='flex gap-3'>
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${cfg.className}`}>
                  <Icon className='size-4' />
                </div>
                <div>
                  <p className='text-sm font-medium'>{alert.title}</p>
                  <p className='text-xs text-muted-foreground'>{alert.detail}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
