export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api'

export const DEMO_COMPANY_ID = 'C005'

export function authHeaders(): HeadersInit {
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
  payment_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | null
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

export type CompanyProfile = {
  companyName: string
  businessNumber: string
  planType: string
}

export type CompanyDetail = {
  // 회사 기본 정보
  companyName: string
  businessNumber: string
  representativeName: string | null
  planType: 'DC' | 'DB'
  // 퇴직연금 정보 (공통)
  companyAccount: string | null
  contractDate: string | null
  employeeCount: number | null
  totalReserve: number | null
  // DC 전용
  paymentCycle: string | null
  // DB 전용
  fiscalMonth: number | null
  targetReturnRate: number | null
}

export type ContributionChartItem = {
  label: string
  amount: number
  paid: boolean
}

export type DcContributionChart = {
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  items: ContributionChartItem[]
}

export async function getDcContributionChart(signal?: AbortSignal): Promise<DcContributionChart> {
  const res = await fetch(`${API_BASE}/company/dc-contributions`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '부담금 납입 현황 조회 실패'))
  return res.json()
}

export async function getCompanyProfile(signal?: AbortSignal): Promise<CompanyProfile> {
  const res = await fetch(`${API_BASE}/company/profile`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '기업 정보 조회 실패'))
  return res.json()
}

export async function getCompanyDetail(signal?: AbortSignal): Promise<CompanyDetail> {
  const res = await fetch(`${API_BASE}/company/detail`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '기업 상세 정보 조회 실패'))
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
    payment_cycle: (r.payment_cycle ?? null) as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | null,
  }
}

function mapMember(item: Record<string, unknown>): Employee {
  return {
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
  }
}

export type MemberQuery = {
  name?: string
  status?: string[]
  type?: string[]
  irp?: string[]
  default?: string[]
  contribution?: string[]
  page?: number
  size?: number
}

export type MemberPage = {
  totalCount: number
  page: number
  size: number
  totalPages: number
  members: Employee[]
}

function buildMemberQuery(q: MemberQuery): string {
  const p = new URLSearchParams()
  if (q.name) p.set('name', q.name)
  ;(q.status ?? []).forEach(v => p.append('status', v))
  ;(q.type ?? []).forEach(v => p.append('type', v))
  ;(q.irp ?? []).forEach(v => p.append('irp', v))
  ;(q.default ?? []).forEach(v => p.append('default', v))
  ;(q.contribution ?? []).forEach(v => p.append('contribution', v))
  p.set('page', String(q.page ?? 0))
  p.set('size', String(q.size ?? 20))
  return p.toString()
}

async function fetchMemberPage(plan: 'dc' | 'db', q: MemberQuery, signal?: AbortSignal): Promise<MemberPage> {
  const res = await fetch(`${API_BASE}/pension/${plan}/members?${buildMemberQuery(q)}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '가입자 목록 조회 실패'))
  const r = await res.json() as Record<string, unknown>
  return {
    totalCount: (r.totalCount as number) ?? 0,
    page: (r.page as number) ?? 0,
    size: (r.size as number) ?? 0,
    totalPages: (r.totalPages as number) ?? 0,
    members: ((r.members ?? []) as Record<string, unknown>[]).map(mapMember),
  }
}

export function getDcMemberPage(q: MemberQuery, signal?: AbortSignal): Promise<MemberPage> {
  return fetchMemberPage('dc', q, signal)
}

export function getDbMemberPage(q: MemberQuery, signal?: AbortSignal): Promise<MemberPage> {
  return fetchMemberPage('db', q, signal)
}

// 전체 목록(배열) — 마감 알림 등에서 사용
export async function getDbMembers(signal?: AbortSignal): Promise<Employee[]> {
  return (await fetchMemberPage('db', { size: 100000 }, signal)).members
}

export async function getDcMembers(signal?: AbortSignal): Promise<Employee[]> {
  return (await fetchMemberPage('dc', { size: 100000 }, signal)).members
}

export async function getPensionSchedules(signal?: AbortSignal): Promise<ExpectedRetiree[]> {
  return pensionFetch('/schedules', signal) as Promise<ExpectedRetiree[]>
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
    hasIrpAccount: string | null
    balance: number | null
    status: EmployeeStatus | null
  } | null
  annualSalaries: { year: string; salary: number }[]
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
  is_mandatory: boolean
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
  is_mandatory: boolean
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
  const res = await fetch(`${API_BASE}/dc/schedules${query ? '?' + query : ''}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 목록 조회 실패'))
  return res.json()
}

export async function getScheduleDcDetail(id: number, signal?: AbortSignal): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/dc/schedules/${id}`, {
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
  const res = await fetch(`${API_BASE}/dc/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 추가 실패'))
  return res.json()
}

export async function deleteScheduleDc(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/dc/schedules/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 삭제 실패'))
}

