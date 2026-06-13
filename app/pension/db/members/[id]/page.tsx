'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IdCard, Wallet } from 'lucide-react'
import { getDbMemberDetail, EmployeeDetail } from '@/lib/api'
import { AnnualSalaryCard } from '@/components/dashboard/annual-salary-card'
import { formatRrnAsBirthDate } from '@/lib/utils'
import {
  InfoField,
  InfoCard,
  StatusBadge,
  MemberDetailBackButton,
  MemberDetailSkeleton,
  MemberDetailError,
  MemberProfileHeader,
  fmtDate,
} from '@/components/dashboard/member-detail'

export default function DBMemberDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)

  const [detail, setDetail] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getDbMemberDetail(id, controller.signal)
      .then(setDetail)
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id])

  const goBack = () => router.push('/pension/db/members')

  if (loading) return <MemberDetailSkeleton onBack={goBack} />
  if (error || !detail) return <MemberDetailError onBack={goBack} />

  const r = detail.retirement
  const status = r?.status ?? '재직'

  return (
    <div className="space-y-6">
      <MemberDetailBackButton onClick={goBack} />

      <MemberProfileHeader
        name={detail.name}
        status={status}
        position={r?.position}
        companyName={detail.company?.companyName}
        planType={detail.company?.planType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="기본 정보" icon={IdCard}>
          <InfoField label="이름" value={detail.name} />
          <InfoField label="생년월일" value={formatRrnAsBirthDate(detail.rrnMasked)} />
          <InfoField label="구분" value={r?.position ?? '-'} />
          <InfoField label="회사" value={detail.company?.companyName ?? '-'} />
          <InfoField label="제도유형" value={detail.company?.planType ? `${detail.company.planType}형` : '-'} />
          <InfoField label="재직여부" value={status} />
        </InfoCard>

        {/* DB형: 디폴트옵션/기산일/적립금 없음 */}
        <InfoCard title="퇴직연금 정보" icon={Wallet}>
          <InfoField label="가입자 계좌" value={r?.employeeAccount ?? '-'} />
          <InfoField
            label="IRP 계좌"
            value={<StatusBadge ok={r?.hasIrpAccount === 'Y'} okLabel="보유" noLabel="미보유" />}
          />
          <InfoField label="가입일" value={fmtDate(r?.joinDate)} />
          <InfoField label="입사일" value={fmtDate(r?.startDate)} />
          <InfoField label="퇴사일" value={fmtDate(r?.terminationDate)} />
        </InfoCard>
      </div>

      <AnnualSalaryCard salaries={detail.annualSalaries} startDate={r?.startDate} />
    </div>
  )
}
