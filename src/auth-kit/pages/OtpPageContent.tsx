'use client'

/**
 * Auth Kit - OTP Page Content
 * 
 * OTP doğrulama sayfası
 */

import React from 'react'
import Image from 'next/image'
import { useAuthKit } from '../context/useAuthKit'
import { OtpForm } from '../components/OtpForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OtpPageContent() {
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
        
        {/* OTP Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('otp.title')}
            </CardTitle>
            <CardDescription>
              {t('otp.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OtpForm length={6} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