export async function updateScheduleDc(id: number, data: {
  title: string
  due_date: string
  description?: string
  employee_ids?: number[]
}): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/dc/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 수정 실패'))
  return res.json()
}

export async function completeScheduleDc(id: number): Promise<ScheduleDcDetail> {
  const res = await fetch(`${API_BASE}/dc/schedules/${id}/complete`, {
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

export async function getDbMemberDetail(id: number, signal?: AbortSignal): Promise<EmployeeDetail> {
  const res = await fetch(`${API_BASE}/pension/db/members/${id}`, {
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
  is_mandatory: boolean
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
  is_mandatory: boolean
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
  const res = await fetch(`${API_BASE}/db/schedules${query ? '?' + query : ''}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '일정 목록 조회 실패'))
  return res.json()
}

export async function getScheduleDbDetail(id: number, signal?: AbortSignal): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/db/schedules/${id}`, {
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
  const res = await fetch(`${API_BASE}/db/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 추가 실패'))
  return res.json()
}

export async function deleteScheduleDb(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/db/schedules/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 삭제 실패'))
}

export async function updateScheduleDb(id: number, data: {
  title: string
  due_date: string
  description?: string
  employee_ids?: number[]
}): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/db/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '일정 수정 실패'))
  return res.json()
}

export async function completeScheduleDb(id: number): Promise<ScheduleDbDetail> {
  const res = await fetch(`${API_BASE}/db/schedules/${id}/complete`, {
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

// ─── DB Assets API ─────────────────────────────────────────────────────────

export type ReturnHistoryPoint = {
  base_date: string
  return_rate: number
}

export type AssetClassPortfolio = {
  class_code: string
  class_name: string
  amount: number
  pct: number
  color: string
}

export type ProductHolding = {
  product_name: string
  provider: string
  return_rate: number
  amount: number
}

export type AssetClassHoldings = {
  class_code: string
  class_name: string
  color: string
  products: ProductHolding[]
}

export type AssetsCurrent = {
  current_return_rate: number
  target_return_rate: number
  return_history: ReturnHistoryPoint[]
  portfolio_by_class: AssetClassPortfolio[]
  holdings_by_class: AssetClassHoldings[]
  total_amount: number
  risk_asset_ratio: number
}

export async function getAssetsCurrent(signal?: AbortSignal): Promise<AssetsCurrent> {
  const res = await fetch(`${API_BASE}/pension/db/assets/current`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '자산 현황 조회 실패'))
  return res.json()
}

export async function updateTargetReturnRate(rate: number): Promise<number> {
  const res = await fetch(`${API_BASE}/pension/db/assets/target-rate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify({ target_return_rate: rate }),
  })
  if (!res.ok) throw new Error(await readError(res, '목표 수익률 업데이트 실패'))
  return res.json()
}

export type ProductOption = {
  id: number
  name: string
  return_rate: number
  tag: string | null
  provider: string
}

export type AssetClassOption = {
  id: number
  class_code: string
  class_name: string
  is_risk: boolean
  allow_multi: boolean
  avg_return_3y: number
  color: string
  products: ProductOption[]
}

export type SimulationOptions = {
  classes: AssetClassOption[]
}

export async function getSimulationOptions(signal?: AbortSignal): Promise<SimulationOptions> {
  const res = await fetch(`${API_BASE}/pension/db/assets/simulation-options`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '시뮬레이션 옵션 조회 실패'))
  return res.json()
}

export type SimulationItemDto = {
  asset_class_id: number
  product_master_id: number | null
  weight_pct: number
  applied_return: number
}

export type SimulationSaveRequest = {
  simulation_name: string
  preset_type: string
  expected_return_rate: number
  risk_asset_ratio: number
  items: SimulationItemDto[]
}

export type SimulationItemResponse = {
  asset_class_id: number
  class_code: string
  class_name: string
  product_master_id: number | null
  product_name: string | null
  weight_pct: number
  applied_return: number
}

export type Simulation = {
  id: number
  simulation_name: string
  expected_return_rate: number
  risk_asset_ratio: number
  preset_type: string
  status: string
  created_at: string
  items: SimulationItemResponse[]
}

export async function saveSimulation(data: SimulationSaveRequest): Promise<Simulation> {
  const res = await fetch(`${API_BASE}/pension/db/assets/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, '시뮬레이션 저장 실패'))
  return res.json()
}

export async function listSimulations(signal?: AbortSignal): Promise<Simulation[]> {
  const res = await fetch(`${API_BASE}/pension/db/assets/simulation`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(await readError(res, '시뮬레이션 목록 조회 실패'))
  return res.json()
}

export async function deleteSimulation(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/pension/db/assets/simulation/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await readError(res, '시뮬레이션 삭제 실패'))
}
