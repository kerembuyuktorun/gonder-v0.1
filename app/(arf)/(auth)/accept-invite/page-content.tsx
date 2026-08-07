'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { AuthTwoPanelShell } from '@/auth-kit/components/AuthTwoPanelShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { acceptInvite } from '../_api/auth-client'
import { ARF_ROUTES } from '../../_shared/routes'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = (searchParams.get('token') || '').trim()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Davet bağlantısı geçersiz veya süresi dolmuş.')
      return
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setIsLoading(true)
    const response = await acceptInvite({ token, password })
    setIsLoading(false)

    if (!response.success) {
      setError(response.error || 'Davet kabul edilemedi.')
      return
    }

    setSuccess(true)
    window.setTimeout(() => {
      router.push(ARF_ROUTES.auth.signIn)
    }, 1800)
  }

  return (
    <AuthTwoPanelShell>
      <div className='space-y-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Daveti Kabul Et</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Hesabınızı aktifleştirmek için yeni şifrenizi belirleyin.
          </p>
        </div>

        {success ? (
          <div className='flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center'>
            <CheckCircle2 className='size-10 text-emerald-600' />
            <p className='text-sm font-medium text-emerald-800'>
              Hesabınız aktifleştirildi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <form className='space-y-4' onSubmit={handleSubmit}>
            {error ? (
              <div className='flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700'>
                <AlertCircle className='mt-0.5 size-4 shrink-0' />
                <span>{error}</span>
              </div>
            ) : null}

            <div className='space-y-2'>
              <Label htmlFor='password'>Yeni Şifre</Label>
              <Input
                id='password'
                type='password'
                autoComplete='new-password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='En az 8 karakter'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Şifre Tekrar</Label>
              <Input
                id='confirmPassword'
                type='password'
                autoComplete='new-password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder='Şifrenizi tekrar girin'
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Hesabımı Aktifleştir'}
            </Button>
          </form>
        )}
      </div>
    </AuthTwoPanelShell>
  )
}

export default function AcceptInvitePageContent() {
  return (
    <Suspense fallback={<div className='p-6 text-center text-sm'>Yükleniyor...</div>}>
      <AcceptInviteContent />
    </Suspense>
  )
}
