'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { FleetSlice } from '../_types/dashboard'

interface Props {
  data: FleetSlice[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className='rounded-lg border bg-white px-3 py-2 shadow-md'>
      <p className='text-sm font-medium text-slate-900'>{item.name}</p>
      <p className='text-sm text-slate-600'>{item.value.toLocaleString('tr-TR')} kurye</p>
    </div>
  )
}

export function DashboardFleetChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-medium'>Filo Durumu</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col items-center gap-4 pt-0 sm:flex-row'>
        <div className='relative size-36 shrink-0'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={58}
                paddingAngle={3}
                dataKey='value'
                stroke='none'
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-lg font-semibold tracking-tight'>{total}</span>
            <span className='text-[10px] text-muted-foreground'>Kurye</span>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          {data.map((item) => (
            <div key={item.name} className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='size-2.5 rounded-full' style={{ backgroundColor: item.color }} />
                <span className='text-sm text-slate-600'>{item.name}</span>
              </div>
              <span className='text-sm font-medium tabular-nums'>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
