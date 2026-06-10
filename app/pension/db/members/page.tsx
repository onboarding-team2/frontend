import { Suspense } from 'react'
import { MemberManagement } from '@/components/dashboard/db-member-management'

export default function DBMembersTab() {
  return (
    <Suspense fallback={null}>
      <MemberManagement />
    </Suspense>
  )
}
