'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

type AnnualSalary = {
  year: string
  salary: number
  minContribution?: number | null
  contribution?: number | null
}

type Row = AnnualSalary & {
  delta: number | null
  pct: number | null
}

function fmtWon(value: number | null | undefined) {
  return value != null ? `${value.toLocaleString()}원` : '-'
}

function DeltaBadge({
  delta,
  pct,
  variant = 'amount',
  prefix = '',
  className = '',
}: {
  delta: number
  pct: number | null
  variant?: 'amount' | 'pct'
  prefix?: string
  className?: string
}) {
  const positive = delta > 0
  const negative = delta < 0
  const color = positive
    ? 'bg-emerald-100 text-emerald-600'
    : negative
      ? 'bg-red-100 text-red-500'
      : 'bg-gray-100 text-gray-500'
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus
  const sign = positive ? '+' : ''
  const pctText = pct != null ? `${sign}${pct.toFixed(1)}%` : null
  const amountText = `${sign}${delta.toLocaleString()}원`

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {prefix}
      {variant === 'pct' ? (pctText ?? amountText) : amountText}
      {variant === 'amount' && pctText && (
        <span className="opacity-70">({pctText})</span>
      )}
    </span>
  )
}

export function AnnualSalaryCard({
  salaries,
  startDate,
}: {
  salaries: AnnualSalary[]
  startDate?: string | null
}) {
  const asc = [...salaries].sort((a, b) => Number(a.year) - Number(b.year))
  const rows: Row[] = asc.map((s, i) => {
    if (i === 0) return { ...s, delta: null, pct: null }
    const prev = asc[i - 1].salary
    const delta = s.salary - prev
    const pct = prev !== 0 ? (delta / prev) * 100 : null
    return { ...s, delta, pct }
  })
  const desc = [...rows].reverse()

  const latest = desc[0] ?? null
  const pctValues = rows
    .map((r) => r.pct)
    .filter((p): p is number => p != null)
  const avgPct =
    pctValues.length > 0
      ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length
      : null
  const totalGrowth =
    asc.length > 1 ? asc[asc.length - 1].salary - asc[0].salary : null

  // 실제 부담금 데이터 보유 여부 (DC인 경우 채워짐, DB는 null)
  const hasContribution = salaries.some(
    (s) => s.contribution != null && s.minContribution != null,
  )
  const latestPaid =
    latest != null && latest.contribution != null && latest.minContribution != null
      ? latest.contribution >= latest.minContribution
      : null

  // DB형 퇴직급여 추계액 = 월평균급여 × 근속연수 (= 평균임금 × 30 × 재직일수 / 365 단순화)
  const monthlySalary = latest != null ? Math.round(latest.salary / 12) : null
  const yearsServed =
    startDate && latest != null
      ? (Date.now() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
      : null
  const estimatedBenefit =
    monthlySalary != null && yearsServed != null
      ? Math.round(monthlySalary * yearsServed)
      : null
  const tenureText =
    yearsServed != null
      ? `${Math.floor(yearsServed)}년 ${Math.floor((yearsServed - Math.floor(yearsServed)) * 12)}개월`
      : null

  const isEmpty = salaries.length === 0

  return (
    <Card className="glass border-0 overflow-hidden py-0 gap-0 animate-slide-up">
      <CardHeader className="border-b border-white/30 py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> 연도별 연봉
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 space-y-5">
        {isEmpty ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            연봉 정보가 없습니다.
          </div>
        ) : (
          <>
            {/* 요약 지표 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200/70 p-4">
                <p className="text-xs font-medium text-slate-500 mb-1.5">
                  최신 연봉 ({latest!.year})
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {fmtWon(latest!.salary)}
                </p>
                {latest!.delta != null && (
                  <DeltaBadge
                    delta={latest!.delta}
                    pct={latest!.pct}
                    variant="pct"
                    prefix="전년 대비 "
                    className="mt-2"
                  />
                )}
              </div>
              <div className="rounded-xl border border-slate-200/70 p-4">
                <p className="text-xs font-medium text-slate-500 mb-1.5">
                  평균 인상률
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {avgPct != null
                    ? `${avgPct >= 0 ? '+' : ''}${avgPct.toFixed(1)}%`
                    : '-'}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {totalGrowth != null
                    ? `누적 ${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toLocaleString()}원`
                    : '단일 연도'}
                </p>
              </div>
              {hasContribution ? (
                <div className="rounded-xl border border-slate-200/70 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-slate-500">
                      납입 부담금 ({latest!.year})
                    </p>
                    {latestPaid != null && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        latestPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {latestPaid ? '납입완료' : '미납'}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtWon(latest!.contribution)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    최소 {fmtWon(latest!.minContribution)}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200/70 p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">
                    예상 퇴직급여 추계액
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtWon(estimatedBenefit)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {tenureText
                      ? `월평균 ${fmtWon(monthlySalary)} × 근속 ${tenureText}`
                      : `최신 연봉 ${fmtWon(latest!.salary)} 기준`}
                  </p>
                </div>
              )}
            </div>

            {/* 연도별 테이블 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/70">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-28" />
                  <col />
                  {hasContribution && <col />}
                </colgroup>
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200/70">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      연도
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      연봉
                    </th>
                    {hasContribution && (
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                        최소 부담금
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {desc.map((s) => (
                    <tr key={s.year} className="border-b border-white/20">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {s.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        {fmtWon(s.salary)}
                      </td>
                      {hasContribution && (
                        <td className="px-6 py-4 text-sm text-right text-foreground">
                          {fmtWon(s.minContribution)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
