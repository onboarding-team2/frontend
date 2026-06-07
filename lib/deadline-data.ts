export type DeadlineType = 'DC' | 'DB' | '계약갱신' | '운용지시' | '정기점검' | '신고의무'
export type TargetType = '기업' | '가입자'
export type DeadlineStatus = '예정' | '완료' | '지연'
export type DeadlinePriority = 'high' | 'medium' | 'low'

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

export interface DeadlineSchedule {
  id: string
  title: string
  deadline: string
  content: string
  type: DeadlineType
  targetType: TargetType
  priority: DeadlinePriority
  status: DeadlineStatus
  createdAt: string
  memo?: string
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

export const typeColors: Record<DeadlineType, { bg: string; text: string }> = {
  DC: { bg: 'bg-purple-100', text: 'text-purple-700' },
  DB: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  계약갱신: { bg: 'bg-rose-100', text: 'text-rose-700' },
  운용지시: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  정기점검: { bg: 'bg-teal-100', text: 'text-teal-700' },
  신고의무: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

export const mockDeadlines: DeadlineSchedule[] = [
  {
    id: 'DL-001',
    title: '가입자 퇴직 정산 처리',
    deadline: '2026-05-20',
    content: '두산중공업 퇴직자 DB형 퇴직연금 정산 처리 기한 초과. 담당자 확인 및 즉시 처리 필요.',
    type: 'DB',
    targetType: '가입자',
    priority: 'high',
    status: '지연',
    createdAt: '2026-04-15',
    relatedSubscribers: [
      { id: 'SUB-001', name: '김태양', employeeId: 'EMP-2020-0012', company: '두산중공업(주)', joinDate: '2020-03-01', balance: 45000000 },
    ],
  },
  {
    id: 'DL-002',
    title: 'DC형 운용지시 기한 도래',
    deadline: '2026-06-10',
    content: '삼성전자 DC형 퇴직연금 가입자 운용지시 변경 기한이 도래합니다. 미이행 시 기본 포트폴리오로 자동 운용됩니다.',
    type: 'DC',
    targetType: '가입자',
    priority: 'medium',
    status: '예정',
    createdAt: '2026-05-10',
    relatedSubscribers: [
      { id: 'SUB-002', name: '김민준', employeeId: 'EMP-2021-0034', company: '삼성전자(주)', joinDate: '2021-06-15', balance: 28000000 },
      { id: 'SUB-003', name: '이서연', employeeId: 'EMP-2019-0089', company: '삼성전자(주)', joinDate: '2019-09-01', balance: 52000000 },
      { id: 'SUB-004', name: '박지훈', employeeId: 'EMP-2022-0156', company: '삼성전자(주)', joinDate: '2022-01-10', balance: 15000000 },
    ],
  },
  {
    id: 'DL-003',
    title: 'DB형 계약 갱신 기한',
    deadline: '2026-06-15',
    content: 'LG화학 DB형 퇴직연금 계약 갱신 기한입니다. 계약 조건 재검토 및 갱신 서류 준비가 필요합니다.',
    type: '계약갱신',
    targetType: '기업',
    priority: 'medium',
    status: '예정',
    createdAt: '2026-05-01',
    relatedCompanies: [
      { id: 'COMP-001', name: 'LG화학(주)', businessNumber: '110-81-12345', employeeCount: 12500, planType: 'DB', contractDate: '2021-06-15' },
    ],
  },
  {
    id: 'DL-004',
    title: '정기 운용현황 보고',
    deadline: '2026-06-20',
    content: '현대자동차 퇴직연금 운용현황 정기 보고 기한입니다. 분기별 운용성과 및 리스크 분석 보고서 제출이 필요합니다.',
    type: '정기점검',
    targetType: '기업',
    priority: 'medium',
    status: '예정',
    createdAt: '2026-05-15',
    relatedCompanies: [
      { id: 'COMP-002', name: '현대자동차(주)', businessNumber: '101-81-54321', employeeCount: 68000, planType: 'DB', contractDate: '2020-03-01' },
      { id: 'COMP-003', name: '현대모비스(주)', businessNumber: '101-81-98765', employeeCount: 32000, planType: 'DC', contractDate: '2020-03-01' },
    ],
  },
  {
    id: 'DL-005',
    title: 'DC형 신규 가입자 운용지시 안내',
    deadline: '2026-06-25',
    content: 'SK하이닉스 신규 입사자 DC형 퇴직연금 운용지시 안내 기한입니다. 신규 가입자 대상 운용지시 교육 및 안내 자료 발송이 필요합니다.',
    type: '운용지시',
    targetType: '가입자',
    priority: 'low',
    status: '예정',
    createdAt: '2026-05-25',
    relatedSubscribers: [
      { id: 'SUB-005', name: '최수아', employeeId: 'EMP-2026-0001', company: 'SK하이닉스(주)', joinDate: '2026-03-02', balance: 0 },
      { id: 'SUB-006', name: '정도현', employeeId: 'EMP-2026-0002', company: 'SK하이닉스(주)', joinDate: '2026-03-02', balance: 0 },
      { id: 'SUB-007', name: '윤하은', employeeId: 'EMP-2026-0003', company: 'SK하이닉스(주)', joinDate: '2026-03-02', balance: 0 },
      { id: 'SUB-008', name: '임재원', employeeId: 'EMP-2026-0004', company: 'SK하이닉스(주)', joinDate: '2026-03-02', balance: 0 },
    ],
  },
  {
    id: 'DL-006',
    title: '퇴직연금 신고의무 이행',
    deadline: '2026-06-30',
    content: '포스코 퇴직연금 운용 현황 고용노동부 신고 기한입니다. 연간 운용 현황 및 적립금 현황 보고서를 제출해야 합니다.',
    type: '신고의무',
    targetType: '기업',
    priority: 'low',
    status: '예정',
    createdAt: '2026-05-20',
    relatedCompanies: [
      { id: 'COMP-004', name: '포스코(주)', businessNumber: '123-81-67890', employeeCount: 45000, planType: 'DB', contractDate: '2019-01-01' },
    ],
  },
]

export function getDeadlinesByMonth(schedules: DeadlineSchedule[], year: number, month: number): DeadlineSchedule[] {
  return schedules.filter(s => {
    const d = new Date(s.deadline)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

export function getDeadlinesByDate(schedules: DeadlineSchedule[], dateStr: string): DeadlineSchedule[] {
  return schedules.filter(s => s.deadline === dateStr)
}

export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
