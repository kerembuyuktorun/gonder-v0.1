import { Card, CardContent } from "@/components/ui/card"

interface Props {
  title: string
  description: string
}

export function SimulationEmptyState({ title, description }: Props) {
  return (
    <Card className="border-slate-200">
      <CardContent className="py-10 text-center">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}
