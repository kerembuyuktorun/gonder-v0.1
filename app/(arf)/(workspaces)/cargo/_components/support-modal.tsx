"use client"

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpenText, LifeBuoy, Phone } from 'lucide-react'
import { supportTopics } from '../_data/nav'
import { ARF_ROUTES } from '../../../_shared/routes'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden p-0 sm:max-w-3xl'>
        <div className='border-b bg-linear-to-br from-lime-200/80 via-background to-background px-6 py-5'>
          <DialogHeader className='text-left'>
            <div className='mb-2 flex flex-wrap items-center gap-2'>
              <Badge className='bg-lime-300 text-black hover:bg-lime-300'>Yardım Merkezi</Badge>
              <Badge variant='outline'>Kargo V1.0</Badge>
            </div>
            <DialogTitle className='text-2xl font-semibold tracking-tight'>
              Yardım & Destek
            </DialogTitle>
            <DialogDescription className='max-w-2xl text-sm'>
              Operasyon, teslimat ve ekran kullanımıyla ilgili destek taleplerini buradan başlatabilirsiniz.
              Acil durumlarda öncelikli destek kanalını kullanın.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='space-y-6 px-6 py-5'>
          <section className='grid gap-3 md:grid-cols-3'>
            <a
              href='mailto:destek@kargosistemi.com?subject=ARF%20Kargo%20Destek%20Talebi'
              className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-lime-300 hover:bg-lime-50/60'
            >
              <LifeBuoy className='mb-3 size-5 text-foreground/80 transition-transform group-hover:scale-105' />
              <p className='text-sm font-semibold'>Yeni Destek Talebi</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Destek ekibine e-posta ile ekran görüntüsü ekleyerek detaylı talep açın.
              </p>
            </a>

            <a
              href='tel:+902120000000'
              className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-lime-300 hover:bg-lime-50/60'
            >
              <Phone className='mb-3 size-5 text-foreground/80 transition-transform group-hover:scale-105' />
              <p className='text-sm font-semibold'>Acil Operasyon Hattı</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Kritik sevkiyat sorunlarında doğrudan canlı operasyon hattını arayın.
              </p>
            </a>

            <button
              type='button'
              onClick={() => {
                router.push(ARF_ROUTES.cargo.support)
              }}
              className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-lime-300 hover:bg-lime-50/60'
            >
              <BookOpenText className='mb-3 size-5 text-foreground/80 transition-transform group-hover:scale-105' />
              <p className='text-sm font-semibold'>Destek Dokümantasyonu</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Sık yapılan işlemler ve kullanım adımlarını tek noktadan görüntüleyin.
              </p>
            </button>
          </section>

          <section className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-xl border border-border bg-muted/20 p-4'>
              <p className='mb-3 text-sm font-semibold'>Sık Yardım Başlıkları</p>
              <div className='space-y-2'>
                {supportTopics.map((topic) => (
                  <div key={topic} className='rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-foreground/85'>
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-xl border border-border bg-muted/20 p-4'>
              <p className='mb-3 text-sm font-semibold'>Servis Bilgisi</p>
              <div className='space-y-3 text-xs text-muted-foreground'>
                <div className='rounded-lg border border-border/70 bg-background px-3 py-2'>
                  <p className='font-medium text-foreground'>Destek Saatleri</p>
                  <p>Pazartesi - Cumartesi, 08:00 - 22:00</p>
                </div>
                <div className='rounded-lg border border-border/70 bg-background px-3 py-2'>
                  <p className='font-medium text-foreground'>Hedef İlk Yanıt Süresi</p>
                  <p>Kritik taleplerde 15 dk, standart taleplerde 2 saat</p>
                </div>
                <div className='rounded-lg border border-border/70 bg-background px-3 py-2'>
                  <p className='font-medium text-foreground'>Öneri</p>
                  <p>Talep açarken takip no ve parça no bilgilerini ekleyin.</p>
                </div>
              </div>
            </div>
          </section>

          <div className='flex flex-wrap justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
            <Button
              asChild
              className='bg-lime-400 text-black hover:bg-lime-300'
            >
              <a href='mailto:destek@kargosistemi.com?subject=ARF%20Kargo%20Destek%20Talebi'>Talep Oluştur</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
