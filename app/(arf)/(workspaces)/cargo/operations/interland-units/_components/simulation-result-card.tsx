import type { InterlandUnitsSimulationResult } from "../_types"
import { MatchedReceiverBranchCard } from "./matched-receiver-branch-card"
import { MatchedSenderBranchCard } from "./matched-sender-branch-card"

interface Props {
  result: InterlandUnitsSimulationResult
}

export function SimulationResultCard({ result }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MatchedSenderBranchCard result={result.sender} />
      <MatchedReceiverBranchCard result={result.receiver} />
    </div>
  )
}
