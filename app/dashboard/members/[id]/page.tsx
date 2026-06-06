'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Users,
  Loader2,
  Wallet,
  CalendarDays,
  Building2,
} from 'lucide-react'
import {
  DEMO_COMPANY_ID,
  EmployeeDetail,
  getEmployeeDetail,
} from '@/lib/api'

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const employeeId = Number(id)

  const [data, setData] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(employeeId)) {
      setError('잘못된 가입자 ID입니다.')
      setIsLoading(false)
      return
    }

    const ctrl = new AbortController()
    setIsLoading(true)
    setError(null)

    getEmployeeDetail(DEMO_COMPANY_ID, employeeId, ctrl.signal)
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      })
      .finally(() => setIsLoading(false))

    return () => ctrl.abort()
  }, [employeeId])

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard?tab=members"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        가입자 목록으로
      </Link>

      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
          불러오는 중...
        </div>
      ) : error ? (
        <Card className="glass border-0">
          <CardContent className="p-8 text-destructive">{error}</CardContent>
        </Card>
      ) : data ? (
        <MemberDetailView data={data} />
      ) : null}
    </div>
  )
}

function MemberDetailView({ data }: { data: EmployeeDetail }) {
  const retirement = data.retirement
  const company = data.company

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{data.name}</h1>
          <p className="text-muted-foreground">
            사원번호 {data.memberId}
            {retirement?.position ? ` · ${retirement.position}` : ''}
            {retirement?.status ? ` · ${retirement.status}` : ''}
          </p>
        </div>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            소속 회사
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="회사명" value={company?.companyName} />
          <Field label="회사 코드" value={company?.companyId} />
          <Field label="제도" value={company?.planType ? `${company.planType}형` : null} />
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            퇴직연금 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="가입자 계좌" value={retirement?.employeeAccount} />
          <Field label="직위" value={retirement?.position} />
          <Field
            label="적립금"
            value={
              retirement?.balance != null
                ? `${retirement.balance.toLocaleString()}원`
                : null
            }
          />
          <Field label="가입일" value={retirement?.joinDate} />
          <Field label="시작일" value={retirement?.startDate} />
          <Field label="기준일" value={retirement?.effectiveDate} />
          <Field
            label="디폴트옵션"
            value={
              retirement?.defaultOption == null
                ? null
                : retirement.defaultOption
                  ? '설정완료'
                  : '미설정'
            }
          />
          <Field label="퇴직일" value={retirement?.terminationDate} />
          <Field label="상태" value={retirement?.status} />
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            연봉 이력
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.annualSalaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">연봉 정보가 없습니다.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-white/30">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    연도
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                    연봉
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.annualSalaries.map((s) => (
                  <tr key={s.year} className="border-b border-white/20">
                    <td className="p-3 text-sm text-foreground">{s.year}</td>
                    <td className="p-3 text-sm text-right text-foreground font-medium">
                      {s.salary.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-lg">개인 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="주민등록번호" value={data.rrnMasked} />
        </CardContent>
      </Card>
    </>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '-'}</p>
    </div>
  )
}
