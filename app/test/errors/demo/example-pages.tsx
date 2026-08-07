/**
 * Example Error Pages for Testing
 * 
 * Demonstrates ErrorRenderer with custom error pages
 */

'use client'

import Link from 'next/link'
import { AlertCircle, Home, RefreshCw, Lock, FileQuestion } from 'lucide-react'
import { ErrorPageProps } from '@hascanb/arf-ui-kit/errors-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * 404 Not Found Error Page
 */
export function NotFoundPage({ message, onBack }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <FileQuestion className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">Sayfa Bulunamadı</h2>
            <p className="text-muted-foreground">
              {message || 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.'}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
            {onBack && (
              <Button onClick={onBack}>
                Geri Dön
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 401 Unauthorized Error Page
 */
export function UnauthorizedPage({ message, onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-warning/10 p-4">
              <Lock className="h-12 w-12 text-warning" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">401</h1>
            <h2 className="text-2xl font-semibold">Oturum Süresi Doldu</h2>
            <p className="text-muted-foreground">
              {message || 'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.'}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/signin">
                Giriş Yap
              </Link>
            </Button>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 403 Forbidden Error Page
 */
export function ForbiddenPage({ message, onBack }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <Lock className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">403</h1>
            <h2 className="text-2xl font-semibold">Erişim Engellendi</h2>
            <p className="text-muted-foreground">
              {message || 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
            {onBack && (
              <Button onClick={onBack}>
                Geri Dön
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 500 Internal Server Error Page
 */
export function ServerErrorPage({ message, onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">500</h1>
            <h2 className="text-2xl font-semibold">Sunucu Hatası</h2>
            <p className="text-muted-foreground">
              {message || 'Bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Dene
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
