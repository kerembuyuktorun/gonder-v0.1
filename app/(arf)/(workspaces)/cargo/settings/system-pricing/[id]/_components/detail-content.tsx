"use client"

import { useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import {
  setPricingDefinitionStatus,
  updatePricingDefinition,
  type UpsertPriceDefinitionInput,
} from "../../_api/price-definitions-api"
import type { PriceDefinitionDetail } from "../../_types"
import { CreatePriceDefinitionModal } from "../../_components/create-price-definition-modal"
import { DetailHeaderCard } from "./detail-header-card"
import { DetailRulesSection } from "./detail-rules-section"
import { DetailSurchargesSection } from "./detail-surcharges-section"

interface Props {
  initialDetail: PriceDefinitionDetail
}

export function DetailContent({ initialDetail }: Props) {
  const [detail, setDetail] = useState(initialDetail)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Fiyat Tanımları", href: "/arf/cargo/settings-pricing" },
          { label: detail.name },
        ]}
      />

      <CreatePriceDefinitionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValue={detail}
        onSubmit={async (payload: UpsertPriceDefinitionInput & { id?: string }) => {
          const updated = await updatePricingDefinition(detail.id, payload)
          if (updated) {
            setDetail(updated)
          }
        }}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        <DetailHeaderCard
          detail={detail}
          onEdit={() => setEditOpen(true)}
          onToggleStatus={async () => {
            const next = detail.status === "active" ? "passive" : "active"
            const updated = await setPricingDefinitionStatus(detail.id, next)
            if (updated) {
              setDetail(updated)
            }
          }}
        />

        <DetailRulesSection rules={detail.rules} />
        <DetailSurchargesSection surcharges={detail.surcharges} />
      </div>
    </>
  )
}
