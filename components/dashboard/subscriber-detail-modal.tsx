'use client'

import { X, User, Building2, Calendar, CreditCard, Shield, Wallet, Clock, BadgeCheck } from 'lucide-react'

export interface SubscriberDetail {
  id: string
  employeeId: string
  name: string
  company: string
  department?: string
  accountType: 'DC' | 'DB' | 'IRP'
  joinDate: string
  startDate?: string
  terminationDate?: string
  effectiveDate?: string
  defaultOption?: 'Y' | 'N' | null
  employeeType?: string
  balance: number
}

interface SubscriberDetailModalProps {
  subscriber: SubscriberDetail | null
  open: boolean
  onClose: () => void
}

export function SubscriberDetailModal({ subscriber, open, onClose }: SubscriberDetailModalProps) {
  if (!open || !subscriber) return null

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원'
  }

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
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all"
          style={{ zIndex: 10001 }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-start gap-4 pr-8 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{subscriber.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  subscriber.accountType === 'DC' ? 'bg-purple-100 text-purple-700' :
                  subscriber.accountType === 'DB' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-teal-100 text-teal-700'
                }`}>
                  {subscriber.accountType}형
                </span>
                <span className="text-sm text-slate-500">사번: {subscriber.employeeId}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">기본 정보</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">소속 기업</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-bold text-slate-900">{subscriber.company}</p>
                  </div>
                </div>
                {subscriber.department && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">부서</p>
                    <p className="text-sm font-bold text-slate-900">{subscriber.department}</p>
                  </div>
                )}
                {subscriber.employeeType && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">임직원 구분</p>
                    <p className="text-sm font-bold text-slate-900">{subscriber.employeeType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 계좌 정보 */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">퇴직연금 계좌</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">계좌 유형</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    subscriber.accountType === 'DC' ? 'bg-purple-100 text-purple-700' :
                    subscriber.accountType === 'DB' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {subscriber.accountType}형
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">적립금</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(subscriber.balance)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 날짜 정보 */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-slate-200/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">날짜 정보</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">제도 가입일</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(subscriber.joinDate)}</p>
                </div>
                {subscriber.startDate && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">입사일</p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(subscriber.startDate)}</p>
                  </div>
                )}
                {subscriber.terminationDate && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">퇴직예정일</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-bold text-amber-600">{formatDate(subscriber.terminationDate)}</p>
                    </div>
                  </div>
                )}
                {subscriber.effectiveDate && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">기산일</p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(subscriber.effectiveDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 디폴트옵션 (DC형인 경우만) */}
            {subscriber.accountType === 'DC' && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/60 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">디폴트옵션</span>
                </div>
                <div className="p-4 rounded-xl bg-white/80 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      subscriber.defaultOption === 'Y' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      <BadgeCheck className={`w-5 h-5 ${
                        subscriber.defaultOption === 'Y' ? 'text-emerald-600' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {subscriber.defaultOption === 'Y' ? '설정 완료' : subscriber.defaultOption === 'N' ? '미설정' : '미지정'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscriber.defaultOption === 'Y' 
                          ? '디폴트옵션이 설정되어 있습니다' 
                          : '디폴트옵션 설정이 필요합니다'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    subscriber.defaultOption === 'Y' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {subscriber.defaultOption === 'Y' ? '완료' : '필요'}
                  </span>
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
      </div>
    </div>
  )
}
