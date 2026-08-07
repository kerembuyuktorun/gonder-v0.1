'use client'

import { useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DefinitionsNav } from './_components/definitions-nav'
import { SectionOrderTypes } from './_components/section-order-types'
import { SectionTags } from './_components/section-tags'
import { SectionSkills } from './_components/section-skills'
import { SectionPod } from './_components/section-pod'
import { SectionReasons } from './_components/section-reasons'
import { SectionTemplates } from './_components/section-templates'
import {
  deleteReason,
  deleteSkill,
  deleteTag,
  getDefinitionsState,
  setOrderTypeEnabled,
  updatePodRule,
  upsertReason,
  upsertSkill,
  upsertTag,
  upsertTemplate,
} from './_mock/definitions-mock'
import type {
  DefinitionsSectionId,
  DefinitionsState,
  NotificationTemplate,
  OperationalTag,
  PodRule,
  ReasonCode,
  RoutingSkill,
} from './_types/definitions'

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

export default function DefinitionsSettingsPage() {
  const [state, setState] = useState<DefinitionsState>(() => getDefinitionsState())
  const [active, setActive] = useState<DefinitionsSectionId>('order_types')

  const handleToggleOrderType = (id: string, enabled: boolean) => {
    const orderType = state.orderTypes.find((item) => item.id === id)
    setState(setOrderTypeEnabled(id, enabled))
    if (orderType) {
      toast.success(`${orderType.label} ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`)
    }
  }

  const handleTagUpsert = (tag: OperationalTag) => {
    const isEdit = state.tags.some((item) => item.id === tag.id)
    setState(upsertTag(tag))
    toast.success(isEdit ? `${tag.name} güncellendi` : `${tag.name} oluşturuldu`)
  }

  const handleTagDelete = (id: string) => {
    const tag = state.tags.find((item) => item.id === id)
    setState(deleteTag(id))
    toast.success(tag ? `${tag.name} silindi` : 'Etiket silindi')
  }

  const handleTagToggleActive = (id: string, active: boolean) => {
    const tag = state.tags.find((item) => item.id === id)
    if (!tag) return
    setState(upsertTag({ ...tag, active }))
    toast.success(`${tag.name} ${active ? 'aktifleştirildi' : 'pasife alındı'}`)
  }

  const handleSkillUpsert = (skill: RoutingSkill) => {
    const isEdit = state.skills.some((item) => item.id === skill.id)
    setState(upsertSkill(skill))
    toast.success(isEdit ? `${skill.name} güncellendi` : `${skill.name} oluşturuldu`)
  }

  const handleSkillDelete = (id: string) => {
    const skill = state.skills.find((item) => item.id === id)
    setState(deleteSkill(id))
    toast.success(skill ? `${skill.name} silindi` : 'Yetkinlik silindi')
  }

  const handleSkillToggleActive = (id: string, active: boolean) => {
    const skill = state.skills.find((item) => item.id === id)
    if (!skill) return
    setState(upsertSkill({ ...skill, active }))
    toast.success(`${skill.name} ${active ? 'aktifleştirildi' : 'pasife alındı'}`)
  }

  const handlePodChange = (rule: PodRule) => {
    setState(updatePodRule(rule))
    toast.success(`${rule.label} kuralı güncellendi`)
  }

  const handleReasonUpsert = (reason: ReasonCode) => {
    const isEdit = state.reasons.some((item) => item.id === reason.id)
    setState(upsertReason(reason))
    toast.success(isEdit ? 'Neden güncellendi' : 'Neden eklendi')
  }

  const handleReasonDelete = (id: string) => {
    setState(deleteReason(id))
    toast.success('Neden silindi')
  }

  const handleReasonToggleActive = (id: string, active: boolean) => {
    const reason = state.reasons.find((item) => item.id === id)
    if (!reason) return
    setState(upsertReason({ ...reason, active }))
    toast.success(active ? 'Neden aktifleştirildi' : 'Neden pasife alındı')
  }

  const handleTemplateUpsert = (template: NotificationTemplate) => {
    setState(upsertTemplate(template))
    toast.success(`${template.eventLabel} şablonu güncellendi`)
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Ayarlar', href: ARF_ROUTES.lastmile.settings.roles.list },
          { label: 'Tanımlamalar' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='min-w-0'>
            <h1 className='text-2xl font-semibold tracking-tight'>Tanımlamalar</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Sipariş tipleri, etiketler, yetkinlikler, POD kuralları, ret/iptal kodları ve
              bildirim şablonlarını yönetin.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className='px-6'>
            <div className='flex flex-col gap-6 lg:flex-row'>
              <DefinitionsNav active={active} onChange={setActive} />

              <div className='min-w-0 flex-1'>
                {active === 'order_types' ? (
                  <SectionOrderTypes
                    orderTypes={state.orderTypes}
                    onToggle={handleToggleOrderType}
                  />
                ) : null}

                {active === 'tags' ? (
                  <SectionTags
                    tags={state.tags}
                    onUpsert={handleTagUpsert}
                    onDelete={handleTagDelete}
                    onToggleActive={handleTagToggleActive}
                  />
                ) : null}

                {active === 'skills' ? (
                  <SectionSkills
                    skills={state.skills}
                    onUpsert={handleSkillUpsert}
                    onDelete={handleSkillDelete}
                    onToggleActive={handleSkillToggleActive}
                  />
                ) : null}

                {active === 'pod' ? (
                  <SectionPod
                    podRules={state.podRules}
                    orderTypes={state.orderTypes}
                    onChange={handlePodChange}
                  />
                ) : null}

                {active === 'reasons' ? (
                  <SectionReasons
                    reasons={state.reasons}
                    onUpsert={handleReasonUpsert}
                    onDelete={handleReasonDelete}
                    onToggleActive={handleReasonToggleActive}
                  />
                ) : null}

                {active === 'templates' ? (
                  <SectionTemplates templates={state.templates} onUpsert={handleTemplateUpsert} />
                ) : null}
              </div>
            </div>

            <div className='mt-6 flex justify-end border-t border-slate-100 pt-3 text-xs text-slate-400'>
              {state.updatedAt ? (
                <span>
                  Son güncelleme {formatUpdatedAt(state.updatedAt)}
                  {state.updatedBy ? ` · ${state.updatedBy}` : ''}
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
