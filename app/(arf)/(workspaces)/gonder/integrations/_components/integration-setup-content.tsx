'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ArrowLeft, CheckCircle2, Loader2, PlugZap, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { getSalesChannelById } from '../../_data/sales-channels-catalog'
import { useSalesChannelIntegrationsHydrated } from '../../_hooks/use-sales-channel-integrations-hydrated'
import {
  formatDateTimeTr,
  formatRelativeTr,
  mockTestSalesChannelConnection,
  validateSalesChannelCredentials,
} from '../../_lib/sales-channel-connection'
import { useSalesChannelIntegrationsStore } from '../../_stores/sales-channel-integrations-store'
import {
  SALES_CHANNEL_CATEGORY_LABELS,
  type SalesChannelField,
} from '../../_types/sales-channels'
import { SalesChannelLogo } from './sales-channel-logo'
import { SalesChannelStatusBadge } from './sales-channel-status-badge'

type Props = {
  channelId: string
}

function emptyFields(fields: SalesChannelField[]): Record<string, string> {
  const next: Record<string, string> = {}
  for (const field of fields) {
    next[field.key] = field.type === 'select' ? (field.options?.[0]?.value ?? '') : ''
  }
  return next
}

export function IntegrationSetupContent({ channelId }: Props) {
  const channel = getSalesChannelById(channelId)
  const hydrated = useSalesChannelIntegrationsHydrated()
  const connection = useSalesChannelIntegrationsStore((state) =>
    channel ? state.connections[channel.id] : undefined
  )
  const connect = useSalesChannelIntegrationsStore((state) => state.connect)
  const disconnect = useSalesChannelIntegrationsStore((state) => state.disconnect)
  const markError = useSalesChannelIntegrationsStore((state) => state.markError)
  const markTested = useSalesChannelIntegrationsStore((state) => state.markTested)
  const saveCredentials = useSalesChannelIntegrationsStore((state) => state.saveCredentials)

  const [values, setValues] = useState<Record<string, string>>(() =>
    channel ? emptyFields(channel.fields) : {}
  )
  const [isTesting, setIsTesting] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [testMessage, setTestMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [disconnectOpen, setDisconnectOpen] = useState(false)

  useEffect(() => {
    if (!channel || !hydrated) return
    const saved = useSalesChannelIntegrationsStore.getState().connections[channel.id]
    setValues({
      ...emptyFields(channel.fields),
      ...(saved?.credentials ?? {}),
    })
  }, [channel, hydrated])

  const status = connection?.status ?? 'disconnected'

  const requiredMissing = useMemo(() => {
    if (!channel) return []
    return channel.fields
      .filter((field) => field.required)
      .filter((field) => !(values[field.key] ?? '').trim())
      .map((field) => field.label)
  }, [channel, values])

  if (!channel) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Gönder', href: ARF_ROUTES.gonder.root },
            { label: 'Entegrasyonlar', href: ARF_ROUTES.gonder.integrations.root },
            { label: 'Kanal bulunamadı' },
          ]}
          searchPlaceholder='Gönder ara...'
          searchShortcut={<>⌘K</>}
          notificationsLabel='Bildirimler'
        />
        <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-3 p-4'>
              <p className='text-sm font-medium'>Bu satış kanalı bulunamadı.</p>
              <Button asChild variant='outline' size='sm'>
                <Link href={ARF_ROUTES.gonder.integrations.root}>Listeye dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setTestMessage(null)
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestMessage(null)
    try {
      const result = await mockTestSalesChannelConnection(channel, values)
      saveCredentials(channel.id, values)
      if (result.ok) {
        markTested(channel.id, values)
        setTestMessage({ ok: true, text: result.message })
        toast.success(result.message)
      } else {
        markError(channel.id, values, result.message)
        setTestMessage({ ok: false, text: result.message })
        toast.error(result.message)
      }
    } finally {
      setIsTesting(false)
    }
  }

  const handleConnect = async () => {
    const validation = validateSalesChannelCredentials(channel, values)
    if (!validation.ok) {
      setTestMessage({ ok: false, text: validation.message })
      toast.error(validation.message)
      return
    }

    setIsConnecting(true)
    setTestMessage(null)
    try {
      const result = await mockTestSalesChannelConnection(channel, values)
      if (!result.ok) {
        markError(channel.id, values, result.message)
        setTestMessage({ ok: false, text: result.message })
        toast.error(result.message)
        return
      }
      connect(channel.id, values)
      setTestMessage({ ok: true, text: `${channel.name} bağlandı.` })
      toast.success(`${channel.name} bağlandı.`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect(channel.id)
    setDisconnectOpen(false)
    setTestMessage(null)
    toast.success(`${channel.name} bağlantısı kesildi.`)
  }

  const busy = isTesting || isConnecting

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: ARF_ROUTES.gonder.root },
          { label: 'Entegrasyonlar', href: ARF_ROUTES.gonder.integrations.root },
          { label: channel.name },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div>
          <Button asChild variant='ghost' size='sm' className='-ml-1 h-8 gap-1 px-2'>
            <Link href={ARF_ROUTES.gonder.integrations.root}>
              <ArrowLeft className='size-4' />
              Satış kanalları
            </Link>
          </Button>
        </div>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='flex flex-col gap-4 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <SalesChannelLogo channel={channel} size='lg' />
              <div className='min-w-0 space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='text-xl font-semibold tracking-tight'>{channel.name}</h1>
                  {hydrated ? <SalesChannelStatusBadge status={status} /> : null}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {SALES_CHANNEL_CATEGORY_LABELS[channel.category]} · {channel.description}
                </p>
                {hydrated && status === 'connected' ? (
                  <p className='text-xs text-muted-foreground'>
                    Son senkron {formatRelativeTr(connection?.lastSyncAt)}
                    {connection?.connectedAt
                      ? ` · Bağlandı ${formatDateTimeTr(connection.connectedAt)}`
                      : ''}
                  </p>
                ) : null}
                {hydrated && status === 'error' && connection?.lastError ? (
                  <p className='text-xs text-amber-700'>{connection.lastError}</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)]'>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-4 p-3 sm:p-4'>
              <div>
                <h2 className='text-sm font-semibold tracking-tight'>Bağlantı bilgileri</h2>
                <p className='mt-1 text-sm text-muted-foreground'>{channel.help}</p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                {channel.fields.map((field) => (
                  <ChannelField
                    key={field.key}
                    field={field}
                    value={values[field.key] ?? ''}
                    disabled={!hydrated || busy}
                    onChange={(value) => setField(field.key, value)}
                  />
                ))}
              </div>

              {testMessage ? (
                <div
                  className={
                    testMessage.ok
                      ? 'rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700'
                      : 'rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-800'
                  }
                >
                  {testMessage.text}
                </div>
              ) : null}

              {requiredMissing.length > 0 ? (
                <p className='text-xs text-muted-foreground'>
                  Zorunlu: {requiredMissing.join(', ')}
                </p>
              ) : null}

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={!hydrated || busy}
                  onClick={() => void handleTest()}
                >
                  {isTesting ? <Loader2 className='size-4 animate-spin' /> : <PlugZap className='size-4' />}
                  Bağlantıyı dene
                </Button>
                <Button
                  type='button'
                  disabled={!hydrated || busy}
                  onClick={() => void handleConnect()}
                >
                  {isConnecting ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='size-4' />
                  )}
                  {status === 'connected' ? 'Bağlantıyı güncelle' : 'Bağla'}
                </Button>
                {status === 'connected' || status === 'error' ? (
                  <Button
                    type='button'
                    variant='ghost'
                    className='text-destructive hover:text-destructive'
                    disabled={!hydrated || busy}
                    onClick={() => setDisconnectOpen(true)}
                  >
                    <Unplug className='size-4' />
                    Bağlantıyı kes
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className='h-fit gap-0 py-0 shadow-sm'>
            <CardContent className='space-y-3 p-3 sm:p-4'>
              <h2 className='text-sm font-semibold tracking-tight'>Bu kanalda neler olur?</h2>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>Siparişler Gönder → Siparişler listesine düşer.</li>
                <li>Bağlı kanallar listede “Bağlı” olarak görünür.</li>
                <li>Demo ortamında gerçek pazaryeri API’si çağrılmaz; bilgiler tarayıcıda saklanır.</li>
              </ul>
              {status === 'connected' ? (
                <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800'>
                  Bu kanal aktif. Yeni siparişler bir sonraki senkron döngüsünde gelecek.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{channel.name} bağlantısı kesilsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Sipariş senkronu durur. Girdiğiniz bilgiler formda kalır; dilediğinizde yeniden
              bağlayabilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>Bağlantıyı kes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ChannelField({
  field,
  value,
  disabled,
  onChange,
}: {
  field: SalesChannelField
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const id = `sales-channel-${field.key}`

  return (
    <div className={field.fullWidth ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
      <Label htmlFor={id}>
        {field.label}
        {field.required ? <span className='text-destructive'> *</span> : null}
      </Label>
      {field.type === 'select' ? (
        <Select value={value || field.options?.[0]?.value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={id} className='w-full'>
            <SelectValue placeholder={field.placeholder ?? 'Seçin'} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'}
          value={value}
          disabled={disabled}
          placeholder={field.placeholder}
          autoComplete='off'
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.hint ? <p className='text-xs text-muted-foreground'>{field.hint}</p> : null}
    </div>
  )
}
