export type ReserveStatus = '적정' | '주의' | '추가납입필요'

type StatusConfig = {
  label: string
  badgeClass: string
  showWarning: boolean
  warningText: string | null
}

export const STATUS_CONFIG: Record<ReserveStatus, StatusConfig> = {
  적정: {
    label: '적립 적정',
    badgeClass: 'bg-emerald-100 text-emerald-600',
    showWarning: false,
    warningText: null,
  },
  주의: {
    label: '주의 필요',
    badgeClass: 'bg-amber-100 text-amber-600',
    showWarning: true,
    warningText: '법정 기준 미달 주의',
  },
  추가납입필요: {
    label: '추가납입 필요',
    badgeClass: 'bg-red-100 text-red-500',
    showWarning: true,
    warningText: '법정 기준 미달 주의',
  },
}
