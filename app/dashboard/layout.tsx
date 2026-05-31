'use client'

import { Suspense, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ChatBot } from '@/components/dashboard/chatbot'
import type { TabType } from '@/lib/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      <Suspense fallback={null}>
        <SidebarWithRouting />
      </Suspense>

      <div className="flex-1 flex flex-col min-h-screen">
        <Header onChatOpen={() => setIsChatOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

function SidebarWithRouting() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab: TabType = pathname.startsWith('/dashboard/members')
    ? 'members'
    : ((searchParams.get('tab') as TabType | null) ?? 'overview')

  const handleTabChange = (tab: TabType) => {
    router.push(tab === 'overview' ? '/dashboard' : `/dashboard?tab=${tab}`)
  }

  return <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
}
