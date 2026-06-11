'use client'

import { Suspense, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ChatBot } from '@/components/dashboard/chatbot'
import type { TabType } from '@/lib/types'

export default function DBLayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      <Suspense fallback={null}>
        <DBSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onChatOpen={() => setIsChatOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

function DBSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const activeTab: TabType = pathname.includes('/members')
    ? 'members'
    : pathname.endsWith('/deadlines')
    ? 'deadlines'
    : pathname.endsWith('/documents')
    ? 'documents'
    : 'overview'

  const handleTabChange = (tab: TabType) => {
    const segment = tab === 'overview' ? 'dashboard' : tab
    router.push(`/pension/db/${segment}`)
  }

  return <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
}
