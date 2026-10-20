import type { MonthlyAvailability } from '../types'

/**
 * Parses user input for rate into a valid positive number.
 * Handles: "1500", "1.500", "1500,00", "1.500,00", "R$ 1500", etc.
 */
export function parseNumericRate(input: string): number {
  if (!input) return 0
  const cleaned = input.trim().replace(/^R\$\s*/i, '')
  if (cleaned.includes(',') && cleaned.includes('.')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
  }
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.'))
  }
  return parseFloat(cleaned)
}

/**
 * Robustly resolves the payment rate (in R$) for a professional on a given day and shift.
 * Fallback priority:
 * 1. Exact shiftId + exact day rate
 * 2. Exact shiftId + base rate (key 0 or 'default')
 * 3. 'default' shiftId + exact day rate
 * 4. 'default' shiftId + base rate (key 0 or 'default')
 * 5. Any shiftId + exact day rate
 * 6. Any shiftId + first positive rate configured
 */
export function getPersonShiftRate(
  availabilities: MonthlyAvailability[],
  personId: string,
  month: string,
  shiftId: string | undefined,
  day: number,
): number {
  const userAvail = availabilities.find(
    (a) => a.personId === personId && a.month === month,
  )
  if (!userAvail?.shiftRates) return 0
  const rates = userAvail.shiftRates

  const effectiveShiftId = shiftId && shiftId !== 'default' ? shiftId : undefined

  // 1. Direct match: shiftRates[shiftId][day]
  if (effectiveShiftId && rates[effectiveShiftId]) {
    const shiftMap = rates[effectiveShiftId]
    const r = shiftMap[day] ?? (shiftMap as Record<string, number>)[String(day)]
    if (typeof r === 'number' && r > 0) return r

    const baseR = shiftMap[0] ?? (shiftMap as Record<string, number>)['default']
    if (typeof baseR === 'number' && baseR > 0) return baseR
  }

  // 2. 'default' shift mapping + day
  if (rates['default']) {
    const defaultMap = rates['default']
    const r = defaultMap[day] ?? (defaultMap as Record<string, number>)[String(day)]
    if (typeof r === 'number' && r > 0) return r

    const baseR = defaultMap[0] ?? (defaultMap as Record<string, number>)['default']
    if (typeof baseR === 'number' && baseR > 0) return baseR
  }

  // 3. Fallback: check any shift in rates for this specific day
  for (const sId of Object.keys(rates)) {
    const sMap = rates[sId]
    if (sMap) {
      const r = sMap[day] ?? (sMap as Record<string, number>)[String(day)]
      if (typeof r === 'number' && r > 0) return r
    }
  }

  // 4. Fallback: if user specified rates on that shift for other days, use that shift's rate
  if (effectiveShiftId && rates[effectiveShiftId]) {
    const validRates = Object.values(rates[effectiveShiftId]).filter(
      (v): v is number => typeof v === 'number' && v > 0,
    )
    if (validRates.length > 0) return validRates[0]
  }

  // 5. Fallback: if user has any positive rate configured anywhere in shiftRates, use it
  for (const sId of Object.keys(rates)) {
    const sMap = rates[sId]
    if (sMap) {
      const validRates = Object.values(sMap).filter(
        (v): v is number => typeof v === 'number' && v > 0,
      )
      if (validRates.length > 0) return validRates[0]
    }
  }

  return 0
}

