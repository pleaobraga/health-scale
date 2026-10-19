import type { Address } from '../types'

/**
 * Formats a structured address into a readable multi-line string.
 * Strictly excludes CEP as per project requirements.
 */
export function formatAddress(address: Partial<Address>): string {
  const lines: string[] = []
  if (address.name) {
    lines.push(address.name)
  }

  const line1Parts: string[] = []
  if (address.street) {
    line1Parts.push(address.street)
  }
  if (address.number) {
    line1Parts.push(address.number)
  }
  if (line1Parts.length > 0) {
    lines.push(line1Parts.join(', '))
  }

  const line2Parts: string[] = []
  if (address.complement) {
    line2Parts.push(address.complement)
  }
  if (address.neighborhood) {
    line2Parts.push(address.neighborhood)
  }
  if (address.city) {
    line2Parts.push(address.city)
  }
  if (line2Parts.length > 0) {
    lines.push(line2Parts.join(' - '))
  }

  return lines.join('\n')
}

/**
 * Formats a structured address into a single-line string (useful for select options or table rows).
 */
export function formatAddressOneLine(address: Partial<Address>): string {
  const parts: string[] = []
  if (address.name) {
    parts.push(address.name)
  }
  if (address.street) {
    const streetNum = [address.street, address.number].filter(Boolean).join(', ')
    parts.push(streetNum)
  }
  if (address.complement) {
    parts.push(address.complement)
  }
  if (address.neighborhood) {
    parts.push(address.neighborhood)
  }
  if (address.city) {
    parts.push(address.city)
  }
  return parts.join(' - ')
}

