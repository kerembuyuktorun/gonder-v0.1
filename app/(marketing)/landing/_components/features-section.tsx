'use client'

import {
  ArrowRightLeft,
  Bell,
  Boxes,
  FileText,
  LayoutDashboard,
  Plug,
  Search,
} from 'lucide-react'

const FEATURES = [
  {
    id: 'compare',
    icon: Search,
    title: 'Talebini oluştur, seçenekler gelsin',
    description:
      'Gönder anlaşmalı firmalar ve taşıma ağı üzerinden uygun seçenekleri oluşturur. Fiyat, süre ve hizmet tipini birlikte görürsün.',
    align: 'left' as const,
    mock: (
      <div className='space-y-2 p-4'>
        {[
          { initials: 'AP', bg: '#195b55', name: 'ARF Parcel', source: 'Anlık Teklif', price: '₺189', days: '1–2 gün', badge: 'Önerilen' },
          { initials: 'EG', bg: '#2f6b3a', name: 'EkoGönder', source: 'Gönder Eşleşmesi', price: '₺118', days: '3–5 gün', badge: 'En Uygun' },
        ].map((o) => (
          <div
            key={o.name}
            className='flex items-center justify-between gap-3 rounded-lg border border-[var(--gl-border)] bg-white p-3 text-sm'
          >
            <div className='flex min-w-0 items-center gap-2.5'>
              <span
                className='flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white'
                style={{ background: o.bg }}
                aria-hidden
              >
                {o.initials}
              </span>
              <div className='min-w-0'>
                <p className='font-medium'>{o.name}</p>
                <p className='text-xs text-[var(--gl-muted)]'>
                  {o.days} · {o.source}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='font-semibold text-[var(--gl-accent)]'>{o.price}</p>
              <span className='text-[10px] text-[var(--gl-muted)]'>{o.badge}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'panel',
    icon: LayoutDashboard,
    title: 'Gönderilerini tek yerden yönet',
    description: 'Kargo ve lojistik işlemlerini ortak panelde takip et.',
    align: 'right' as const,
    mock: (
      <div className='p-4'>
        <div className='rounded-lg border border-[var(--gl-border)] bg-white'>
          <div className='border-b border-[var(--gl-border)] px-3 py-2 text-xs font-semibold text-[var(--gl-muted)]'>
            Aktif gönderiler
          </div>
          {['GDR-4821 · İstanbul → Ankara', 'GDR-4819 · Bursa → İzmir'].map((row) => (
            <div key={row} className='flex items-center justify-between border-b border-[var(--gl-border)] px-3 py-2.5 text-xs last:border-0'>
              <span>{row}</span>
              <span className='rounded-full bg-[var(--gl-yellow)]/40 px-2 py-0.5 text-[10px] font-medium'>Yolda</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'bulk',
    icon: Boxes,
    title: 'Toplu işlem yap',
    description: 'Çok sayıda siparişi aktar, seç ve gönderiye dönüştür.',
    align: 'left' as const,
    mock: (
      <div className='p-4'>
        <div className='rounded-lg border border-[var(--gl-border)] bg-white p-3'>
          <div className='mb-2 flex items-center gap-2 text-xs text-[var(--gl-muted)]'>
            <Boxes className='size-3.5' />
            Excel içe aktarım · 48 sipariş
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-[var(--gl-subtle)]'>
            <div className='h-full w-3/4 rounded-full bg-[var(--gl-petrol)]' />
          </div>
          <p className='mt-2 text-[11px] text-[var(--gl-muted)]'>36 sipariş gönderiye hazır</p>
        </div>
      </div>
    ),
  },
  {
    id: 'tracking',
    icon: Bell,
    title: 'Takip ve bildirimler',
    description: 'Taşıyıcının sağladığı durum güncellemelerine tek yerden eriş.',
    align: 'right' as const,
    mock: (
      <div className='space-y-3 p-4'>
        {[
          { time: '14:32', text: 'Ambarda aktarmaya alındı' },
          { time: '09:15', text: 'Çıkış noktasından alındı' },
          { time: '08:40', text: 'Gönderi oluşturuldu' },
        ].map((e) => (
          <div key={e.time} className='flex gap-3 text-xs'>
            <span className='w-10 shrink-0 font-mono text-[var(--gl-muted)]'>{e.time}</span>
            <span className='relative pl-4 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-[var(--gl-accent)]'>
              {e.text}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'docs',
    icon: FileText,
    title: 'Belgeler ve maliyet görünürlüğü',
    description: 'Fatura, taşıma ve teslimat belgelerini ilgili gönderide görüntüle.',
    align: 'left' as const,
    mock: (
      <div className='grid grid-cols-2 gap-2 p-4'>
        {['İrsaliye.pdf', 'Fatura.pdf', 'Teslim tutanağı.pdf'].map((doc) => (
          <div
            key={doc}
            className='col-span-1 flex items-center gap-2 rounded-lg border border-[var(--gl-border)] bg-white p-2.5 text-[11px] last:col-span-2'
          >
            <FileText className='size-3.5 text-[var(--gl-petrol)]' />
            {doc}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'integrations',
    icon: Plug,
    title: 'Entegrasyon ve otomasyon',
    description: 'Sipariş aktarımını ve tekrar eden adımları kolaylaştır.',
    align: 'right' as const,
    mock: (
      <div className='flex items-center justify-center gap-3 p-6'>
        <div className='rounded-lg border border-[var(--gl-border)] bg-white px-3 py-2 text-xs'>Sipariş</div>
        <ArrowRightLeft className='size-4 text-[var(--gl-muted)]' />
        <div className='rounded-lg border border-[var(--gl-border)] bg-white px-3 py-2 text-xs'>Gönderi</div>
        <ArrowRightLeft className='size-4 text-[var(--gl-muted)]' />
        <div className='rounded-lg border border-[var(--gl-border)] bg-white px-3 py-2 text-xs'>Takip</div>
      </div>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id='ozellikler' className='gl-section scroll-mt-16 bg-[var(--gl-bg-soft)]'>
      <div className='gl-container'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold sm:text-4xl'>Tekliften teslimata, tüm süreç elinin altında.</h2>
          <p className='mt-3 text-[var(--gl-muted)]'>
            Gönder panelinde kargo ve lojistiği aynı akışta yönet.
          </p>
        </div>

        <div className='mt-14 space-y-16'>
          {FEATURES.map((feature, index) => {
            const reversed = feature.align === 'right'
            return (
              <article
                key={feature.id}
                className={`grid items-center gap-8 lg:grid-cols-2 ${reversed ? 'lg:[direction:rtl]' : ''}`}
              >
                <div className={`space-y-4 ${reversed ? 'lg:[direction:ltr]' : ''}`}>
                  <span className='inline-flex size-10 items-center justify-center rounded-xl bg-[var(--gl-accent)]/10 text-[var(--gl-accent)]'>
                    <feature.icon className='size-5' />
                  </span>
                  <h3 className='text-2xl font-semibold'>{feature.title}</h3>
                  <p className='max-w-md text-[var(--gl-muted)]'>{feature.description}</p>
                </div>
                <div
                  className={`gl-card overflow-hidden ${reversed ? 'lg:[direction:ltr]' : ''} ${
                    index % 2 === 1 ? 'lg:translate-y-4' : ''
                  }`}
                >
                  {feature.mock}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
