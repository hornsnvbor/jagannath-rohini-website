import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  let out = ''
  if (hundreds) out += ONES[hundreds] + ' Hundred'
  if (rest) out += (out ? ' ' : '') + twoDigits(rest)
  return out
}

/** Indian numbering-system words for an integer amount in Rupees
 * (e.g. 31000 -> "Thirty One Thousand"). */
export function numberToIndianWords(num: number): string {
  const n = Math.floor(Math.abs(num))
  if (n === 0) return 'Zero'
  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const rest = n % 1000
  let out = ''
  if (crore) out += threeDigits(crore) + ' Crore'
  if (lakh) out += (out ? ' ' : '') + twoDigits(lakh) + ' Lakh'
  if (thousand) out += (out ? ' ' : '') + twoDigits(thousand) + ' Thousand'
  if (rest) out += (out ? ' ' : '') + threeDigits(rest)
  return out
}
