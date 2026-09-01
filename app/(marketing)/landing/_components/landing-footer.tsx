import Link from 'next/link'
import { Send } from 'lucide-react'
import { ARF_ROUTES } from '../../../(arf)/_shared/routes'

const FOOTER_LINKS = {
  Çözümler: [
    { label: 'Kargo', href: '#teklif-al' },
    { label: 'Parsiyel Taşıma', href: '#teklif-al' },
    { label: 'Komple Taşıma', href: '#teklif-al' },
    { label: 'Navlun Ağı', href: '#navlun-agi' },
  ],
  Destek: [
    { label: 'SSS', href: '#sss' },
    { label: 'Gönderi Takibi', href: ARF_ROUTES.auth.signIn },
    { label: 'Gönder Asistan', href: '#asistan' },
  ],
  İletişim: [
    { label: 'İşletme görüşmesi', href: '#sss' },
    { label: 'Taşıma ağı başvurusu', href: '#navlun-agi' },
  ],
  Yasal: [
    { label: 'Gizlilik', href: '#' },
    { label: 'Kullanım koşulları', href: '#' },
    { label: 'KVKK', href: '#' },
  ],
}

export function LandingFooter() {
  return (
    <footer className='border-t border-[var(--gl-border)] bg-white py-12'>
      <div className='gl-container'>
        <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-5'>
          <div className='lg:col-span-1'>
            <Link href='/landing' className='flex items-center gap-2 font-semibold'>
              <span className='flex size-9 items-center justify-center rounded-xl bg-[var(--gl-petrol)] text-white'>
                <Send className='size-4' />
              </span>
              Gönder
            </Link>
            <p className='mt-3 text-sm text-[var(--gl-muted)]'>
              Arf altyapısıyla kargo ve lojistik yönetimi.
            </p>
            <Link
              href={ARF_ROUTES.auth.signIn}
              className='mt-4 inline-block text-sm font-semibold text-[var(--gl-accent)] hover:underline'
            >
              Giriş Yap → Panel
            </Link>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className='text-sm font-semibold'>{title}</p>
              <ul className='mt-3 space-y-2'>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className='text-sm text-[var(--gl-muted)] hover:text-[var(--gl-ink)]'
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-10 flex flex-col items-center justify-between gap-2 border-t border-[var(--gl-border)] pt-6 text-xs text-[var(--gl-muted)] sm:flex-row'>
          <p>© {new Date().getFullYear()} Gönder · Arf altyapısı</p>
          <p>Örnek veri — gerçek servis bağlantısı olmayan alanlar prototiptir.</p>
        </div>
      </div>
    </footer>
  )
}
