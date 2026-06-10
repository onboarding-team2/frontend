import { Suspense } from 'react'
import { MemberManagement } from '@/components/dashboard/dc-member-management'

export default function DCMembersTab() {
  return (
    <Suspense fallback={null}>
      <MemberManagement />
    </Suspense>
  )
}
