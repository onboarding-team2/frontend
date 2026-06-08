const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export const DEMO_COMPANY_ID = 'C005'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getPlanType(): 'DC' | 'DB' | 'IRP' | null {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem('planType') as 'DC' | 'DB' | 'IRP' | null)
}

export type DcDashboard = {
  total_balance: number
  total_employee: number
  default_option_not_selected: number
  this_month_contribution: number
  contribution_due_date: string | null
}

export type ExpectedRetiree = {
  rank: number
  name: string
  memberId: string
  retirementDate: string
  retirementType: string | null
}

async function pensionFetch(path: string, signal?: AbortSignal): Promise<unknown> {
  const planType = getPlanType()?.toLowerCase() ?? 'dc'
  const res = await fetch(`${API_BASE}/pension/${planType}${path}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, `${path} 조회 실패`))
  return res.json()
}

export async function getPensionDashboard(signal?: AbortSignal): Promise<DcDashboard> {
  const r = await pensionFetch('/dashboard', signal) as Record<string, unknown>
  return {
    total_balance: (r.total_balance ?? r.totalBalance ?? 0) as number,
    total_employee: (r.total_employee ?? r.totalEmployee ?? 0) as number,
    default_option_not_selected: (r.default_option_not_selected ?? r.defaultOptionNotSelected ?? 0) as number,
    this_month_contribution: (r.this_month_contribution ?? r.thisMonthContribution ?? 0) as number,
    contribution_due_date: (r.contribution_due_date ?? r.contributionDueDate ?? null) as string | null,
  }
}

export async function getPensionMembers(signal?: AbortSignal): Promise<Employee[]> {
  const result = await pensionFetch('/members', signal) as Record<string, unknown>[]
  return result.map((item) => ({
    id: item.id as number,
    name: item.name as string,
    position: (item.position as string) ?? null,
    startDate: ((item.startDate ?? item.start_date) as string) ?? null,
    balance: (item.balance as number) ?? null,
    contributionPaid: (item.contributionPaid as boolean) ?? null,
    status: (item.status as EmployeeStatus) ?? null,
  }))
}

export async function getPensionDeadlines(signal?: AbortSignal): Promise<ExpectedRetiree[]> {
  return pensionFetch('/deadlines', signal) as Promise<ExpectedRetiree[]>
}

export async function getPensionDocuments(signal?: AbortSignal): Promise<unknown> {
  return pensionFetch('/documents', signal)
}

export type PlanType = 'DC' | 'DB' | 'IRP'
export type EmployeeStatus = '재직' | '퇴직'

export type Employee = {
  id: number
  name: string
  position: string | null
  startDate: string | null
  balance: number | null
  contributionPaid: boolean | null
  status: EmployeeStatus | null
}

export type EmployeeListResponse = {
  totalCount: number
  page: number
  size: number
  members: Employee[]
}

export type EmployeeDetail = {
  id: number
  memberId: string
  name: string
  rrnMasked: string | null
  company: {
    companyId: string
    companyName: string
    planType: PlanType | null
  } | null
  retirement: {
    employeeAccount: string | null
    employeeType: string | null
    position: string | null
    joinDate: string | null
    startDate: string | null
    effectiveDate: string | null
    terminationDate: string | null
    defaultOption: boolean | null
    balance: number | null
    status: EmployeeStatus | null
  } | null
  annualSalaries: { year: string; salary: number }[]
}

export type EmployeeListParams = {
  companyId: string
  name?: string
  status?: 'ACTIVE' | 'RETIRED'
  page?: number
  size?: number
  signal?: AbortSignal
}

export async function getEmployees(
  params: EmployeeListParams,
): Promise<EmployeeListResponse> {
  const qs = new URLSearchParams()
  qs.set('companyId', params.companyId)
  if (params.name) qs.set('name', params.name)
  if (params.status) qs.set('status', params.status)
  qs.set('page', String(params.page ?? 0))
  qs.set('size', String(params.size ?? 20))

  const res = await fetch(`${API_BASE}/employees?${qs.toString()}`, {
    signal: params.signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 목록 조회 실패'))
  return res.json()
}

export async function getEmployeeDetail(
  companyId: string,
  id: number,
  signal?: AbortSignal,
): Promise<EmployeeDetail> {
  const qs = new URLSearchParams({ companyId })
  const res = await fetch(`${API_BASE}/employees/${id}?${qs.toString()}`, {
    signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 상세 조회 실패'))
  return res.json()
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text()
    return text || `${fallback} (HTTP ${res.status})`
  } catch {
    return `${fallback} (HTTP ${res.status})`
  }
}
