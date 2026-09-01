import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const CHANNELS = [
  { name: 'Trendyol', logo: '/gonder/channels/trendyol.svg' },
  { name: 'Hepsiburada', logo: '/gonder/channels/hepsiburada.svg' },
  { name: 'Amazon', logo: '/gonder/channels/amazon.svg' },
  { name: 'Shopify', logo: '/gonder/channels/shopify.svg' },
  { name: 'WooCommerce', logo: '/gonder/channels/woocommerce.svg' },
  { name: 'Excel', logo: '/gonder/channels/excel.svg' },
  { name: 'API', logo: '/gonder/channels/api.svg' },
  { name: 'Manuel', logo: '/gonder/channels/manual.svg' },
]

const GROUPS = [
  { title: 'Pazaryerleri', items: ['Trendyol', 'Hepsiburada', 'Amazon'] },
  { title: 'E-ticaret altyapıları', items: ['Shopify', 'WooCommerce'] },
  { title: 'Veri aktarımı', items: ['Excel', 'API', 'Manuel'] },
]

export function IntegrationsSection() {
  return (
    <section id='entegrasyonlar' className='gl-section scroll-mt-16'>
      <div className='gl-container'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold sm:text-4xl'>Siparişlerin gelsin. Gönderilerin ilerlesin.</h2>
          <p className='mt-3 text-[var(--gl-muted)]'>
            Pazaryeri, e-ticaret ve ERP bağlantılarıyla siparişten takibe kesintisiz akış.
          </p>
        </div>

        <div className='mt-12 grid gap-8 lg:grid-cols-[1fr_minmax(280px,360px)]'>
          <div className='space-y-6'>
            {GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-[var(--gl-muted)]'>
                  {group.title}
                </h3>
                <div className='mt-3 flex flex-wrap gap-3'>
                  {CHANNELS.filter((c) => group.items.includes(c.name)).map((channel) => (
                    <div
                      key={channel.name}
                      className='flex h-14 min-w-[8rem] items-center justify-center rounded-xl border border-[var(--gl-border)] bg-white px-4'
                    >
                      <Image
                        src={channel.logo}
                        alt={channel.name}
                        width={100}
                        height={32}
                        className='h-7 w-auto object-contain'
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='gl-card p-6'>
            <p className='text-sm font-semibold'>Sipariş → Gönderi → Takip</p>
            <div className='mt-4 space-y-3'>
              {[
                { step: '1', label: 'Sipariş kanaldan gelir', detail: 'Pazaryeri veya mağaza entegrasyonu' },
                { step: '2', label: 'Gönderiye dönüştürülür', detail: 'Toplu seçim ve etiket oluşturma' },
                { step: '3', label: 'Takip bilgisi geri iletilir', detail: 'Durum kanala otomatik yansır' },
              ].map((item) => (
                <div key={item.step} className='flex gap-3 rounded-lg bg-[var(--gl-bg)] p-3'>
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--gl-petrol)] text-xs font-bold text-white'>
                    {item.step}
                  </span>
                  <div>
                    <p className='text-sm font-medium'>{item.label}</p>
                    <p className='text-xs text-[var(--gl-muted)]'>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-4 flex items-center gap-2 text-xs text-[var(--gl-muted)]'>
              <ArrowRight className='size-3.5' />
              Entegrasyonlar Gönder panelinde yapılandırılır
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
