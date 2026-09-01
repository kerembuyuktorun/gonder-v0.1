'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuoteLanding } from './quote-context'
import { CITY_MAP_COORDS, TURKEY_CITIES } from '../_lib/turkey-cities'

const MAP_CITIES = TURKEY_CITIES.filter((c) => CITY_MAP_COORDS[c])

function TurkeyOutline() {
  return (
    <path
      d='M8 18 C12 8, 28 6, 42 12 C58 8, 78 14, 82 28 C88 38, 84 52, 76 62 C68 72, 52 78, 38 74 C24 70, 12 58, 8 42 Z'
      fill='rgba(255,255,255,0.06)'
      stroke='rgba(255,255,255,0.25)'
      strokeWidth='0.8'
    />
  )
}

export function NetworkMapSection() {
  const { prefillRoute, scrollToQuote } = useQuoteLanding()
  const [origin, setOrigin] = useState('İstanbul')
  const [dest, setDest] = useState('Ankara')

  const originCoord = CITY_MAP_COORDS[origin]
  const destCoord = CITY_MAP_COORDS[dest]

  const routeLine = useMemo(() => {
    if (!originCoord || !destCoord || origin === dest) return null
    return { x1: originCoord.x, y1: originCoord.y, x2: destCoord.x, y2: destCoord.y }
  }, [origin, dest, originCoord, destCoord])

  return (
    <section id='navlun-agi' className='gl-section scroll-mt-16 bg-[#195B55] text-white'>
      <div className='gl-container'>
        <div className='grid items-center gap-10 lg:grid-cols-2'>
          <div className='space-y-5'>
            <h2 className='text-3xl font-bold sm:text-4xl'>81 il. Tek navlun ağı.</h2>
            <p className='text-lg text-white/80'>Ambar taşımacılığını dijitalleştiriyoruz.</p>
            <p className='text-sm leading-relaxed text-white/70'>
              Yerel ambarları ve taşıma ağlarını ortak bir dijital yapıda buluşturuyoruz. Yüküne uygun hattı
              bulmanı, teklif almanı ve taşıma sürecini takip etmeni kolaylaştırıyoruz.
            </p>
            <ul className='space-y-2 text-sm text-white/75'>
              <li>· Ambar hatlarının dijital görünürlüğü</li>
              <li>· Standart yük bilgisi iletimi</li>
              <li>· Kapasiteye göre eşleştirme</li>
              <li>· Tekliflerin tek talep üzerinden takibi</li>
            </ul>
            <div className='flex flex-wrap gap-3 pt-2'>
              <button
                type='button'
                className='gl-btn-primary'
                onClick={() => prefillRoute(origin, dest, 'lojistik')}
              >
                Bu hatta teklif al
              </button>
              <button type='button' className='gl-btn-secondary border-white/30 bg-transparent text-white hover:border-white'>
                Taşıma Ağına Katıl
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-white/80'>Çıkış ili</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className='border-white/20 bg-white/10 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-white/80'>Varış ili</Label>
                <Select value={dest} onValueChange={setDest}>
                  <SelectTrigger className='border-white/20 bg-white/10 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 bg-[#144a45]'>
              <svg viewBox='0 0 100 80' className='h-full w-full' aria-label='Türkiye haritası'>
                <TurkeyOutline />
                {routeLine ? (
                  <line
                    x1={routeLine.x1}
                    y1={routeLine.y1}
                    x2={routeLine.x2}
                    y2={routeLine.y2}
                    stroke='var(--gl-accent)'
                    strokeWidth='1.2'
                    strokeDasharray='2 1.5'
                    opacity='0.9'
                  />
                ) : null}
                {MAP_CITIES.map((city) => {
                  const coord = CITY_MAP_COORDS[city]
                  if (!coord) return null
                  const active = city === origin || city === dest
                  return (
                    <g key={city}>
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={active ? 2.8 : 1.8}
                        fill={active ? 'var(--gl-accent)' : 'rgba(255,255,255,0.7)'}
                      />
                      {active ? (
                        <text
                          x={coord.x}
                          y={coord.y - 4}
                          textAnchor='middle'
                          fontSize='3.5'
                          fill='white'
                          className='select-none'
                        >
                          {city}
                        </text>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
              <p className='absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-white/50'>
                <MapPin className='size-3' />
                Örnek harita — gerçek kapasite verisi yok
              </p>
            </div>

            <Button
              variant='outline'
              className='w-full border-white/30 bg-transparent text-white hover:bg-white/10 lg:hidden'
              onClick={() => {
                prefillRoute(origin, dest, 'lojistik')
                scrollToQuote()
              }}
            >
              Yüküm İçin Teklif Al
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
