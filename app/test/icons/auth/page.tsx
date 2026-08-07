"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Fingerprint,
  ScanFace,
  QrCode,
  Shield,
  MailCheck,
  PhoneCall,
  EyeOff,
  Eye,
  Github,
  Home,
  Package,
  Users,
  Settings,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Lock,
  Key,
  UserCheck,
} from "lucide-react"
import { GoogleIcon, AppleIcon } from '@hascanb/arf-ui-kit/auth-kit'

export default function AuthIconsTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Lucide React İkonları</h1>
        <p className="text-muted-foreground">
          Tüm ikonlar lucide-react kütüphanesinden geliyor (1000+ ikon)
        </p>
      </div>

      {/* Why Lucide? */}
      <Card>
        <CardHeader>
          <CardTitle>Hibrit Yaklaşım: Lucide React + Minimal Custom SVG</CardTitle>
          <CardDescription>
            Lucide React'i esas alıyoruz, sadece brand ikonları için custom SVG kullanıyoruz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">✅ Lucide React (1000+ ikon)</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Fingerprint, Shield, Eye, MailCheck, Lock, Key - hepsi mevcut</li>
              <li>GitHub, Chrome (generic browser icon) - mevcut</li>
              <li>Tutarlı tasarım dili</li>
              <li>Otomatik TypeScript desteği</li>
              <li>Tree-shaking (sadece kullanılan ikonlar bundle'a dahil)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">🎨 Custom SVG (Sadece 2 ikon)</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>GoogleIcon - Lucide'da yok (legal/trademark sebeplerle)</li>
              <li>AppleIcon - Lucide'da yok (legal/trademark sebeplerle)</li>
              <li>Brand ikonları için resmi renkler ve logolar gerekli</li>
              <li>src/auth-kit/icons/BrandIcons.tsx - minimal 50 satır kod</li>
            </ul>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Strateji:</strong> Lucide React'te olan her şeyi Lucide'dan al, 
              sadece brand logoları (Google/Apple gibi) için custom SVG kullan. 
              Bu sayede hem kütüphane avantajlarından yararlanıyoruz, 
              hem de social login için gerekli brand identity'yi koruyoruz.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Biometric Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Biyometrik Kimlik Doğrulama İkonları</CardTitle>
          <CardDescription>Fingerprint, ScanFace, QrCode, Shield</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<Fingerprint size={48} />} name="Fingerprint" importName="Fingerprint" />
            <IconCard icon={<ScanFace size={48} />} name="Face ID" importName="ScanFace" />
            <IconCard icon={<QrCode size={48} />} name="QR Code" importName="QrCode" />
            <IconCard icon={<Shield size={48} />} name="2FA Shield" importName="Shield" />
          </div>
        </CardContent>
      </Card>

      {/* Verification Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Doğrulama İkonları</CardTitle>
          <CardDescription>MailCheck, PhoneCall, UserCheck, Lock, Key</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<MailCheck size={48} />} name="Email Verified" importName="MailCheck" />
            <IconCard icon={<PhoneCall size={48} />} name="Phone Verified" importName="PhoneCall" />
            <IconCard icon={<UserCheck size={48} />} name="User Verified" importName="UserCheck" />
            <IconCard icon={<Lock size={48} />} name="Security" importName="Lock" />
            <IconCard icon={<Key size={48} />} name="Access Key" importName="Key" />
          </div>
        </CardContent>
      </Card>

      {/* Password Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Şifre İkonları</CardTitle>
          <CardDescription>Eye, EyeOff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<Eye size={48} />} name="Show Password" importName="Eye" />
            <IconCard icon={<EyeOff size={48} />} name="Hide Password" importName="EyeOff" />
          </div>
        </CardContent>
      </Card>

      {/* Social Login Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Social Login İkonları</CardTitle>
          <CardDescription>GoogleIcon, AppleIcon (Custom SVG) + Github (Lucide)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<GoogleIcon size={48} />} name="Google" importName="GoogleIcon" badge="Custom SVG" />
            <IconCard icon={<AppleIcon size={48} />} name="Apple" importName="AppleIcon" badge="Custom SVG" />
            <IconCard icon={<Github size={48} />} name="GitHub" importName="Github" badge="Lucide" />
          </div>
        </CardContent>
      </Card>

      {/* UI Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Genel UI İkonları</CardTitle>
          <CardDescription>Sidebar ve navigation için</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<Home size={48} />} name="Home" importName="Home" />
            <IconCard icon={<Package size={48} />} name="Package" importName="Package" />
            <IconCard icon={<Users size={48} />} name="Users" importName="Users" />
            <IconCard icon={<Settings size={48} />} name="Settings" importName="Settings" />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media İkonları</CardTitle>
          <CardDescription>Footer için sosyal medya linkleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IconCard icon={<Twitter size={48} />} name="Twitter" importName="Twitter" />
            <IconCard icon={<Facebook size={48} />} name="Facebook" importName="Facebook" />
            <IconCard icon={<Linkedin size={48} />} name="LinkedIn" importName="Linkedin" />
            <IconCard icon={<Mail size={48} />} name="Email" importName="Mail" />
          </div>
        </CardContent>
      </Card>

      {/* Usage Example with Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Butonlarda Kullanım</CardTitle>
          <CardDescription>İkonları button'larla birlikte kullanma örnekleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full">
            <GoogleIcon size={20} className="mr-2" />
            Google ile Giriş Yap
          </Button>
          <Button variant="outline" className="w-full">
            <AppleIcon size={20} className="mr-2" />
            Apple ile Giriş Yap
          </Button>
          <Button variant="outline" className="w-full">
            <Github size={20} className="mr-2" />
            GitHub ile Giriş Yap
          </Button>
          <Button variant="outline" className="w-full">
            <Fingerprint size={20} className="mr-2" />
            Parmak İzi ile Giriş
          </Button>
        </CardContent>
      </Card>

      {/* Import Example */}
      <Card>
        <CardHeader>
          <CardTitle>Import Örneği</CardTitle>
          <CardDescription>Hibrit yaklaşım - Lucide + Custom SVG</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Lucide React'ten (1000+ ikon)
