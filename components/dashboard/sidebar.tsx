'use client'

import { Building2, LayoutDashboard, Users, CalendarDays, FileText, LogOut, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { TabType } from '@/lib/types'
import { useEffect, useState } from 'react'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

interface CompanyInfo {
  companyName: string
  businessNumber: string
  planType : string
}

const menuItems = [
  { id: 'overview' as TabType, label: '현황 관리', icon: LayoutDashboard },
  { id: 'members' as TabType, label: '가입자 관리', icon: Users },
  { id: 'schedules' as TabType, label: '기일 관리', icon: CalendarDays },
  { id: 'documents' as TabType, label: '양서식', icon: FileText },
]

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
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

        const response = await fetch('http://localhost:8080/company/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCompanyInfo(data)
        } else {
          console.error('기업 정보를 불러오는 데 실패했습니다.')
        }
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

    router.push('/')
  }
  

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  };

  return (
    <aside className="hidden md:flex w-72 glass-strong border-r border-white/30 flex-col sticky top-0 h-screen">
      {/* Company Info */}
      <div className="p-4">
        {loading ? (
          <div className="rounded-2xl p-5 animate-pulse bg-white/20 h-24" />
        ) : companyInfo ? (
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-primary to-accent shadow-lg glow-blue overflow-hidden hover-lift">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>

              <div className="flex flex-col gap-1 flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="font-bold text-white text-base truncate flex-shrink min-w-0 drop-shadow-sm">
                    {companyInfo.companyName}
                  </p>

                  <div className="flex-shrink-0">
                    {companyInfo.planType === 'DC' && (
                      <span className="px-2 py-0.5 text-[11px] rounded-md bg-white/25 text-white font-semibold backdrop-blur-sm border border-white/30 whitespace-nowrap">
                        DC형
                      </span>
                    )}
                    {companyInfo.planType === 'DB' && (
                      <span className="px-2 py-0.5 text-[11px] rounded-md bg-white/25 text-white font-semibold backdrop-blur-sm border border-white/30 whitespace-nowrap">
                        DB형
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/85 font-medium">{companyInfo.businessNumber}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-4 text-center text-xs text-muted-foreground">
            기업 정보 없음
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground px-3 mb-3">메뉴</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`menu-item w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left group ${
                    isActive
                      ? 'active bg-gradient-to-r from-primary/15 to-accent/10 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
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
