'use client'

import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PriceCalculationLocation } from '../_types/price-calculation'
import { PriceLocationField } from './price-location-field'

type Props = {
  origin: PriceCalculationLocation | null
  destination: PriceCalculationLocation | null
  onOriginChange: (value: PriceCalculationLocation | null) => void
  onDestinationChange: (value: PriceCalculationLocation | null) => void
  onSwap: () => void
  originInvalid?: boolean
  destinationInvalid?: boolean
}

export function PriceRouteLocations({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  originInvalid,
  destinationInvalid,
}: Props) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
        <CardTitle className='text-sm font-semibold'>Rota</CardTitle>
      </CardHeader>
      <CardContent className='px-3 pb-3 pt-0'>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start'>
          <PriceLocationField
            label='Nereden?'
            value={origin}
            onSelect={onOriginChange}
            onClear={() => onOriginChange(null)}
            invalid={originInvalid}
          />

          <div className='flex items-center justify-center md:pt-6'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='size-9 shrink-0 rounded-full'
              onClick={onSwap}
              disabled={!origin && !destination}
              aria-label='Nereden ve nereye konumlarını değiştir'
            >
              <ArrowUpDown className='size-4' />
            </Button>
          </div>

          <PriceLocationField
            label='Nereye?'
            value={destination}
            onSelect={onDestinationChange}
            onClear={() => onDestinationChange(null)}
            invalid={destinationInvalid}
          />
        </div>

        {(originInvalid && !origin?.label) || (destinationInvalid && !destination?.label) ? (
          <p className='mt-2 text-[11px] text-destructive'>Nereden ve nereye konumları zorunludur</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
