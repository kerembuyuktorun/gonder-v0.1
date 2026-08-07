import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus } from "lucide-react"
import { validateLineRules } from "../_lib/line-rules-validator"
import type { LineFormState, LineRuleError, LineStopFormRow, LocationOption, StopLocationType } from "../_types"
import { LineStopsDndList } from "./line-stops-dnd-list"

interface Props {
  form: LineFormState
  setForm: (next: LineFormState) => void
  locations: LocationOption[]
  errors: LineRuleError[]
}

function getAllowedLocationTypes(type: LineFormState["type"], index: number, length: number) {
  if (type === "main") return ["transfer_center"] as StopLocationType[]
  if (type === "hub") return index === 0 ? (["transfer_center"] as StopLocationType[]) : (["branch"] as StopLocationType[])
  if (index === length - 1) return ["transfer_center"] as StopLocationType[]
  return ["branch"] as StopLocationType[]
}

export function LineWizardStepStops({ form, setForm, locations, errors }: Props) {
  const getLocationOptions = (index: number) => {
    const allowed = getAllowedLocationTypes(form.type, index, form.stops.length)
    return locations.filter((item) => allowed.includes(item.type))
  }

  const appendStop = () => {
    const nextStops: LineStopFormRow[] = [
      ...form.stops,
      {
        id: `stop-${Date.now()}`,
        locationId: "",
        locationName: "",
        locationType: form.type === "main" ? "transfer_center" : "branch",
        operationType: "",
      },
    ]
    setForm({ ...form, stops: nextStops })
  }

  const handleStopsChange = (nextStops: LineFormState["stops"]) => {
    setForm({ ...form, stops: nextStops })
  }

  const liveErrors = validateLineRules(form.type, form.stops)
  const allErrors = [...errors, ...liveErrors].filter(
    (error, index, list) =>
      index === list.findIndex((item) => item.message === error.message),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Durakları sürükle-bırak ile sıralayabilirsiniz.</p>
        <Button type="button" variant="outline" onClick={appendStop}>
          <Plus className="mr-2 size-4" />
          Lokasyon Ekle
        </Button>
      </div>

      <LineStopsDndList stops={form.stops} getLocationOptions={getLocationOptions} onChange={handleStopsChange} />

      {allErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-5">
              {allErrors.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
