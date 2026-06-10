'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Lock,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react'

const IBKScene3D = dynamic(
  () => import('@/components/login/ibk-scene-3d').then((m) => m.IBKScene3D),
  { ssr: false, loading: () => null },
)

export default function LoginPage() {
  const [businessNumber, setBusinessNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    const brn = businessNumber.replace(/-/g, '')

    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brn, password }),
      })

      if (!res.ok) {
        const msg = await res.text()
        setErrorMessage(msg || '로그인에 실패했습니다.')
        return
      }

      const data = await res.json()
      console.log(data)
     
      localStorage.setItem('token', data.token)
      localStorage.setItem('planType', data.planType)
      Cookies.set('token', data.token, { expires: 1, path: '/' }) 
      Cookies.set('planType', data.planType, { expires: 1, path: '/' })

      const plan = (data.planType as string)?.toLowerCase() ?? 'dc'
      router.push(`/pension/${plan}/dashboard`)
    } catch {
      setErrorMessage('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* 배경 글로우 — develop 브랜치 반영 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-sky-200/35 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/50 rounded-full blur-[160px]" />
      </div>

      {/* 3D IBK 배경 오브젝트 */}
      <div className="absolute inset-0 z-[1]">
        <IBKScene3D />
      </div>

      {/* 메인 레이아웃 */}
      <div className="relative z-10 px-16 lg:px-44 pt-28 pb-24 lg:pt-32 lg:pb-28 grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start h-screen">
        
        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col gap-6 min-w-0">
          <div className="flex items-center gap-4 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/login/ibk-logo.svg" alt="IBK 로고" className="w-12 h-12 object-contain drop-shadow-md" />
            <h2 className="text-xl font-bold text-foreground">IBK 기업은행</h2>
            <span className="text-sm font-semibold text-primary ml-1">AI 기반</span>
          </div>

          <div className="space-y-3 -mt-4">
            <h1 className="text-[36px] xl:text-[44px] font-black leading-[1.05] tracking-tight text-foreground">
              스마트 퇴직연금
              <br />
              관리 시스템
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground leading-relaxed pt-1">
              DC/DB형 퇴직연금을 한눈에 관리하고,
              <br />
              AI 챗봇으로 실시간 상담받으세요.
            </p>
          </div>

          {/* 피처 4개 카드 (develop의 개선된 컴포넌트 구조 준수) */}
          <div className="grid grid-cols-4 gap-3">
            <FeatureCard icon={MessageCircle} title="AI 챗봇" desc="24시간 상담" tone="accent" />
            <FeatureCard icon={TrendingUp} title="현황 관리" desc="통계 및 모니터링" tone="primary" />
            <FeatureCard icon={Users} title="가입자 관리" desc="회원 관리" tone="sky" />
            <FeatureCard icon={Shield} title="기일 알림" desc="자동 알림" tone="indigo" />
          </div>

          {/* AI 챗봇 배너 */}
          <div className="group relative rounded-3xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 transition-all duration-300 h-[140px]">
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/login/home-banner.png"
                alt=""
                className="w-full h-full object-cover scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
            </div>

            <div className="relative h-full flex items-center justify-between px-6 py-4 gap-4">
              <div className="min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
                  AI 챗봇이 24시간 함께합니다
                </h3>
                <p className="text-white/90 text-xs mt-1 drop-shadow">
                  복잡한 문의도 쉽고 빠르게 해결해드려요
                </p>
                <button className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 hover:bg-white text-primary text-xs font-semibold transition-all hover:scale-105 shadow-md">
                  AI 챗봇 상담하기
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION — develop 브랜치의 컴팩트한 고성능 글래스 폼 채택 */}
        <div className="w-full max-w-[360px] mx-auto lg:ml-auto lg:mr-0">
          <div className="relative rounded-[28px] p-[0.5px] bg-gradient-to-br from-white/60 via-primary/15 to-accent/20 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.35)]">
            <div className="relative rounded-[calc(28px-0.5px)] overflow-hidden bg-sky-50/70 backdrop-blur-2xl px-7 py-10">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

              <div className="relative">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-foreground">시작하기</h3>
                  <p className="text-xs text-muted-foreground mt-1">사업자번호와 비밀번호를 입력해주세요.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* 사업자번호 필드 */}
                  <div className="space-y-1.5">
                    <label htmlFor="businessNumber" className="text-xs font-medium text-foreground/80">
                      사업자번호
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="businessNumber"
                        type="text"
                        placeholder="000-00-00000"
                        value={businessNumber}
                        onChange={(e) => setBusinessNumber(formatBusinessNumber(e.target.value))}
                        className="pl-11 h-11 bg-white/40 backdrop-blur-sm border-white/60 rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                        maxLength={12}
                      />
                    </div>
                  </div>

                  {/* 비밀번호 필드 */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-medium text-foreground/80">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-11 bg-white/40 backdrop-blur-sm border-white/60 rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-destructive text-center">{errorMessage}</p>
                  )}

                  <Button
                    type="submit"
                    className="group w-full h-11 text-sm font-semibold bg-gradient-to-r from-sky-300 to-blue-300 hover:opacity-95 rounded-xl transition-all shadow-lg shadow-sky-200/50 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        로그인 중...
                      </span>
                    ) : (
                      <>
                        로그인
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                      비밀번호 찾기
                    </button>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      인증서 로그인
                    </button>
                  </div>
                </form>

                {/* 하단 챗봇 인포 칩 */}
                <div className="mt-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">AI 챗봇으로 24시간 상담 가능</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">문의사항은 고객센터 1566-2566</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// develop 브랜치의 정적 타입 정의 및 FeatureCard 구현 준수
type Tone = 'primary' | 'accent' | 'sky' | 'indigo'

const TONE: Record<Tone, { iconBg: string; iconColor: string; arrow: string }> = {
  primary: { iconBg: 'bg-primary', iconColor: 'text-white', arrow: 'text-primary' },
  accent: { iconBg: 'bg-accent', iconColor: 'text-white', arrow: 'text-accent' },
  sky: { iconBg: 'bg-sky-500', iconColor: 'text-white', arrow: 'text-sky-600' },
  indigo: { iconBg: 'bg-indigo-500', iconColor: 'text-white', arrow: 'text-indigo-600' },
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  tone: Tone
}) {
  const t = TONE[tone]
  return (
    <div className="relative rounded-2xl bg-white/55 backdrop-blur-md border border-white/70 shadow-sm p-3.5 flex flex-col gap-2.5">
      <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center shadow-md`}>
        <Icon className={`w-4 h-4 ${t.iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
      </div>
    </div>
  )
}