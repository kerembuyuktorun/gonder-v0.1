/**
 * Orkestratör çalışma modu.
 * - demo: mock katalog + client-side mock motorlar (sunum / QA)
 * - live: backend API (bağlantı hazır olunca doldurulur)
 */
export type OrchestratorMode = 'demo' | 'live'

export function isOrchestratorDemo(mode: OrchestratorMode): boolean {
  return mode === 'demo'
}

export function isOrchestratorLive(mode: OrchestratorMode): boolean {
  return mode === 'live'
}
