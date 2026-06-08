'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  PieChart as PieChartIcon,
  ArrowUp,
} from 'lucide-react'

const portfolioItems = [
  { name: '원리금보장 (정기예금)', percent: 52, amount: '22.2억', color: '#2563eb' },
  { name: '채권형 펀드', percent: 23, amount: '9.8억', color: '#15803d' },
  { name: '혼합형 펀드', percent: 15, amount: '6.4억', color: '#d97706' },
  { name: 'MMF', percent: 10, amount: '4.2억', color: '#94a3b8' },
]

const maturingProducts = [
  { name: 'IBK 정기예금 A', due: '만기 06.15', amount: '8.4억', dday: 'D-20', tone: 'danger' as const },
  { name: 'IBK 정기예금 B', due: '만기 06.30', amount: '3.2억', dday: 'D-35', tone: 'warning' as const },
  { name: '채권형 펀드 C', due: '만기 07.20', amount: '2.1억', dday: 'D-55', tone: 'info' as const },
]

const ddayToneClass: Record<'danger' | 'warning' | 'info', string> = {
  danger: 'bg-red-100 text-red-500',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-sky-100 text-sky-600',
}

const FUNDING_RATIO = 83.0

export function DBOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-primary font-medium">DB형 퇴직연금 관리 현황</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              <span className="gradient-text">기금 적립</span> 현황을 확인하세요
            </h2>
            <p className="text-muted-foreground">법정 기준 대비 적립 적정성을 한눈에 점검할 수 있습니다</p>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap mt-1">
            2025년 5월 기준 · (주)한국기업
          </span>
        </div>
      </div>

      {/* 주요 현황 Stats */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3 px-1">주요 현황</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 가입자 수 */}
          <Card className="glass border-0 card-interactive bg-gradient-to-br from-sky-500/15 to-sky-500/5 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">가입자 수</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  247<span className="text-lg font-normal text-muted-foreground ml-1">명</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">전체 임직원 250명 중</p>
              </div>
            </CardContent>
          </Card>

          {/* 현재 적립금 */}
          <Card className="glass border-0 card-interactive bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">현재 적립금</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  42.6<span className="text-lg font-normal text-muted-foreground ml-1">억</span>
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">전월 대비 +0.8억</p>
              </div>
            </CardContent>
          </Card>

          {/* 퇴직급여 추계액 */}
          <Card className="glass border-0 card-interactive bg-gradient-to-br from-violet-500/15 to-violet-500/5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">퇴직급여 추계액</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  51.3<span className="text-lg font-normal text-muted-foreground ml-1">억</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-0.5">
                  전년 대비 <span className="text-emerald-600 font-medium">+3.2억</span>
                  <ArrowUp className="w-3 h-3 text-emerald-600" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 적립금 적정성 */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            적립금 적정성
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-100 text-amber-600">법정 기준 미달 주의</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-5 bg-white/50 rounded-2xl border border-white/50">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-semibold text-foreground">기준책임준비금 대비 적립 비율</p>
                <p className="text-sm text-muted-foreground mt-1">
                  법정 최소 기준: <span className="font-semibold text-foreground">100%</span> ·
                  현재: <span className="font-semibold text-amber-600"> {FUNDING_RATIO.toFixed(1)}%</span> ·
                  부족액: <span className="font-semibold text-red-500"> 8.7억</span>
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-100 text-red-500 whitespace-nowrap">추가납입 필요</span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 progress-fill rounded-full transition-all duration-700"
                style={{ width: `${FUNDING_RATIO}%` }}
              />
              {/* 100% marker */}
              <div className="absolute inset-y-0 right-0 w-0.5 bg-red-500" />
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
                <p className="text-xl font-bold text-foreground">51.3억</p>
                <p className="text-xs text-muted-foreground mt-1">기준책임준비금</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">42.6억</p>
                <p className="text-xs text-muted-foreground mt-1">현재 적립금</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">-8.7억</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  부족액
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-500">D-47 기한</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 2단 구성 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 운용상품 포트폴리오 */}
        <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
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
              {portfolioItems.map((item) => (
                <div
                  key={item.name}
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  className="h-full"
                />
              ))}
            </div>

            <div className="space-y-3">
              {portfolioItems.map((item) => (
                <div key={item.name} className="flex items-center text-sm">
                  <span className="w-2.5 h-2.5 rounded-sm mr-2.5 shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-foreground">{item.name}</span>
                  <span className="font-semibold text-foreground w-14 text-right">{item.percent}%</span>
                  <span className="text-muted-foreground w-16 text-right">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 만기 도래 상품 */}
        <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md">
                  <CalendarClock className="w-4 h-4 text-white" />
                </div>
                만기 도래 상품
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-muted-foreground">3건</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {maturingProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300">
                  <span className="font-semibold text-foreground text-sm">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {p.due} · <span className="text-foreground font-medium">{p.amount}</span>
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${ddayToneClass[p.tone]}`}>
                      {p.dday}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/50 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">전체 운용수익률 (연환산)</span>
                <span className="font-semibold text-emerald-600">3.42%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">원리금보장 비중</span>
                <span className="font-semibold text-foreground">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
