import { Suspense } from 'react'
import { MemberManagement } from '@/components/dashboard/member-management'

export default function DCMembersTab() {
  return (
    <Suspense fallback={null}>
      <MemberManagement plan="DC" />
    </Suspense>
  )
}
