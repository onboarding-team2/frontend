import { Suspense } from 'react'
import { MemberManagement } from '@/components/dashboard/member-management'

export default function DBMembersTab() {
  return (
    <Suspense fallback={null}>
      <MemberManagement plan="DB" />
    </Suspense>
  )
}
