'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

type AnnualSalary = { year: string; salary: number }

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

export function AnnualSalaryCard({ salaries }: { salaries: AnnualSalary[] }) {
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

  // DC 최소 부담금 기준(연봉의 1/12) 추정 산정액
  const estimatedContribution =
    latest != null ? Math.round(latest.salary / 12) : null

  const isEmpty = salaries.length === 0

  return (
    <Card className="glass border-0 overflow-hidden animate-slide-up">
      <CardHeader className="border-b border-white/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> 연도별 연봉
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4 space-y-5">
        {isEmpty ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            연봉 정보가 없습니다.
          </div>
        ) : (
          <>
            {/* 요약 지표 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/60 border border-slate-200/70 shadow-sm p-4">
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
              <div className="rounded-xl bg-white/60 border border-slate-200/70 shadow-sm p-4">
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
              <div className="rounded-xl bg-white/60 border border-slate-200/70 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-500 mb-1.5">
                  예상 부담금 (산정액)
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {fmtWon(estimatedContribution)}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {latest!.year}년 · 연봉의 1/12
                </p>
              </div>
            </div>

            {/* 연도별 테이블 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/70">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      연도
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      연봉
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {desc.map((s) => (
                    <tr key={s.year} className="border-b border-white/20">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {s.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
                        {fmtWon(s.salary)}
                      </td>
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
