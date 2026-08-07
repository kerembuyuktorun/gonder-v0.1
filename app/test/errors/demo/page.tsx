/**
 * Errors-Kit Comprehensive Test & Documentation
 * 
 * Bu sayfa Errors-Kit'in tüm özelliklerini kapsamlı şekilde test eder ve dokümante eder.
 * 
 * @module ErrorsKitTest
 * @category Errors-Kit
 * 
 * ## 📚 Errors-Kit Nedir?
 * 
 * Errors-Kit, React uygulamalarında hata yönetimini merkezi ve tutarlı hale getiren
 * production-ready bir error handling sistemidir. Global error boundary, custom error
 * pages ve unified error handling API sağlar.
 * 
 * ## 🎯 Ana Özellikler
 * 
 * ### 1. Error Handling Components
 * - **GlobalErrorBoundary**: React error boundary wrapper
 * - **ErrorRenderer**: Dinamik error page renderer
 * - **Custom Error Pages**: 404, 401, 403, 500, maintenance vb.
 * 
 * ### 2. Error Handler Hook
 * - **useErrorHandler**: Merkezi error handling
 * - **handleError()**: Hataları yakalayıp işle
 * - **getLevel()**: Error severity belirleme
 * - **normalizeError()**: Error normalization
 * 
 * ### 3. Error Types
 * - **not-found** (404): Sayfa bulunamadı
 * - **unauthorized** (401): Yetkisiz erişim
 * - **forbidden** (403): Erişim yasak
 * - **internal-server-error** (500): Sunucu hatası
 * - **bad-request** (400): Geçersiz istek
 * - **maintenance-error**: Bakım modu
 * 
 * ### 4. Integration
 * - Feedback-Kit ile otomatik toast notifications
 * - React Router ile automatic error page routing
 * - Axios/Fetch interceptors için ready
 * - Custom error loggers ile entegrasyon
 * 
 * ## 📦 Import
 * 
 * ```tsx
 * import {
 *   ErrorsKitProvider,
 *   GlobalErrorBoundary,
 *   ErrorRenderer,
 *   useErrorHandler,
 *   createErrorHandler
 * } from '@hascanb/arf-ui-kit/errors-kit'
 * ```
 * 
 * ## 💡 Basic Usage
 * 
 * ### Setup Provider
 * ```tsx
 * import { ErrorsKitProvider } from '@hascanb/arf-ui-kit/errors-kit'
 * 
 * const errorMap = {
 *   'not-found': NotFoundPage,
 *   'unauthorized': UnauthorizedPage,
 *   'internal-server-error': ServerErrorPage
 * }
 * 
 * function App() {
 *   return (
 *     <ErrorsKitProvider errorMap={errorMap}>
 *       <GlobalErrorBoundary>
 *         {children}
 *       </GlobalErrorBoundary>
 *     </ErrorsKitProvider>
 *   )
 * }
 * ```
 * 
 * ### Using Error Handler
 * ```tsx
 * function MyComponent() {
 *   const { handleError } = useErrorHandler()
 *   
 *   const fetchData = async () => {
 *     try {
 *       const data = await api.getData()
 *     } catch (error) {
 *       handleError(error) // Automatically shows error page/toast
 *     }
 *   }
 * }
 * ```
 * 
 * ## 🎨 Error Handling Patterns
 * 
 * ### API Errors
 * ```tsx
 * try {
 *   const response = await fetch('/api/data')
 *   if (!response.ok) {
 *     throw { status: response.status, message: 'API Error' }
 *   }
 * } catch (error) {
 *   handleError(error) // Automatically maps to error page
 * }
 * ```
 * 
 * ### Runtime Errors
 * ```tsx
 * <GlobalErrorBoundary fallback={<ErrorPage />}>
 *   <App />
 * </GlobalErrorBoundary>
 * ```
 * 
 * ### Custom Error Pages
 * ```tsx
 * const errorMap = {
 *   'not-found': () => <div>404 - Not Found</div>,
 *   'unauthorized': () => <div>401 - Unauthorized</div>
 * }
 * 
 * <ErrorsKitProvider errorMap={errorMap}>
 *   <ErrorRenderer code="not-found" />
 * </ErrorsKitProvider>
 * ```
 * 
 * ## 🔐 Error Levels
 * 
 * Errors-Kit otomatik olarak error severity belirler:
 * 
 * - **info**: 404 Not Found
 * - **warning**: 401 Unauthorized, 403 Forbidden
 * - **error**: 400 Bad Request, 500 Internal Server Error
 * - **fatal**: Maintenance, Critical failures
 * 
 * ## ♿ Accessibility
 * 
 * - ✅ Semantic HTML: Proper heading hierarchy
 * - ✅ Focus Management: Auto-focus on error message
 * - ✅ Screen Reader: Announcements for errors
 * - ✅ Keyboard Navigation: Fully navigable
 * 
 * ## 🎯 Test Scenarios
 * 
 * Bu sayfada test edilenler:
 * 
 * 1. **Error Rendering**: Tüm error page tipleri
 * 2. **Error Boundary**: Runtime crash handling
 * 3. **API Errors**: Network error simulation
 * 4. **Custom Errors**: Özel error handling
 * 5. **Feedback Integration**: Toast notifications
 * 
 * @see /src/errors-kit - Source code
 * @see GlobalErrorBoundary - Error boundary implementation
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ErrorsKitProvider,
  ErrorRenderer,
  createErrorHandler,
  useErrorHandler,
  GlobalErrorBoundary,
} from '@hascanb/arf-ui-kit/errors-kit'
import { FeedbackProvider, useFeedback } from '@hascanb/arf-ui-kit/feedback-kit'
import {
  NotFoundPage,
  UnauthorizedPage,
  ForbiddenPage,
  ServerErrorPage,
} from './example-pages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const errorMap = {
  'not-found': NotFoundPage,
  unauthorized: UnauthorizedPage,
  forbidden: ForbiddenPage,
  'internal-server-error': ServerErrorPage,
  'bad-request': NotFoundPage,
  'maintenance-error': ServerErrorPage,
}

function CrashyPanel({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('Demo runtime crash triggered intentionally.')
  }

  return <p className="text-sm text-muted-foreground">Panel healthy. Crash trigger bekleniyor.</p>
}

function TestContent() {
  const router = useRouter()
  const feedback = useFeedback()
  const { handleError, getLevel, normalizeError } = useErrorHandler()

  const [lastError, setLastError] = useState<string>('')
  const [renderErrorCode, setRenderErrorCode] = useState<string>('not-found')
  const [shouldCrash, setShouldCrash] = useState(false)

  const levelToFeedbackType = (level?: string): 'error' | 'warning' | 'info' => {
    if (level === 'critical' || level === 'high') return 'error'
    if (level === 'medium') return 'warning'
    return 'info'
  }

  const simulateError = (type: string) => {
    let error: Record<string, unknown> | Error | undefined

    switch (type) {
      case 'axios-404':
        error = {
          response: {
            status: 404,
            data: { code: 'USER_NOT_FOUND', message: 'Kullanici bulunamadi' },
          },
        }
        break
      case 'axios-401':
        error = {
          response: {
            status: 401,
            data: { code: 'UNAUTHORIZED', message: 'Oturum süresi doldu' },
          },
        }
        break
      case 'axios-500':
        error = {
          response: {
            status: 500,
            data: { code: 'INTERNAL_ERROR', message: 'Sunucu hatasi' },
          },
        }
        break
      case 'fetch-403':
        error = {
          status: 403,
          statusText: 'Forbidden',
          message: 'Erişim engellendi',
        }
        break
      case 'custom-low':
        error = {
          code: 'VALIDATION_ERROR',
          message: 'Form doğrulama hatasi',
        }
        break
      default:
        error = new Error('Bilinmeyen hata')
    }

    const normalized = normalizeError(error)
    const level = getLevel(error)

    setLastError(JSON.stringify({ ...normalized, level }, null, 2))
    handleError(error)
  }

  const testManualHandler = () => {
    const customHandler = createErrorHandler({
      onToast: (msg, level) => {
        feedback.notify({
          title: msg,
          type: levelToFeedbackType(level),
          description: `level: ${level}`,
        })
      },
      onRedirect: (path) => {
        feedback.info('Yonlendirme', path)
      },
      on401: () => {
        feedback.warning('401 yakalandi', 'Login ekranina yonlendirme tetiklenebilir')
      },
    })

    customHandler.handleError({ response: { status: 401 } })
  }

  return (
    <div className="container py-8 space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Errors + Feedback Kit Test</h1>
        <p className="text-muted-foreground mt-2">
          Merkezi hata yönetimi, toast feedback merkezi ve global recovery boundary
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>1. Error Simulation - Level Actions</CardTitle>
          <CardDescription>Farkli hata tiplerini test edin (toast / redirect / modal)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Button onClick={() => simulateError('axios-404')} variant="outline">
              <Badge variant="secondary" className="mr-2">high</Badge>404
            </Button>
            <Button onClick={() => simulateError('axios-401')} variant="outline">
              <Badge variant="secondary" className="mr-2">high</Badge>401
            </Button>
            <Button onClick={() => simulateError('fetch-403')} variant="outline">
              <Badge variant="secondary" className="mr-2">high</Badge>403
            </Button>
            <Button onClick={() => simulateError('axios-500')} variant="outline">
              <Badge variant="destructive" className="mr-2">critical</Badge>500
            </Button>
            <Button onClick={() => simulateError('custom-low')} variant="outline">
              <Badge className="mr-2">low</Badge>custom
            </Button>
            <Button onClick={testManualHandler} variant="outline">
              Manual handler
            </Button>
          </div>

          {lastError && (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
              {lastError}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. ErrorRenderer</CardTitle>
          <CardDescription>Slug tabanli dinamik hata sayfasi render</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setRenderErrorCode('not-found')} variant="outline">404</Button>
            <Button onClick={() => setRenderErrorCode('unauthorized')} variant="outline">401</Button>
            <Button onClick={() => setRenderErrorCode('forbidden')} variant="outline">403</Button>
            <Button onClick={() => setRenderErrorCode('internal-server-error')} variant="outline">500</Button>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <ErrorRenderer
              errorCode={renderErrorCode}
              message="Bu bir test hatasıdır"
              onBack={() => feedback.info('Geri aksiyonu tetiklendi')}
              onRetry={() => feedback.success('Tekrar dene çalıştı')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Global Error Boundary Recovery</CardTitle>
          <CardDescription>Uygulama crash oldugunda Retry ve Home aksiyonlari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" onClick={() => setShouldCrash(true)}>
            Crash Tetikle
          </Button>

          <GlobalErrorBoundary
            onReset={() => {
              setShouldCrash(false)
              feedback.success('Boundary reset edildi')
            }}
            onGoHome={() => router.push('/')}
          >
            <CrashyPanel shouldCrash={shouldCrash} />
          </GlobalErrorBoundary>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorsKitShell() {
  const router = useRouter()
  const feedback = useFeedback()

  return (
    <ErrorsKitProvider
      errorMap={errorMap}
      handlerConfig={{
        onToast: (message, level) => {
          feedback.notify({
            title: message,
            type: level === 'critical' || level === 'high' ? 'error' : level === 'medium' ? 'warning' : 'info',
            description: `Error Level: ${level}`,
          })
        },
        onRedirect: (path) => {
          feedback.info('Yonlendirme', path)
          router.push(path)
        },
        on401: () => {
          feedback.warning('Oturum süresi doldu')
        },
      }}
    >
      <TestContent />
    </ErrorsKitProvider>
  )
}

export default function ErrorsKitTestPage() {
  return (
    <FeedbackProvider>
      <ErrorsKitShell />
    </FeedbackProvider>
  )
}
