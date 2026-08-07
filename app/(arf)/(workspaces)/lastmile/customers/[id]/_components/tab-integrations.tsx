'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode2,
  KeyRound,
  RefreshCw,
  Webhook,
  type LucideIcon,
} from 'lucide-react'
import type { CustomerApiCredentials } from '../_types/customer-detail'

type Props = {
  api: CustomerApiCredentials
}

const INTEGRATION_DOCS: Array<{
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
}> = [
  {
    id: 'getting-started',
    title: 'API Başlangıç Rehberi',
    description: 'Kimlik bilgileri, base URL ve ilk istek örnekleri',
    href: 'https://docs.getarf.com/lastmile/api/getting-started',
    icon: BookOpen,
  },
  {
    id: 'auth',
    title: 'Kimlik Doğrulama',
    description: 'API Key / Secret kullanımı ve güvenlik kuralları',
    href: 'https://docs.getarf.com/lastmile/api/authentication',
    icon: KeyRound,
  },
  {
    id: 'orders',
    title: 'Sipariş API Referansı',
    description: 'Sipariş oluşturma, güncelleme ve durum sorgulama',
    href: 'https://docs.getarf.com/lastmile/api/orders',
    icon: FileCode2,
  },
  {
    id: 'webhooks',
    title: 'Webhook Olayları',
    description: 'Durum değişikliklerini kendi sisteminize bildirme',
    href: 'https://docs.getarf.com/lastmile/api/webhooks',
    icon: Webhook,
  },
]

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function SecretField({
  label,
  value,
  revealed,
  onToggle,
}: {
  label: string
  value: string
  revealed: boolean
  onToggle: () => void
}) {
  return (
    <div className='space-y-1.5'>
      <p className='text-xs font-semibold tracking-wide text-slate-500 uppercase'>{label}</p>
      <div className='flex gap-2'>
        <Input
          readOnly
          value={revealed ? value.replace(/•/g, 'x') : value}
          className='font-mono text-sm'
        />
        <Button type='button' size='icon' variant='outline' onClick={onToggle} aria-label='Göster/Gizle'>
          {revealed ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
        </Button>
        <Button
          type='button'
          size='icon'
          variant='outline'
          onClick={async () => {
            const ok = await copyText(value)
            if (ok) toast.success(`${label} kopyalandı`)
            else toast.error('Kopyalanamadı')
          }}
          aria-label='Kopyala'
        >
          <Copy className='size-4' />
        </Button>
      </div>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
          <Icon className='size-4' />
        </span>
        <h3 className='text-sm font-semibold text-slate-900'>{title}</h3>
      </div>
      {action}
    </div>
  )
}

export function TabIntegrations({ api }: Props) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader
          icon={KeyRound}
          title='API Kimlik Bilgileri'
          action={
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8'
              onClick={() => toast.message('Anahtar yenileme yakında')}
            >
              <RefreshCw className='mr-2 size-3.5' />
              Yenile
            </Button>
          }
        />
        <div className='space-y-4 p-4'>
          <SecretField
            label='API Key'
            value={api.api_key}
            revealed={showApiKey}
            onToggle={() => setShowApiKey((current) => !current)}
          />
          <SecretField
            label='Secret Key'
            value={api.secret_key}
            revealed={showSecret}
            onToggle={() => setShowSecret((current) => !current)}
          />
          <p className='text-xs text-slate-500'>Oluşturulma: {api.olusturulma}</p>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader icon={BookOpen} title='Entegrasyon Dokümanları' />
        <div className='divide-y divide-slate-100'>
          {INTEGRATION_DOCS.map((doc) => {
            const Icon = doc.icon
            return (
              <a
                key={doc.id}
                href={doc.href}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80'
              >
                <span className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-white group-hover:text-slate-700 group-hover:ring-1 group-hover:ring-slate-200'>
                  <Icon className='size-4' />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <p className='truncate text-sm font-medium text-slate-800 group-hover:text-slate-950'>
                      {doc.title}
                    </p>
                    <ExternalLink className='size-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500' />
                  </div>
                  <p className='mt-0.5 text-xs leading-5 text-slate-400'>{doc.description}</p>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
