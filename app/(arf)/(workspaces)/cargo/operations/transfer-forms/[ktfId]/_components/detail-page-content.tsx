"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addConsignmentToKTF, closeTransferForm, removeConsignmentFromKTF } from "../_api/transfer-form-detail-api"
import type { TransferFormDetail } from "../_types/detail"
import type { KtfAuditLogEntry } from "../../_types/ktf-audit-types"
import { DetailConsignmentTable } from "./detail-consignment-table"
import { DetailHeaderCard } from "./detail-header-card"
import { KtfAuditTrailSection } from "./ktf-audit-trail-section"
import { TransferFormCloseModal } from "./transfer-form-close-modal"

interface Props {
  initialDetail: TransferFormDetail
  initialAudit: KtfAuditLogEntry[]
}

export function DetailPageContent({ initialDetail, initialAudit }: Props) {
  const router = useRouter()
  const [detail, setDetail] = useState(initialDetail)
  const [closeModalOpen, setCloseModalOpen] = useState(false)

  const isKtfClosed = detail.status === "CLOSED"

  const handleCargoFound = useCallback(
    async (cargoId: string) => {
      const result = await addConsignmentToKTF(detail.id, cargoId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setDetail(result.detail)
      toast.success(`Parça zimmetinize eklendi (${result.detail.totalConsignments} parça)`)
    },
    [detail.id],
  )

  const handleRemoveConsignment = useCallback(
    async (cargoId: string) => {
      const result = await removeConsignmentFromKTF(detail.id, cargoId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setDetail(result.detail)
      toast.success("Parça zimmetten çıkarıldı")
    },
    [detail.id],
  )

  const handleCloseKtf = useCallback(async () => {
    const result = await closeTransferForm(detail.id, "usr-mgr-001")
    if (!result.ok) {
      toast.error(result.error)
      return null
    }
    setDetail(result.result.ktf)
    return result.result.summary
  }, [detail.id])

  const handleAfterClose = useCallback(() => {
    toast.success("KTF başarıyla kapatıldı")
    router.push("/arf/cargo/operations/transfer-forms")
  }, [router])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "KTF Listesi", href: "/arf/cargo/operations/transfer-forms" },
          { label: `KTF No: ${detail.ktfNumber}` },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        {/* Profil Kartı */}
        <DetailHeaderCard
          detail={detail}
          onPrint={() => window.print()}
          onCloseKtf={() => setCloseModalOpen(true)}
        />

        {/* Tabs */}
        <Tabs defaultValue="consignments" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="consignments" className="text-xs">
              Zimmet Listesi
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              İşlem Geçmişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consignments">
            <DetailConsignmentTable
              consignments={detail.consignments}
              isKtfClosed={isKtfClosed}
              onRemove={handleRemoveConsignment}
              ktfId={detail.id}
              onCargoFound={handleCargoFound}
            />
          </TabsContent>

          <TabsContent value="history">
            <KtfAuditTrailSection logs={initialAudit} />
          </TabsContent>
        </Tabs>
      </div>

      {/* KTF Kapatma Modalı */}
      <TransferFormCloseModal
        isKtfClosed={isKtfClosed}
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        onClose={handleCloseKtf}
        onAfterClose={handleAfterClose}
      />
    </>
  )
}
