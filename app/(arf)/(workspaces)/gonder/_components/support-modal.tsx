"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LifeBuoy, Phone } from 'lucide-react'
import { supportTopics } from '../_data/nav'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[min(90vh,720px)] overflow-y-auto p-0 sm:max-w-3xl'>
        <div className='border-b bg-linear-to-br from-lime-200/80 via-background to-background px-4 py-5 sm:px-6'>
          <DialogHeader className='text-left'>
            <div className='mb-2 flex flex-wrap items-center gap-2'>
              <Badge className='bg-lime-300 text-black hover:bg-lime-300'>Yardım Merkezi</Badge>
              <Badge variant='outline'>Gönder V1.0</Badge>
            </div>
            <DialogTitle className='text-2xl font-semibold tracking-tight'>
              Yardım & Destek
            </DialogTitle>
            <DialogDescription className='max-w-2xl text-sm'>
              Gönder paneliyle ilgili destek taleplerini buradan başlatabilirsiniz.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='space-y-3 px-4 py-5 sm:px-6'>
          <section className='grid gap-3 md:grid-cols-2'>
            <a
              href='mailto:destek@kargosistemi.com?subject=ARF%20Gonder%20Destek%20Talebi'
              className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-lime-300 hover:bg-lime-50/60'
            >
              <LifeBuoy className='mb-3 size-5 text-foreground/80 transition-transform group-hover:scale-105' />
              <p className='text-sm font-semibold'>Yeni Destek Talebi</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Destek ekibine ekran görüntüsü ekleyerek detaylı talep açın.
              </p>
            </a>

            <a
              href='tel:+902120000000'
              className='group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-lime-300 hover:bg-lime-50/60'
            >
              <Phone className='mb-3 size-5 text-foreground/80 transition-transform group-hover:scale-105' />
              <p className='text-sm font-semibold'>Acil Operasyon Hattı</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Kritik durumlarda canlı operasyon hattı ile iletişime geçin.
              </p>
            </a>
          </section>

          <section className='rounded-xl border border-border bg-muted/20 p-4'>
            <p className='mb-3 text-sm font-semibold'>Sık Yardım Başlıkları</p>
            <div className='space-y-2'>
              {supportTopics.map((topic) => (
                <div
                  key={topic}
                  className='rounded-lg border border-border/70 bg-background px-3 py-2 text-xs text-foreground/85'
                >
                  {topic}
                </div>
              ))}
            </div>
          </section>

          <div className='flex flex-wrap justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
            <Button asChild className='bg-lime-400 text-black hover:bg-lime-300'>
              <a href='mailto:destek@kargosistemi.com?subject=ARF%20Gonder%20Destek%20Talebi'>
                Talep Oluştur
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
