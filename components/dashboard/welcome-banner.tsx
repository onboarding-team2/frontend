'use client'

import { Sparkles } from 'lucide-react'

interface WelcomeBannerProps {
  planType: 'DC' | 'DB'
  companyName?: string | null
}

export function WelcomeBanner({ planType, companyName }: WelcomeBannerProps) {
  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden animate-scale-in">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-primary font-medium">{planType}형 퇴직연금 관리 현황</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          안녕하세요, <span className="gradient-text">{companyName ?? ''}</span> 담당자님
        </h2>
        <p className="text-muted-foreground">오늘의 퇴직연금 현황을 확인해보세요</p>
      </div>
    </div>
  )
}
