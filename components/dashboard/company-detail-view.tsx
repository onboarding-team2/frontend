'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, Hash, CreditCard, Calendar, Repeat, CalendarClock, ShieldCheck, Users, Wallet } from 'lucide-react'
import { getCompanyDetail, type CompanyDetail } from '@/lib/api'

export function CompanyDetailView() {
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getCompanyDetail(controller.signal)
      .then(setDetail)
      .catch((e) => {
        if (e.name !== 'AbortError') setError('기업 정보를 불러오지 못했습니다.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const formatCurrency = (amount: number | null) =>
    amount != null ? `${amount.toLocaleString()}원` : '-'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">기업 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-center">
        <Building2 className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">{error ?? '기업 정보가 없습니다.'}</p>
      </div>
    )
  }

  const isDc = detail.planType === 'DC'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{detail.companyName}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isDc ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {detail.planType}형
            </span>
          </div>
          <p className="text-muted-foreground">회사 및 퇴직연금 정보</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 회사 정보 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              회사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCell icon={<Hash className="w-4 h-4 text-blue-500" />} label="사업자등록번호" value={detail.businessNumber} />
            <InfoCell icon={<User className="w-4 h-4 text-blue-500" />} label="대표자명" value={detail.representativeName ?? '-'} />
            <InfoCell
              icon={<ShieldCheck className="w-4 h-4 text-blue-500" />}
              label="제도 유형"
              value={`${detail.planType}형 (${isDc ? '확정기여형' : '확정급여형'})`}
            />
            <InfoCell
              icon={<Users className="w-4 h-4 text-blue-500" />}
              label="가입자 수"
              value={detail.employeeCount != null ? `${detail.employeeCount.toLocaleString()}명` : '-'}
            />
          </CardContent>
        </Card>

        {/* 퇴직연금 정보 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              퇴직연금 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCell icon={<CreditCard className="w-4 h-4 text-indigo-500" />} label="퇴직연금 계좌" value={detail.companyAccount ?? '-'} />
            <InfoCell icon={<Calendar className="w-4 h-4 text-cyan-500" />} label="계약일" value={formatDate(detail.contractDate)} />
            <InfoCell icon={<Wallet className="w-4 h-4 text-emerald-500" />} label="총 적립금" value={formatCurrency(detail.totalReserve)} />
            {isDc ? (
              <InfoCell icon={<Repeat className="w-4 h-4 text-purple-500" />} label="납입주기" value={detail.paymentCycle ?? '-'} />
            ) : (
              <InfoCell icon={<CalendarClock className="w-4 h-4 text-amber-500" />} label="결산월" value={detail.fiscalMonth ? `${detail.fiscalMonth}월` : '-'} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoCell({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/50">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-bold text-foreground break-all">{value}</p>
      </div>
    </div>
  )
}
