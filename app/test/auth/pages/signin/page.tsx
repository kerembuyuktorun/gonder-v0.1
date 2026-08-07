/**
 * SignInPageContent Test & Documentation
 * 
 * Bu sayfa SignInPageContent component'ini detaylı şekilde test eder ve dokümante eder.
 * 
 * @module SignInPageTest
 * @category Auth-Kit / Page Templates
 * 
 * ## 📖 Component Açıklaması
 * 
 * `SignInPageContent` tam sayfa bir giriş deneyimi sunar. Tek panel layout kullanır
 * ve merkezi bir tasarıma sahiptir. Basit ve temiz giriş sayfaları için ideal bir çözümdür.
 * 
 * ## 🎨 Design Features
 * 
 * - **Single Panel Layout**: Tek kolonda form ve logo
 * - **Center Aligned**: Merkezi hizalama
 * - **Responsive**: Mobile-first tasarım
 * - **Minimal**: Sade ve odaklanmış UI
 * - **Brandable**: Logo ve renk özelleştirme
 * 
 * ## ⚙️ Props
 * 
 * Bu component props almaz. Tüm konfigürasyon `AuthKitProvider` üzerinden yapılır.
 * 
 * ## 📦 Import
 * 
 * ```tsx
 * import { SignInPageContent } from '@hascanb/arf-ui-kit/auth-kit'
 * ```
 * 
 * ## 🔧 Configuration
 * 
 * SignInPageContent, AuthKitProvider'dan aşağıdaki konfigürasyonları kullanır:
 * 
 * ```tsx
 * const authConfig: AuthKitConfig = {
 *   // API Handler
 *   signIn: async (credentials) => {
 *     const response = await fetch('/api/auth/signin', {
 *       method: 'POST',
 *       body: JSON.stringify(credentials)
 *     })
 *     return response.json()
 *   },
 *   
 *   // Routes
 *   routes: {
 *     signIn: '/test/auth/pages/signin',
 *     afterSignIn: '/dashboard',
 *     forgotPassword: '/test/auth/pages/forgot-password'
 *   },
 *   
 *   // UI Options
 *   ui: {
 *     showRememberMe: true,        // "Beni Hatırla" checkbox
 *     showSocialLogin: true,        // Google/Apple butonları
 *     allowUsernameLogin: true,     // Username ile giriş
 *     brandLogo: '/logo.png',       // Logo URL
 *     brandName: 'My App'           // Uygulama adı
 *   },
 *   
 *   // i18n
 *   locale: 'tr',
 *   translations: {
 *     tr: {
 *       signIn: {
 *         title: 'Giriş Yap',
 *         subtitle: 'Devam etmek için giriş yapın',
 *         // ... diğer çeviriler
 *       }
 *     }
 *   }
 * }
 * ```
 * 
 * ## 💡 Usage Examples
 * 
 * ### Basic Usage
 * 
 * ```tsx
 * import { AuthKitProvider, SignInPageContent } from '@hascanb/arf-ui-kit/auth-kit'
 * 
 * export default function SignInPage() {
 *   return (
 *     <AuthKitProvider config={authConfig}>
 *       <SignInPageContent />
 *     </AuthKitProvider>
 *   )
 * }
 * ```
 * 
 * ### With Custom Success Handler
 * 
 * ```tsx
 * const authConfig = {
 *   signIn: async (credentials) => {
 *     const result = await myAuthAPI.signIn(credentials)
 *     
 *     if (result.success) {
 *       // Custom logic
 *       analytics.track('User Signed In', { userId: result.userId })
 *       
 *       return {
 *         success: true,
 *         token: result.accessToken,
 *         user: result.userData
 *       }
 *     }
 *     
 *     return { success: false, error: result.message }
 *   },
 *   // ... other config
 * }
 * ```
 * 
 * ## 🔐 Security Considerations
 * 
 * 1. **HTTPS Only**: Production'da mutlaka HTTPS kullanın
 * 2. **CSRF Token**: API'ye CSRF token ekleyin
 * 3. **Rate Limiting**: Brute force saldırılarına karşı rate limiting uygulayın
 * 4. **Input Sanitization**: Otomatik olarak yapılır ancak API tarafında da kontrol edin
 * 5. **Error Messages**: Spesifik hatalar vermeyin ("Invalid credentials" yetersiz)
 * 
 * ## ♿ Accessibility
 * 
 * - ✅ Keyboard Navigation: Tab ile tüm alanlara erişilebilir
 * - ✅ Screen Reader: ARIA labels ve roles mevcut
 * - ✅ Focus Management: Otomatik focus yönetimi
 * - ✅ Error Announcements: Hata mesajları screen reader'a bildirilir
 * - ✅ High Contrast: Tema değişikliklerine uyumlu
 * 
 * ## 📱 Responsive Behavior
 * 
 * | Breakpoint | Behavior |
 * |------------|----------|
 * | Mobile (<640px) | Full width, stacked layout |
 * | Tablet (640-1024px) | Centered card, max-width 500px |
 * | Desktop (>1024px) | Centered card, max-width 600px |
 * 
 * ## 🎯 Features Included
 * 
 * - [x] Email/Username input
 * - [x] Password input with visibility toggle
 * - [x] Remember Me checkbox
 * - [x] Forgot Password link
 * - [x] Social login buttons (Google, Apple)
 * - [x] Form validation with Zod
 * - [x] Loading states
 * - [x] Error handling
 * - [x] Auto-redirect after success
 * 
 * ## 🐛 Common Issues & Solutions
 * 
 * ### Issue: Redirect not working
 * **Solution**: Ensure `routes.afterSignIn` is configured correctly
 * 
 * ### Issue: Social login buttons not showing
 * **Solution**: Set `ui.showSocialLogin: true` in config
 * 
 * ### Issue: Translation not applied
 * **Solution**: Check `locale` value and `translations` object structure
 * 
 * @see SignIn2PageContent - Split-screen variant
 * @see SignInForm - Standalone form component
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AuthKitProvider, 
  SignInPageContent, 
  type AuthKitConfig,
  type SignInCredentials
} from '@hascanb/arf-ui-kit/auth-kit'
import { 
  Eye, 
  Code, 
  Settings, 
  PlayCircle, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function SignInPageTest() {
  const [showDemo, setShowDemo] = useState(false)
  const [demoConfig, setDemoConfig] = useState<'default' | 'minimal' | 'full'>('default')

  // Demo configuration presets
  const configs: Record<string, Partial<AuthKitConfig>> = {
    default: {
      onSignIn: async (credentials: SignInCredentials) => {
        toast.info(`Demo: Attempting sign in with ${credentials.username}`)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simple validation
        if (credentials.password === 'demo123') {
          toast.success('Demo: Sign in successful!')
          return {
            success: true,
            data: {
              token: 'demo-jwt-token-' + Date.now(),
              user: {
                id: '1',
                name: 'Demo User',
                email: credentials.username
              }
            }
          }
        }
        
        toast.error('Demo: Invalid credentials (try password: demo123)')
        return {
          success: false,
          error: 'Invalid credentials'
        }
      },
      routes: {
        afterSignIn: '/dashboard',
        forgotPassword: '/test/auth/pages/forgot-password',
        resetPassword: '/test/auth/pages/reset-password',
        signIn: '/test/auth/pages/signin'
      },
      ui: {
        showRememberMe: true,
        showForgotPassword: true
      },
      locale: 'tr'
    },
    minimal: {
      onSignIn: async (credentials: SignInCredentials) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Minimal config demo')
        return {
          success: true,
          data: {
            token: 'demo-token',
            user: { id: '1', name: 'User', email: credentials.username }
          }
        }
      },
      routes: {
        afterSignIn: '/dashboard',
        forgotPassword: '/test/auth/pages/forgot-password',
        resetPassword: '/test/auth/pages/reset-password',
        signIn: '/test/auth/pages/signin'
      },
      ui: {
        showRememberMe: false,
        showForgotPassword: false
      },
      locale: 'tr'
    },
    full: {
      onSignIn: async (credentials: SignInCredentials) => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.success('Full config demo with all features')
        return {
          success: true,
          data: {
            token: 'demo-token',
            user: { id: '1', name: 'User', email: credentials.username }
          }
        }
      },
      routes: {
        afterSignIn: '/dashboard',
        forgotPassword: '/test/auth/pages/forgot-password',
        resetPassword: '/test/auth/pages/reset-password',
        signIn: '/test/auth/pages/signin'
      },
      ui: {
        showRememberMe: true,
        showForgotPassword: true,
        brandName: 'ARF Tech'
      },
      locale: 'tr'
    }
  }

  const codeExamples = {
    basic: `import { AuthKitProvider, SignInPageContent } from '@hascanb/arf-ui-kit/auth-kit'

export default function SignInPage() {
  const authConfig = {
    signIn: async (credentials) => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      return response.json()
    },
    routes: {
      afterSignIn: '/dashboard'
    },
    ui: {
      showRememberMe: true,
      showSocialLogin: true
    }
  }

  return (
    <AuthKitProvider config={authConfig}>
      <SignInPageContent />
    </AuthKitProvider>
  )
}`,
    withHooks: `import { AuthKitProvider, SignInPageContent, useAuthKit } from '@hascanb/arf-ui-kit/auth-kit'

function SignInWithTracking() {
  const { isLoading } = useAuthKit()
  
  React.useEffect(() => {
    if (isLoading) {
      analytics.track('SignIn Started')
    }
  }, [isLoading])
  
  return <SignInPageContent />
}

export default function SignInPage() {
  return (
    <AuthKitProvider config={authConfig}>
      <SignInWithTracking />
    </AuthKitProvider>
  )
}`,
    advanced: `const authConfig: AuthKitConfig = {
  signIn: async (credentials) => {
    // Add CSRF token
    const csrfToken = getCsrfToken()
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Include cookies
      })
      
      if (!response.ok) {
        throw new Error('Network error')
      }
      
      const data = await response.json()
      
      // Store tokens securely
      if (data.accessToken) {
        setSecureCookie('accessToken', data.accessToken)
      }
      if (data.refreshToken) {
        setSecureCookie('refreshToken', data.refreshToken, { httpOnly: true })
      }
      
      // Track analytics
      analytics.identify(data.user.id, {
        email: data.user.email,
        name: data.user.name
      })
      analytics.track('User Signed In')
      
      return {
        success: true,
        token: data.accessToken,
        user: data.user
      }
    } catch (_error) {
      return {
        success: false,
        error: 'An error occurred. Please try again.'
      }
    }
  },
  routes: {
    signIn: '/test/auth/pages/signin',
    afterSignIn: '/dashboard',
    forgotPassword: '/test/auth/pages/forgot-password'
  },
  ui: {
    showRememberMe: true,
    showSocialLogin: true,
    allowUsernameLogin: true,
    brandLogo: '/logo.svg',
    brandName: 'My App'
  },
  locale: 'tr',
  translations: {
    tr: {
      signIn: {
        title: 'Hoş Geldiniz',
        subtitle: 'Hesabınıza giriş yapın'
      }
    }
  }
}`
  }

  return (
    <div className="container py-8 space-y-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            ← Back to Auth-Kit
          </Button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">SignInPageContent</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Single panel sign-in page template with centered layout
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="default">Page Template</Badge>
          <Badge variant="outline">Single Panel</Badge>
          <Badge variant="outline">Responsive</Badge>
          <Badge variant="outline">i18n Ready</Badge>
        </div>
      </div>

      <Separator />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Component Overview</CardTitle>
          <CardDescription>
            SignInPageContent tam sayfa giriş deneyimi sunar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <code className="text-xs bg-muted px-1 rounded">SignInPageContent</code> component&apos;i,
            kullanıcı girişi için hazır bir sayfa şablonudur. Tek kolonda form ve logo içerir,
            merkezi hizalama ile minimal ve temiz bir tasarıma sahiptir. Mobil cihazlarda full-width,
            desktop&apos;ta ise maksimum genişlik sınırlı card layout kullanır.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Included Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Email/Username input</li>
                <li>• Password input with toggle</li>
                <li>• Remember Me checkbox</li>
                <li>• Forgot Password link</li>
                <li>• Social login buttons</li>
                <li>• Form validation</li>
                <li>• Loading states</li>
                <li>• Auto-redirect</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Configuration Options
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• API endpoint setup</li>
                <li>• Route configuration</li>
                <li>• UI customization</li>
                <li>• i18n translations</li>
                <li>• Brand logo &amp; name</li>
                <li>• Social login toggle</li>
                <li>• Remember Me toggle</li>
                <li>• Username login toggle</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Interactive Demo
          </CardTitle>
          <CardDescription>
            Try different configurations and see live behavior (Password: demo123)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={demoConfig === 'default' ? 'default' : 'outline'}
              onClick={() => {
                setDemoConfig('default')
                setShowDemo(false)
              }}
            >
              Default Config
            </Button>
            <Button
              variant={demoConfig === 'minimal' ? 'default' : 'outline'}
              onClick={() => {
                setDemoConfig('minimal')
                setShowDemo(false)
              }}
            >
              Minimal (No Social)
            </Button>
            <Button
              variant={demoConfig === 'full' ? 'default' : 'outline'}
              onClick={() => {
                setDemoConfig('full')
                setShowDemo(false)
              }}
            >
              Full Featured
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? <Eye className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              {showDemo ? 'Hide Demo' : 'Show Demo'}
            </Button>
          </div>

          {showDemo && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  <strong>Demo Mode:</strong> Use any email and password: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">demo123</code>
                </p>
              </div>
              <AuthKitProvider config={configs[demoConfig] as AuthKitConfig}>
                <SignInPageContent />
              </AuthKitProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
          <TabsTrigger value="hooks">With Hooks</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Basic Implementation
              </CardTitle>
              <CardDescription>
                Minimal setup ile hızlı başlangıç
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.basic}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Using with Hooks
              </CardTitle>
              <CardDescription>
                useAuthKit hook ile state management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.withHooks}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Production-ready setup with security, analytics, and error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                <code>{codeExamples.advanced}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Props Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configuration Reference</CardTitle>
          <CardDescription>
            AuthKitProvider config options for SignInPageContent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Property</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Required</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-mono text-xs">signIn</td>
                    <td className="p-3 font-mono text-xs">Function</td>
                    <td className="p-3">
                      <Badge variant="destructive" className="text-xs">Yes</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      API handler for sign in request
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">routes.afterSignIn</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Redirect URL after successful sign in (default: &apos;/&apos;)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">routes.forgotPassword</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Forgot password page URL
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ui.showRememberMe</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Show &quot;Remember Me&quot; checkbox (default: true)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ui.showSocialLogin</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Show social login buttons (default: true)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ui.allowUsernameLogin</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Allow username instead of email (default: false)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ui.brandLogo</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Brand logo URL
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ui.brandName</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Application name
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">locale</td>
                    <td className="p-3 font-mono text-xs">&apos;tr&apos; | &apos;en&apos;</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Interface language (default: &apos;tr&apos;)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>AuthKitProvider&apos;ı root seviyede kullanın</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>API endpoint&apos;lerini environment variables&apos;da saklayın</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>HTTPS kullanımı production için zorunludur</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Rate limiting ile brute force saldırılarını önleyin</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Success durumunda analytics event&apos;i gönderin</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Common Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Token&apos;ları localStorage&apos;da saklamayın (XSS riski)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Spesifik error mesajları vermeyin (&quot;User not found&quot; yerine &quot;Invalid credentials&quot;)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>HTTP üzerinden production deployment yapmayın</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>CSRF protection olmadan API çağrısı yapmayın</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Error handling olmadan bırakmayın (try-catch kullanın)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Pages */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>🔗 Related Pages</CardTitle>
          <CardDescription>
            Diğer auth component ve utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/auth/pages/signin2">
                <RefreshCw className="h-4 w-4 mr-2" />
                SignIn2PageContent (Split Screen)
              </a>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/auth/components/signin-form">
                <Code className="h-4 w-4 mr-2" />
                SignInForm Component
              </a>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/auth/pages/forgot-password">
                <AlertCircle className="h-4 w-4 mr-2" />
                Forgot Password Page
              </a>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <a href="/test/utils/validation">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Validation Utilities
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
