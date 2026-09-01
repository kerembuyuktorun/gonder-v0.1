'use client'

import { useState } from 'react'
import { Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function BusinessCta() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', note: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id='isletme' className='gl-section scroll-mt-16'>
      <div className='gl-container'>
        <div className='gl-card grid gap-8 overflow-hidden lg:grid-cols-[1fr_auto] lg:items-center lg:p-10'>
          <div className='space-y-4 p-6 lg:p-0'>
            <span className='inline-flex size-10 items-center justify-center rounded-xl bg-[var(--gl-yellow-soft)] text-[var(--gl-ink)]'>
              <Building2 className='size-5' aria-hidden />
            </span>
            <h2 className='text-2xl font-bold sm:text-3xl'>Her gün gönderiyorsan, birlikte planlayalım.</h2>
            <p className='max-w-lg text-[var(--gl-muted)]'>
              Toplu gönderim, entegrasyon kurulumu ve düzenli taşıma hatları için işletmene özel destek sunuyoruz.
            </p>
            <ul className='space-y-1 text-sm text-[var(--gl-muted)]'>
              <li>· Pazaryeri ve ERP entegrasyonu</li>
              <li>· Toplu gönderi ve fiyat listeleri</li>
              <li>· Düzenli hat planlaması</li>
            </ul>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='mx-6 mb-6 bg-[var(--gl-accent)] hover:bg-[var(--gl-accent-hover)] lg:mx-0 lg:mb-0'>
                İşletmem İçin Görüşelim
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>İşletme görüşmesi</DialogTitle>
                <DialogDescription>
                  Kısa bir form bırak, ekibimiz seninle iletişime geçsin.
                </DialogDescription>
              </DialogHeader>
              {submitted ? (
                <div className='flex flex-col items-center gap-3 py-6 text-center'>
                  <CheckCircle2 className='size-10 text-[var(--gl-petrol)]' />
                  <p className='font-medium'>Talebin alındı</p>
                  <p className='text-sm text-[var(--gl-muted)]'>En kısa sürede dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-3'>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label htmlFor='biz-name'>Ad Soyad</Label>
                      <Input
                        id='biz-name'
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='biz-company'>Şirket</Label>
                      <Input
                        id='biz-company'
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='biz-email'>E-posta</Label>
                    <Input
                      id='biz-email'
                      type='email'
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='biz-phone'>Telefon</Label>
                    <Input
                      id='biz-phone'
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='biz-note'>İhtiyaç özeti</Label>
                    <Textarea
                      id='biz-note'
                      rows={3}
                      placeholder='Aylık gönderi hacmi, entegrasyon ihtiyacı…'
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                  <Button type='submit' className='w-full bg-[var(--gl-accent)] hover:bg-[var(--gl-accent-hover)]'>
                    Gönder
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  )
}
