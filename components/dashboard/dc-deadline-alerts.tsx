'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Calendar, List, Plus, Search, CheckCircle2,
  XCircle, Clock, Building2, Users, Trash2, X,
  FileText, User, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DeadlineSchedule,
  TargetType,
  mockDeadlines,
} from '@/lib/deadline-data'
import { SubscriberDetailModal, SubscriberDetail } from './subscriber-detail-modal'

type ViewMode = 'list' | 'calendar'
type FilterCategory = 'all' | 'imminent' | 'overdue'

// 가입자관리 명부 데이터 (member-management.tsx와 공유)
interface MemberData {
  id: string
  employeeId: string
  name: string
  department: string
  company: string
  joinDate: string
  type: 'DC' | 'DB'
  defaultOption: string
  balance: string
}

const memberList: MemberData[] = [
  { id: '1', employeeId: 'E001', name: '홍길동', department: '영업팀', company: '삼성전자(주)', joinDate: '2020-03-15', type: 'DC', defaultOption: '설정완료', balance: '45,230,000' },
  { id: '2', employeeId: 'E002', name: '김영희', department: '개발팀', company: '삼성전자(주)', joinDate: '2019-07-20', type: 'DC', defaultOption: '미설정', balance: '67,890,000' },
  { id: '3', employeeId: 'E003', name: '이철수', department: '인사팀', company: 'LG화학(주)', joinDate: '2018-01-10', type: 'DB', defaultOption: '-', balance: '89,120,000' },
  { id: '4', employeeId: 'E004', name: '박지민', department: '마케팅팀', company: 'SK하이닉스(주)', joinDate: '2021-05-05', type: 'DC', defaultOption: '설정완료', balance: '23,450,000' },
  { id: '5', employeeId: 'E005', name: '최수진', department: '재무팀', company: '현대자동차(주)', joinDate: '2017-09-12', type: 'DB', defaultOption: '-', balance: '112,340,000' },
  { id: '6', employeeId: 'E006', name: '정민수', department: '영업팀', company: '두산중공업(주)', joinDate: '2022-02-28', type: 'DC', defaultOption: '미설정', balance: '15,670,000' },
  { id: '7', employeeId: 'E007', name: '강하나', department: '개발팀', company: '포스코(주)', joinDate: '2020-11-15', type: 'DC', defaultOption: '설정완료', balance: '38,900,000' },
  { id: '8', employeeId: 'E008', name: '윤서연', department: '인사팀', company: '현대모비스(주)', joinDate: '2019-04-22', type: 'DB', defaultOption: '-', balance: '72,100,000' },
  { id: '9', employeeId: 'E009', name: '김태양', department: '생산팀', company: '두산중공업(주)', joinDate: '2020-03-01', type: 'DB', defaultOption: '-', balance: '45,000,000' },
  { id: '10', employeeId: 'E010', name: '김민준', department: '연구팀', company: '삼성전자(주)', joinDate: '2021-06-15', type: 'DC', defaultOption: '설정완료', balance: '28,000,000' },
]

