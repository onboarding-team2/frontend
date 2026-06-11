export type ScheduleType = 'DC' | 'DB' | '계약갱신' | '운용지시' | '정기점검' | '신고의무'
export type TargetType = '기업' | '가입자'
export type ScheduleStatus = '예정' | '완료' | '지연'
export type SchedulePriority = 'high' | 'medium' | 'low'

export interface RelatedCompany {
  id: string
  name: string
  businessNumber: string
  employeeCount: number
  planType: 'DC' | 'DB'
  contractDate: string
}

export interface RelatedSubscriber {
  id: string
  name: string
  employeeId: string
  company: string
  joinDate: string
  balance: number
}

export interface Schedule {
  id: string
  title: string
  dueDate: string
  content: string
  type: ScheduleType
  targetType: TargetType
  priority: SchedulePriority
  status: ScheduleStatus
  createdAt: string
  memo?: string
  required?: boolean
  relatedCompanies?: RelatedCompany[]
  relatedSubscribers?: RelatedSubscriber[]
}

export const priorityColors = {
  high: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
}

export const statusColors = {
  예정: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  완료: {
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  지연: {
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
}

export function getSchedulesByMonth(schedules: Schedule[], year: number, month: number): Schedule[] {
  return schedules.filter(s => {
    const d = new Date(s.dueDate)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

export function getSchedulesByDate(schedules: Schedule[], dateStr: string): Schedule[] {
  return schedules.filter(s => s.dueDate === dateStr)
}

export function getDaysUntilDueDate(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dueDate)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}