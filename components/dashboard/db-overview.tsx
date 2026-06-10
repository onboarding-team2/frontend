'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { getDbDashboard, DbDashboard, getDbPortfolio, DbPortfolio, getCompanyProfile, CompanyProfile } from '@/lib/api'
import { STATUS_CONFIG } from '@/lib/statusConfig'
import { WelcomeBanner } from './welcome-banner'

const CATEGORY_COLORS: Record<string, string> = {
  '정기예금': '#2563eb',
  '이율보증형보험': '#15803d',
  'ELB 및 ELD': '#d97706',
}

const ddayToneClass: Record<'danger' | 'warning' | 'info', string> = {
  danger: 'bg-red-100 text-red-500',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-sky-100 text-sky-600',
}

function getDdayTone(dateStr: string): 'danger' | 'warning' | 'info' {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 30) return 'danger'
  if (days <= 60) return 'warning'
  return 'info'
}

function formatDue(dateStr: string): string {
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `만기 ${mm}.${dd}`
}

function toEok(won: number): string {
  return (won / 100_000_000).toFixed(1)
}

function toDday(dateStr: string | null): string | null {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  const days = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return `D+${Math.abs(days)}`
  if (days === 0) return 'D-Day'
  return `D-${days}`
}


export function DBOverview() {
  const [data, setData] = useState<DbDashboard | null>(null)
  const [portfolio, setPortfolio] = useState<DbPortfolio | null>(null)
  const [company, setCompany] = useState<CompanyProfile | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getDbDashboard(controller.signal).then(setData).catch(() => {})
    getDbPortfolio(controller.signal).then(setPortfolio).catch(() => {})
    getCompanyProfile(controller.signal).then(setCompany).catch(() => {})
    return () => controller.abort()
  }, [])

  const fundingRatio = data ? Number(data.funding_ratio) : 0
  const shortfallEok = data ? toEok(data.shortfall_amount) : '-'
  const dday = data ? toDday(data.additional_due_date) : null
  const config = data ? STATUS_CONFIG[data.status] : null

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <WelcomeBanner planType="DB" companyName={company?.companyName} />

      {/* 주요 현황 Stats */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3 px-1">주요 현황</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 가입자 수 */}
          <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-sky-500/15 to-sky-500/5 animate-slide-up">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">가입자 수</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data != null ? data.member_count.toLocaleString() : '-'}
                  <span className="text-lg font-normal text-muted-foreground ml-1">명</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 현재 적립금 */}
          <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">현재 적립금</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data != null ? toEok(data.funded_amount) : '-'}
                  <span className="text-lg font-normal text-muted-foreground ml-1">억</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 퇴직급여 추계액 */}
          <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-violet-500/15 to-violet-500/5 animate-slide-up">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">퇴직급여 추계액</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {data != null ? toEok(data.benefit_obligation) : '-'}
                  <span className="text-lg font-normal text-muted-foreground ml-1">억</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 적립금 적정성 */}
      <Card className="glass border-0 animate-slide-up">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-md">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              적립금 적정성
              {config && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${config.badgeClass}`}>
                  {config.label}
                </span>
              )}
            </CardTitle>
            {config?.showWarning && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {config.warningText}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-5 bg-white/50 rounded-2xl border border-white/50">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-semibold text-foreground">기준책임준비금 대비 적립 비율</p>
                <p className="text-sm text-muted-foreground mt-1">
                  법정 최소 기준: <span className="font-semibold text-foreground">100%</span> ·
                  현재: <span className={`font-semibold ${fundingRatio >= 100 ? 'text-emerald-600' : fundingRatio >= 90 ? 'text-amber-600' : 'text-red-500'}`}> {data ? fundingRatio.toFixed(1) : '-'}%</span>
                  {data && data.shortfall_amount > 0 && (
                    <> · 부족액: <span className="font-semibold text-red-500"> {shortfallEok}억</span></>
                  )}
                </p>
              </div>
              {config && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap ${config.badgeClass}`}>
                  {config.label}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full progress-fill rounded-full transition-all duration-700"
                style={{ width: `${Math.min(fundingRatio, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span className="font-medium text-foreground">100% (기준)</span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/50">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  {data ? `${toEok(data.min_reserve)}억` : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">기준책임준비금</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  {data ? `${toEok(data.funded_amount)}억` : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">현재 적립금</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${data && data.shortfall_amount > 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {data ? (data.shortfall_amount > 0 ? `-${shortfallEok}억` : '충족') : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  부족액
                  {data && data.shortfall_amount > 0 && dday && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-500">{dday} 기한</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 2단 구성 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 운용상품 포트폴리오 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <PieChartIcon className="w-4 h-4 text-white" />
              </div>
              운용상품 포트폴리오
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-5">
              {(portfolio?.portfolio_items ?? []).map((item) => (
                <div
                  key={item.category}
                  style={{ flex: item.amount, backgroundColor: CATEGORY_COLORS[item.category] ?? '#94a3b8' }}
                  className="h-full"
                />
              ))}
            </div>

            <div className="space-y-3">
              {(portfolio?.portfolio_items ?? []).map((item) => (
                <div key={item.category} className="flex items-center text-sm">
                  <span className="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#94a3b8' }} />
                  <span className="flex-1 text-foreground">{item.category}</span>
                  <span className="font-semibold text-foreground w-14 text-right">{item.percent}%</span>
                  <span className="text-muted-foreground w-16 text-right">{toEok(item.amount)}억</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 만기 도래 상품 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md">
                  <CalendarClock className="w-4 h-4 text-white" />
                </div>
                만기 도래 상품
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-muted-foreground">{portfolio?.maturing_products.length ?? 0}건</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {(portfolio?.maturing_products ?? []).map((p) => {
                const tone = getDdayTone(p.maturity_date)
                return (
                  <div key={p.name + p.maturity_date} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300">
                    <span className="font-semibold text-foreground text-sm">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDue(p.maturity_date)} · <span className="text-foreground font-medium">{toEok(p.evaluated_amount)}억</span>
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${ddayToneClass[tone]}`}>
                        {toDday(p.maturity_date)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
