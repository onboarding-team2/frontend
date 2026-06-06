const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export const DEMO_COMPANY_ID = 'C005'

export type PlanType = 'DC' | 'DB' | 'IRP'
export type EmployeeStatus = '재직' | '퇴직'

export type Employee = {
  id: number
  memberId: string
  name: string
  position: string | null
  joinDate: string | null
  planType: PlanType | null
  balance: number | null
  contributionPaid: boolean
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
