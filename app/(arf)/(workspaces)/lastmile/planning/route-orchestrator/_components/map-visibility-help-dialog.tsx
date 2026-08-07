'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  CheckCircle2,
  GripVertical,
  LayoutPanelLeft,
  LayoutPanelTop,
  MapPinned,
  Package,
  PanelRight,
  Play,
  Route,
  SlidersHorizontal,
  Truck,
  Undo2,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
      {children}
    </h3>
  )
}

function InfoCard({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index?: number
}) {
  return (
    <div className='rounded-xl border border-slate-200/80 bg-white px-3.5 py-3'>
      <div className='mb-1 flex items-start gap-2.5'>
        {index != null ? (
          <span className='mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white'>
            {index}
          </span>
        ) : null}
        <p className='text-[13px] font-semibold tracking-tight text-slate-900'>{title}</p>
      </div>
      <p
        className={cn(
          'text-[13px] leading-relaxed text-slate-600',
          index != null && 'pl-7'
        )}
      >
        {description}
      </p>
    </div>
  )
}

function LegendRow({
  swatchClass,
  label,
  detail,
}: {
  swatchClass: string
  label: string
  detail: string
}) {
  return (
    <div className='flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5'>
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white',
          swatchClass
        )}
        aria-hidden
      >
        <Truck className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='text-[13px] font-semibold text-slate-900'>{label}</p>
        <p className='text-[12px] leading-relaxed text-slate-500'>{detail}</p>
      </div>
    </div>
  )
}

function PointLegendRow({
  tone,
  icon: Icon,
  label,
  detail,
}: {
  tone: string
  icon: typeof Package
  label: string
  detail: string
}) {
  return (
    <div className='flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5'>
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white',
          tone
        )}
        aria-hidden
      >
        <Icon className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='text-[13px] font-semibold text-slate-900'>{label}</p>
        <p className='text-[12px] leading-relaxed text-slate-500'>{detail}</p>
      </div>
    </div>
  )
}

function RuleRow({ panel, map }: { panel: string; map: string }) {
  return (
    <div className='grid gap-1 rounded-xl border border-slate-200/70 bg-white px-3.5 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4'>
      <p className='text-[12px] font-semibold leading-snug text-slate-900'>{panel}</p>
      <p className='text-[12px] leading-relaxed text-slate-600'>{map}</p>
    </div>
  )
}

const USAGE_STEPS = [
  {
    title: 'Operasyon günü ve havuz',
    description:
      'Sipariş Havuzu filtrelerinde operasyon tarihini seçin. Bugün seçiliyse tüm havuz; başka gün seçiliyse yalnızca o güne ait alım pencereli siparişler listelenir.',
  },
  {
    title: 'Sipariş seçin',
    description:
      'Sol panelden (veya haritadaki alım/teslim pin’inden) rotaya almak istediğiniz siparişleri işaretleyin. Seçililer havuzun üstüne pinlenir; haritada renkli + onay rozetli görünür.',
  },
  {
    title: 'Araç seçin',
    description:
      'Sağ panelden uygun araçları seçin. Boşta araç pin’ine tıklayınca da seçilir. Seçim sonrası haritada seçili araçlar vurgulanır.',
  },
  {
    title: 'Optimize edin',
    description:
      'Toolbar’da seçim özeti görünürken Optimize Et ile rota planı oluşturun. Optimizasyon Ayarları’ndan hedef, kapasite, zaman penceresi ve yetenek kısıtlarını düzenleyebilirsiniz.',
  },
  {
    title: 'Sonucu onaylayın veya müdahale edin',
    description:
      'Alt panelde onay bekleyen rotalar çıkar. Rota detayında durak sırasını düzenleyebilir, sipariş çıkarabilir; rotayı tek tek onay/red veya Tümünü onayla yapabilirsiniz. Eşleşmeyen siparişler nedenleriyle listelenir.',
  },
  {
    title: 'Aktif rota ile sahayı yönetin',
    description:
      'Onay sonrası rotalar Aktif Rota Listesi’ne düşer. Bugün / Geçmişten kalan sekmeleriyle ayırın. Detayda sipariş ekleyin (Rotaya ekle + önizleme), çıkarın veya kalan durakları yeniden sıralayın.',
  },
]