import { 
  Github,
  Fingerprint,
  ScanFace,
  QrCode,
  Shield,
  Eye,
  EyeOff,
  MailCheck,
  PhoneCall,
  Home,
  Package,
  Users,
  Settings,
} from 'lucide-react'

// Custom Brand Icons (sadece 2 ikon)
import { 
  GoogleIcon, 
  AppleIcon 
} from '@hascanb/arf-ui-kit/auth-kit'

// Kullanım - aynı props interface
<Button>
  <GoogleIcon size={20} />  {/* Custom SVG */}
  <Github size={20} />      {/* Lucide */}
</Button>`}
          </pre>
        </CardContent>
      </Card>

      {/* Props */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Props</CardTitle>
          <CardDescription>Tüm Lucide ikonları aynı props'ları destekler</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
  strokeWidth?: number
  absoluteStrokeWidth?: boolean
}

// Kullanım örnekleri
<Chrome size={24} />
<Chrome size={32} color="red" />
<Chrome size={20} className="text-blue-500" />
<Chrome size={24} strokeWidth={2} />
<Chrome 
  size={32}
  className="text-red-500 hover:text-red-700"
  onClick={() => alert('Clicked!')}
/>`}
          </pre>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>İkon Arama</CardTitle>
          <CardDescription>Daha fazla ikon için Lucide'ı ziyaret edin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1000+ ikon arasından arama yapın:
          </p>
          <Button variant="outline" asChild>
            <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer">
              lucide.dev/icons →
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Hibrit Strateji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-500">✅ Lucide React (Ana Kaynak)</h3>
              <pre className="bg-muted p-2 rounded text-xs">
{`import { 
  Github,
  Fingerprint,
  Shield,
} from 'lucide-react'

<Github size={20} />`}
              </pre>
              <p className="text-xs text-muted-foreground">
                1000+ ikon, sıfır bakım, auto TypeScript
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-blue-500">🎨 Custom Brand Icons (Minimal)</h3>
              <pre className="bg-muted p-2 rounded text-xs">
{`import { 
  GoogleIcon,
  AppleIcon
} from '@.../auth-kit'

<GoogleIcon size={20} />`}
              </pre>
              <p className="text-xs text-muted-foreground">
                Sadece 2 ikon, brand identity için gerekli
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs">
              <strong>Neden sadece 2 Custom SVG?</strong> Lucide React'te trademark/legal 
              sebeplerle brand logoları (Google, Apple, Facebook vb.) yok. Bunlar social 
              login için şart. Geri kalan tüm ikonlar (Fingerprint, Shield, Eye, Lock, Key 
              vb.) Lucide'da var, onları custom yapmaya gerek yok.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function IconCard({ 
  icon, 
  name, 
  importName,
  badge
}: { 
  icon: React.ReactNode
  name: string
  importName: string
  badge?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted transition-colors">
      <div className="text-foreground">
        {icon}
      </div>
      <div className="text-center space-y-1">
        <span className="text-sm font-medium block">{name}</span>
        <code className="text-xs text-muted-foreground">{importName}</code>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            badge === "Custom SVG" 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
