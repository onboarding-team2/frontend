import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 마스킹된 주민번호(`YYMMDD-*******`)에서 생년월일을 `YYYY.MM.DD`로 변환.
 * 세기 추정: YY >= 30 이면 1900년대, 그 외 2000년대.
 */
export function formatRrnAsBirthDate(rrn: string | null | undefined): string {
  if (!rrn) return '-'
  const m = rrn.replace(/[^0-9]/g, '').match(/^(\d{2})(\d{2})(\d{2})/)
  if (!m) return rrn
  const [, yy, mm, dd] = m
  const century = parseInt(yy, 10) >= 30 ? '19' : '20'
  return `${century}${yy}.${mm}.${dd}`
}
