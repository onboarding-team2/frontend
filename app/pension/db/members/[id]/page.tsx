'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, IdCard, Wallet, TrendingUp } from 'lucide-react'
import { getDbMemberDetail, EmployeeDetail } from '@/lib/api'
import { formatRrnAsBirthDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function fmtDate(value: string | null | undefined) {
  return value && value.length > 0 ? value : '-'
}

function fmtWon(value: number | null | undefined) {
  return value != null ? `${value.toLocaleString()}원` : '-'
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function DBMemberDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const [detail, setDetail] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getDbMemberDetail(id, controller.signal)
      .then(setDetail)
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id])

  const goBack = () => router.push('/pension/db/members')

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white">
          <ArrowLeft className="w-4 h-4" /> 목록으로
        </Button>
        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <Card key={i} className="glass border-0">
              <CardContent className="p-6 grid grid-cols-2 gap-x-6 gap-y-5">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="glass border-0">
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white">
          <ArrowLeft className="w-4 h-4" /> 목록으로
        </Button>
        <Card className="glass border-0">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">가입자 정보를 불러오지 못했습니다.</CardContent>
        </Card>
      </div>
    )
  }

  const r = detail.retirement
  const status = r?.status ?? '재직'

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white animate-slide-up">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </Button>

      {/* 프로필 헤더 */}
      <Card className="glass border-0 animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{detail.name?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{detail.name}</h2>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  status === '재직' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                {r?.position ?? '-'} · {detail.company?.companyName ?? '-'}
                {detail.company?.planType ? ` · ${detail.company.planType}형` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="border-b border-white/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <IdCard className="w-5 h-5 text-primary" /> 기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField label="이름" value={detail.name} />
            <InfoField label="생년월일" value={formatRrnAsBirthDate(detail.rrnMasked)} />
            <InfoField label="구분" value={r?.position ?? '-'} />
            <InfoField label="회사" value={detail.company?.companyName ?? '-'} />
            <InfoField label="제도유형" value={detail.company?.planType ? `${detail.company.planType}형` : '-'} />
            <InfoField label="재직여부" value={status} />
          </CardContent>
        </Card>

        {/* 퇴직연금 정보 (DB형: 디폴트옵션/기산일/적립금 없음) */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="border-b border-white/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> 퇴직연금 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField label="가입자 계좌" value={r?.employeeAccount ?? '-'} />
            <InfoField
              label="IRP 계좌"
              value={
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                  r?.hasIrpAccount === 'Y' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                }`}>
                  {r?.hasIrpAccount === 'Y' ? '보유' : '미보유'}
                </span>
              }
            />
            <InfoField label="가입일" value={fmtDate(r?.joinDate)} />
            <InfoField label="입사일" value={fmtDate(r?.startDate)} />
            <InfoField label="퇴사일" value={fmtDate(r?.terminationDate)} />
          </CardContent>
        </Card>
      </div>

      {/* 연도별 연봉 */}
      <Card className="glass border-0 overflow-hidden animate-slide-up">
        <CardHeader className="border-b border-white/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> 연도별 연봉
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="overflow-x-auto rounded-xl border border-white/40">
            <table className="w-full">
              <thead>
                <tr className="bg-white/40">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">연도</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">연봉</th>
                </tr>
              </thead>
              <tbody>
                {detail.annualSalaries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-sm text-muted-foreground">연봉 정보가 없습니다.</td>
                  </tr>
                ) : (
                  detail.annualSalaries.map((s) => (
                    <tr key={s.year} className="border-b border-white/20">
                      <td className="px-6 py-4 text-sm text-foreground">{s.year}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">{fmtWon(s.salary)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
