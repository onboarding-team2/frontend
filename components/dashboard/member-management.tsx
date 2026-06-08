'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
} from 'lucide-react'
import {
  Employee,
  getPensionMembers,
} from '@/lib/api'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

type StatusFilter = 'ALL' | 'ACTIVE' | 'RETIRED'

export function MemberManagement() {
  const router = useRouter()

  const [searchInput, setSearchInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(0)

  const [members, setMembers] = useState<Employee[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchKeyword(searchInput.trim())
      setPage(0)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    const ctrl = new AbortController()
    setIsLoading(true)
    setError(null)

    getPensionMembers(ctrl.signal)
      .then((res) => {
        setMembers(res ?? [])
        setTotalCount(res?.length ?? 0)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      })
      .finally(() => setIsLoading(false))

    return () => ctrl.abort()
  }, [searchKeyword, status, page])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  )

  const rangeFrom = totalCount === 0 ? 0 : page * PAGE_SIZE + 1
  const rangeTo = Math.min((page + 1) * PAGE_SIZE, totalCount)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">가입자 관리</h2>
            <p className="text-muted-foreground">
              퇴직연금 가입자 정보를 관리합니다
            </p>
          </div>
        </div>
        <Button
          onClick={() => alert('가입자 등록은 준비중입니다.')}
          className="btn-hover gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg glow-blue transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          가입자 등록
        </Button>
      </div>

      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="이름으로 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-11 h-11 bg-white/50 border-white/50 rounded-xl input-glow focus:bg-white/80 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-white/50 rounded-xl p-1 border border-white/50">
                {(['ALL', 'ACTIVE', 'RETIRED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s)
                      setPage(0)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      status === s
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    {s === 'ALL' ? '전체' : s === 'ACTIVE' ? '재직' : '퇴직'}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => alert('추가 필터는 준비중입니다.')}
                className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Filter className="w-4 h-4" />
                필터
              </Button>
              <Button
                variant="outline"
                onClick={() => alert('내보내기는 준비중입니다.')}
                className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                내보내기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0 overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="border-b border-white/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">가입자 명부</CardTitle>
            <span className="text-sm text-muted-foreground">
              총 <span className="text-foreground font-semibold">{totalCount}</span>명
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-6 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">이름</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">직위</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">가입일</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">부담금</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">적립금</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      불러오는 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      조회된 가입자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((m, idx) => (
                    <tr
                      key={m.id}
                      onClick={() => router.push(`/dashboard/members/${m.id}`)}
                      className="border-b border-white/20 hover:bg-white/40 transition-all duration-300 animate-slide-up cursor-pointer"
                      style={{ animationDelay: `${(idx + 3) * 30}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                            <span className="text-xs font-semibold text-primary">
                              {m.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{m.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{m.position ?? '-'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{m.startDate ?? '-'}</td>
                      <td className="p-4">
                        {m.contributionPaid != null ? (
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              m.contributionPaid
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-red-100 text-red-500'
                            }`}
                          >
                            {m.contributionPaid ? '납입' : '미납'}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-right font-medium text-foreground">
                        {m.balance != null ? `${m.balance.toLocaleString()}원` : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            m.status === '퇴직'
                              ? 'bg-red-100 text-red-500'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {m.status ?? '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-white/30">
            <span className="text-sm text-muted-foreground">
              {rangeFrom}-{rangeTo} / 전체 {totalCount}명
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isLoading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-white/50 bg-white/30 transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-md"
              >
                {page + 1}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="border-white/50 bg-white/30 transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
