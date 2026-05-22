'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { DashboardOverview } from '@/components/dashboard/overview'
import { MemberManagement } from '@/components/dashboard/member-management'
import { DeadlineAlerts } from '@/components/dashboard/deadline-alerts'
import { DocumentForms } from '@/components/dashboard/document-forms'
import { ChatBot } from '@/components/dashboard/chatbot'
import type { TabType } from '@/lib/types'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isChatOpen, setIsChatOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'members':
        return <MemberManagement />
      case 'deadlines':
        return <DeadlineAlerts />
      case 'documents':
        return <DocumentForms />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onChatOpen={() => setIsChatOpen(true)} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div key={activeTab} className="animate-scale-in">
            {renderContent()}
          </div>
        </main>
      </div>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
