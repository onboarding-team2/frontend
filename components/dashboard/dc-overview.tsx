'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Wallet, AlertTriangle, CalendarClock, ShieldAlert, FileX, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getPensionDashboard, DcDashboard, getCompanyProfile, CompanyProfile, getDcContributionChart, DcContributionChart } from '@/lib/api'
import { WelcomeBanner } from './welcome-banner'

function toEok(amount: number): string {
  return (amount / 100000000).toFixed(2)
}

function calcDday(dueDateStr: string | null): string {
  if (!dueDateStr) return '-'
  const diff = Math.ceil((new Date(dueDateStr).getTime() - Date.now()) / 86400000)
  return diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}


function toCheonLabel(amount: number): string {
  if (amount === 0) return '0'
  const cheon = Math.round(amount / 1000)
  return `${cheon.toLocaleString()}천원`
}

function ContributionBarChart({ chart }: { chart: DcContributionChart | null }) {
  if (!chart) return null

  const chartData = chart.items.map(item => ({ label: item.label, amount: item.amount, paid: item.paid }))
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1)

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="40%">
          <defs>
            <linearGradient id="barPaid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 13, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, maxAmount * 1.2]} />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: 'white',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: 13,
            }}
            formatter={(value, _name, props) => [
              toCheonLabel(value as number),
              (props.payload as { paid?: boolean })?.paid ? '납입완료' : '미납입',
            ] as [string, string]}
          />
          <Bar dataKey="amount" name="amount" radius={[6, 6, 0, 0]} isAnimationActive>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.paid ? 'url(#barPaid)' : '#e2e8f0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-b from-primary to-accent" />
          <span className="text-sm text-muted-foreground">납입완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-200" />
          <span className="text-sm text-muted-foreground">미납입</span>
        </div>
      </div>
    </div>
  )
}

export function DCOverview() {
  const router = useRouter()
  const [data, setData] = useState<DcDashboard | null>(null)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [chart, setChart] = useState<DcContributionChart | null>(null)

  const totalMembers = data?.total_employee ?? 0

  const unprocessedItems = [
    {
      title: '디폴트옵션 미선정',
      count: data?.default_option_not_selected ?? 0,
      icon: AlertTriangle,
      iconGradient: 'from-amber-500 to-orange-400',
      chartColor: '#f59e0b',
      incompleteLabel: '미선정',
      completeLabel: '선정 완료',
      filterKey: 'default=미선정',
    },
    {
      title: 'IRP 개설 미완료',
      count: data?.irp_not_opened ?? 0,
      icon: FileX,
      iconGradient: 'from-rose-500 to-red-400',
      chartColor: '#f43f5e',
      incompleteLabel: '미완료',
      completeLabel: '개설 완료',
      filterKey: 'irp=미보유',
    },
  ]

  useEffect(() => {
    const ctrl = new AbortController()
    getPensionDashboard(ctrl.signal)
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
      })
    getCompanyProfile(ctrl.signal)
      .then(setCompany)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
      })
    getDcContributionChart(ctrl.signal)
      .then(setChart)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
      })
    return () => ctrl.abort()
  }, [])

  const dueLabel = data?.contribution_due_date
    ? data.contribution_due_date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2/$3')
    : '-'

  const contributionTitle =
    data?.payment_cycle === 'MONTHLY' ? '이번 달 납입 부담금': 
    data?.payment_cycle === 'QUARTERLY' ? '이번 분기 납입 부담금': 
    data?.payment_cycle === 'YEARLY' ? '올해 납입 부담금': 
    '납입 부담금'

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <WelcomeBanner planType="DC" companyName={company?.companyName} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DC형 총 적립금 */}
        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">DC형 총 적립금</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data ? toEok(data.total_balance) : '-'}
                <span className="text-lg font-normal text-muted-foreground ml-1">억원</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 총 가입자 수 */}
        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-sky-500/15 to-sky-500/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">총 가입자 수</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data ? data.total_employee.toLocaleString() : '-'}
                <span className="text-lg font-normal text-muted-foreground ml-1">명</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 디폴트옵션 미지정자 */}
        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-amber-500/15 to-amber-500/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">디폴트옵션 미지정자</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data ? data.default_option_not_selected.toLocaleString() : '-'}
                <span className="text-lg font-normal text-muted-foreground ml-1">명</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 이번 달 납입 부담금 */}
        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              {data?.contribution_due_date && (
                <div className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium bg-red-100 text-red-500">
                  <CalendarClock className="w-3 h-3" />
                  <span>{calcDday(data.contribution_due_date)}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{contributionTitle}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data ? toEok(data.this_month_contribution) : '-'}
                <span className="text-lg font-normal text-muted-foreground ml-1">억</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                납입기한 <span className="font-semibold text-foreground">{dueLabel}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 미처리 완료 현황 */}
      <Card className="glass border-0 animate-slide-up">
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
              const incomplete = item.count
              const complete = Math.max(totalMembers - incomplete, 0)
              const percent = totalMembers > 0 ? ((incomplete / totalMembers) * 100).toFixed(1) : '0.0'
              const chartData = [
                { name: item.incompleteLabel, value: incomplete, color: item.chartColor },
                { name: item.completeLabel, value: complete, color: '#e2e8f0' },
              ]
              return (
                <div
                  key={item.title}
                  className="p-5 bg-white/50 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md"
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

                  <div className="flex items-center gap-5">
                    <div className="relative w-32 h-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={60}
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {chartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-foreground leading-none">{percent}%</span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">{item.incompleteLabel}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.chartColor }} />
                          <span className="text-muted-foreground">{item.incompleteLabel}</span>
                        </div>
                        <span className="font-semibold text-foreground">{incomplete.toLocaleString()}명</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
                          <span className="text-muted-foreground">{item.completeLabel}</span>
                        </div>
                        <span className="font-semibold text-foreground">{complete.toLocaleString()}명</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/50 text-sm">
                        <span className="text-muted-foreground">총 가입자</span>
                        <span className="font-semibold text-foreground">{totalMembers.toLocaleString()}명</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/50">
                    <button
                      onClick={() => router.push(`/pension/dc/members?${item.filterKey}`)}
                      className="flex items-center gap-1 text-sm text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 hover:gap-2 hover:shadow-sm transition-all"
                    >
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
      <Card className="glass border-0 animate-slide-up">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            DC형 부담금 납입 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionBarChart chart={chart} />
        </CardContent>
      </Card>
    </div>
  )
}
