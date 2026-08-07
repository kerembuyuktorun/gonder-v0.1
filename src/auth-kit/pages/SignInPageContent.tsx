'use client'

/**
 * Auth Kit - Sign In Page Content
 * 
 * Tam sayfa giriş layout'u
 * Ortalanmış, card tabanlı standart giriş sayfası
 */

import React from 'react'
import Image from 'next/image'
import { useAuthKit } from '../context/useAuthKit'
import { SignInForm } from '../components/SignInForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SignInPageContent() {
  const { config, t } = useAuthKit()
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        {/* Logo */}
        {config.ui?.logoUrl && (
          <div className="flex justify-center mb-8">
            <Image
              src={config.ui.logoUrl}
              alt={config.ui.brandName || 'Logo'}
              width={192}
              height={48}
              className="h-12 w-auto"
              unoptimized
            />
          </div>
        )}
        
        {/* Sign In Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('signIn.title')}
            </CardTitle>
            <CardDescription>
              {t('signIn.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
