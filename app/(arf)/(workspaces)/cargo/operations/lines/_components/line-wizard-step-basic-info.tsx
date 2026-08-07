import type { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { LineFormState } from "../_types"

interface Props {
  form: LineFormState
  setForm: (next: LineFormState) => void
}

const dayItems: Array<{ value: LineFormState["workDays"][number]; label: string }> = [
  { value: "mon", label: "Pzt" },
  { value: "tue", label: "Sal" },
  { value: "wed", label: "Çar" },
  { value: "thu", label: "Per" },
  { value: "fri", label: "Cum" },
  { value: "sat", label: "Cmt" },
]

export function LineWizardStepBasicInfo({ form, setForm }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Hat Türü</Label>
        <Select value={form.type} onValueChange={(value: string) => setForm({ ...form, type: value as LineFormState["type"] })}>
          <SelectTrigger>
            <SelectValue placeholder="Hat Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Ana Hat</SelectItem>
            <SelectItem value="hub">Merkez Hat</SelectItem>
            <SelectItem value="feeder">Ara Hat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Hat İsmi</Label>
        <Input value={form.name} readOnly className="bg-slate-50" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Çalışma Günleri</Label>
        <ToggleGroup
          type="multiple"
          value={form.workDays}
          onValueChange={(value) => setForm({ ...form, workDays: value as LineFormState["workDays"] })}
          className="justify-start"
        >
          {dayItems.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value} className="h-8 rounded-md border px-3 text-xs">
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Planan Kalkış Saati</Label>
        <Input
          type="time"
          value={form.plannedDepartureTime}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, plannedDepartureTime: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Planlanan Varış Saati</Label>
        <Input
          type="time"
          value={form.plannedArrivalTime}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, plannedArrivalTime: event.target.value })}
        />
      </div>
    </div>
  )
}
