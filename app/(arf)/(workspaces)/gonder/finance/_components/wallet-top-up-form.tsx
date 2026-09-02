'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { useWalletTopUp } from '../../_hooks/use-wallet'
import { formatMoneyTry } from '../../_types/finance'
import { WALLET_TOP_UP_METHOD_LABELS, type WalletTopUpMethod } from '../../_types/wallet'

const PRESETS = [250, 500, 1000, 2500]

type Props = {
  onSuccess?: () => void
}

export function WalletTopUpForm({ onSuccess }: Props) {
  const topUp = useWalletTopUp()
  const [amountTry, setAmountTry] = useState<number>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState<WalletTopUpMethod>('card')
  const [usingCustom, setUsingCustom] = useState(false)

  const resolvedAmount = usingCustom ? Number(customAmount.replace(',', '.')) : amountTry
  const validAmount = Number.isFinite(resolvedAmount) && resolvedAmount > 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validAmount) {
      toast.error('Geçerli bir tutar girin')
      return
    }
    try {
      const result = await topUp.mutateAsync({
        amountTry: resolvedAmount,
        method,
        note: '',
      })
      toast.success(`Cüzdana ${formatMoneyTry(result.entry.amount.amount)} yüklendi`)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yükleme başarısız')
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label>Tutar</Label>
        <div className='flex flex-wrap gap-1.5'>
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type='button'
              size='sm'
              variant={!usingCustom && amountTry === preset ? 'secondary' : 'outline'}
              className='h-8'
              onClick={() => {
                setUsingCustom(false)
                setAmountTry(preset)
              }}
            >
              {formatMoneyTry(preset)}
            </Button>
          ))}
          <Button
            type='button'
            size='sm'
            variant={usingCustom ? 'secondary' : 'outline'}
            className='h-8'
            onClick={() => setUsingCustom(true)}
          >
            Diğer
          </Button>
        </div>
        {usingCustom ? (
          <Input
            inputMode='decimal'
            placeholder='Örn. 750'
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
          />
        ) : null}
      </div>

      <div className='space-y-2'>
        <Label>Yöntem</Label>
        <RadioGroup
          value={method}
          onValueChange={(value) => setMethod(value as WalletTopUpMethod)}
          className='grid gap-2 sm:grid-cols-2'
        >
          {(['card', 'transfer'] as const).map((id) => (
            <label
              key={id}
              className='flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5'
            >
              <RadioGroupItem value={id} />
              {WALLET_TOP_UP_METHOD_LABELS[id]}
            </label>
          ))}
        </RadioGroup>
        <p className='text-[11px] text-muted-foreground'>
          Demo ortamında yükleme anında bakiyeye yansır. Gerçek tahsilat yoktur.
        </p>
      </div>

      <Button type='submit' className='w-full sm:w-auto' disabled={topUp.isPending || !validAmount}>
        {topUp.isPending ? <Spinner className='size-4' /> : null}
        {validAmount ? `${formatMoneyTry(resolvedAmount)} yükle` : 'Yükle'}
      </Button>
    </form>
  )
}
