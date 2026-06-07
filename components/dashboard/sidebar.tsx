'use client'

import { Building2, LayoutDashboard, Users, CalendarDays, FileText, LogOut, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { TabType } from '@/lib/types'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const menuItems = [
  { id: 'overview' as TabType, label: '현황 관리', icon: LayoutDashboard },
  { id: 'members' as TabType, label: '가입자 관리', icon: Users },
  { id: 'deadlines' as TabType, label: '기일 관리', icon: CalendarDays },
  { id: 'documents' as TabType, label: '양서식', icon: FileText },
]

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planType')
    router.push('/')
  }

  return (
    <aside className="hidden md:flex w-72 glass-strong border-r border-white/30 flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue transition-transform duration-300 hover:scale-105">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">IBK 기업은행</h1>
            <p className="text-xs text-muted-foreground">퇴직연금 관리</p>
          </div>
        </div>
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

      {/* Company Info Card */}
      <div className="p-4">
        <div className="glass rounded-2xl p-4 bg-gradient-to-br from-primary/10 to-accent/5 hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">주식회사 테스트기업</p>
              <p className="text-xs text-muted-foreground">123-45-67890</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-xs rounded-md bg-primary/15 text-primary font-medium transition-colors hover:bg-primary/25">DC형</span>
            <span className="px-2 py-1 text-xs rounded-md bg-accent/15 text-accent font-medium transition-colors hover:bg-accent/25">DB형</span>
          </div>
        </div>
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
