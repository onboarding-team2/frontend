'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

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
    title: 'DB형 총 적립금',
    value: '89.2',
    unit: '억원',
    change: '+1.8%',
    trend: 'up',
    icon: TrendingUp,
    gradient: 'from-accent/15 to-accent/5',
    iconGradient: 'from-accent to-cyan-400',
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

const upcomingRetirements = [
  { name: '홍길동', employeeId: 'E001', expectedDate: '2026-06-15', type: '정년퇴직' },
  { name: '김영희', employeeId: 'E002', expectedDate: '2026-07-20', type: '희망퇴직' },
  { name: '이철수', employeeId: 'E003', expectedDate: '2026-08-01', type: '정년퇴직' },
]

const contributionData = [
  { month: '1월', planned: 120, actual: 115 },
  { month: '2월', planned: 120, actual: 122 },
  { month: '3월', planned: 120, actual: 118 },
  { month: '4월', planned: 120, actual: 125 },
  { month: '5월', planned: 120, actual: 0 },
]

export function DashboardOverview() {
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contribution Chart */}
        <Card className="lg:col-span-2 glass border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
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

        {/* Upcoming Retirements */}
        <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-md">
                <Users className="w-4 h-4 text-white" />
              </div>
              퇴직 예정자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRetirements.map((person, idx) => (
                <div
                  key={person.employeeId}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all duration-300 cursor-pointer hover:shadow-md hover-scale-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.employeeId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{person.expectedDate}</p>
                    <p className="text-xs text-muted-foreground">{person.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DB 현황 */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-md">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            DB형 운용 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl border border-emerald-200/50 hover-lift cursor-pointer">
              <p className="text-sm text-muted-foreground">과세이연 적용</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">적용중</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 hover-lift cursor-pointer">
              <p className="text-sm text-muted-foreground">추계액</p>
              <p className="text-2xl font-bold text-foreground mt-2">92.3<span className="text-lg font-normal text-muted-foreground ml-1">억원</span></p>
            </div>
            <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 hover-lift cursor-pointer">
              <p className="text-sm text-muted-foreground">적립비율</p>
              <p className="text-2xl font-bold text-accent mt-2">96.6%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
