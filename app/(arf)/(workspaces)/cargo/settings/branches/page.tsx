"use client"

import { Suspense, useCallback, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronUp, Building2, CheckCircle2, AlertCircle } from "lucide-react"
import { mockBranches } from "./_mock/branches-mock-data"
import { BranchesTableSection } from "./_components/branches-table-section"
import { BranchDetailEditModal } from "./[id]/_components/branch-detail-edit-modal"
import type { BranchDetail } from "./[id]/_types"

export default function SubelerPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showSummary, setShowSummary] = useState(true)

  const handleCreateSave = useCallback((branch: BranchDetail) => {
    void branch
    setIsCreateModalOpen(false)
  }, [])

  const totalBranches = mockBranches.length
  const activeBranches = mockBranches.filter(b => b.aktif).length
  const passiveBranches = mockBranches.filter(b => !b.aktif).length

  const stats = [
    {
      title: "Toplam Şube",
      value: totalBranches.toString(),
      icon: Building2,
    },
    {
      title: "Aktif Şube",
      value: activeBranches.toString(),
      icon: CheckCircle2,
    },
    {
      title: "Pasif Şube",
      value: passiveBranches.toString(),
      icon: AlertCircle,
    },
  ]

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Şubeler" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Şubeler</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setShowSummary(!showSummary)}
            >
              <ChevronUp className={`mr-1.5 size-4 transition-transform ${showSummary ? '' : 'rotate-180'}`} />
              {showSummary ? 'Özeti Gizle' : 'Özeti Göster'}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="h-8">
              <Plus className="mr-2 size-4" />
              Yeni Şube
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {showSummary && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.title} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">{stat.title}</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums leading-tight text-foreground">{stat.value}</p>
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border bg-primary/12 text-secondary border-secondary/25">
                      <stat.icon className="size-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table Card */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <Suspense>
              <BranchesTableSection data={mockBranches} />
            </Suspense>
          </CardContent>
        </Card>

        <BranchDetailEditModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          branch={undefined}
          onSave={handleCreateSave}
          mode="create"
        />
      </div>
    </>
  )
}
