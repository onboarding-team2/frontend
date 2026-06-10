'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Users, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDbMemberPage, MemberPage } from '@/lib/api'
import { formatRrnAsBirthDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type FilterKey = 'status' | 'type' | 'irp'

interface Member {
  id: string
  name: string
  rrnMasked: string
  position: string
  joinDate: string
  status: '재직' | '퇴직'
}

const FILTER_GROUPS: {
  key: FilterKey
  label: string
  options: { value: string; label: string; chip?: string }[]
}[] = [
  { key: 'status', label: '재직여부', options: [{ value: '재직', label: '재직중' }, { value: '퇴직', label: '퇴직' }] },
  { key: 'type', label: '구분', options: [{ value: '사원', label: '사원' }, { value: '임원', label: '임원' }] },
  { key: 'irp', label: 'IRP계좌', options: [{ value: '보유', label: '보유', chip: 'IRP 보유' }, { value: '미보유', label: '미보유', chip: 'IRP 미보유' }] },
]

const FILTER_KEYS = FILTER_GROUPS.map(g => g.key)
const PAGE_SIZE = 20
const PATH = '/pension/db/members'

function toMember(item: MemberPage['members'][0]): Member {
  return {
    id: String(item.id),
    name: item.name,
    rrnMasked: item.rrnMasked ?? '-',
    position: item.position ?? '-',
    joinDate: item.joinDate ?? '-',
    status: item.status === '퇴직' ? '퇴직' : '재직',
  }
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

export function MemberManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const spString = searchParams.toString()

  const urlFilters: Record<FilterKey, string[]> = {
    status: searchParams.getAll('status'),
    type: searchParams.getAll('type'),
    irp: searchParams.getAll('irp'),
  }
  const nameParam = searchParams.get('name') ?? ''
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10) || 0)

  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState(nameParam)
  const [filterOpen, setFilterOpen] = useState(false)
  const [pending, setPending] = useState<Record<FilterKey, string[]>>(urlFilters)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    getDbMemberPage({
      name: searchParams.get('name') ?? undefined,
      status: searchParams.getAll('status'),
      type: searchParams.getAll('type'),
      irp: searchParams.getAll('irp'),
      page: Math.max(0, parseInt(searchParams.get('page') ?? '0', 10) || 0),
      size: PAGE_SIZE,
    }, ctrl.signal)
      .then(res => { setMembers(res.members.map(toMember)); setTotal(res.totalCount); setTotalPages(res.totalPages) })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [spString]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== (searchParams.get('name') ?? '')) {
        const p = new URLSearchParams(searchParams.toString())
        if (searchInput) p.set('name', searchInput); else p.delete('name')
        p.set('page', '0')
        router.replace(`${PATH}?${p.toString()}`)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  const setParams = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(searchParams.toString())
    mutate(p)
    router.push(`${PATH}?${p.toString()}`)
  }

  const openFilter = () => { setPending(urlFilters); setFilterOpen(true) }
  const applyFilter = () => {
    setParams(p => {
      FILTER_KEYS.forEach(k => { p.delete(k); pending[k].forEach(v => p.append(k, v)) })
      p.set('page', '0')
    })
    setFilterOpen(false)
  }
  const togglePending = (key: FilterKey, value: string) =>
    setPending(prev => ({ ...prev, [key]: toggle(prev[key], value) }))
  const removeChip = (key: FilterKey, value: string) =>
    setParams(p => {
      const vals = p.getAll(key).filter(v => v !== value)
      p.delete(key); vals.forEach(v => p.append(key, v)); p.set('page', '0')
    })
  const clearAll = () =>
    setParams(p => { FILTER_KEYS.forEach(k => p.delete(k)); p.set('page', '0') })
  const goPage = (n: number) => setParams(p => p.set('page', String(n)))

  const activeCount = FILTER_KEYS.reduce((s, k) => s + urlFilters[k].length, 0)
  const labelOf = (key: FilterKey, value: string) => {
    const opt = FILTER_GROUPS.find(g => g.key === key)?.options.find(o => o.value === value)
    return opt?.chip ?? opt?.label ?? value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">가입자 관리</h2>
          <p className="text-muted-foreground">퇴직연금 가입자 정보를 관리합니다</p>
        </div>
      </div>

      {/* Search + Filter */}
      <Card className="glass border-0 animate-slide-up">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3">
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

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
                className={`gap-2 h-11 border-white/50 transition-all ${
                  activeCount > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white/30 hover:bg-white/60'
                }`}
              >
                <Filter className="w-4 h-4" />
                필터
                {activeCount > 0 && (
                  <span className="ml-0.5 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs font-bold">
                    {activeCount}
                  </span>
                )}
              </Button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 z-50 rounded-2xl border border-white/40 bg-white/90 backdrop-blur-xl shadow-xl p-4 space-y-4 animate-slide-up">
                    {FILTER_GROUPS.map((group) => (
                      <div key={group.key} className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((opt) => {
                            const selected = pending[group.key].includes(opt.value)
                            return (
                              <button
                                key={opt.value}
                                onClick={() => togglePending(group.key, opt.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                  selected ? 'bg-primary text-white font-semibold shadow-sm' : 'bg-black/5 text-muted-foreground hover:bg-black/10'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5" />}
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setPending({ status: [], type: [], irp: [] })}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        초기화
                      </button>
                      <Button onClick={applyFilter} size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        완료
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 적용된 필터 칩 */}
          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_GROUPS.flatMap((group) =>
                urlFilters[group.key].map((value) => (
                  <span key={`${group.key}-${value}`} className="flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {labelOf(group.key, value)}
                    <button onClick={() => removeChip(group.key, value)} className="rounded-full hover:bg-primary/20 p-0.5 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={clearAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                전체 해제
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="glass border-0 overflow-hidden animate-slide-up">
        <CardHeader className="border-b border-white/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">가입자 명부</CardTitle>
            <span className="text-sm text-muted-foreground">
              총 <span className="text-foreground font-semibold">{total}</span>명
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="overflow-x-auto rounded-xl border border-white/40">
            <table className="w-full">
              <thead>
                <tr className="bg-white/40">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">이름</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">생년월일</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">구분</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">가입일</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">재직여부</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-white/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-3.5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-3.5 w-14" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-3.5 w-24" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-14 mx-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">가입자가 없습니다.</td>
                  </tr>
                ) : (
                  members.map((member, idx) => (
                    <tr
                      key={member.id}
                      onClick={() => router.push(`/pension/db/members/${member.id}`)}
                      className="border-b border-white/20 cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{member.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatRrnAsBirthDate(member.rrnMasked)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.position}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.joinDate}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          member.status === '재직' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline" size="sm" disabled={page <= 0}
                onClick={() => goPage(page - 1)}
                className="border-white/50 bg-white/30 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline" size="sm" disabled={page >= totalPages - 1}
                onClick={() => goPage(page + 1)}
                className="border-white/50 bg-white/30 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
