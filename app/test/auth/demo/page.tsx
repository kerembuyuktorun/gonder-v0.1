/**
 * Auth-Kit Test & Documentation Hub
 * 
 * Bu sayfa Auth-Kit'in tüm özelliklerini ve bileşenlerini kapsamlı şekilde test etmek
 * ve dokümante etmek için tasarlanmıştır.
 * 
 * @module AuthKitTestHub
 * @category Testing & Documentation
 * 
 * ## 📚 Auth-Kit Nedir?
 * 
 * Auth-Kit, modern web uygulamaları için eksiksiz bir kimlik doğrulama çözümüdür.
 * React Hook Form, Zod validation ve TypeScript ile tam tip güvenliği sunar.
 * 
 * ## 🎯 Ana Özellikler
 * 
 * ### 1. Authentication Forms
 * - **SignInForm**: Kullanıcı giriş formu (email/username + password)
 * - **OtpForm**: Tek kullanımlık şifre doğrulama
 * - **ForgotPasswordForm**: Şifre sıfırlama talebi
 * - **ResetPasswordForm**: Yeni şifre belirleme
 * 
 * ### 2. Page Templates
 * - **SignInPageContent**: Hazır giriş sayfası (tek panel)
 * - **SignIn2PageContent**: Split-screen giriş sayfası (çift panel)
 * - **OtpPageContent**: OTP doğrulama sayfası
 * - **ForgotPasswordPageContent**: Şifre sıfırlama talebi sayfası
 * - **ResetPasswordPageContent**: Şifre değiştirme sayfası
 * 
 * ### 3. Validation Utilities
 * - Email, username, phone validation
 * - Password strength calculation
 * - OTP format validation
 * - Password similarity checking
 * 
 * ### 4. Token Management
 * - JWT token storage & retrieval
 * - Token expiration checking
 * - Refresh token handling
 * - Auto session management
 * 
 * ### 5. Brand Icons
 * - GoogleIcon: Google OAuth için
 * - AppleIcon: Apple Sign In için
 * 
 * ### 6. i18n Support
 * - Türkçe ve İngilizce dil desteği
 * - Özelleştirilebilir çeviriler
 * - Otomatik dil seçimi
 * 
 * ## 🧪 Test Sayfaları
 * 
 * Bu hub'dan aşağıdaki test sayfalarına erişebilirsiniz:
 * 
 * 1. **Page Templates** (`/test/auth/pages`)
 *    - SignInPageContent demo
 *    - SignIn2PageContent demo
 *    - OTP, Forgot Password, Reset Password demos
 * 
 * 2. **Form Components** (`/test/auth/components`)
 *    - Standalone form component testleri
 *    - Props ve event handling örnekleri
 *    - Validation demonstrasyonları
 * 
 * 3. **Brand Icons** (`/test/icons/auth`)
 *    - Google ve Apple ikonları
 *    - Boyut ve renk varyantları
 * 
 * 4. **Utilities** (`/test/utils`)
 *    - Validation fonksiyonları (`/test/utils/validation`)
 *    - Token management (`/test/utils/token`)
 * 
 * ## 📦 Installation
 * 
 * ```tsx
 * import { 
 *   AuthKitProvider,
 *   SignInForm,
 *   useAuthKit 
 * } from '@hascanb/arf-ui-kit/auth-kit'
 * ```
 * 
 * ## ⚙️ Configuration
 * 
 * ```tsx
 * const authConfig: AuthKitConfig = {
 *   // API endpoints
 *   signIn: async (credentials) => { ... },
 *   verifyOtp: async (otpData) => { ... },
 *   forgotPassword: async (data) => { ... },
 *   resetPassword: async (data) => { ... },
 *   
 *   // Routes
 *   routes: {
 *     signIn: '/test/auth/pages/signin',
 *     otp: '/test/auth/pages/otp',
 *     forgotPassword: '/test/auth/pages/forgot-password',
 *     resetPassword: '/test/auth/pages/reset-password',
 *     afterSignIn: '/dashboard'
 *   },
 *   
 *   // UI Customization
 *   ui: {
 *     showRememberMe: true,
 *     showSocialLogin: true,
 *     allowUsernameLogin: true
 *   },
 *   
 *   // i18n
 *   locale: 'tr',
 *   translations: { ... }
 * }
 * ```
 * 
 * ## 🔐 Security Features
 * 
 * - ✅ Password strength validation
 * - ✅ CSRF protection ready
 * - ✅ XSS prevention
 * - ✅ Secure token storage
 * - ✅ Auto token refresh
 * - ✅ Session timeout handling
 * 
 * ## 🎨 Theming
 * 
 * Auth-Kit shadcn/ui component library'sini kullanır ve tam tema desteği sunar.
 * Dark/Light mode otomatik olarak desteklenir.
 * 
 * @see {@link https://github.com/arftech/arfweb-shared-lib}
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  LogIn, 
  KeyRound, 
  ShieldCheck, 
  Palette,
  Globe,
  Code,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react'

export default function AuthKitTestHub() {
  const features = [
    {
      icon: LogIn,
      title: 'Authentication Forms',
      description: 'SignIn, OTP, Forgot Password ve Reset Password formları',
      status: 'complete'
    },
    {
      icon: FileText,
      title: 'Page Templates',
      description: 'Hazır sayfa şablonları ve layout\'ları',
      status: 'complete'
    },
    {
      icon: ShieldCheck,
      title: 'Validation Utilities',
      description: 'Email, password, OTP validasyon fonksiyonları',
      status: 'complete'
    },
    {
      icon: KeyRound,
      title: 'Token Management',
      description: 'JWT token storage, refresh ve expiration handling',
      status: 'complete'
    },
    {
      icon: Palette,
      title: 'Brand Icons',
      description: 'Google ve Apple OAuth ikonları',
      status: 'complete'
    },
    {
      icon: Globe,
      title: 'i18n Support',
      description: 'Türkçe/İngilizce dil desteği ve özelleştirme',
      status: 'complete'
    }
  ]

  const testPages = [
    {
      category: 'Page Templates',
      icon: FileText,
      description: 'Hazır sayfa şablonlarını test edin',
      pages: [
        { 
          title: 'SignIn Page', 
          path: '/test/auth/pages/signin',
          description: 'Tek panel giriş sayfası'
        },
        { 
          title: 'SignIn2 Page', 
          path: '/test/auth/pages/signin2',
          description: 'Split-screen giriş sayfası'
        },
        { 
          title: 'OTP Page', 
          path: '/test/auth/pages/otp',
          description: 'Tek kullanımlık şifre doğrulama'
        },
        { 
          title: 'Forgot Password', 
          path: '/test/auth/pages/forgot-password',
          description: 'Şifre sıfırlama talebi'
        },
        { 
          title: 'Reset Password', 
          path: '/test/auth/pages/reset-password',
          description: 'Yeni şifre belirleme'
        }
      ]
    },
    {
      category: 'Form Components',
      icon: Code,
      description: 'Standalone form componentlerini inceleyin',
      pages: [
        { 
          title: 'SignInForm', 
          path: '/test/auth/components/signin-form',
          description: 'Props ve event handling'
        },
        { 
          title: 'OtpForm', 
          path: '/test/auth/components/otp-form',
          description: 'OTP input ve validation'
        },
        { 
          title: 'ForgotPasswordForm', 
          path: '/test/auth/components/forgot-password-form',
          description: 'Email gönderimi formu'
        },
        { 
          title: 'ResetPasswordForm', 
          path: '/test/auth/components/reset-password-form',
          description: 'Yeni şifre belirleme formu'
        }
      ]
    },
    {
      category: 'Brand Icons',
      icon: Palette,
      description: 'OAuth provider ikonlarını görüntüleyin',
      pages: [
        { 
          title: 'Auth Icons', 
          path: '/test/icons/auth',
          description: 'Google ve Apple ikonları'
        }
      ]
    },
    {
      category: 'Utilities',
      icon: BookOpen,
      description: 'Yardımcı fonksiyonları test edin',
      pages: [
        { 
          title: 'Validation Utils', 
          path: '/test/utils/validation',
          description: 'Email, password, OTP validation'
        },
        { 
          title: 'Token Utils', 
          path: '/test/utils/token',
          description: 'JWT token management'
        }
      ]
    }
  ]

  const codeExamples = [
    {
      title: 'Basic Usage',
      code: `import { AuthKitProvider, SignInForm } from '@hascanb/arf-ui-kit/auth-kit'

<AuthKitProvider config={authConfig}>
  <SignInForm 
    onSuccess={(response) => {
      console.log('Giriş başarılı!', response)
    }}
  />
</AuthKitProvider>`
    },
    {
      title: 'Using Hooks',
      code: `import { useAuthKit } from '@hascanb/arf-ui-kit/auth-kit'

function MyComponent() {
  const { signIn, isLoading } = useAuthKit()
  
  const handleSignIn = async () => {
    const result = await signIn({ 
      username: 'user@example.com',
      password: 'password123'
    })
    
    if (result.success) {
      console.log('Token:', result.token)
    }
  }
}`
    },
    {
      title: 'Validation',
      code: `import { 
  isValidEmail, 
  getPasswordStrength 
} from '@hascanb/arf-ui-kit/auth-kit'

const email = 'user@example.com'
const isValid = isValidEmail(email) // true

const password = 'MySecurePass123!'
const strength = getPasswordStrength(password) // 4 (strong)`
    }
  ]

  return (
    <div className="container py-8 space-y-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Auth-Kit</h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive Authentication Solution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Production Ready
          </Badge>
          <Badge variant="outline">v1.0.0</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">i18n</Badge>
        </div>
      </div>

      <Separator />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Genel Bakış
          </CardTitle>
          <CardDescription>
            Auth-Kit, modern web uygulamaları için eksiksiz kimlik doğrulama çözümü
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Auth-Kit, kullanıcı kimlik doğrulama süreçlerini basitleştiren, güvenli ve 
            kullanıcı dostu bir component library&apos;sidir. React Hook Form ve Zod 
            validation ile entegre çalışır, TypeScript ile tam tip güvenliği sunar.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.title}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{feature.title}</p>
                      <Badge variant="default" className="h-5 text-xs">
                        ✓
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Pages */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Test & Documentation Pages</h2>
          <p className="text-muted-foreground">
            Auth-Kit&apos;in tüm özelliklerini keşfedin ve test edin
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {testPages.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {section.category}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.pages.map((page) => (
                    <Link key={page.path} href={page.path}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-colors group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {page.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {page.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Hızlı başlangıç için örnek kullanımlar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {codeExamples.map((example, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-sm font-semibold">{example.title}</h3>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security & Best Practices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  <strong>Password Strength Validation:</strong> Güçlü şifre kontrolü
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  <strong>CSRF Protection Ready:</strong> Cross-site request forgery koruması
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  <strong>XSS Prevention:</strong> Otomatik input sanitization
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  <strong>Secure Storage:</strong> Güvenli token ve session yönetimi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  <strong>Token Refresh:</strong> Otomatik token yenileme mekanizması
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Her zaman <code className="text-xs bg-muted px-1 rounded">AuthKitProvider</code> kullanın
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  API endpoint&apos;lerini environment variables&apos;da saklayın
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Token&apos;ları localStorage yerine secure cookie&apos;lerde saklayın
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Social login için HTTPS kullanımı zorunludur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  Error handling için try-catch blokları kullanın
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>🚀 Quick Start</CardTitle>
          <CardDescription>
            Hemen test etmeye başlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/test/auth/pages/signin">
            <Button variant="default">
              <LogIn className="h-4 w-4 mr-2" />
              SignIn Demo
            </Button>
          </Link>
          <Link href="/test/auth/components/signin-form">
            <Button variant="outline">
              <Code className="h-4 w-4 mr-2" />
              Component Test
            </Button>
          </Link>
          <Link href="/test/utils/validation">
            <Button variant="outline">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Validation Utils
            </Button>
          </Link>
          <Link href="/test/utils/token">
            <Button variant="outline">
              <KeyRound className="h-4 w-4 mr-2" />
              Token Management
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
