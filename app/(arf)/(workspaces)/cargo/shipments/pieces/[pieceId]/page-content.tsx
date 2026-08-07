"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeliveryInfoModal } from "../../_components/delivery-info-modal"
import { PieceCancelInfoModal } from "../../_components/piece-cancel-info-modal"
import { PieceCancelModal } from "../../_components/piece-cancel-modal"
import { PieceDeliveryEntryModal } from "../../_components/piece-delivery-entry-modal"
import { PieceReportInfoModal } from "../../_components/piece-report-info-modal"
import { PieceReportModal } from "../../_components/piece-report-modal"
import { usePieceActions } from "../../_hooks/use-piece-actions"
import {
	mockPieceCancelInfoByPieceNo as sharedPieceCancelInfoByPieceNo,
	mockPieceDetailsById,
} from "../../_mock/shipments-mock-data"
import { AlertTriangle, Ban, CheckCircle2, Eye, Printer } from "lucide-react"

type PieceStatus = "beklemede" | "transferde" | "dagitimda" | "teslim_edildi" | "iptal_edildi"
type PieceType = "koli" | "palet" | "cuval"
type MovementStatus =
	| "kaydedildi"
	| "araca_yuklendi"
	| "aractan_indirildi"
	| "dagitimda"
	| "teslim_edildi"
	| "iptal_edildi"
	| "ihbar_edildi"

type MovementRow = {
	id: string
	olusturulma_zamani: string
	islem_yapan: string
	islem_yapan_sube: string
	plaka: string
	durum: MovementStatus
	aciklama: string
}

type PieceDetail = {
	id: string
	kargo_id: string
	parca_no: string
	takip_no: string
	kargo_kodu: string
	durum: PieceStatus
	parca_tipi: PieceType
	desi: number
	agirlik: number
	odeme_turu: "Gönderici Ödemeli" | "Alıcı Ödemeli"
	olusturulma_zamani: string
	guncellenme_zamani: string
	gonderici: string
	gonderici_telefon: string
	alici: string
	alici_telefon: string
	cikis_sube: string
	varis_sube: string
	hareketler: MovementRow[]
}

type ShipmentCancelInfo = {
	canceledAt: string
	canceledBy: string
	category: string
	reason: string
	note: string
}

type ShipmentHandoverInfo = {
	transferredAt: string
	transferredBy: string
	receiverBranch: string
	reason: string
	note: string
}

type PieceCancelInfo = {
	canceledAt: string
	canceledBy: string
	category: string
	reason: string
	note: string
}

type PieceDeliveryInfo = {
	firstName: string
	lastName: string
	deliveryTime: string
	phone: string
	imageUrl?: string
}

type PieceReportInfo = {
	reportTime: string
	reason: string
	description: string
	evidenceImageUrl?: string
}

type PrimaryShipmentStatus =
	| "olusturuldu"
	| "transfer_surecinde"
	| "varis_subede"
	| "dagitimda"
	| "teslim_edildi"
	| "devredildi"
	| "kargo_iptal"

