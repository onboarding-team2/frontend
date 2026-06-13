'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function MemberDetailBackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="gap-2 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white animate-slide-up"
    >
      <ArrowLeft className="w-4 h-4" /> 목록으로
    </Button>
  )
}

export function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function fmtDate(value: string | null | undefined) {
  return value && value.length > 0 ? value : '-'
}

export function fmtWon(value: number | null | undefined) {
  return value != null ? `${value.toLocaleString()}원` : '-'
}

export function MemberDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <MemberDetailBackButton onClick={onBack} />
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

export function MemberDetailError({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <MemberDetailBackButton onClick={onBack} />
      <Card className="glass border-0">
        <CardContent className="p-12 text-center text-sm text-muted-foreground">가입자 정보를 불러오지 못했습니다.</CardContent>
      </Card>
    </div>
  )
}

export function MemberProfileHeader({
  name,
  status,
  position,
  companyName,
  planType,
}: {
  name: string
  status: string
  position?: string | null
  companyName?: string | null
  planType?: string | null
}) {
  return (
    <Card className="glass border-0 animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{name}</h2>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                status === '재직' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {position ?? '-'} · {companyName ?? '-'}
              {planType ? ` · ${planType}형` : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Card className="glass border-0 animate-slide-up">
      <CardHeader className="border-b border-white/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-2 gap-x-6 gap-y-5">
        {children}
      </CardContent>
    </Card>
  )
}

export function StatusBadge({ ok, okLabel, noLabel }: { ok: boolean; okLabel: string; noLabel: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
      ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
    }`}>
      {ok ? okLabel : noLabel}
    </span>
  )
}
