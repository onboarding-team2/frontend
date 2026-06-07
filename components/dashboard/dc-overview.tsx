'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight, Sparkles, CalendarClock, ShieldAlert, FileX, ShoppingCart, RefreshCw, ChevronRight } from 'lucide-react'

const statsCards = [
  {
    title: 'DC형 총 적립금',
    value: '124.5',
    unit: '억원',
    change: '+2.4%',
    trend: 'up',
    icon: Wallet,
    gradient: 'from-primary/15 to-primary/5',
    iconGradient: 'from-primary to-blue-500',
  },
  {
    title: '총 가입자 수',
    value: '1,234',
    unit: '명',
    change: '+12',
    trend: 'up',
    icon: Users,
    gradient: 'from-sky-500/15 to-sky-500/5',
    iconGradient: 'from-sky-500 to-blue-400',
  },
  {
    title: '디폴트옵션 미지정자',
    value: '45',
    unit: '명',
    change: '-5',
    trend: 'down',
    icon: AlertTriangle,
    gradient: 'from-amber-500/15 to-amber-500/5',
    iconGradient: 'from-amber-500 to-orange-400',
  },
]

const contributionData = [
  { month: '1월', planned: 120, actual: 115 },
  { month: '2월', planned: 120, actual: 122 },
  { month: '3월', planned: 120, actual: 118 },
  { month: '4월', planned: 120, actual: 125 },
  { month: '5월', planned: 120, actual: 0 },
]

const unprocessedItems = [
  {
    title: '디폴트옵션 미선정',
    count: 12,
    icon: AlertTriangle,
    iconGradient: 'from-amber-500 to-orange-400',
    rows: [
      { name: '김지훈', dateLabel: '가입일 2025.03.12', badge: '54일 초과', badgeType: 'danger' },
      { name: '이수연', dateLabel: '가입일 2025.04.01', badge: '34일 초과', badgeType: 'danger' },
    ],
    extra: '박민준 외 10명',
  },
  {
    title: 'IRP 개설 미완료',
    count: 3,
    icon: FileX,
    iconGradient: 'from-rose-500 to-red-400',
    rows: [
      { name: '최영호', dateLabel: '퇴직일 2025.04.30', badge: '지급 지연', badgeType: 'danger' },
      { name: '오은서', dateLabel: '퇴직일 2025.05.02', badge: '지급 지연', badgeType: 'danger' },
      { name: '강태양', dateLabel: '퇴직일 2025.05.10', badge: '확인 필요', badgeType: 'warning' },
    ],
    extra: null,
  },
  {
    title: '매수예정 상품 미등록',
    count: 8,
    icon: ShoppingCart,
    iconGradient: 'from-sky-500 to-blue-400',
    rows: [
      { name: '정다은', dateLabel: '운용지시 2025.04.28', badge: '매수 미완료', badgeType: 'warning' },
      { name: '한승우', dateLabel: '운용지시 2025.05.03', badge: '매수 미완료', badgeType: 'warning' },
    ],
    extra: '윤지수 외 6명',
  },
  {
    title: '만기 후 재투자 미지시',
    count: 5,
    icon: RefreshCw,
    iconGradient: 'from-violet-500 to-purple-400',
    rows: [
      { name: '임채원', dateLabel: '만기일 2025.04.15', badge: '46일 방치', badgeType: 'danger' },
      { name: '신예린', dateLabel: '만기일 2025.05.01', badge: '30일 방치', badgeType: 'danger' },
    ],
    extra: '조현준 외 3명',
  },
]

export function DCOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-primary font-medium">퇴직연금 관리 현황</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요, <span className="gradient-text">김담당자</span>님
          </h2>
          <p className="text-muted-foreground">오늘의 퇴직연금 현황을 확인해보세요</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <Card 
              key={stat.title} 
              className={`glass border-0 card-interactive bg-gradient-to-br ${stat.gradient} animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.iconGradient} flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium ${
                    stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value}
                    <span className="text-lg font-normal text-muted-foreground ml-1">{stat.unit}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* 이번 달 납입 부담금 */}
        <Card className="glass border-0 card-interactive bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium bg-red-100 text-red-500">
                <CalendarClock className="w-3 h-3" />
                <span>D-4</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">이번 달 납입 부담금</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                1.24
                <span className="text-lg font-normal text-muted-foreground ml-1">억</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">납입기한 <span className="font-semibold text-foreground">6/5</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 미처리 완료 현황 */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-400 flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            미처리 완료 현황
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-100 text-red-500">즉시 확인 필요</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unprocessedItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="p-5 bg-white/50 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shadow-md`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">{item.title}</span>
                    </div>
                    <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-muted-foreground">{item.count}명</span>
                  </div>
                  <div className="space-y-2.5">
                    {item.rows.map((row) => (
                      <div key={row.name} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground w-16">{row.name}</span>
                        <span className="text-muted-foreground flex-1 text-right mr-3">{row.dateLabel}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${
                          row.badgeType === 'danger' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {row.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/50">
                    <span className="text-sm text-muted-foreground">{item.extra ?? ''}</span>
                    <button className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
                      목록 전체 보기
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* DC형 부담금 납입 현황 */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            DC형 부담금 납입 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributionData.map((data, idx) => (
              <div key={data.month} className="flex items-center gap-4 group">
                <span className="w-12 text-sm text-muted-foreground font-medium">{data.month}</span>
                <div className="flex-1 h-10 bg-white/50 rounded-xl overflow-hidden relative">
                  {/* Planned line */}
                  <div
                    className="absolute h-full border-r-2 border-dashed border-muted-foreground/30"
                    style={{ left: `${(data.planned / 150) * 100}%` }}
                  />
                  {/* Actual */}
                  <div
                    className={`absolute h-full rounded-xl transition-all duration-500 ${
                      data.actual === 0 
                        ? 'bg-slate-200' 
                        : 'progress-fill'
                    }`}
                    style={{ 
                      width: `${(data.actual / 150) * 100}%`,
                      transitionDelay: `${idx * 100}ms`
                    }}
                  />
                  {data.actual > 0 && (
                    <div 
                      className="absolute h-full flex items-center px-3"
                      style={{ left: `${(data.actual / 150) * 100 - 12}%` }}
                    >
                      <span className="text-xs font-semibold text-white drop-shadow-lg">
                        {data.actual}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`w-20 text-sm text-right font-medium transition-colors ${
                  data.actual === 0 ? 'text-destructive' : 'text-foreground group-hover:text-primary'
                }`}>
                  {data.actual === 0 ? '미납입' : `${data.actual}백만`}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-primary to-accent" />
              <span className="text-sm text-muted-foreground">실제 납입</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">예정 금액</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
