'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { DailyDeliveryPoint } from '../_types/dashboard'

interface Props {
  data: DailyDeliveryPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-lg border bg-white px-3 py-2 shadow-md'>
      <p className='mb-1 text-sm font-medium text-slate-900'>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className='text-sm text-slate-600'>
          <span className='mr-1 inline-block size-2 rounded-full' style={{ backgroundColor: p.color }} />
          {p.name}: {p.value.toLocaleString('tr-TR')}
        </p>
      ))}
    </div>
  )
}

export function DashboardDeliveryTrendChart({ data }: Props) {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-medium'>Haftalık Teslimat Trendi</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 pt-0'>
        <div className='h-48'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' />
              <XAxis
                dataKey='day'
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => (value === 'teslim' ? 'Teslim' : 'İptal')}
              />
              <Bar dataKey='teslim' name='teslim' fill='#10b981' radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey='iptal' name='iptal' fill='#f87171' radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