const PANEL_ITEMS = [
  {
    icon: LayoutPanelLeft,
    title: 'Sol panel — Sipariş Havuzu',
    description:
      'Atama bekleyen siparişleri arayın, tip/rota/müşteri ve operasyon tarihiyle filtreleyin, seçin. Açıkken sipariş pinleri görünür. Araçlar: seçim yoksa Aktif Rotada + Boşta; araç seçimi varsa yalnızca seçili araçlar.',
  },
  {
    icon: PanelRight,
    title: 'Sağ panel — Kaynaklar',
    description:
      'Araçları filtreleyip seçersiniz. İlk açılışta tüm araçlar görünür; seçim yapılınca yalnızca seçili araçlar kalır. Yolda araç tıklanınca ilgili aktif rota detayı açılır.',
  },
  {
    icon: LayoutPanelTop,
    title: 'Alt panel — Aktif Rota Listesi',
    description:
      'Sahadaki aktif rotalar. Bugün / Geçmişten kalan sekmeleriyle dilimleyin. Checkbox ile haritada gösterin; karta tıklayınca aktif rota detayına geçilir (sol/sağ paneller kilitlenir). Sağ üstten rota detay sayfasına gidebilirsiniz.',
  },
  {
    icon: Route,
    title: 'Alt panel — Onay bekleyen sonuç',
    description:
      'Optimize sonrası buraya düşer. Rota kartları, kısmi onay/red, eşleşmeyen sipariş listesi ve “Tümünü onayla” burada. Detayda durak sırası ve sipariş çıkarma da çalışır.',
  },
  {
    icon: Play,
    title: 'Toolbar',
    description:
      'Seçim özeti (× ile temizleme), Orkestratör Bilgi, Optimizasyon Ayarları, Geri al, Optimize Et / Rotaya ekle. Planlamada “Seçili X sipariş · Y araç”; rota seçiminde “Haritada X rota” (açık detay da sayılır).',
  },
]

const ACTION_ITEMS = [
  {
    icon: SlidersHorizontal,
    title: 'Optimizasyon Ayarları',
    description:
      'Toolbar’daki dişli ikon. Optimize Et ve Rotaya ekle (kalan yeniden optimize) aynı ayarları kullanır. Uygula’dan sonra bir sonraki optimize’a yansır.',
  },
  {
    icon: Undo2,
    title: 'Geri al',
    description:
      'Toolbar’daki Geri al veya ⌘/Ctrl+Z ile son mutasyonu geri alır: onay, red, sipariş çıkarma, durak sırası, rotaya ekleme, sonuç iptali vb. (en fazla ~20 adım).',
  },
  {
    icon: GripVertical,
    title: 'Durak sırası düzenleme',
    description:
      'Detayda “Durakları düzenle” → Tab yalnızca sıralanabilir duraklarda dolaşır. Space/Enter ile tut, ↑/↓ ile taşı, Esc ile bırak. Kaydet / Vazgeç. Düzenlerken Tamamlananları Gizle ve Başlangıç Ve Son Gizle açılır.',
  },
  {
    icon: Package,
    title: 'Sipariş çıkarma',
    description:
      'Alım/teslim kartı başlığındaki çöp ikonu siparişi (alım + teslim birlikte) rotadan düşürür; havuza döner. Alımı tamamlanmış sipariş aktif rotadan çıkarılamaz.',
  },
  {
    icon: Route,
    title: 'Aktif rotaya sipariş ekleme',
    description:
      'Aktif rota detayı açıkken havuzdan sipariş seçip Rotaya ekle → önizleme (kilitli tamamlananlar + kalanın yeniden optimizasyonu) → Uygula.',
  },
  {
    icon: CheckCircle2,
    title: 'Kart aç/kapa',
    description:
      'Durak kartı ortasındaki chevron detayı gizler/açar. “Hepsini aç / Hepsini kapa” tüm kartları senkronlar. Varsayılan kapalıdır.',
  },
]

