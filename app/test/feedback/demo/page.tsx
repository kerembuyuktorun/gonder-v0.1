/**
 * Feedback-Kit Test ve Dokümantasyon Sayfası.
 *
 * Bu sayfa, toast bildirim sisteminin temel ve gelişmiş kullanımlarini
 * tek yerde gösterir. Örnekler, API özetleri ve erişilebilirlik notları
 * tamamen test amaçlıdır.
 *
 * Not: Tüm açıklamalar Türkçe tutulmuştur ve emoji tabanlı basliklar
 * kullanılmamıştır.
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedbackProvider, useFeedback } from '@hascanb/arf-ui-kit/feedback-kit'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  Loader2,
  MessageSquare,
  Settings,
  Code,
  Sparkles,
  Upload,
  Download,
  Trash2,
  Save,
  Send,
  RefreshCw,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'

type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export default function FeedbackKitTest() {
  return (
    <FeedbackProvider renderToaster={false}>
      <FeedbackKitTestContent />
    </FeedbackProvider>
  )
}

function FeedbackKitTestContent() {
  const feedback = useFeedback()
  
  const [customMessage, setCustomMessage] = useState('Özel toast mesajı')
  const [customDuration, setCustomDuration] = useState('4000')
  const [customPosition, setCustomPosition] = useState<ToastPosition>('bottom-right')

  // Demo functions
  const simulateSuccess = () => {
    feedback.success('İşlem başarıyla tamamlandı!', 'Değişiklikleriniz kaydedildi.')
  }

  const simulateError = () => {
    feedback.error('Bir hata oluştu', 'Lütfen tekrar deneyin veya destek ile iletişime geçin.')
  }

  const simulateWarning = () => {
    feedback.warning('Disk alanı azalıyor', 'Kullanılmayan dosyaları silmeyi düşünebilirsiniz.')
  }

  const simulateInfo = () => {
    feedback.info('Yeni güncelleme mevcut', '2.0.0 sürümü kuruluma hazır.')
  }

  const simulateLoading = () => {
    const id = toast.loading('İsteğiniz işleniyor...')
    
    setTimeout(() => {
      toast.success('İstek işlendi!', { id })
    }, 3000)
  }

  const simulatePromise = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Success!')
        } else {
          reject('Failed!')
        }
      }, 2000)
    })

    toast.promise(promise, {
      loading: 'Dosya yükleniyor...',
      success: (data) => `Dosya yüklendi: ${data}`,
      error: (err) => `Yükleme başarısız: ${err}`
    })
  }

  const _simulateLongDuration = () => {
    feedback.info('Bu mesaj 10 saniye görünür', 'Önemli bilgilendirmeler için uygundur')
  }

  const simulateWithAction = () => {
    toast.error('Dosya silinemedi', {
      action: {
        label: 'Geri Al',
        onClick: () => feedback.success('Dosya geri yüklendi!')
      }
    })
  }

  const simulateRichContent = () => {
    toast.custom((_t) => (
      <div className="flex items-center gap-3 p-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg">
        <Sparkles className="h-5 w-5" />
        <div>
          <p className="font-semibold">Premium Özellik Açıldı!</p>
          <p className="text-sm opacity-90">Artik gelişmiş analizlere erisebilirsiniz</p>
        </div>
      </div>
    ))
  }

  const showCustomToast = () => {
    const parsedDuration = Number.parseInt(customDuration, 10)
    const duration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 4000

    toast.info(customMessage || 'Özel toast mesajı', {
      description: 'Bu özel bir toast mesajıdır',
      duration,
      position: customPosition,
    })
  }

  // Practical examples
  const examples = [
    {
      title: 'Form Gönderimi',
      icon: Send,
      action: () => {
        const promise = new Promise((resolve) => setTimeout(resolve, 2000))
        toast.promise(promise, {
          loading: 'Form gönderiliyor...',
          success: 'Form başarıyla gönderildi!',
          error: 'Gönderim başarısız oldu'
        })
      }
    },
    {
      title: 'Dosya Yükleme',
      icon: Upload,
      action: () => {
        const id = toast.loading('Dosya yükleniyor...')
        setTimeout(() => {
          toast.success('Dosya başarıyla yüklendi!', { id })
        }, 2500)
      }
    },
    {
      title: 'Dosya İndirme',
      icon: Download,
      action: () => {
        feedback.info('İndirme hazırlaniyor...')
        setTimeout(() => {
          feedback.success('İndirme başladı!', 'Indirilenler klasörünü kontrol edin')
        }, 2000)
      }
    },
    {
      title: 'Silme ve Geri Alma',
      icon: Trash2,
      action: () => {
        toast.warning('Öğe silindi', {
          action: {
            label: 'Geri Al',
            onClick: () => feedback.success('Öğe geri yüklendi!')
          }
        })
      }
    },
    {
      title: 'Otomatik Kaydetme',
      icon: Save,
      action: () => {
        feedback.success('Taslak kaydedildi')
      }
    },
    {
      title: 'Ağ Hatası',
      icon: RefreshCw,
      action: () => {
        toast.error('Bağlantı koptu', {
          description: 'Lütfen internet baglantinizi kontrol edin',
          action: {
            label: 'Tekrar Dene',
            onClick: () => feedback.info('Tekrar deneniyor...')
          },
          duration: Infinity
        })
      }
    }
  ]

  const codeExamples = {
    basic: `import { useFeedback } from '@hascanb/arf-ui-kit/feedback-kit'

function MyComponent() {
  const feedback = useFeedback()
  
  const handleClick = () => {
    feedback.success('İşlem başarılı!')
    feedback.error('Bir seyler ters gitti')
    feedback.warning('Dikkatli olun!')
    feedback.info('Bilgi: Yeni özellik kullanıma açıldı')
  }
  
  return <button onClick={handleClick}>Toast Göster</button>
}`,
    
    withOptions: `// Açıklamalı kullanım
feedback.success('Veriler kaydedildi!', 'Değişiklikleriniz yayinda')

// Aksiyon butonuyla kullanım (doğrudan toast)
toast.error('Silme işlemi başarısız', {
  action: {
    label: 'Geri Al',
    onClick: () => restoreItem()
  }
})

// Süre ile kullanım (doğrudan toast)
toast.info('Yeni mesaj', {
  duration: 5000
})`,
    
    promise: `// Otomatik yükleniyor -> başarılı/hata geçişi
import { toast } from 'sonner'

const handleSubmit = async () => {
  const promise = submitForm(data)
  
  toast.promise(promise, {
    loading: 'Gönderiliyor...',
    success: (result) => \`ID ile gönderildi: \${result.id}\`,
    error: 'Gönderim başarısız'
  })
}

// Yükleniyor toast'unu manuel kontrol et
const handleUpload = async () => {
  const toastId = toast.loading('Yükleniyor...')
  
  try {
    await uploadFile()
    toast.success('Yükleme tamamlandı!', { id: toastId })
  } catch (error) {
    toast.error('Yükleme başarısız', { id: toastId })
  }
}`,
    
    advanced: `// JSX ile zengin icerik
toast.custom(
  <div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg">
    <Icon className="h-5 w-5" />
    <div>
      <p className="font-bold">Özel Toast</p>
      <p className="text-sm">Zengin icerikle</p>
    </div>
  </div>
)

// Belirli bir toast'u kapat
const toastId = feedback.info('...')
feedback.dismiss(toastId)

// Tüm toast'lari kapat
feedback.dismiss()`
  }

  return (
    <div className="container py-8 space-y-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Feedback-Kit</h1>
            <p className="text-muted-foreground text-lg">
              Toast ve Bildirim Sistemi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="default">Bildirim Sistemi</Badge>
          <Badge variant="outline">Toast Mesajları</Badge>
          <Badge variant="outline">Promise Destegi</Badge>
          <Badge variant="outline">Erisilebilir</Badge>
        </div>
      </div>

      <Separator />

      {/* Genel Bakis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Genel Bakis
          </CardTitle>
          <CardDescription>
            Hafif ve esnek toast bildirim sistemi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Feedback-Kit, kullanıcılara işlem sonuçlarını bildirmek için tasarlanmış modern bir
            toast/snackbar sistemidir. Sonner kütüphanesi üzerine kurulmuş olup, TypeScript ile 
            tam tip güvenliği, erişilebilirlik özellikleri ve kolay özelleştirme sunar.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Mesaj Tipleri</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Başarı (yeşil)
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Hata (kırmızı)
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Uyarı (sarı)
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Bilgi (mavi)
                </li>
                <li className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4" />
                  Yükleniyor (spinner)
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Özellikler</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Özel süre kontrolu</li>
                <li>• Konum secimi</li>
                <li>• Aksiyon butonlari (geri al, tekrar dene)</li>
                <li>• Promise tabanlı bildirimler</li>
                <li>• Zengin JSX icerigi destegi</li>
                <li>• Otomatik kapatma ve manuel kontrol</li>
                <li>• Tema entegrasyonu</li>
                <li>• Tam erişilebilirlik</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etkilesimli Demolar */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temel Tipler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Mesaj Tipleri</CardTitle>
            <CardDescription>
              Standart toast bildirimleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={simulateSuccess} 
              className="w-full justify-start"
              variant="outline"
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Başarı Göster
            </Button>
            <Button 
              onClick={simulateError} 
              className="w-full justify-start"
              variant="outline"
            >
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Hata Göster
            </Button>
            <Button 
              onClick={simulateWarning} 
              className="w-full justify-start"
              variant="outline"
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              Uyarı Göster
            </Button>
            <Button 
              onClick={simulateInfo} 
              className="w-full justify-start"
              variant="outline"
            >
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              Bilgi Göster
            </Button>
          </CardContent>
        </Card>

        {/* Gelismis Tipler */}
        <Card>
          <CardHeader>
            <CardTitle>Gelismis Özellikler</CardTitle>
            <CardDescription>
              Yükleniyor, promise ve zengin icerik toast'lari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={simulateLoading} 
              className="w-full justify-start"
              variant="outline"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Yükleniyor Toast
            </Button>
            <Button 
              onClick={simulatePromise} 
              className="w-full justify-start"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Promise Tabanli Toast
            </Button>
            <Button 
              onClick={simulateRichContent} 
              className="w-full justify-start"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Zengin Icerikli Toast
            </Button>
            <Button 
              onClick={simulateWithAction} 
              className="w-full justify-start"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Aksiyonlu Toast
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pratik Örnekler */}
      <Card>
        <CardHeader>
          <CardTitle>Pratik Kullanim Senaryolari</CardTitle>
          <CardDescription>
            Gercek dunya senaryolari ve kaliplari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((example) => {
              const Icon = example.icon
              return (
                <Button
                  key={example.title}
                  onClick={example.action}
                  variant="outline"
                  className="justify-start h-auto py-3"
                >
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <span className="text-sm">{example.title}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Özel Toast Oluşturucu */}
      <Card>
        <CardHeader>
          <CardTitle>Özel Toast Oluşturucu</CardTitle>
          <CardDescription>
            Özel toast ayarları oluşturun ve test edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="message">Mesaj</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Mesajinizi girin"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Süre (ms)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={customDuration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDuration(e.target.value)}
                  placeholder="4000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Konum</Label>
                <Select
                  value={customPosition}
                  onValueChange={(value) => setCustomPosition(value as ToastPosition)}
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Ust Sol</SelectItem>
                    <SelectItem value="top-center">Ust Orta</SelectItem>
                    <SelectItem value="top-right">Ust Sag</SelectItem>
                    <SelectItem value="bottom-left">Alt Sol</SelectItem>
                    <SelectItem value="bottom-center">Alt Orta</SelectItem>
                    <SelectItem value="bottom-right">Alt Sag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Button onClick={showCustomToast} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Özel Toast Göster
          </Button>
        </CardContent>
      </Card>

      {/* Kod Örnekleri */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Temel</TabsTrigger>
          <TabsTrigger value="options">Secenekli</TabsTrigger>
          <TabsTrigger value="promise">Promise</TabsTrigger>
          <TabsTrigger value="advanced">Gelismis</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Temel Kullanim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.basic}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Secenekli Kullanim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.withOptions}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promise">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Promise Tabanli Bildirimler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.promise}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Gelismis Kaliplar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.advanced}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Referansı */}
      <Card>
        <CardHeader>
          <CardTitle>API Referansı</CardTitle>
          <CardDescription>
            useFeedback hook'u için tam API özeti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">Metot</th>
                  <th className="text-left p-3 font-semibold">Parametreler</th>
                  <th className="text-left p-3 font-semibold">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-mono text-xs">success()</td>
                  <td className="p-3 font-mono text-xs">mesaj, seçenekler?</td>
                  <td className="p-3 text-muted-foreground">Başarı toast'ı gösterir (yeşil)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">error()</td>
                  <td className="p-3 font-mono text-xs">mesaj, seçenekler?</td>
                  <td className="p-3 text-muted-foreground">Hata toast'ı gösterir (kırmızı)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">warning()</td>
                  <td className="p-3 font-mono text-xs">mesaj, seçenekler?</td>
                  <td className="p-3 text-muted-foreground">Uyarı toast'ı gösterir (sarı)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">info()</td>
                  <td className="p-3 font-mono text-xs">mesaj, seçenekler?</td>
                  <td className="p-3 text-muted-foreground">Bilgi toast'ı gösterir (mavi)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">loading()</td>
                  <td className="p-3 font-mono text-xs">mesaj, seçenekler?</td>
                  <td className="p-3 text-muted-foreground">Yükleniyor toast'ı gösterir</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">promise()</td>
                  <td className="p-3 font-mono text-xs">promise, mesajlar</td>
                  <td className="p-3 text-muted-foreground">Promise durumlarını otomatik yönetir</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">dismiss()</td>
                  <td className="p-3 font-mono text-xs">toastId?</td>
                  <td className="p-3 text-muted-foreground">Toast(lar)i kapatır</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* En İyi Uygulamalar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              En İyi Uygulamalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Mesajları kısa ve açık tutun (en fazla 2 satır)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Doğru mesaj tipini seçin (önem derecesine göre)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Kritik hatalarda aksiyon butonu ekleyin (Tekrar Dene, Geri Al)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Promise tabanlı bildirimleri kullanın (asenkron işlemler)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Süreyi mesajın önemine göre ayarlayın</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Sık Yapılan Hatalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Çok uzun mesajlar yazmayın (kaydirma gerektirir)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Aynı işlem için birden fazla toast göstermeyin</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Önemsiz işlemler için toast kullanmayın</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Kapatilamayan toast'lar oluşturmayin</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Yükleniyor toast'larini zamaninda kapatmayi unutmayin</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Erisilebilirlik Bilgisi */}
      <Card>
        <CardHeader>
          <CardTitle>Erisilebilirlik Özellikleri</CardTitle>
          <CardDescription>
            Yerlesik erişilebilirlik destegi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold text-sm mb-2">Ekran Okuyucu Destegi</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Duyurular için ARIA live bolgeleri</li>
                <li>• Doğru role ve aria-label nitelikleri</li>
                <li>• Yeni toast'lari otomatik duyurma</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Klavye Destegi</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Escape tusu ile kapatma</li>
                <li>• Tab ile aksiyon butonlarina gecis</li>
                <li>• Odak yönetimi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
