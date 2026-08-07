"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

const IBAN_LENGTH = 26

export function sanitizeIbanInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, IBAN_LENGTH)
}

export function formatIban(value: string): string {
  const cleaned = sanitizeIbanInput(value)
  return cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned
}

export function extractBankCode(iban: string): string {
  const cleaned = sanitizeIbanInput(iban)
  return cleaned.length >= 9 ? cleaned.slice(4, 9) : ""
}

export function validateTurkishIban(iban: string): { isValid: boolean; error?: string } {
  const cleaned = sanitizeIbanInput(iban)

  if (!cleaned.startsWith("TR")) {
    return { isValid: false, error: "IBAN TR ile başlamalıdır." }
  }

  if (cleaned.length !== IBAN_LENGTH) {
    return { isValid: false, error: "IBAN 26 karakter olmalıdır." }
  }

  if (!/^TR\d{24}$/.test(cleaned)) {
    return { isValid: false, error: "IBAN yalnızca TR ve rakamlardan oluşmalıdır." }
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (character) => String(character.charCodeAt(0) - 55))

  let remainder = BigInt(0)
  for (const chunk of numeric.match(/.{1,9}/g) ?? []) {
    remainder = (remainder * BigInt(10 ** chunk.length) + BigInt(chunk)) % BigInt(97)
  }

  if (remainder !== BigInt(1)) {
    return { isValid: false, error: "IBAN doğrulama rakamları hatalı." }
  }

  return { isValid: true }
}

interface IbanInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string
  onValueChange: (value: string) => void
}

export const IbanInput = React.forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(
  { value, onValueChange, ...props },
  ref,
) {
  return (
    <Input
      {...props}
      ref={ref}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      className={`font-mono ${props.className ?? ""}`.trim()}
      value={formatIban(value)}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onValueChange(sanitizeIbanInput(event.target.value))}
    />
  )
})
