'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Calendar, List, Plus, Search, CheckCircle2,
  XCircle, Clock, Building2, Users, Trash2, X,
  FileText, User, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Schedule,
  TargetType,
} from '@/lib/schedule-data'
import { SubscriberDetailModal, SubscriberDetail } from './subscriber-detail-modal'
import { getChoseong } from 'es-hangul'
import {
  Employee,
  ScheduleDbDetail,
  getDbMembers,
  getSchedulesDb,
  getScheduleDbDetail,
  createScheduleDb,
  deleteScheduleDb,
  completeScheduleDb,
  getPensionMemberDetail,
  getCompanyProfile,
} from '@/lib/api'

type ViewMode = 'list' | 'calendar'
type FilterCategory = 'all' | 'completed' | 'imminent' | 'overdue'

// ─── API 응답 → Schedule 변환 ─────────────────────────────────────

function convertDetailToSchedule(detail: ScheduleDbDetail): Schedule {
  const hasEmployees = detail.target_employees && detail.target_employees.length > 0

  return {
    id: String(detail.id),
    title: detail.title,
    dueDate: detail.due_date,
    content: detail.description || '',
    type: 'DB',
    targetType: hasEmployees ? '가입자' : ('기업' as TargetType),
    status: detail.status === 'DONE' ? '완료' : detail.status === 'OVERDUE' ? '지연' : '예정',
    createdAt: detail.created_date || '',
    isMandatory: detail.is_mandatory,
    relatedSubscribers: hasEmployees
      ? detail.target_employees.map(e => ({
          id: String(e.employee_id),
          name: e.name,
          employeeId: String(e.employee_id),
          company: e.company_name || '',
          joinDate: '',
          balance: 0,
        }))
      : undefined,
    relatedCompanies: !hasEmployees && detail.company_name ? [
      {
        id: String(detail.company_name),
        name: detail.company_name,
        businessNumber: detail.brn || '',
        employeeCount: 0,
        planType: (detail.plan_type as 'DC' | 'DB') ?? 'DB',
        contractDate: '',
      }
    ] : undefined,
  }
}

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
  onSubscriberClick,
}: {
  schedule: Schedule
  onClose: () => void
  onSubscriberClick: (sub: SubscriberDetail) => void
}) {
  const getDays = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(schedule.dueDate)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }
  const days = getDays()

  const formatDateShort = (s: string) => {
    const d = new Date(s)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const getScheduleText = () => {
    if (schedule.status === '완료') return '처리 완료'
    if (days < 0) return `${Math.abs(days)}일 초과`
    if (days === 0) return '오늘 마감'
    return `${days}일 전`
  }

  const getScheduleColor = () => {
    if (schedule.status === '완료') return 'text-emerald-600'
    if (days < 0) return 'text-red-600'
    if (days <= 14) return 'text-amber-600'
    return 'text-blue-600'
  }

  const handleSubscriberClick = async (sub: { id: string; name: string; employeeId: string; company: string; joinDate: string; balance: number }) => {
    try {
      const fetched = await getPensionMemberDetail(Number(sub.id))
      const detail: SubscriberDetail = {
        id: String(fetched.id),
        employeeId: String(fetched.id),
        name: fetched.name,
        company: fetched.company?.companyName ?? sub.company,
        accountType: (fetched.company?.planType as 'DC' | 'DB' | 'IRP') ?? 'DB',
        joinDate: fetched.retirement?.joinDate ?? sub.joinDate,
        startDate: fetched.retirement?.startDate ?? undefined,
        terminationDate: fetched.retirement?.terminationDate ?? undefined,
        effectiveDate: fetched.retirement?.effectiveDate ?? undefined,
        defaultOption: fetched.retirement?.defaultOption as 'Y' | 'N' | null ?? null,
        employeeType: fetched.retirement?.employeeType ?? undefined,
        balance: (fetched.retirement?.balance as number) ?? sub.balance,
      }
      onSubscriberClick(detail)
    } catch {
      onSubscriberClick({
        id: sub.id,
        employeeId: sub.employeeId,
        name: sub.name,
        company: sub.company,
        accountType: 'DB',
        joinDate: sub.joinDate,
        defaultOption: null,
        balance: sub.balance,
      })
    }
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
            <p className={`text-sm font-semibold ${getScheduleColor()}`}>
              기한: {formatDateShort(schedule.dueDate)} ({getScheduleText()})
            </p>
          </div>
        </div>
        {schedule.createdAt && (
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0 mr-2">
            등록: {formatDateShort(schedule.createdAt)}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {schedule.content && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">일정 내용</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-xl p-4 border border-slate-100">{schedule.content}</p>
          </div>
        )}

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
                      {sub.company && <p className="text-xs text-slate-500">{sub.company}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {schedule.relatedCompanies && schedule.relatedCompanies.length > 0 && (!schedule.relatedSubscribers || schedule.relatedSubscribers.length === 0) && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">대상 기업</span>
            </div>
            <div className="space-y-2">
              {schedule.relatedCompanies.map(company => (
                <div key={company.id} className="flex items-center gap-3 p-4 rounded-xl bg-white/80 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{company.name}</p>
                    <p className="text-xs text-slate-500">사업자번호: {company.businessNumber}</p>
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
   일정 추가 모달 내용
───────────────────────────────────────────── */
function AddModalContent({
  onClose,
  onAdd,
  defaultDate,
}: {
  onClose: () => void
  onAdd: (title: string, dueDate: string, description: string, employeeIds: number[]) => Promise<void>
  defaultDate?: string
}) {
  const [form, setForm] = useState({
    title: '',
    dueDate: defaultDate || '',
    content: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [allMembers, setAllMembers] = useState<Employee[]>([])
  const [subscriberSearch, setSubscriberSearch] = useState('')
  const [selectedSubscribers, setSelectedSubscribers] = useState<Employee[]>([])
  const [showSubscriberDropdown, setShowSubscriberDropdown] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSubscriberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    getDbMembers().then(setAllMembers).catch(() => {})
  }, [])

  const filteredMembers = allMembers
  .filter(member => !selectedSubscribers.some(selected => selected.id === member.id))
  .filter(member =>
    member.name.includes(subscriberSearch) ||
    getChoseong(member.name).includes(subscriberSearch)
  )

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = '일정 타이틀을 입력해주세요.'
    if (!form.dueDate) e.dueDate = '기한을 선택해주세요.'
    if (!form.content.trim()) e.content = '일정 내용을 입력해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onAdd(
        form.title,
        form.dueDate,
        form.content,
        selectedSubscribers.map(m => m.id),
      )
      onClose()
    } catch {
      setErrors(prev => ({ ...prev, submit: '일정 추가에 실패했습니다. 다시 시도해주세요.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSubscriber = (member: Employee) => {
    if (!selectedSubscribers.find(s => s.id === member.id)) {
      setSelectedSubscribers(prev => [...prev, member])
    }
    setSubscriberSearch('')
    setShowSubscriberDropdown(false)
  }

  const removeSubscriber = (id: number) => {
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
              placeholder="예: DB형 퇴직급여 산정 기한"
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
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/80 transition-all ${errors.dueDate ? 'border-red-400' : 'border-slate-200'}`}
              value={form.dueDate}
              onChange={e => f('dueDate', e.target.value)}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1.5">{errors.dueDate}</p>}
          </div>
        </div>

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

        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-slate-200/60 p-5 space-y-4" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">연관 가입자</span>
            <span className="text-xs text-slate-400 ml-1">(선택)</span>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-2 block">가입자 검색</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500/30 bg-white/80"
                placeholder="이름으로 검색..."
                value={subscriberSearch}
                onChange={e => {
                  setSubscriberSearch(e.target.value)
                  setShowSubscriberDropdown(true)
                }}
                onFocus={() => setShowSubscriberDropdown(true)}
              />
            </div>

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
                      <p className="text-xs text-slate-500">{member.position || '직책 미지정'} · {member.status || ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                    {sub.position && <span className="text-xs text-slate-400">{sub.position}</span>}
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

        {errors.submit && (
          <p className="text-xs text-red-500 text-center">{errors.submit}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? '추가 중...' : '일정 추가'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   캘린더 뷰
───────────────────────────────────────────── */
function CalendarView({
  refreshKey,
  onAdd,
  onDelete,
  onViewDetail,
  onComplete,
}: {
  refreshKey: number
  onAdd: (title: string, dueDate: string, description: string, employeeIds: number[]) => Promise<void>
  onDelete: (id: string) => void
  onViewDetail: (s: Schedule) => void
  onComplete: (id: string) => void
}) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [showAddForDate, setShowAddForDate] = useState<string | null>(null)

  const [calendarSchedules, setCalendarSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const controller = new AbortController()

    getSchedulesDb({period: 0}, controller.signal)
      .then(res => {
      const items: Schedule[] = res.schedules.map(item => ({
        id: String(item.id),
        title: item.title,
        dueDate: item.due_date,
        content: '',
        type: 'DB' as const,
        targetType: '기업',
        status: item.status === 'DONE' ? '완료' : item.status === 'OVERDUE' ? '지연' : '예정',
        isMandatory: item.is_mandatory,
        createdAt: '',
      }))

      setCalendarSchedules(items)
    })
    .catch(() => {})
    return () => controller.abort()
  }, [refreshKey])

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

  const getDaysUntil = (dueDate: string) => {
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)
    const d = new Date(dueDate)
    return Math.round((d.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getDateSchedules = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarSchedules.filter(s => s.dueDate === dateStr)
  }

  const getScheduleColor = (s: Schedule) => {
    if (s.status === '완료') return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    const days = getDaysUntil(s.dueDate)
    if (days < 0) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
  }

  const selectedDateSchedules = calendarSchedules.filter(s => s.dueDate === selectedDate)

  const DAYS = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-4">
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {year}년 {month}월
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setSelectedDate(todayStr) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            오늘
          </button>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 캘린더 + 사이드 패널 */}
      <div className="flex gap-4">
        {/* 캘린더 그리드 */}
        <div className="flex-1 min-w-0 rounded-2xl border border-slate-200/60 overflow-hidden bg-white/60">
          <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
            {DAYS.map((d, i) => (
              <div key={d} className={`py-3 text-center text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-slate-100 bg-slate-50/30" />
            ))}

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
                  onClick={() => setSelectedDate(dateStr)}
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

        {/* 우측 날짜별 일정 패널 */}
        <div className="w-[320px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800">
              {selectedDate} 기일 목록
              <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">{selectedDateSchedules.length}건</span>
            </h4>
            <button
              onClick={() => setShowAddForDate(selectedDate)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              추가
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {selectedDateSchedules.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">선택한 날짜에 일정이 없습니다.</p>
                <button
                  onClick={() => setShowAddForDate(selectedDate)}
                  className="mt-2 text-xs text-blue-600 font-medium hover:underline"
                >
                  일정 추가하기
                </button>
              </div>
            ) : (
              selectedDateSchedules.map(s => {
                const color = getScheduleColor(s)
                const isCompleted = s.status === '완료'
                return (
                  <div
                    key={s.id}
                    onClick={() => onViewDetail(s)}
                    className={`flex items-center gap-2 p-3 rounded-xl bg-white/80 border transition-all hover:shadow-md cursor-pointer ${
                      isCompleted ? 'border-emerald-200 opacity-70' : 'border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${color.bg}`}>
                      <Calendar className={`w-4 h-4 ${color.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{s.title}</p>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {!isCompleted && (
                        <button
                          onClick={() => onComplete(s.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="완료 처리"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(s.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <Modal open={!!showAddForDate} onClose={() => setShowAddForDate(null)}>
        <AddModalContent
          onClose={() => setShowAddForDate(null)}
          onAdd={async (title, dueDate, desc, empIds) => {
            await onAdd(title, dueDate, desc, empIds)
          }}
          defaultDate={showAddForDate || undefined}
        />
      </Modal>
    </div>
  )
}

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [subscriberDetail, setSubscriberDetail] = useState<SubscriberDetail | null>(null)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getSchedulesDb({}, controller.signal)
      .then(res => {
        const items = res.schedules.map(item => ({
          id: String(item.id),
          title: item.title,
          dueDate: item.due_date,
          content: '',
          type: 'DB' as const,
          targetType: '기업' as TargetType,
          isMandatory: item.is_mandatory,
          status: item.status === 'DONE' ? ('완료' as const) : item.status === 'OVERDUE' ? ('지연' as const) : ('예정' as const),
          createdAt: '',
        }))
        setSchedules(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const handleViewDetail = async (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    const id = Number(schedule.id)
    if (isNaN(id)) return
    try {
        const detail = await getScheduleDbDetail(id)
        const s = convertDetailToSchedule(detail)
        if ((!s.relatedSubscribers || s.relatedSubscribers.length === 0) && (!s.relatedCompanies || s.relatedCompanies.length === 0)) {
          try {
            const cp = await getCompanyProfile()
            s.relatedCompanies = [
              {
                id: String(cp.companyName),
                name: cp.companyName,
                businessNumber: cp.businessNumber,
                employeeCount: 0,
                planType: (cp.planType as 'DC' | 'DB') ?? 'DB',
                contractDate: '',
              }
            ]
          } catch {
            // ignore
          }
        }
        setSelectedSchedule(s)
    } catch {
      // 기본 데이터로 유지
    }
  }

  const handleAdd = async (title: string, dueDate: string, description: string, employeeIds: number[]) => {
    await createScheduleDb({
      title,
      due_date: dueDate,
      description: description || undefined,
      employee_ids: employeeIds.length > 0 ? employeeIds : undefined,
    })
    const res = await getSchedulesDb({})
    const items = res.schedules.map(item => ({
      id: String(item.id),
      title: item.title,
      dueDate: item.due_date,
      content: '',
      type: 'DB' as const,
      targetType: '기업' as TargetType,
      status: item.status === 'DONE' ? ('완료' as const) : item.status === 'OVERDUE' ? ('지연' as const) : ('예정' as const),
      isMandatory: item.is_mandatory,
      createdAt: '',
    }))
    setSchedules(items)
    setCalendarRefreshKey(prev => prev + 1)
    setToast({ message: '새 일정이 추가되었습니다.', type: 'success' })
  }

  const handleDelete = async (id: string) => {
    const schedule = schedules.find(s => s.id === id)
    if (schedule?.isMandatory) {
      setToast({ message: '의무이행 일정은 삭제 불가합니다.', type: 'error' })
      return
    }
    try {
      await deleteScheduleDb(Number(id))
      setSchedules(prev => prev.filter(s => s.id !== id))
      setCalendarRefreshKey(prev => prev + 1)
      setToast({ message: '삭제되었습니다.', type: 'success' })
    } catch {
      setToast({ message: '일정 삭제에 실패했습니다.', type: 'error' })
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await completeScheduleDb(Number(id))
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: '완료' as const } : s))
      setCalendarRefreshKey(prev => prev + 1)
      setToast({ message: '처리 완료되었습니다.', type: 'success' })
    } catch {
      setToast({ message: '완료 처리에 실패했습니다.', type: 'error' })
    }
  }

  const getDaysUntil = (dueDate: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(dueDate)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const stats = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.status !== '완료')
    return {
      total: activeSchedules.length,
      completed: schedules.filter(s => s.status === '완료').length,
      imminent: activeSchedules.filter(s => {
        const days = getDaysUntil(s.dueDate)
        return days >= 0 && days <= 14
      }).length,
      overdue: activeSchedules.filter(s => getDaysUntil(s.dueDate) < 0).length,
    }
  }, [schedules])

  const { activeSchedules, completedSchedules } = useMemo(() => {
    const active = schedules.filter(s => {
      if (s.status === '완료') return false
      const days = getDaysUntil(s.dueDate)
      const matchSearch = !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())

      let matchCategory = true
      if (filterCategory === 'imminent') {
        matchCategory = days >= 0 && days <= 14
      } else if (filterCategory === 'overdue') {
        matchCategory = days < 0
      } else if (filterCategory === 'completed') {
        return false
      }

      return matchSearch && matchCategory
    }).sort((a, b) => {
      const daysA = getDaysUntil(a.dueDate)
      const daysB = getDaysUntil(b.dueDate)
      if (daysA < 0 && daysB >= 0) return -1
      if (daysB < 0 && daysA >= 0) return 1
      return daysA - daysB
    })

    const completed = schedules.filter(s => {
      if (s.status !== '완료') return false
      if (filterCategory !== 'all' && filterCategory !== 'completed') return false
      const matchSearch = !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })

    return { activeSchedules: active, completedSchedules: completed }
  }, [schedules, searchQuery, filterCategory])

  const getDaysLabel = (dueDate: string) => {
    const days = getDaysUntil(dueDate)
    if (days < 0) return { label: `${Math.abs(days)}일 초과`, color: 'text-red-600', bg: 'bg-red-50' }
    if (days === 0) return { label: '오늘 마감', color: 'text-red-600', bg: 'bg-red-50' }
    if (days <= 14) return { label: `D-${days}`, color: 'text-amber-600', bg: 'bg-amber-50' }
    return { label: `D-${days}`, color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const renderScheduleCard = (schedule: Schedule, isCompleted = false) => {
    const daysInfo = getDaysLabel(schedule.dueDate)
    const isOverdue = getDaysUntil(schedule.dueDate) < 0

    return (
      <div
        key={schedule.id}
        onClick={() => handleViewDetail(schedule)}
        className={`glass rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
          isCompleted
            ? 'border-emerald-200/70 bg-gradient-to-r from-emerald-50/30 to-green-50/20 opacity-80'
            : isOverdue
            ? 'border-red-200/70 bg-gradient-to-r from-red-50/50 to-rose-50/30'
            : getDaysUntil(schedule.dueDate) <= 14
            ? 'border-amber-200/70 bg-gradient-to-r from-amber-50/30 to-orange-50/20'
            : 'border-border/50'
        }`}
      >
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                <h4 className={`text-sm font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-foreground'}`}>{schedule.title}</h4>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateShort(schedule.dueDate)}</span>
                </div>
              </div>
            </div>

            {!isCompleted && (
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${daysInfo.color} ${daysInfo.bg} flex-shrink-0`}>
                {daysInfo.label}
              </span>
            )}
            {isCompleted && (
              <span className="text-sm font-bold px-3 py-1.5 rounded-lg text-emerald-600 bg-emerald-50 flex-shrink-0">완료</span>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
              {!isCompleted && (
                <button
                  onClick={() => handleComplete(schedule.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  title="완료 처리"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(schedule.id)}
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
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 헤더 */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">기일 관리</h2>
            <p className="text-muted-foreground"> 올해 일정은 목록에서, 전체 일정은 캘린더에서 확인하세요.</p>
          </div>
        </div>
      </div>

      {/* 통계 카드 - 4분할 */}
      <div className="grid grid-cols-4 gap-4">
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
            <span className="text-sm font-medium text-muted-foreground">미완료</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total}</p>
        </button>

        <button
          onClick={() => setFilterCategory('completed')}
          className={`glass rounded-2xl p-5 border transition-all hover:shadow-lg text-left ${
            filterCategory === 'completed' ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-emerald-200/50 bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">완료</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
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
                placeholder="일정명, 내용 검색..."
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

      {/* 목록 뷰 */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-muted-foreground">일정을 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 진행중/미완료 섹션 */}
              {filterCategory !== 'completed' && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">진행중 / 미완료</span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">{activeSchedules.length}건</span>
                  </div>
                  {activeSchedules.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm text-muted-foreground">조건에 맞는 일정이 없습니다.</p>
                    </div>
                  ) : (
                    activeSchedules.map(s => renderScheduleCard(s, false))
                  )}
                </>
              )}

              {/* 완료된 일정 섹션 */}
              {(filterCategory === 'all' || filterCategory === 'completed') && completedSchedules.length > 0 && (
                <>
                  <div className="flex items-center gap-2 py-1 mt-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">완료된 일정</span>
                    <div className="flex-1 h-px bg-emerald-200" />
                    <span className="text-xs text-emerald-500">{completedSchedules.length}건</span>
                  </div>
                  {completedSchedules.map(s => renderScheduleCard(s, true))}
                </>
              )}

              {filterCategory === 'completed' && completedSchedules.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm text-muted-foreground">완료된 일정이 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <div className="glass rounded-2xl border border-border/50 p-6">
          <CalendarView
            refreshKey={calendarRefreshKey}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
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
          onAdd={handleAdd}
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