/* ─────────────────────────────────────────────
   Toast 컴포넌트
───────────────────────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-[10000] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl ${
        type === 'success' 
          ? 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white' 
          : 'bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   인라인 모달 래퍼
───────────────────────────────────────────── */
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/20 animate-scale-in"
        style={{ 
          zIndex: 10000,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   상세보기 모달 내용
───────────────────────────────────────────── */
function DetailModalContent({ 
  schedule, 
  onClose,
  onSubscriberClick 
}: { 
  schedule: DeadlineSchedule
  onClose: () => void
  onSubscriberClick: (sub: SubscriberDetail) => void
}) {
  const getDays = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(schedule.deadline)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }
  const days = getDays()

  const formatDate = (s: string) => {
    const d = new Date(s)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const formatDateShort = (s: string) => {
    const d = new Date(s)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const getDeadlineText = () => {
    if (schedule.status === '완료') return '처리 완료'
    if (days < 0) return `${Math.abs(days)}일 초과`
    if (days === 0) return '오늘 마감'
    return `${days}일 전`
  }

  const getDeadlineColor = () => {
    if (schedule.status === '완료') return 'text-emerald-600'
    if (days < 0) return 'text-red-600'
    if (days <= 14) return 'text-amber-600'
    return 'text-blue-600'
  }

  // 연관 가입자 -> SubscriberDetail로 변환
  const handleSubscriberClick = (sub: { id: string; name: string; employeeId: string; company: string; joinDate: string; balance: number }) => {
    // memberList에서 해당 가입자 찾기
    const member = memberList.find(m => 
      m.name === sub.name || m.employeeId === sub.employeeId
    )
    
    const detail: SubscriberDetail = {
      id: sub.id,
      employeeId: sub.employeeId,
      name: sub.name,
      company: sub.company,
      department: member?.department,
      accountType: member?.type || 'DC',
      joinDate: sub.joinDate,
      defaultOption: member?.defaultOption === '설정완료' ? 'Y' : member?.defaultOption === '미설정' ? 'N' : null,
      balance: sub.balance,
    }
    onSubscriberClick(detail)
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mt-2 mb-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-0.5">{schedule.title}</h2>
            <p className={`text-sm font-semibold ${getDeadlineColor()}`}>
              기한: {formatDateShort(schedule.deadline)} ({getDeadlineText()})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0 mr-2">
          등록: {formatDateShort(schedule.createdAt)}
        </div>
      </div>

      <div className="space-y-4">

        {/* 일정 내용 */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">일정 내용</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-xl p-4 border border-slate-100">{schedule.content}</p>
        </div>

        {/* 기업 대상 - 가입자가 없을 때만 표시 */}
        {schedule.targetType === '기업' && schedule.relatedCompanies && schedule.relatedCompanies.length > 0 && (!schedule.relatedSubscribers || schedule.relatedSubscribers.length === 0) && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">기업 대상</span>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{schedule.relatedCompanies.length}개 기업</span>
            </div>
            <div className="space-y-2">
              {schedule.relatedCompanies.map(company => (
                <div key={company.id} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{company.name}</p>
                      <p className="text-xs text-slate-500">사업자번호: {company.businessNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      company.planType === 'DC' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {company.planType}형
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{company.employeeCount.toLocaleString()}명</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 연관 가입자 - 클릭 시 상세조회 */}
        {schedule.relatedSubscribers && schedule.relatedSubscribers.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-slate-200/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">연관 가입자</span>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{schedule.relatedSubscribers.length}명</span>
            </div>
            <div className="space-y-2">
              {schedule.relatedSubscribers.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={() => handleSubscriberClick(sub)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-100 hover:shadow-md hover:border-cyan-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sub.name}</p>
                      <p className="text-xs text-slate-500">{sub.company}</p>
                      <p className="text-xs text-slate-400">사번: {sub.employeeId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {sub.balance === 0 ? '신규 가입' : `${(sub.balance / 10000).toLocaleString()}만원`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">가입일: {sub.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   일정 추가 모달 내용 - 가입자 검색/선택 기능
───────────────────────────────────────────── */
function AddModalContent({
  onClose,
  onAdd,
  defaultDate,
}: {
  onClose: () => void
  onAdd: (s: DeadlineSchedule) => void
  defaultDate?: string
}) {
  const [form, setForm] = useState({
    title: '',
    deadline: defaultDate || '',
    content: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // 가입자 검색/선택 상태
  const [subscriberSearch, setSubscriberSearch] = useState('')
  const [selectedSubscribers, setSelectedSubscribers] = useState<MemberData[]>([])
  const [showSubscriberDropdown, setShowSubscriberDropdown] = useState(false)

  // 검색된 가입자 목록
  const filteredMembers = useMemo(() => {
    if (!subscriberSearch.trim()) return []
    const query = subscriberSearch.toLowerCase()
    return memberList.filter(m => 
      m.name.includes(query) || 
      m.employeeId.toLowerCase().includes(query) ||
      m.company.includes(query)
    ).slice(0, 5)
  }, [subscriberSearch])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = '일정 타이틀을 입력해주세요.'
    if (!form.deadline) e.deadline = '기한을 선택해주세요.'
    if (!form.content.trim()) e.content = '일정 내용을 입력해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const hasSubscriber = selectedSubscribers.length > 0
    
    // 가입자가 없을 경우 현재 기업 정보
    const currentCompany = {
      id: 'CURRENT-COMPANY',
      name: 'IBK 퇴직연금',
      businessNumber: '000-00-00000',
      employeeCount: 0,
      planType: 'DC' as const,
      contractDate: new Date().toISOString().split('T')[0],
    }
    
    const newSchedule: DeadlineSchedule = {
      id: `DL-${Date.now()}`,
      title: form.title,
      deadline: form.deadline,
      content: form.content,
      type: 'DC',
      targetType: hasSubscriber ? '가입자' : '기업' as TargetType,
      priority: 'medium',
      status: '예정',
      createdAt: new Date().toISOString().split('T')[0],
      relatedSubscribers: hasSubscriber ? selectedSubscribers.map(m => ({
        id: m.id,
        name: m.name,
        employeeId: m.employeeId,
        company: m.company,
        joinDate: m.joinDate,
        balance: parseInt(m.balance.replace(/,/g, '')) || 0,
      })) : undefined,
      relatedCompanies: !hasSubscriber ? [currentCompany] : undefined,
    }
    onAdd(newSchedule)
    onClose()
  }

  const addSubscriber = (member: MemberData) => {
    if (!selectedSubscribers.find(s => s.id === member.id)) {
      setSelectedSubscribers(prev => [...prev, member])
    }
    setSubscriberSearch('')
    setShowSubscriberDropdown(false)
  }

  const removeSubscriber = (id: string) => {
    setSelectedSubscribers(prev => prev.filter(s => s.id !== id))
  }

  const f = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }))

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mt-2 mb-6 pr-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">일정 추가</h2>
          <p className="text-sm text-slate-500 mt-0.5">새로운 일정을 등록합니다</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 기본 정보 */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">기본 정보</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">
              일정 타이틀 <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/80 transition-all ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="예: DC형 운용지시 기한 도래"
              value={form.title}
              onChange={e => f('title', e.target.value)}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">
              기한 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/80 transition-all ${errors.deadline ? 'border-red-400' : 'border-slate-200'}`}
              value={form.deadline}
              onChange={e => f('deadline', e.target.value)}
            />
            {errors.deadline && <p className="text-xs text-red-500 mt-1.5">{errors.deadline}</p>}
          </div>
        </div>

        {/* 일정 내용 */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">일정 내용</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 resize-none bg-white/80 transition-all ${errors.content ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="일정에 대한 상세 내용을 입력해주세요."
              value={form.content}
              onChange={e => f('content', e.target.value)}
              rows={3}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1.5">{errors.content}</p>}
          </div>
        </div>

        {/* 연관 가입자 검색/선택 */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-slate-200/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">연관 가입자</span>
            <span className="text-xs text-slate-400 ml-1">(선택)</span>
          </div>

          {/* 가입자 검색 */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-2 block">가입자 검색</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500/30 bg-white/80"
                placeholder="이름, 사번, 소속기업으로 검색..."
                value={subscriberSearch}
                onChange={e => {
                  setSubscriberSearch(e.target.value)
                  setShowSubscriberDropdown(true)
                }}
                onFocus={() => setShowSubscriberDropdown(true)}
              />
            </div>

            {/* 검색 결과 드롭다운 */}
            {showSubscriberDropdown && filteredMembers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-60 overflow-y-auto">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => addSubscriber(member)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.company} / {member.department}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.type === 'DC' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {member.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 가입자 목록 */}
          {selectedSubscribers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">선택된 가입자 ({selectedSubscribers.length}명)</p>
              <div className="flex flex-wrap gap-2">
                {selectedSubscribers.map(sub => (
                  <div 
                    key={sub.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-cyan-200 text-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-slate-700">{sub.name}</span>
                    <span className="text-xs text-slate-400">{sub.company}</span>
                    <button
                      onClick={() => removeSubscriber(sub.id)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   캘린더 뷰
───────────────────────────────────────────── */
function CalendarView({
  schedules,
  onAdd,
  onDelete,
  onViewDetail,
  onComplete,
}: {
  schedules: DeadlineSchedule[]
  onAdd: (s: DeadlineSchedule) => void
  onDelete: (id: string) => void
  onViewDetail: (s: DeadlineSchedule) => void
  onComplete: (id: string) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddForDate, setShowAddForDate] = useState<string | null>(null)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const getDaysUntil = (deadline: string) => {
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)
    const d = new Date(deadline)
    return Math.round((d.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getDateSchedules = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter(s => s.deadline === dateStr)
  }

  // 일정 색상: 미완료=노랑, 완료=초록, 초과=빨강
  const getScheduleColor = (s: DeadlineSchedule) => {
    if (s.status === '완료') return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    const days = getDaysUntil(s.deadline)
    if (days < 0) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
  }

  const selectedDateSchedules = selectedDate ? schedules.filter(s => s.deadline === selectedDate) : []

  const DAYS = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-5">
      {/* 캘린더 헤더 - 년월 강조 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {year}년 {month}월
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            오늘
          </button>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/60">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {/* 빈 칸 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-slate-100 bg-slate-50/30" />
          ))}

          {/* 날짜 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const daySchedules = getDateSchedules(day)
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()
            const isSelected = selectedDate === dateStr
            const dayOfWeek = (firstDayOfWeek + i) % 7

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`min-h-[90px] border-b border-r border-slate-100 p-2 cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    isToday ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm' :
                    dayOfWeek === 0 ? 'text-red-500' :
                    dayOfWeek === 6 ? 'text-blue-500' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  {daySchedules.length > 0 && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center">
                      {daySchedules.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 2).map(s => {
                    const color = getScheduleColor(s)
                    return (
                      <div
                        key={s.id}
                        onClick={e => { e.stopPropagation(); onViewDetail(s) }}
                        className={`text-xs px-2 py-1 rounded-lg truncate cursor-pointer transition-all hover:scale-[1.02] ${color.bg} ${color.text} border ${color.border}`}
                        title={s.title}
                      >
                        {s.title}
                      </div>
                    )
                  })}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-slate-400 pl-1 font-medium">+{daySchedules.length - 2}개</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택된 날짜 상세 */}
      {selectedDate && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800">
              {selectedDate} 기일 목록
              <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">{selectedDateSchedules.length}건</span>
            </h4>
            <button
              onClick={() => setShowAddForDate(selectedDate)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              일정 추가
            </button>
          </div>

          {selectedDateSchedules.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">이 날짜에 일정이 없습니다.</p>
              <button
                onClick={() => setShowAddForDate(selectedDate)}
                className="mt-3 text-sm text-blue-600 font-medium hover:underline"
              >
                일정 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateSchedules.map(s => {
                const color = getScheduleColor(s)
                const isCompleted = s.status === '완료'
                return (
                  <div 
                    key={s.id} 
                    onClick={() => onViewDetail(s)}
                    className={`flex items-center gap-3 p-4 rounded-xl bg-white/80 border transition-all hover:shadow-md cursor-pointer ${
                      isCompleted ? 'border-emerald-200 opacity-70' : 'border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${color.bg}`}>
                      <Calendar className={`w-5 h-5 ${color.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{s.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      {!isCompleted && (
                        <button
                          onClick={() => onComplete(s.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="완료 처리"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`"${s.title}" 일정을 삭제하시겠습니까?`)) onDelete(s.id)
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 날짜별 일정 추가 모달 */}
      <Modal open={!!showAddForDate} onClose={() => setShowAddForDate(null)}>
        <AddModalContent
          onClose={() => setShowAddForDate(null)}
          onAdd={s => { onAdd(s); setShowAddForDate(null) }}
          defaultDate={showAddForDate || undefined}
        />
      </Modal>
    </div>
  )
}

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
export function DeadlineAlerts() {
  const [schedules, setSchedules] = useState<DeadlineSchedule[]>(mockDeadlines)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedSchedule, setSelectedSchedule] = useState<DeadlineSchedule | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // 가입자 상세보기 모달
  const [subscriberDetail, setSubscriberDetail] = useState<SubscriberDetail | null>(null)

  const handleAdd = (s: DeadlineSchedule) => {
    setSchedules(prev => [s, ...prev])
    setToast({ message: '새 일정이 추가되었습니다.', type: 'success' })
  }
  
  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
    setToast({ message: '일정이 삭제되었습니다.', type: 'success' })
  }
  
  const handleComplete = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: '완료' as const } : s))
    setToast({ message: '처리 완료되었습니다.', type: 'success' })
  }

  // 기일 임박(2주 이내) 및 초과 여부 계산
  const getDaysUntil = (deadline: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(deadline)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // 통계: 전체 / 기일임박(2주이내) / 초과 - 완료 제외
  const stats = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.status !== '완료')
    return {
      total: activeSchedules.length,
      imminent: activeSchedules.filter(s => {
        const days = getDaysUntil(s.deadline)
        return days >= 0 && days <= 14
      }).length,
      overdue: activeSchedules.filter(s => getDaysUntil(s.deadline) < 0).length,
    }
  }, [schedules])

  // 필터링 (목록에서는 완료 건 제외)
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      // 목록 뷰에서는 완료 건 제외
      if (s.status === '완료') return false
      
      const days = getDaysUntil(s.deadline)
      const matchSearch = !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.relatedCompanies?.some(c => c.name.includes(searchQuery)) ||
        s.relatedSubscribers?.some(sub => sub.name.includes(searchQuery))
      
      let matchCategory = true
      if (filterCategory === 'imminent') {
        matchCategory = days >= 0 && days <= 14
      } else if (filterCategory === 'overdue') {
        matchCategory = days < 0
      }
      
      return matchSearch && matchCategory
    }).sort((a, b) => {
      // 초과 > 임박 > 예정 순으로 정렬
      const daysA = getDaysUntil(a.deadline)
      const daysB = getDaysUntil(b.deadline)
      if (daysA < 0 && daysB >= 0) return -1
      if (daysB < 0 && daysA >= 0) return 1
      return daysA - daysB
    })
  }, [schedules, searchQuery, filterCategory])

  const getDaysLabel = (deadline: string) => {
    const days = getDaysUntil(deadline)
    if (days < 0) return { label: `${Math.abs(days)}일 초과`, color: 'text-red-600', bg: 'bg-red-50' }
    if (days === 0) return { label: '오늘 마감', color: 'text-red-600', bg: 'bg-red-50' }
    if (days <= 14) return { label: `D-${days}`, color: 'text-amber-600', bg: 'bg-amber-50' }
    return { label: `D-${days}`, color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  // 날짜 포맷 (일자만)
  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 헤더 - 아이콘 크기+컬러 다른 탭과 동일하게 */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">기일 관리</h2>
            <p className="text-sm text-muted-foreground">도래하는 퇴직연금 일정을 관리합니다.</p>
          </div>
        </div>
      </div>

      {/* 통계 카드: 전체 / 기일임박(2주이내) / 초과 */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilterCategory('all')}
          className={`glass rounded-2xl p-5 border transition-all hover:shadow-lg text-left ${
            filterCategory === 'all' ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-border/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">전체 건수</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total}</p>
        </button>
        
        <button
          onClick={() => setFilterCategory('imminent')}
          className={`glass rounded-2xl p-5 border transition-all hover:shadow-lg text-left ${
            filterCategory === 'imminent' ? 'border-amber-300 ring-2 ring-amber-500/20' : 'border-amber-200/50 bg-amber-50/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">기일임박 (2주)</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.imminent}</p>
        </button>
        
        <button
          onClick={() => setFilterCategory('overdue')}
          className={`glass rounded-2xl p-5 border transition-all hover:shadow-lg text-left ${
            filterCategory === 'overdue' ? 'border-red-300 ring-2 ring-red-500/20' : 'border-red-200/50 bg-red-50/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md shadow-red-500/25">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">기한 초과</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </button>
      </div>

      {/* 뷰 모드 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 p-1 glass rounded-xl border border-border/50 self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'list' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            목록
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            캘린더
          </button>
        </div>

        {viewMode === 'list' && (
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/70 bg-white/80 backdrop-blur-sm text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="일정명, 기업명, 가입자명 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-11 px-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/25 rounded-xl font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              일정 추가
            </Button>
          </div>
        )}
      </div>

      {/* 목록 뷰 - 간소화된 셀 */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-muted-foreground">조건에 맞는 일정이 없습니다.</p>
            </div>
          ) : (
            filteredSchedules.map(schedule => {
              const daysInfo = getDaysLabel(schedule.deadline)
              const isOverdue = getDaysUntil(schedule.deadline) < 0

              return (
                <div
                  key={schedule.id}
                  onClick={() => setSelectedSchedule(schedule)}
                  className={`glass rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                    isOverdue
                      ? 'border-red-200/70 bg-gradient-to-r from-red-50/50 to-rose-50/30'
                      : getDaysUntil(schedule.deadline) <= 14
                      ? 'border-amber-200/70 bg-gradient-to-r from-amber-50/30 to-orange-50/20'
                      : 'border-border/50'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-foreground truncate">{schedule.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDateShort(schedule.deadline)}</span>
                          </div>
                        </div>
                      </div>

                      {/* D-day */}
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${daysInfo.color} ${daysInfo.bg} flex-shrink-0`}>
                        {daysInfo.label}
                      </span>

                      {/* 완료/삭제 버튼 */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleComplete(schedule.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="완료 처리"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${schedule.title}" 일정을 삭제하시겠습니까?`)) handleDelete(schedule.id)
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <div className="glass rounded-2xl border border-border/50 p-6">
          <CalendarView
            schedules={schedules}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onViewDetail={setSelectedSchedule}
            onComplete={handleComplete}
          />
        </div>
      )}

      {/* 상세보기 모달 */}
      <Modal open={!!selectedSchedule} onClose={() => setSelectedSchedule(null)}>
        {selectedSchedule && (
          <DetailModalContent
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
            onSubscriberClick={(sub) => {
              setSelectedSchedule(null)
              setSubscriberDetail(sub)
            }}
          />
        )}
      </Modal>

      {/* 일정 추가 모달 */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddModalContent
          onClose={() => setShowAddModal(false)}
          onAdd={s => { handleAdd(s); setShowAddModal(false) }}
        />
      </Modal>

      {/* 가입자 상세보기 모달 */}
      <SubscriberDetailModal
        subscriber={subscriberDetail}
        open={!!subscriberDetail}
        onClose={() => setSubscriberDetail(null)}
      />
    </div>
  )
}