const primaryShipmentStatusConfig: Record<PrimaryShipmentStatus, { label: string; className: string }> = {
	olusturuldu: { label: "Oluşturuldu", className: "border-slate-200 bg-slate-50 text-slate-700" },
	transfer_surecinde: { label: "Transfer Sürecinde", className: "border-primary/25 bg-primary/10 text-foreground" },
	varis_subede: { label: "Varış Şubede", className: "border-amber-200 bg-amber-50 text-amber-700" },
	dagitimda: { label: "Dağıtımda", className: "border-sky-200 bg-sky-50 text-sky-700" },
	teslim_edildi: { label: "Teslim Edildi", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
	devredildi: { label: "Devredildi", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
	kargo_iptal: { label: "Kargo İptal", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

const movementStatusConfig: Record<MovementStatus, { label: string; className: string }> = {
	kaydedildi: { label: "Kaydedildi", className: "border-border bg-muted text-muted-foreground" },
	araca_yuklendi: { label: "Araca Yüklendi", className: "border-primary/20 bg-primary/10 text-foreground" },
	aractan_indirildi: { label: "Araçtan İndirildi", className: "border-amber-200 bg-amber-50 text-amber-700" },
	dagitimda: { label: "Dağıtımda", className: "border-secondary/25 bg-secondary/15 text-foreground" },
	teslim_edildi: { label: "Teslim Edildi", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
	ihbar_edildi: { label: "İhbar Edildi", className: "border-amber-200 bg-amber-50 text-amber-700" },
	iptal_edildi: { label: "İptal Edildi", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

const pieceTypeLabel: Record<PieceType, string> = {
	koli: "Koli",
	palet: "Palet",
	cuval: "Çuval",
}

const pieceCancelReasonLabels: Record<string, string> = {
	musteri_talebi: "Müşteri talebi",
	yanlis_parca_kaydi: "Yanlış parça kaydı",
	teslimat_imkansiz: "Teslimat koşulu sağlanamadı",
	hasarli_parca: "Parça hasarlı / kullanılamaz",
	diger_sebep: "Diğer sebep",
}

const pieceCancelCategoryLabels: Record<string, string> = {
	operasyonel: "Operasyonel",
	musteri: "Müşteri",
	hasar: "Hasar",
	diger: "Diğer",
}

const pieceReportReasonLabels: Record<string, string> = {
	hasarli_kargo: "Hasarlı Kargo",
	yanlis_urun: "Yanlış Ürün",
	eksik_hatali_evrak: "Eksik/Hatalı Evrak",
	saskin_kargo: "Şaşkın Kargo",
}

const mockPieceCancelInfoByPieceNo: Record<string, PieceCancelInfo> = { ...sharedPieceCancelInfoByPieceNo }

const pieceDetailMap = mockPieceDetailsById as Record<string, PieceDetail>

const buildFallbackDetail = (pieceId: string): PieceDetail => {
	const normalized = pieceId || "piece-unknown"

	return {
		id: normalized,
		kargo_id: normalized.split("-")[0] || "1",
		parca_no: normalized,
		takip_no: normalized.split("-")[0] || "1000",
		kargo_kodu: normalized,
		durum: "beklemede",
		parca_tipi: "koli",
		desi: 0,
		agirlik: 0,
		odeme_turu: "Alıcı Ödemeli",
		olusturulma_zamani: "-",
		guncellenme_zamani: "-",
		gonderici: "-",
		gonderici_telefon: "-",
		alici: "-",
		alici_telefon: "-",
		cikis_sube: "-",
		varis_sube: "-",
		hareketler: [],
	}
}

function InfoCell({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border border-slate-200/90 bg-white/80 px-3.5 py-2.5 backdrop-blur-[1px]">
			<p className="text-xs text-slate-500">{label}</p>
			<p className="mt-1 text-base font-semibold leading-tight tracking-tight text-slate-900">{value}</p>
		</div>
	)
}

const getNameParts = (fullName: string) => {
	if (!fullName || fullName === "-") {
		return { firstName: "-", lastName: "-" }
	}

	const parts = fullName.trim().split(/\s+/)
	const firstName = parts.shift() || "-"
	const lastName = parts.join(" ") || "-"

	return { firstName, lastName }
}

const resolvePrimaryShipmentStatus = (detail: PieceDetail): PrimaryShipmentStatus => {
	const movementStatuses = detail.hareketler.map((row) => row.durum)

	if (movementStatuses.includes("teslim_edildi") || detail.durum === "teslim_edildi") {
		return "teslim_edildi"
	}

	if (movementStatuses.includes("dagitimda") || detail.durum === "dagitimda") {
		return "dagitimda"
	}

	if (movementStatuses.includes("aractan_indirildi")) {
		return "varis_subede"
	}

	if (movementStatuses.includes("araca_yuklendi") || detail.durum === "transferde") {
		return "transfer_surecinde"
	}

	return "olusturuldu"
}

export default function ParcaDetayPage() {
	const params = useParams<{ pieceId: string }>()
	const [table, setTable] = useState<TanStackTable<MovementRow> | null>(null)
	const [pieceCancelModalOpen, setPieceCancelModalOpen] = useState(false)
	const [pieceCancelInitialValues, setPieceCancelInitialValues] = useState<{
		category: "operasyonel" | "musteri" | "hasar" | "diger"
		reason: "musteri_talebi" | "yanlis_parca_kaydi" | "teslimat_imkansiz" | "hasarli_parca" | "diger_sebep"
		note: string
	}>({
		category: "operasyonel",
		reason: "musteri_talebi",
		note: "",
	})
	const [pieceReportModalOpen, setPieceReportModalOpen] = useState(false)
	const [pieceReportInitialValues, setPieceReportInitialValues] = useState<{
		reason: "hasarli_kargo" | "yanlis_urun" | "eksik_hatali_evrak" | "saskin_kargo"
		description: string
	}>({
		reason: "hasarli_kargo",
		description: "",
	})
	const [pieceDeliveryModalOpen, setPieceDeliveryModalOpen] = useState(false)
	const [pieceDeliveryInfoModalOpen, setPieceDeliveryInfoModalOpen] = useState(false)
	const [pieceReportInfoModalOpen, setPieceReportInfoModalOpen] = useState(false)
	const [pieceCancelInfoModalOpen, setPieceCancelInfoModalOpen] = useState(false)
	const [deliveryEntryInitialValues, setDeliveryEntryInitialValues] = useState({
		firstName: "",
		lastName: "",
		phone: "",
	})
	const [, setActionNotice] = useState("")
	const [shipmentCancelInfo, setShipmentCancelInfo] = useState<ShipmentCancelInfo | null>(null)
	const [shipmentHandoverInfo, setShipmentHandoverInfo] = useState<ShipmentHandoverInfo | null>(null)
	const [pieceCancelInfo, setPieceCancelInfo] = useState<PieceCancelInfo | null>(null)
	const [pieceDeliveryInfo, setPieceDeliveryInfo] = useState<PieceDeliveryInfo | null>(null)
	const [pieceReportInfo, setPieceReportInfo] = useState<PieceReportInfo | null>(null)

	const { loading, submitDeliveryEntry, submitPieceReport, submitPieceCancel } = usePieceActions()

	const pieceId = useMemo(() => {
		if (!params?.pieceId) {
			return "piece-1"
		}

		return Array.isArray(params.pieceId) ? params.pieceId[0] : params.pieceId
	}, [params])

	const detail = useMemo(() => {
		return pieceDetailMap[pieceId] ?? buildFallbackDetail(pieceId)
	}, [pieceId])

	useEffect(() => {
		try {
			const storedCancelInfo = localStorage.getItem(`shipment-cancel-info:${detail.takip_no}`)
			if (!storedCancelInfo) {
				setShipmentCancelInfo(null)
				return
			}

			const parsed = JSON.parse(storedCancelInfo) as ShipmentCancelInfo
			setShipmentCancelInfo(parsed)
		} catch {
			setShipmentCancelInfo(null)
		}
	}, [detail.takip_no])

	useEffect(() => {
		try {
			const storedHandoverInfo = localStorage.getItem(`shipment-handover-info:${detail.takip_no}`)
			if (!storedHandoverInfo) {
				setShipmentHandoverInfo(null)
				return
			}

			const parsed = JSON.parse(storedHandoverInfo) as ShipmentHandoverInfo
			setShipmentHandoverInfo(parsed)
		} catch {
			setShipmentHandoverInfo(null)
		}
	}, [detail.takip_no])

	useEffect(() => {
		try {
			const storedPieceCancelInfo = localStorage.getItem(`shipment-piece-cancel-info:${detail.takip_no}`)
			const parsed = storedPieceCancelInfo ? (JSON.parse(storedPieceCancelInfo) as Record<string, PieceCancelInfo>) : {}
			const merged = { ...mockPieceCancelInfoByPieceNo, ...parsed }
			setPieceCancelInfo(merged[detail.parca_no] ?? null)
		} catch {
			setPieceCancelInfo(mockPieceCancelInfoByPieceNo[detail.parca_no] ?? null)
		}
	}, [detail.parca_no, detail.takip_no])

	useEffect(() => {
		try {
			const storedDeliveryInfo = localStorage.getItem(`shipment-piece-delivery-info:${detail.takip_no}`)
			const parsed = storedDeliveryInfo ? (JSON.parse(storedDeliveryInfo) as Record<string, PieceDeliveryInfo>) : {}
			setPieceDeliveryInfo(parsed[detail.parca_no] ?? null)
		} catch {
			setPieceDeliveryInfo(null)
		}
	}, [detail.parca_no, detail.takip_no])

	useEffect(() => {
		try {
			const storedReportInfo = localStorage.getItem(`shipment-piece-report-info:${detail.takip_no}`)
			const parsed = storedReportInfo ? (JSON.parse(storedReportInfo) as Record<string, PieceReportInfo>) : {}
			setPieceReportInfo(parsed[detail.parca_no] ?? null)
		} catch {
			setPieceReportInfo(null)
		}
	}, [detail.parca_no, detail.takip_no])

	const movementRows = useMemo<MovementRow[]>(() => {
		const rows = detail.hareketler.filter((row) => row.durum !== "iptal_edildi" && row.durum !== "ihbar_edildi")

		if (pieceReportInfo) {
			const reportRow: MovementRow = {
				id: `${detail.id}-report`,
				olusturulma_zamani: pieceReportInfo.reportTime || "-",
				islem_yapan: "Operasyon Merkezi",
				islem_yapan_sube: detail.varis_sube || "-",
				plaka: "-",
				durum: "ihbar_edildi",
				aciklama: `Parça ihbar edildi. Neden: ${pieceReportInfo.reason}.`,
			}

			rows.unshift(reportRow)
		}

		if (pieceCancelInfo) {
			const pieceCancelRow: MovementRow = {
				id: `${detail.id}-piece-cancel`,
				olusturulma_zamani: pieceCancelInfo.canceledAt || "-",
				islem_yapan: pieceCancelInfo.canceledBy || "-",
				islem_yapan_sube: detail.varis_sube || "-",
				plaka: "-",
				durum: "iptal_edildi",
				aciklama: `Parça iptal edildi. Neden: ${pieceCancelInfo.reason}.`,
			}

			rows.unshift(pieceCancelRow)
		}

		if (shipmentCancelInfo) {
			const shipmentCancelRow: MovementRow = {
				id: `${detail.id}-cancel`,
				olusturulma_zamani: shipmentCancelInfo.canceledAt || "-",
				islem_yapan: shipmentCancelInfo.canceledBy || "-",
				islem_yapan_sube: detail.varis_sube || "-",
				plaka: "-",
				durum: "iptal_edildi",
				aciklama: `Kargo iptal edildi. Kategori: ${shipmentCancelInfo.category}. Neden: ${shipmentCancelInfo.reason}.`,
			}

			rows.unshift(shipmentCancelRow)
		}

		return rows
	}, [detail.hareketler, detail.id, detail.varis_sube, pieceCancelInfo, pieceReportInfo, shipmentCancelInfo])

	const handleOpenPieceDeliveryModal = useCallback(() => {
		setActionNotice("")
		setDeliveryEntryInitialValues({ firstName: "", lastName: "", phone: "" })
		setPieceDeliveryModalOpen(true)
	}, [])

	const handleConfirmPieceDelivery = useCallback(
		(values: { firstName: string; lastName: string; phone: string }) => {
			if (loading.deliveryEntry) {
				return
			}

			void (async () => {
				const result = await submitDeliveryEntry({
					pieceNos: [detail.parca_no],
					firstName: values.firstName,
					lastName: values.lastName,
					phone: values.phone,
				})

				if (result.ok) {
					const deliveryInfo: PieceDeliveryInfo = {
						firstName: values.firstName || "-",
						lastName: values.lastName || "-",
						deliveryTime: new Date().toLocaleString("tr-TR"),
						phone: values.phone || "-",
						imageUrl: "",
					}

					setPieceDeliveryInfo(deliveryInfo)
					try {
						const storageKey = `shipment-piece-delivery-info:${detail.takip_no}`
						const storedDeliveryInfo = localStorage.getItem(storageKey)
						const parsed = storedDeliveryInfo ? (JSON.parse(storedDeliveryInfo) as Record<string, PieceDeliveryInfo>) : {}
						localStorage.setItem(
							storageKey,
							JSON.stringify({
								...parsed,
								[detail.parca_no]: deliveryInfo,
							}),
						)
					} catch {
						// ignore storage write errors in demo flow
					}

					setPieceDeliveryModalOpen(false)
					setActionNotice("")
					return
				}

				setActionNotice(`Hata: ${result.message || "Teslimat bilgisi kaydedilemedi."}`)
			})()
		},
		[detail.parca_no, detail.takip_no, loading.deliveryEntry, submitDeliveryEntry],
	)

	const handleConfirmPieceReport = useCallback(
		(values: { reason: string; description: string }) => {
			if (loading.pieceReport) {
				return
			}

			void (async () => {
				const result = await submitPieceReport({
					pieceNos: [detail.parca_no],
					reason: values.reason,
					description: values.description,
				})

				if (result.ok) {
					const reportInfo: PieceReportInfo = {
						reportTime: new Date().toLocaleString("tr-TR"),
						reason: pieceReportReasonLabels[values.reason] || values.reason,
						description: values.description || "-",
						evidenceImageUrl: "",
					}

					setPieceReportInfo(reportInfo)
					try {
						const storageKey = `shipment-piece-report-info:${detail.takip_no}`
						const storedReportInfo = localStorage.getItem(storageKey)
						const parsed = storedReportInfo ? (JSON.parse(storedReportInfo) as Record<string, PieceReportInfo>) : {}
						localStorage.setItem(
							storageKey,
							JSON.stringify({
								...parsed,
								[detail.parca_no]: reportInfo,
							}),
						)
					} catch {
						// ignore storage write errors in demo flow
					}

					setPieceReportModalOpen(false)
					setActionNotice("")
					return
				}

				setActionNotice(`Hata: ${result.message || "Parça ihbarı kaydedilemedi."}`)
			})()
		},
		[detail.parca_no, detail.takip_no, loading.pieceReport, submitPieceReport],
	)

	const handleConfirmPieceCancel = useCallback(
		(values: { category: string; reason: string; note: string }) => {
			if (loading.pieceCancel) {
				return
			}

			void (async () => {
				const result = await submitPieceCancel({
					pieceNos: [detail.parca_no],
					reason: values.reason,
					note: values.note,
				})

				if (result.ok) {
					const cancelTime = new Date().toLocaleString("tr-TR")
					const cancelInfo: PieceCancelInfo = {
						canceledAt: cancelTime,
						canceledBy: "Operasyon Merkezi",
						category: pieceCancelCategoryLabels[values.category] || values.category,
						reason: pieceCancelReasonLabels[values.reason] || values.reason,
						note: values.note,
					}

					setPieceCancelInfo(cancelInfo)
					try {
						const storageKey = `shipment-piece-cancel-info:${detail.takip_no}`
						const storedPieceCancelInfo = localStorage.getItem(storageKey)
						const parsed = storedPieceCancelInfo ? (JSON.parse(storedPieceCancelInfo) as Record<string, PieceCancelInfo>) : {}
						localStorage.setItem(
							storageKey,
							JSON.stringify({
								...parsed,
								[detail.parca_no]: cancelInfo,
							}),
						)
					} catch {
						// ignore storage write errors in demo flow
					}

					setPieceCancelModalOpen(false)
					setActionNotice("")
					return
				}

				setActionNotice(`Hata: ${result.message || "Parça iptal talebi gönderilemedi."}`)
			})()
		},
		[detail.parca_no, detail.takip_no, loading.pieceCancel, submitPieceCancel],
	)

	const handleTableReady = useCallback((nextTable: TanStackTable<MovementRow>) => {
		setTable(nextTable)
	}, [])

	const movementColumns = useMemo<ColumnDef<MovementRow>[]>(
		() => [
			{
				accessorKey: "olusturulma_zamani",
				header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Zamanı" />,
			},
			{
				accessorKey: "islem_yapan",
				header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Yapan" />,
			},
			{
				accessorKey: "islem_yapan_sube",
				header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Yapan Şube" />,
			},
			{
				accessorKey: "plaka",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Plaka" />,
				cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.plaka || "-"}</span>,
			},
			{
				accessorKey: "durum",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
				cell: ({ row }) => {
					const status = movementStatusConfig[row.original.durum]
					return (
						<Badge variant="outline" className={status.className}>
							{status.label}
						</Badge>
					)
				},
			},
			{
				accessorKey: "aciklama",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
				cell: ({ row }) => <span className="text-slate-600">{row.original.aciklama}</span>,
			},
		],
		[],
	)

	const isShipmentCanceled = Boolean(shipmentCancelInfo)
	const isPieceCanceled = Boolean(pieceCancelInfo) || detail.durum === "iptal_edildi"
	const hasShipmentHandover = Boolean(shipmentHandoverInfo)
	const primaryStatus = useMemo<PrimaryShipmentStatus>(() => {
		if (isShipmentCanceled) {
			return "kargo_iptal"
		}

		if (hasShipmentHandover) {
			return "devredildi"
		}

		return resolvePrimaryShipmentStatus(detail)
	}, [detail, hasShipmentHandover, isShipmentCanceled])
	const primaryStatusBadge = primaryShipmentStatusConfig[primaryStatus]
	const fallbackDeliveryInfo = useMemo<PieceDeliveryInfo | null>(() => {
		if (detail.durum !== "teslim_edildi") {
			return null
		}

		const name = getNameParts(detail.alici)
		return {
			firstName: name.firstName,
			lastName: name.lastName,
			deliveryTime: detail.guncellenme_zamani || "-",
			phone: detail.alici_telefon || "-",
			imageUrl: "",
		}
	}, [detail.alici, detail.alici_telefon, detail.durum, detail.guncellenme_zamani])
	const resolvedDeliveryInfo = pieceDeliveryInfo ?? fallbackDeliveryInfo
	const hasDeliveryInfo = Boolean(resolvedDeliveryInfo)
	const hasReportInfo = Boolean(pieceReportInfo)

	return (
		<>
			<AppHeader
				breadcrumbs={[
					{ label: "Ana Sayfa", href: "/" },
					{ label: "Kargo İşlemleri", href: "/arf/cargo/shipments" },
					{ label: "Parça Listesi", href: "/arf/cargo/shipments/pieces" },
					{ label: `Parça ${detail.parca_no}` },
				]}
			/>

			<div className="flex flex-1 flex-col gap-3 bg-slate-50 p-3 pt-2.5 lg:gap-4">
				<Card className="relative overflow-hidden rounded-xl border-primary/25 bg-linear-to-br from-white via-primary/5 to-secondary/15 shadow-sm">
					<div className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-primary/25 blur-3xl" />
					<div className="pointer-events-none absolute -left-16 -bottom-20 size-64 rounded-full bg-secondary/25 blur-3xl" />

					<CardContent className="relative space-y-3 p-3.5 lg:p-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="space-y-2">
								<h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Parça Barkod No: {detail.parca_no}</h1>
								<div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
									<p>Takip No: {detail.takip_no}</p>
									<Badge variant="outline" className={primaryStatusBadge.className}>
										{primaryStatusBadge.label}
									</Badge>
									{isPieceCanceled && (
										<Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
											Parça İptal
										</Badge>
									)}
									{hasReportInfo && (
										<Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
											İhbar Edildi
										</Badge>
									)}
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2 lg:justify-end">
								<Button className="h-9 rounded-xl px-3.5 text-sm font-semibold shadow-sm">
									<Printer className="size-4" />
									Barkod Yazdır
								</Button>
								{hasDeliveryInfo ? (
									<Button
										type="button"
										variant="outline"
										className="h-9 rounded-xl border-emerald-200 bg-emerald-50/70 px-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
										onClick={() => setPieceDeliveryInfoModalOpen(true)}
									>
										<Eye className="size-4" />
										Teslim Bilgi
									</Button>
								) : (
									<Button
										variant="outline"
										className="h-9 rounded-xl border-slate-300 bg-white px-3.5 text-sm font-semibold hover:bg-slate-50"
										onClick={handleOpenPieceDeliveryModal}
									>
										<CheckCircle2 className="size-4" />
										Teslim Et
									</Button>
								)}
								{hasReportInfo ? (
									<Button
										type="button"
										variant="outline"
										className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
										onClick={() => setPieceReportInfoModalOpen(true)}
									>
										<Eye className="size-4" />
										İhbar Bilgi
									</Button>
								) : (
									<Button
										type="button"
										variant="outline"
										className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
										onClick={() => {
											setActionNotice("")
											setPieceReportInitialValues({ reason: "hasarli_kargo", description: "" })
											setPieceReportModalOpen(true)
										}}
									>
										<AlertTriangle className="size-4" />
										İhbar Et
									</Button>
								)}
								{isPieceCanceled ? (
									<Button
										type="button"
										variant="outline"
										className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
										onClick={() => setPieceCancelInfoModalOpen(true)}
									>
										<Eye className="size-4" />
										İptal Bilgi
									</Button>
								) : (
									!isShipmentCanceled && (
										<Button
											type="button"
											variant="outline"
											className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
											onClick={() => {
												setActionNotice("")
												setPieceCancelInitialValues({
													category: "operasyonel",
													reason: "musteri_talebi",
													note: "",
												})
												setPieceCancelModalOpen(true)
											}}
										>
											<Ban className="size-4" />
											Parça İptal
										</Button>
									)
								)}
							</div>

						</div>

						<div className="h-px w-full bg-linear-to-r from-primary/40 via-secondary/35 to-transparent" />

						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<InfoCell label="Parça Tipi" value={pieceTypeLabel[detail.parca_tipi]} />
							<InfoCell label="Desi" value={String(detail.desi)} />
							<InfoCell label="Ağırlık" value={`${detail.agirlik} kg`} />
							<InfoCell label="Ödeme Türü" value={detail.odeme_turu} />
							<InfoCell label="Oluşturulma Zamanı" value={detail.olusturulma_zamani} />
							<InfoCell label="Son İşlem Zamanı" value={detail.guncellenme_zamani} />
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-slate-200 bg-white shadow-sm">
					<CardContent className="space-y-3 p-3.5">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<h2 className="text-xl font-semibold tracking-tight text-slate-900">Kargo Bağlamı</h2>
							<Button type="button" variant="outline" className="h-9 rounded-lg px-3.5 text-sm font-semibold" asChild>
								<Link href={`/arf/cargo/shipments/${detail.kargo_id}`}>Kargo Detayına Git</Link>
							</Button>
						</div>
						<div className="grid gap-3 md:grid-cols-2">
							<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
								<p className="text-xs text-slate-500">Gönderici</p>
								<p className="mt-1 text-sm font-semibold text-slate-900">{detail.gonderici}</p>
								<p className="text-xs text-slate-600">{detail.gonderici_telefon}</p>
							</div>
							<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
								<p className="text-xs text-slate-500">Alıcı</p>
								<p className="mt-1 text-sm font-semibold text-slate-900">{detail.alici}</p>
								<p className="text-xs text-slate-600">{detail.alici_telefon}</p>
							</div>
							<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
								<p className="text-xs text-slate-500">Çıkış Şubesi</p>
								<p className="mt-1 text-sm font-semibold text-slate-900">{detail.cikis_sube}</p>
							</div>
							<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
								<p className="text-xs text-slate-500">Varış Şubesi</p>
								<p className="mt-1 text-sm font-semibold text-slate-900">{detail.varis_sube}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border-slate-200 bg-white shadow-sm">
					<CardContent className="space-y-3 p-3.5">
						<h2 className="text-xl font-semibold tracking-tight text-slate-900">Parça Hareketleri</h2>
						<DataTable
							data={movementRows}
							columns={movementColumns}
							enableSorting
							enableGlobalFilter
							enableColumnVisibility
							enableHorizontalScroll
							emptyMessage="Bu parçaya ait hareket kaydı bulunamadı."
							className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
							onTableReady={handleTableReady}
						/>

						{table && (
							<DataTablePagination
								table={table as TanStackTable<unknown>}
								pageSizeOptions={[5, 10, 20]}
								totalRows={movementRows.length}
							/>
						)}
					</CardContent>
				</Card>
			</div>

			<PieceDeliveryEntryModal
				open={pieceDeliveryModalOpen}
				onOpenChange={setPieceDeliveryModalOpen}
				pieceNos={[detail.parca_no]}
				initialValues={deliveryEntryInitialValues}
				onConfirm={handleConfirmPieceDelivery}
			/>

			<DeliveryInfoModal
				open={pieceDeliveryInfoModalOpen}
				onOpenChange={setPieceDeliveryInfoModalOpen}
				heading={`Teslimat Bilgisi - Parça ${detail.parca_no}`}
				firstName={resolvedDeliveryInfo?.firstName || "-"}
				lastName={resolvedDeliveryInfo?.lastName || "-"}
				deliveryTime={resolvedDeliveryInfo?.deliveryTime || "-"}
				phone={resolvedDeliveryInfo?.phone || "-"}
				imageUrl={resolvedDeliveryInfo?.imageUrl || ""}
				imageAlt={`${detail.parca_no} teslimat resmi`}
			/>

			<PieceCancelModal
				open={pieceCancelModalOpen}
				onOpenChange={setPieceCancelModalOpen}
				pieceNos={[detail.parca_no]}
				initialValues={pieceCancelInitialValues}
				onConfirm={handleConfirmPieceCancel}
				confirmLabel="Parça İptal"
			/>

			<PieceReportModal
				open={pieceReportModalOpen}
				onOpenChange={setPieceReportModalOpen}
				pieceNos={[detail.parca_no]}
				initialValues={pieceReportInitialValues}
				onConfirm={handleConfirmPieceReport}
				confirmLabel="İhbarı Kaydet"
			/>

			<PieceReportInfoModal
				open={pieceReportInfoModalOpen}
				onOpenChange={setPieceReportInfoModalOpen}
				pieceNo={detail.parca_no}
				reportTime={pieceReportInfo?.reportTime || "-"}
				reason={pieceReportInfo?.reason || "-"}
				description={pieceReportInfo?.description || "-"}
				evidenceImageUrl={pieceReportInfo?.evidenceImageUrl || ""}
			/>

			<PieceCancelInfoModal
				open={pieceCancelInfoModalOpen}
				onOpenChange={setPieceCancelInfoModalOpen}
				pieceNo={detail.parca_no}
				info={pieceCancelInfo}
			/>
		</>
	)
}
