'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/overview'
import { MemberManagement } from '@/components/dashboard/member-management'
import { DeadlineAlerts } from '@/components/dashboard/deadline-alerts'
import { DocumentForms } from '@/components/dashboard/document-forms'
import type { TabType } from '@/lib/types'

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <TabRouter />
    </Suspense>
  )
}

function TabRouter() {
  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') as TabType | null) ?? 'overview'

  const content = (() => {
    switch (tab) {
      case 'members':
        return <MemberManagement />
      case 'deadlines':
        return <DeadlineAlerts />
      case 'documents':
        return <DocumentForms />
      case 'overview':
      default:
        return <DashboardOverview />
    }
  })()

  return (
    <div key={tab} className="animate-scale-in">
      {content}
    </div>
  )
}
