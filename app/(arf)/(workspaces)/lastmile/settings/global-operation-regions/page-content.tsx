'use client'

import { useMemo, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { GlobalRegionsKpiCards } from './_components/global-regions-kpi-cards'
import { GlobalRegionsScope } from './_components/global-regions-scope'
import { computeGlobalRegionKpi } from './_lib/region-kpi'
import {
  getGlobalOperationRegions,
  saveGlobalOperationRegions,
} from './_mock/global-regions-mock'
import type { GlobalOperationScopeRow } from './_types/global-regions'

function formatUpdatedAt(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function GlobalOperationRegionsPage() {
  const initial = getGlobalOperationRegions()
  const [scopes, setScopes] = useState<GlobalOperationScopeRow[]>(initial.scopes)
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial.updatedAt)
  const [updatedBy, setUpdatedBy] = useState<string | null>(initial.updatedBy)
  const [showSummary, setShowSummary] = useState(false)
  const [createRequest, setCreateRequest] = useState(0)

  const kpi = useMemo(() => computeGlobalRegionKpi(scopes), [scopes])

  const handleScopesChange = (nextScopes: GlobalOperationScopeRow[]) => {
    const saved = saveGlobalOperationRegions(nextScopes)
    setScopes(saved.scopes)
    setUpdatedAt(saved.updatedAt)
    setUpdatedBy(saved.updatedBy)
  }

  const handleRefresh = () => {
    const refreshed = getGlobalOperationRegions()
    setScopes(refreshed.scopes)
    setUpdatedAt(refreshed.updatedAt)
    setUpdatedBy(refreshed.updatedBy)
    toast.success('Operasyon bölgeleri yenilendi')
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Ayarlar', href: ARF_ROUTES.lastmile.settings.roles.list },
          { label: 'Global Operasyon Bölgeleri' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='min-w-0'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Global Operasyon Bölgeleri
            </h1>
          </div>

          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 rounded-full'
              onClick={() => setShowSummary((previous) => !previous)}
            >
              {showSummary ? (
                <ChevronUp className='mr-2 size-4' />
              ) : (
                <ChevronDown className='mr-2 size-4' />
              )}
              {showSummary ? 'Özeti Gizle' : 'Özeti Göster'}
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={() => setCreateRequest((previous) => previous + 1)}
            >
              <Plus className='mr-2 size-4' />
              Kapsam Ekle
            </Button>
          </div>
        </div>

        {showSummary ? <GlobalRegionsKpiCards kpi={kpi} /> : null}

        <Card>
          <CardContent className='space-y-4 px-6'>
            <GlobalRegionsScope
              scopes={scopes}
              onChange={handleScopesChange}
              createRequest={createRequest}
              onRefresh={handleRefresh}
            />

            <div className='flex justify-end border-t border-slate-100 pt-3 text-xs text-slate-400'>
              {updatedAt ? (
                <span>
                  Son güncelleme {formatUpdatedAt(updatedAt)}
                  {updatedBy ? ` · ${updatedBy}` : ''}
                </span>
              ) : (
                <span>Henüz güncellenmedi</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
