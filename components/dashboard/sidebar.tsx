'use client'

import { Building2, LayoutDashboard, Users, CalendarDays, FileText, LogOut, ChevronRight, Wallet, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { TabType } from '@/lib/types'
import { useEffect, useState } from 'react'
import { getCompanyProfile } from '@/lib/api'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  planType?: string
}

interface CompanyInfo {
  companyName: string
  businessNumber: string
  planType: string
}

const dcMenuItems = [
  { id: 'overview' as TabType, label: '현황 관리', icon: LayoutDashboard },
  { id: 'members' as TabType, label: '가입자 관리', icon: Users },
  { id: 'schedules' as TabType, label: '기일 관리', icon: CalendarDays },
  { id: 'documents' as TabType, label: '양서식', icon: FileText },
  { id: 'faq' as TabType, label: 'FAQ', icon: HelpCircle },
]

const dbMenuItems = [
  { id: 'overview' as TabType, label: '현황 관리', icon: LayoutDashboard },
  { id: 'assets' as TabType, label: '자산 운용', icon: Wallet },
  { id: 'members' as TabType, label: '가입자 관리', icon: Users },
  { id: 'schedules' as TabType, label: '기일 도래', icon: CalendarDays },
  { id: 'documents' as TabType, label: '양서식', icon: FileText },
  { id: 'faq' as TabType, label: 'FAQ', icon: HelpCircle },
]

export function Sidebar({ activeTab, setActiveTab, planType }: SidebarProps) {
  const router = useRouter()

  // 기업 정보
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/')
          return
        }

        const data = await getCompanyProfile()
        setCompanyInfo(data)
      } catch (error) {
        console.error('API 호출 에러:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyInfo()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planType')
    
    deleteCookie('token')
    deleteCookie('planType')

    router.push('/')
  }
  

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  };

  return (
    <aside className="hidden md:flex w-72 glass-strong border-r border-white/30 flex-col sticky top-0 h-screen">
      {/* 연금 ON 로고 — 클릭 시 현황 관리로 이동 */}
      <button
        type="button"
        onClick={() => setActiveTab('overview')}
        className="flex items-center gap-2 p-6 pt-10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        title="현황 관리로 이동"
      >
        <span
          className="text-4xl text-foreground drop-shadow-sm leading-[0.85]"
          style={{ fontFamily: "'Recipekorea', sans-serif" }}
        >
          연금
        </span>
        <div className="relative inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30 -translate-y-[5px]">
          <span className="text-white font-black text-xl tracking-tight leading-none">
            ON
          </span>
          <span className="w-6 h-6 rounded-full bg-white shadow-sm shrink-0" />
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground px-3 mb-3">메뉴</p>
        <ul className="space-y-1">
          {(planType === 'DB' ? dbMenuItems : dcMenuItems).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 to-accent/10 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md glow-blue' 
                        : 'bg-white/70 text-muted-foreground group-hover:text-foreground group-hover:bg-white group-hover:shadow-sm'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                    isActive ? 'text-primary opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                  }`} />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Company Info — 하단 */}
      <div className="px-4 pt-2 pb-3">
        {loading ? (
          <div className="rounded-2xl p-5 animate-pulse bg-white/20 h-24" />
        ) : companyInfo ? (
          <button
            type="button"
            onClick={() => router.push(`/pension/${companyInfo.planType.toLowerCase()}/company`)}
            title="회사 상세 정보 보기"
            className="w-full text-left relative rounded-2xl p-5 bg-gradient-to-br from-primary/8 to-accent/5 border border-primary/15 shadow-sm overflow-hidden hover-lift cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-accent/5 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-6 h-6 text-primary" />
              </div>

              <div className="flex flex-col gap-1 flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="font-bold text-foreground text-base truncate flex-shrink min-w-0">
                    {companyInfo.companyName}
                  </p>

                  <div className="flex-shrink-0">
                    {companyInfo.planType === 'DC' && (
                      <span className="px-2 py-0.5 text-[11px] rounded-md bg-primary/15 text-primary font-semibold border border-primary/20 whitespace-nowrap">
                        DC형
                      </span>
                    )}
                    {companyInfo.planType === 'DB' && (
                      <span className="px-2 py-0.5 text-[11px] rounded-md bg-primary/15 text-primary font-semibold border border-primary/20 whitespace-nowrap">
                        DB형
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-medium">{companyInfo.businessNumber}</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="glass rounded-2xl p-4 text-center text-xs text-muted-foreground">
            기업 정보 없음
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/30">
        <button
          onClick={handleLogout}
          className="btn-hover w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
