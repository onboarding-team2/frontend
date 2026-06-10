const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export const DEMO_COMPANY_ID = 'C005'

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const cookieRaw = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1]
  const token =
    localStorage.getItem('token') ??
    (cookieRaw ? decodeURIComponent(cookieRaw) : null)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getPlanType(): 'DC' | 'DB' | 'IRP' | null {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem('planType') as 'DC' | 'DB' | 'IRP' | null)
}

export type DefaultOptionMember = {
  name: string
  join_date: string
  days_elapsed: number
}

export type DcDashboard = {
  total_balance: number
  total_employee: number
  default_option_not_selected: number
  default_option_members: DefaultOptionMember[]
  default_option_summary: string | null
  irp_not_opened: number
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
    default_option_members: ((r.default_option_members ?? r.defaultOptionMembers ?? []) as Record<string, unknown>[]).map((m) => ({
      name: m.name as string,
      join_date: (m.join_date ?? m.joinDate ?? '') as string,
      days_elapsed: (m.days_elapsed ?? m.daysElapsed ?? 0) as number,
    })),
    default_option_summary: (r.default_option_summary ?? r.defaultOptionSummary ?? null) as string | null,
    this_month_contribution: (r.this_month_contribution ?? r.thisMonthContribution ?? 0) as number,
    contribution_due_date: (r.contribution_due_date ?? r.contributionDueDate ?? null) as string | null,
    irp_not_opened: (r.irp_account_not_opened ?? r.irpAccountNotOpened ?? 0) as number,
  }
}

export async function getPensionMembers(signal?: AbortSignal): Promise<Employee[]> {
  const result = await pensionFetch('/members', signal) as Record<string, unknown>[]
  return result.map((item) => ({
    id: item.id as number,
    name: item.name as string,
    rrnMasked: ((item.rrnMasked ?? item.rrn_masked) as string) ?? null,
    position: (item.position as string) ?? null,
    startDate: ((item.startDate ?? item.start_date) as string) ?? null,
    joinDate: ((item.joinDate ?? item.join_date) as string) ?? null,
    hasIrpAccount: ((item.hasIrpAccount ?? item.has_irp_account) as string) ?? null,
    defaultOption: ((item.defaultOption ?? item.default_option) as string) ?? null,
    balance: (item.balance as number) ?? null,
    contributionPaid: (item.contributionPaid as boolean) ?? null,
    status: (item.status as EmployeeStatus) ?? null,
  }))
}

async function fetchMembersByPlan(plan: 'dc' | 'db', signal?: AbortSignal): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/pension/${plan}/members`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 목록 조회 실패'))
  const result = await res.json() as Record<string, unknown>[]
  return result.map((item) => ({
    id: item.id as number,
    name: item.name as string,
    rrnMasked: ((item.rrnMasked ?? item.rrn_masked) as string) ?? null,
    position: (item.position as string) ?? null,
    startDate: ((item.startDate ?? item.start_date) as string) ?? null,
    joinDate: ((item.joinDate ?? item.join_date) as string) ?? null,
    hasIrpAccount: ((item.hasIrpAccount ?? item.has_irp_account) as string) ?? null,
    defaultOption: ((item.defaultOption ?? item.default_option) as string) ?? null,
    balance: (item.balance as number) ?? null,
    contributionPaid: (item.contributionPaid as boolean) ?? null,
    status: (item.status as EmployeeStatus) ?? null,
  }))
}

export async function getDbMembers(signal?: AbortSignal): Promise<Employee[]> {
  return fetchMembersByPlan('db', signal)
}

export async function getDcMembers(signal?: AbortSignal): Promise<Employee[]> {
  return fetchMembersByPlan('dc', signal)
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
  rrnMasked: string | null
  position: string | null
  startDate: string | null
  joinDate: string | null
  hasIrpAccount: string | null
  defaultOption: string | null
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

// ─── Schedule DC API ───────────────────────────────────────────────────────

export type ScheduleDcItem = {
  id: number
  title: string
  due_date: string
  status: string
  d_day: string
}

export type ScheduleDcResponse = {
  total_count: number
  imminent_count: number
  overdue_count: number
  schedules: ScheduleDcItem[]
}

export type ScheduleDcTargetEmployee = {
  employee_id: number
  name: string
  company_name: string | null
}

export type ScheduleDcDetail = {
  id: number
  title: string
  due_date: string
  created_date: string | null
  description: string | null
  status: string
  d_day: string
  company_name: string | null
  brn: string | null
  plan_type: string | null
  target_employees: ScheduleDcTargetEmployee[]
}

export async function getSchedulesDc(
  params?: { period?: number; keyword?: string },
  signal?: AbortSignal,
): Promise<ScheduleDcResponse> {
  const qs = new URLSearchParams()
  if (params?.period != null) qs.set('period', String(params.period))
  if (params?.keyword) qs.set('keyword', params.keyword)
  const query = qs.toString()
  const res = await fetch(`${API_BASE}/schedules${query ? '?' + query : ''}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 목록 조회 실패'))
  return res.json()
}

