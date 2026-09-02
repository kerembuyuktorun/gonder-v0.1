import { NextResponse } from 'next/server'
import { enforceRateLimit } from '../../_lib/rate-limit'
import {
  buildChatReply,
  hasRoute,
  mergePrompt,
  parsePrompt,
  type ChatDraft,
} from '../../../(marketing)/landing/_lib/parse-prompt'

export type LandingChatRequest = {
  message?: string
  draft?: ChatDraft | null
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'landing-chat', { maxRequests: 40, windowMs: 60_000 })
  if (limited) return limited

  let body: LandingChatRequest
  try {
    body = (await request.json()) as LandingChatRequest
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 })
  }
  if (message.length > 500) {
    return NextResponse.json({ error: 'Mesaj çok uzun' }, { status: 400 })
  }

  const incoming = parsePrompt(message)
  const parsed = mergePrompt(body.draft ?? null, incoming)
  const ready = hasRoute(parsed)

  return NextResponse.json({
    reply: buildChatReply(parsed),
    parsed,
    ready,
  })
}
