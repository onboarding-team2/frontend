'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Lock, MessageCircle, Shield, TrendingUp, Users, Sparkles } from 'lucide-react'

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
      localStorage.setItem('token', data.token)
      localStorage.setItem('planType', data.planType)
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Section - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow-purple">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">IBK 기업은행</h1>
                <p className="text-muted-foreground">퇴직연금 관리시스템</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight">
              <span className="gradient-text">AI 기반</span>
              <br />
              스마트 퇴직연금 관리
            </h2>
            <p className="text-muted-foreground text-lg">
              DC/DB형 퇴직연금을 한눈에 관리하고,
              <br />AI 챗봇으로 실시간 상담받으세요
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<MessageCircle className="w-5 h-5" />}
              title="AI 챗봇"
              description="실시간 상담"
              gradient="from-accent/20 to-accent/5"
              iconBg="bg-accent"
            />
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="현황 관리"
              description="적립금 모니터링"
              gradient="from-primary/20 to-primary/5"
              iconBg="bg-primary"
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="가입자 관리"
              description="통합 관리"
              gradient="from-neon-cyan/20 to-neon-cyan/5"
              iconBg="bg-neon-cyan"
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="기일 알림"
              description="자동 알림"
              gradient="from-chart-3/20 to-chart-3/5"
              iconBg="bg-chart-3"
            />
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full">
          <div className="glass rounded-3xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">로그인</h2>
              <p className="text-muted-foreground mt-2">
                사업자번호와 비밀번호를 입력해주세요
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="businessNumber" className="text-sm font-medium text-foreground">
                  사업자번호
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="businessNumber"
                    type="text"
                    placeholder="000-00-00000"
                    value={businessNumber}
                    onChange={(e) => setBusinessNumber(formatBusinessNumber(e.target.value))}
                    className="pl-12 h-14 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400 text-center">{errorMessage}</p>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl transition-all neon-glow-purple"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                  비밀번호 찾기
                </button>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  인증서 로그인
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>AI 챗봇으로 24시간 상담 가능</span>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                문의사항: 고객센터 1566-2566
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  iconBg,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  iconBg: string
}) {
  return (
    <div className={`glass p-4 rounded-2xl bg-gradient-to-br ${gradient}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