export async function getScheduleDcDetail(id: number, signal?: AbortSignal): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 상세 조회 실패'))
  return res.json()
}

export async function createScheduleDc(data: {
  title: string
  due_date: string
  description?: string
  employee_ids?: number[]
}): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 추가 실패'))
  return res.json()
}

export async function deleteScheduleDc(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 삭제 실패'))
}

export async function completeScheduleDc(id: number): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/schedules/${id}/complete`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 완료 처리 실패'))
  return res.json()
}

export async function getDcMemberDetail(id: number, signal?: AbortSignal): Promise<EmployeeDetail> {
  const res = await fetch(`${API_BASE}/pension/dc/members/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 상세 조회 실패'))
  return res.json()
}

export async function getPensionMemberDetail(id: number, signal?: AbortSignal): Promise<EmployeeDetail> {
  const planType = getPlanType()?.toLowerCase() ?? 'dc'
  const res = await fetch(`${API_BASE}/pension/${planType}/members/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 상세 조회 실패'))
  return res.json()
}

// ─── Schedule DB API ───────────────────────────────────────────────────────

export type ScheduleDbItem = {
  id: number
  title: string
  due_date: string
  status: string
  d_day: string
}

export type ScheduleDbResponse = {
  total_count: number
  imminent_count: number
  overdue_count: number
  schedules: ScheduleDbItem[]
}

export type ScheduleDbTargetEmployee = {
  employee_id: number
  name: string
  company_name: string | null
}

export type ScheduleDbDetail = {
  id: number
  title: string
  due_date: string
  created_date: string | null
  description: string | null
  status: string
  d_day: string
  company_name: string | null
  brn: string | null
  plan_type: string | null
  target_employees: ScheduleDbTargetEmployee[]
}

export async function getSchedulesDb(
  params?: { period?: number; keyword?: string },
  signal?: AbortSignal,
): Promise<ScheduleDbResponse> {
  const qs = new URLSearchParams()
  if (params?.period != null) qs.set('period', String(params.period))
  if (params?.keyword) qs.set('keyword', params.keyword)
  const query = qs.toString()
  const res = await fetch(`${API_BASE}/schedules/db${query ? '?' + query : ''}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 목록 조회 실패'))
  return res.json()
}

export async function getScheduleDbDetail(id: number, signal?: AbortSignal): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/schedules/db/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 상세 조회 실패'))
  return res.json()
}

export async function createScheduleDb(data: {
  title: string
  due_date: string
  description?: string
  employee_ids?: number[]
}): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/schedules/db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 추가 실패'))
  return res.json()
}

export async function deleteScheduleDb(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/schedules/db/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 삭제 실패'))
}

export async function completeScheduleDb(id: number): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/schedules/db/${id}/complete`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 완료 처리 실패'))
  return res.json()
}

// ─── DB Dashboard API ─────────────────────────────────────────────────────

export type DbDashboard = {
  member_count: number
  funded_amount: number
  benefit_obligation: number
  min_reserve: number
  funding_ratio: number
  shortfall_amount: number
  additional_due_date: string | null
  status: '적정' | '주의' | '추가납입필요'
  base_date: string | null
}

export async function getDbDashboard(signal?: AbortSignal): Promise<DbDashboard> {
  const res = await fetch(`${API_BASE}/pension/db/dashboard`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, 'DB 대시보드 조회 실패'))
  return res.json()
}

// ─── DB Portfolio API ──────────────────────────────────────────────────────

export type PortfolioCategoryItem = {
  category: string
  amount: number
  percent: number
}

export type MaturingProductItem = {
  name: string
  maturity_date: string
  principal: number
  evaluated_amount: number
}

export type DbPortfolio = {
  portfolio_items: PortfolioCategoryItem[]
  maturing_products: MaturingProductItem[]
  average_return_rate: number
  principal_guaranteed_ratio: number
}

export async function getDbPortfolio(signal?: AbortSignal): Promise<DbPortfolio> {
  const res = await fetch(`${API_BASE}/pension/db/portfolio`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, 'DB 포트폴리오 조회 실패'))
  return res.json()
}