const SETTINGS_DETAILS = [
  {
    title: 'Hedef',
    description:
      'Dengeli yük · Minimum mesafe · Minimum süre · Minimum araç — solver’ın neyi önceliklendireceğini seçer.',
  },
  {
    title: 'Max rota süresi / Max durak',
    description:
      'Tek rotanın üst sınırları (dk ve operasyonel durak sayısı). Aşırı uzun veya kalabalık rotaları engeller.',
  },
  {
    title: 'Kapasite kısıtı',
    description: 'Araç hacim ve ağırlık limitlerini aşmadan planlar.',
  },
  {
    title: 'Zaman penceresi',
    description: 'Alım / teslim pencerelerine uymaya çalışır.',
  },
  {
    title: 'Yetenek eşleştirme',
    description: 'Sipariş gereksinimlerini araç yetenekleriyle eşleştirir.',
  },
  {
    title: 'Vardiya uygunluğu',
    description: 'Planı araç vardiya saatleri içinde tutar.',
  },
  {
    title: 'Park konumuna dönüş',
    description:
      'Açıksa rota sonunda araç park / dönüş ankoru eklenir; kapalıysa yalnızca operasyonel duraklarla biter.',
  },
]

const VISIBILITY_RULES = [
  {
    panel: 'Tüm paneller kapalı (seçim yok)',
    map: 'Tüm araçlar görünür: Aktif Rotada (yeşil), Boşta (mavi), Pasif (gri). Sipariş pinleri yok.',
  },
  {
    panel: 'Paneller kapalı — planlama seçimi var',
    map: 'Yalnızca seçili olanlar kalır: sadece sipariş, sadece araç veya ikisi birden.',
  },
  {
    panel: 'Planlama seçimi + alt panel açık',
    map: 'Rota seçilene kadar seçili sipariş/araçlar haritada kalır. Rota seçilince planlama seçimi temizlenir (detay açıkken sipariş seçimi Rotaya ekle için korunabilir).',
  },
  {
    panel: 'Yalnızca sol panel',
    map: 'Siparişler (seçili aktif, değilse pasif). Araçlar: seçim yoksa Aktif Rotada + Boşta; araç seçimi varsa yalnızca seçili araçlar.',
  },
  {
    panel: 'Yalnızca sağ panel',
    map: 'Sipariş pinleri yok. Araç seçimi yoksa tüm araçlar; seçim varsa yalnızca seçili araçlar.',
  },
  {
    panel: 'Sol + sağ birlikte',
    map: 'Siparişler + araçlar (seçim yoksa Aktif Rotada + Boşta; seçim varsa seçililer).',
  },
  {
    panel: 'Yalnızca alt panel (rota seçimi yok)',
    map: 'Planlama seçimi yoksa harita boştur. Rota kartı seçilince durak, çizgi ve araç görünür. Liste Bugün / Geçmişten kalan scope’una göre filtrelenir.',
  },
  {
    panel: 'Alt panel kapalı, rota seçili',
    map: 'Seçili rota haritada pinli kalır. Sol veya sağ panel açılınca rota seçimi temizlenir.',
  },
  {
    panel: 'Seçim çakışması',
    map: 'Planlama seçimi (sipariş/araç) ile aktif rota harita seçimi aynı anda olamaz. Biri seçilince diğeri temizlenir.',
  },
  {
    panel: 'Toolbar × ile temizleme',
    map: '“Seçili X sipariş · Y araç” yanındaki × planlama seçimini; “Haritada X rota” yanındaki × rota seçimini temizler.',
  },
  {
    panel: 'Optimizasyon sonrası (adım 2+)',
    map: 'Harita yalnızca oluşturulan rota planını gösterir; planlama panellerinin görünürlük kuralları geçerli değildir.',
  },
]

