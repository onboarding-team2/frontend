'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, AlertTriangle, Clock, CreditCard, FileText, ChevronRight, CalendarDays, Sparkles } from 'lucide-react'

interface DeadlineItem {
  id: string
  title: string
  description: string
  dueDate: string
  daysLeft: number
  type: 'urgent' | 'warning' | 'normal'
  category: 'contribution' | 'fee' | 'estimate' | 'tax'
  amount?: string
}

const deadlines: DeadlineItem[] = [
  {
    id: '1',
    title: 'DC형 부담금 납입',
    description: '5월 정기 부담금 납입 기한',
    dueDate: '2026-05-25',
    daysLeft: 6,
    type: 'urgent',
    category: 'contribution',
    amount: '125,000,000원',
  },
  {
    id: '2',
    title: '연간 수수료 납입',
    description: '2026년 연간 운용관리 수수료',
    dueDate: '2026-06-30',
    daysLeft: 42,
    type: 'warning',
    category: 'fee',
    amount: '12,450,000원',
  },
  {
    id: '3',
    title: 'DB형 추계액 산정',
    description: '상반기 추계액 산정 및 보고',
    dueDate: '2026-06-15',
    daysLeft: 27,
    type: 'warning',
    category: 'estimate',
  },
  {
    id: '4',
    title: '과세이연 신고',
    description: '반기 과세이연 현황 신고',
    dueDate: '2026-07-31',
    daysLeft: 73,
    type: 'normal',
    category: 'tax',
  },
]

const getCategoryIcon = (category: DeadlineItem['category']) => {
  switch (category) {
    case 'contribution':
      return CreditCard
    case 'fee':
      return CreditCard
    case 'estimate':
      return FileText
    case 'tax':
      return FileText
    default:
      return Calendar
  }
}

const getTypeStyles = (type: DeadlineItem['type']) => {
  switch (type) {
    case 'urgent':
      return {
        gradient: 'from-red-100 to-red-50',
        border: 'border-red-200/50',
        text: 'text-red-500',
        badge: 'bg-gradient-to-r from-red-500 to-red-600',
        iconBg: 'from-red-500 to-red-600',
      }
    case 'warning':
      return {
        gradient: 'from-amber-100 to-amber-50',
        border: 'border-amber-200/50',
        text: 'text-amber-600',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
        iconBg: 'from-amber-500 to-orange-500',
      }
    default:
      return {
        gradient: 'from-primary/15 to-primary/5',
        border: 'border-primary/20',
        text: 'text-primary',
        badge: 'bg-gradient-to-r from-primary to-accent',
        iconBg: 'from-primary to-accent',
      }
  }
}

export function DeadlineAlerts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">기일 도래</h2>
            <p className="text-muted-foreground">중요한 납입 및 신고 일정을 확인하세요</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95">
          <CalendarDays className="w-4 h-4" />
          알림 설정
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '긴급', count: 1, color: 'red', icon: AlertTriangle, gradient: 'from-red-100 to-red-50', iconGradient: 'from-red-500 to-red-600' },
          { label: '주의', count: 2, color: 'amber', icon: Clock, gradient: 'from-amber-100 to-amber-50', iconGradient: 'from-amber-500 to-orange-500' },
          { label: '예정', count: 1, color: 'primary', icon: Calendar, gradient: 'from-primary/15 to-primary/5', iconGradient: 'from-primary to-accent' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <Card 
              key={item.label} 
              className={`glass border-0 bg-gradient-to-br ${item.gradient} card-interactive animate-slide-up`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={`text-3xl font-bold ${
                    item.color === 'red' ? 'text-red-500' : 
                    item.color === 'amber' ? 'text-amber-600' : 'text-primary'
                  }`}>{item.count}<span className="text-lg font-normal ml-1">건</span></p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Deadline List */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            다가오는 일정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deadlines.map((deadline, idx) => {
            const styles = getTypeStyles(deadline.type)
            const Icon = getCategoryIcon(deadline.category)
            return (
              <div
                key={deadline.id}
                className={`p-5 rounded-2xl border bg-gradient-to-r ${styles.gradient} ${styles.border} transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer animate-slide-up`}
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{deadline.title}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${styles.badge} shadow-sm badge-pulse`}>
                          D-{deadline.daysLeft}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                      {deadline.amount && (
                        <p className="text-sm font-semibold text-foreground mt-2">
                          납입 예정 금액: <span className={styles.text}>{deadline.amount}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">기한</p>
                    <p className="font-semibold text-foreground">{deadline.dueDate}</p>
                    <button className={`mt-2 text-sm flex items-center gap-1 hover:underline transition-all duration-300 hover:gap-2 ${styles.text}`}>
                      상세보기 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Fee Discount Info */}
      <Card className="glass border-0 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 hover-lift animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue animate-float">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">수수료 할인 안내</h3>
              <p className="text-sm text-muted-foreground mt-1">
                적립금 규모에 따른 수수료 할인 혜택을 받으실 수 있습니다.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { range: '50억 이상', discount: '10%' },
                  { range: '100억 이상', discount: '15%' },
                  { range: '200억 이상', discount: '20%' },
                ].map((tier, idx) => (
                  <div 
                    key={tier.range}
                    className="p-3 bg-white/50 rounded-xl text-center border border-white/50 transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:scale-105"
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    <p className="text-xs text-muted-foreground">{tier.range}</p>
                    <p className="text-lg font-bold text-primary">{tier.discount}</p>
                  </div>
                ))}
              </div>
              <Button variant="link" className="px-0 mt-3 text-primary transition-all duration-300 hover:gap-2">
                자세히 알아보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
