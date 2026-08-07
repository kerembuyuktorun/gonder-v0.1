'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PriceListSimulationInput, SimulationLookups } from "../_types"
import type { PieceRow } from "./pieces-form-and-table"
import { PiecesFormAndTable } from "./pieces-form-and-table"

interface Props {
  lookups: SimulationLookups
  onSimulate: (input: PriceListSimulationInput) => void
}

export function SimulationFilterPanel({ lookups, onSimulate }: Props) {
  // Sender address
  const [senderCityId, setSenderCityId] = useState("")
  const [senderDistrictId, setSenderDistrictId] = useState("")
  const [senderNeighborhoodId, setSenderNeighborhoodId] = useState("")

  // Receiver address
  const [receiverCityId, setReceiverCityId] = useState("")
  const [receiverDistrictId, setReceiverDistrictId] = useState("")
  const [receiverNeighborhoodId, setReceiverNeighborhoodId] = useState("")

  // Pieces
  const [pieceRows, setPieceRows] = useState<PieceRow[]>([])
  const [pieceForm, setPieceForm] = useState({
    pieceType: "koli",
    length: "0",
    width: "0",
    height: "0",
    kg: "0",
    quantity: "1",
    desi: "0",
  })

  // Computed
  const senderDistricts = useMemo(
    () => lookups.districtOptions.filter((item) => item.cityId === senderCityId),
    [lookups.districtOptions, senderCityId],
  )
  const senderNeighborhoods = useMemo(
    () => lookups.neighborhoodOptions.filter((item) => item.districtId === senderDistrictId),
    [lookups.neighborhoodOptions, senderDistrictId],
  )
  const receiverDistricts = useMemo(
    () => lookups.districtOptions.filter((item) => item.cityId === receiverCityId),
    [lookups.districtOptions, receiverCityId],
  )
  const receiverNeighborhoods = useMemo(
    () => lookups.neighborhoodOptions.filter((item) => item.districtId === receiverDistrictId),
    [lookups.neighborhoodOptions, receiverDistrictId],
  )

  const totalDesi = useMemo(
    () => pieceRows.reduce((sum, piece) => sum + piece.quantity * piece.desi, 0),
    [pieceRows],
  )

  // Handlers
  const handlePieceFormChange = (field: string, value: string) => {
    setPieceForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddPiece = () => {
    if (!pieceForm.pieceType || !pieceForm.desi) {
      return
    }

    const newPiece: PieceRow = {
      id: `piece-${Date.now()}`,
      pieceType: pieceForm.pieceType as "koli" | "zarf" | "palet",
      length: Number(pieceForm.length) || 0,
      width: Number(pieceForm.width) || 0,
      height: Number(pieceForm.height) || 0,
      kg: Number(pieceForm.kg) || 0,
      quantity: Number(pieceForm.quantity) || 1,
      desi: Number(pieceForm.desi) || 0,
    }

    setPieceRows((prev) => [...prev, newPiece])
    setPieceForm({
      pieceType: "koli",
      length: "0",
      width: "0",
      height: "0",
      kg: "0",
      quantity: "1",
      desi: "0",
    })
  }

  const handleRemovePiece = (id: string) => {
    setPieceRows((prev) => prev.filter((piece) => piece.id !== id))
  }

  const handleSubmit = () => {
    if (!senderCityId || !senderDistrictId || !senderNeighborhoodId) {
      return
    }
    if (!receiverCityId || !receiverDistrictId || !receiverNeighborhoodId) {
      return
    }
    if (pieceRows.length === 0) {
      return
    }

    onSimulate({
      senderAddress: {
        cityId: senderCityId,
        districtId: senderDistrictId,
        neighborhoodId: senderNeighborhoodId,
      },
      receiverAddress: {
        cityId: receiverCityId,
        districtId: receiverDistrictId,
        neighborhoodId: receiverNeighborhoodId,
      },
      cargoPieces: pieceRows.map((piece) => ({
        id: piece.id,
        pieceType: piece.pieceType,
        length: piece.length,
        width: piece.width,
        height: piece.height,
        kg: piece.kg,
        quantity: piece.quantity,
        desi: piece.desi,
      })),
      totalDesi: Number(totalDesi.toFixed(2)),
      extraServices: {
        pickup: false,
        mobileDelivery: false,
        cod: false,
      },
    })
  }

  const handleReset = () => {
    setSenderCityId("")
    setSenderDistrictId("")
    setSenderNeighborhoodId("")
    setReceiverCityId("")
    setReceiverDistrictId("")
    setReceiverNeighborhoodId("")
    setPieceRows([])
    setPieceForm({
      pieceType: "koli",
      length: "0",
      width: "0",
      height: "0",
      kg: "0",
      quantity: "1",
      desi: "0",
    })
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Fiyat Listesi Simülasyonu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Addresses */}
          {/* Sender */}
          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Gönderici Adres</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <AddressSelector
                label="İl"
                value={senderCityId}
                options={lookups.cityOptions}
                onChange={(value: string) => {
                  setSenderCityId(value)
                  setSenderDistrictId("")
                  setSenderNeighborhoodId("")
                }}
              />
              <AddressSelector
                label="İlçe"
                value={senderDistrictId}
                options={senderDistricts}
                onChange={(value: string) => {
                  setSenderDistrictId(value)
                  setSenderNeighborhoodId("")
                }}
                disabled={!senderCityId}
              />
              <AddressSelector
                label="Mahalle"
                value={senderNeighborhoodId}
                options={senderNeighborhoods}
                onChange={setSenderNeighborhoodId}
                disabled={!senderDistrictId}
              />
            </div>
          </div>

          {/* Receiver */}
          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Alıcı Adres</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <AddressSelector
                label="İl"
                value={receiverCityId}
                options={lookups.cityOptions}
                onChange={(value: string) => {
                  setReceiverCityId(value)
                  setReceiverDistrictId("")
                  setReceiverNeighborhoodId("")
                }}
              />
              <AddressSelector
                label="İlçe"
                value={receiverDistrictId}
                options={receiverDistricts}
                onChange={(value: string) => {
                  setReceiverDistrictId(value)
                  setReceiverNeighborhoodId("")
                }}
                disabled={!receiverCityId}
              />
              <AddressSelector
                label="Mahalle"
                value={receiverNeighborhoodId}
                options={receiverNeighborhoods}
                onChange={setReceiverNeighborhoodId}
                disabled={!receiverDistrictId}
              />
            </div>
          </div>

          {/* Pieces */}
          <div className="space-y-3 rounded-xl border border-slate-200 p-3">
            <h3 className="text-sm font-semibold text-slate-800">Parça Listesi</h3>
            <PiecesFormAndTable
              lookups={lookups}
              pieceRows={pieceRows}
              pieceForm={pieceForm}
              onPieceFormChange={handlePieceFormChange}
              onAddPiece={handleAddPiece}
              onRemovePiece={handleRemovePiece}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Hesapla</Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AddressSelectorProps {
  label: string
  value: string
  options: Array<{ id: string; name: string }>
  onChange: (value: string) => void
  disabled?: boolean
}

function AddressSelector({ label, value, options, onChange, disabled }: AddressSelectorProps) {
  return (
    <div>
      <Label className="mb-1.5 text-xs font-medium text-slate-600">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={`${label} seçin`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