export function MapVisibilityHelpDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[88vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='shrink-0 border-b border-slate-200/80 px-5 py-4 text-left sm:px-6'>
          <div className='flex items-center gap-3'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm'>
              <BookOpen className='size-5' aria-hidden />
            </span>
            <div className='min-w-0'>
              <DialogTitle className='text-base font-semibold tracking-tight text-slate-900'>
                Orkestratör Bilgi
              </DialogTitle>
              <p className='mt-0.5 text-[12px] text-slate-500'>
                Planlama akışı, paneller, aksiyonlar ve harita kuralları
              </p>
            </div>
            <DialogDescription className='sr-only'>
              Rota Orkestratörü kullanım rehberi: akış, paneller, aksiyonlar, harita ikonları ve
              görünürlük kuralları.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue='usage' className='flex min-h-0 flex-1 flex-col gap-0'>
          <div className='shrink-0 border-b border-slate-200/70 px-5 py-3 sm:px-6'>
            <TabsList className='grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-slate-100/90 p-1 sm:grid-cols-6'>
              <TabsTrigger
                value='usage'
                className='rounded-lg px-2 py-1.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm'
              >
                Kullanım
              </TabsTrigger>
              <TabsTrigger
                value='panels'
                className='rounded-lg px-2 py-1.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm'
              >
                Paneller
              </TabsTrigger>
              <TabsTrigger
                value='actions'
                className='rounded-lg px-2 py-1.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm'
              >
                Aksiyonlar
              </TabsTrigger>
              <TabsTrigger
                value='legend'
                className='rounded-lg px-2 py-1.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm'
              >
                İkonlar
              </TabsTrigger>
              <TabsTrigger
                value='rules'
                className='rounded-lg px-2 py-1.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm'
              >
                Kurallar
              </TabsTrigger>
              <Link
                href={ARF_ROUTES.lastmile.planning.orchestratorDemo}
                onClick={() => onOpenChange(false)}
                className='inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:bg-white/80 hover:text-slate-900'
              >
                Demo
              </Link>
            </TabsList>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6'>
            <TabsContent value='usage' className='mt-0 space-y-3 focus-visible:outline-none'>
              <SectionTitle>Nasıl kullanılır</SectionTitle>
              <div className='space-y-2'>
                {USAGE_STEPS.map((step, index) => (
                  <InfoCard
                    key={step.title}
                    index={index + 1}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
              <div className='rounded-xl border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-3'>
                <p className='flex items-start gap-2 text-[12px] leading-relaxed text-emerald-900'>
                  <CheckCircle2 className='mt-0.5 size-3.5 shrink-0' aria-hidden />
                  İpucu: Yanlışlıkla onay / çıkar / sıra değiştirdiyseniz toolbar’dan Geri al veya
                  ⌘/Ctrl+Z kullanın. Rota Listesi sayfası tüm rotaların arşiv görünümüdür.
                </p>
              </div>
            </TabsContent>

            <TabsContent value='panels' className='mt-0 space-y-3 focus-visible:outline-none'>
              <SectionTitle>Ekrandaki alanlar</SectionTitle>
              <div className='space-y-2'>
                {PANEL_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className='flex gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3'
                    >
                      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200/80'>
                        <Icon className='size-4' aria-hidden />
                      </span>
                      <div className='min-w-0'>
                        <p className='text-[13px] font-semibold text-slate-900'>{item.title}</p>
                        <p className='mt-1 text-[12px] leading-relaxed text-slate-600'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value='actions' className='mt-0 space-y-4 focus-visible:outline-none'>
              <div>
                <SectionTitle>Manuel müdahale ve yardımcılar</SectionTitle>
                <div className='space-y-2'>
                  {ACTION_ITEMS.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className='flex gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3'
                      >
                        <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200/80'>
                          <Icon className='size-4' aria-hidden />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[13px] font-semibold text-slate-900'>{item.title}</p>
                          <p className='mt-1 text-[12px] leading-relaxed text-slate-600'>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <SectionTitle>Optimizasyon Ayarları — alanlar</SectionTitle>
                <div className='space-y-2'>
                  {SETTINGS_DETAILS.map((item) => (
                    <InfoCard
                      key={item.title}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='legend' className='mt-0 space-y-4 focus-visible:outline-none'>
              <div>
                <SectionTitle>Araç durumları</SectionTitle>
                <div className='space-y-2'>
                  <LegendRow
                    swatchClass='bg-emerald-600'
                    label='Aktif Rotada'
                    detail='Yeşil dolu ikon + nabız. Sahada rotası devam eden araç.'
                  />
                  <LegendRow
                    swatchClass='bg-sky-600'
                    label='Boşta'
                    detail='Mavi dolu ikon. Göreve hazır, rotada değil — tıklayınca planlama seçimine eklenir.'
                  />
                  <LegendRow
                    swatchClass='bg-slate-400'
                    label='Pasif'
                    detail='Gri kontur ikon. Kullanılamayan / pasif araç.'
                  />
                </div>
              </div>
              <div>
                <SectionTitle>Sipariş noktaları</SectionTitle>
                <div className='space-y-2'>
                  <PointLegendRow
                    tone='bg-sky-600'
                    icon={Package}
                    label='Alım noktası (seçili)'
                    detail='Mavi paket ikonu + onay rozeti. Tıklayınca sipariş seçimi toggle olur.'
                  />
                  <PointLegendRow
                    tone='bg-emerald-600'
                    icon={MapPinned}
                    label='Teslim noktası (seçili)'
                    detail='Yeşil teslim ikonu + onay rozeti. Aynı siparişi toggle eder.'
                  />
                  <PointLegendRow
                    tone='bg-slate-400'
                    icon={Package}
                    label='Pasif nokta'
                    detail='Seçili olmayan alım/teslim — soluk; yine de tıklanabilir.'
                  />
                </div>
              </div>
              <div>
                <SectionTitle>Aktif rota görünümü</SectionTitle>
                <div className='flex gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3'>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200/80'>
                    <Route className='size-4' aria-hidden />
                  </span>
                  <p className='text-[12px] leading-relaxed text-slate-600'>
                    Alt panelden seçilen rota: numaralı durak pinleri, renkli çizgi ve araç konumu.
                    Tamamlanan duraklar soluk görünür. Toolbar’da “Haritada X rota” yazar.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='rules' className='mt-0 space-y-3 focus-visible:outline-none'>
              <SectionTitle>Harita görünürlük kuralları</SectionTitle>
              <div className='space-y-2'>
                {VISIBILITY_RULES.map((row) => (
                  <RuleRow key={row.panel} panel={row.panel} map={row.map} />
                ))}
              </div>
            </TabsContent>
          </div>

          <div className='shrink-0 border-t border-slate-200/80 bg-slate-50/80 px-5 py-3 sm:px-6'>
            <p className='text-[11px] leading-relaxed text-slate-500'>
              Harita verisi:{' '}
              <a
                href='https://www.openstreetmap.org/copyright'
                target='_blank'
                rel='noreferrer'
                className='font-medium text-slate-700 underline-offset-2 hover:underline'
              >
                © OpenStreetMap
              </a>
              {' · '}
              <a
                href='https://carto.com/attributions'
                target='_blank'
                rel='noreferrer'
                className='font-medium text-slate-700 underline-offset-2 hover:underline'
              >
                © CARTO
              </a>
              {' · '}
              Leaflet
            </p>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

/** @deprecated Use MapVisibilityHelpDialog — aynı bileşen, Orkestratör Bilgi başlığıyla */
export const OrchestratorInfoDialog = MapVisibilityHelpDialog
