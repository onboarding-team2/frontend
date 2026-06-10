'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Users, X, Check } from 'lucide-react'
import { getDbMembers } from '@/lib/api'

type FilterKey = 'status' | 'type' | 'irp'

interface Member {
  id: string
  name: string
  rrnMasked: string
  position: string
  joinDate: string
  status: '재직' | '퇴직'
  irp: '보유' | '미보유'
}

// label: 팝업 안에서 보이는 짧은 라벨 / chip: 적용된 필터 칩에 보이는 라벨(맥락 포함)
const FILTER_GROUPS: {
  key: FilterKey
  label: string
  options: { value: string; label: string; chip?: string }[]
}[] = [
  { key: 'status', label: '재직여부', options: [{ value: '재직', label: '재직중' }, { value: '퇴직', label: '퇴직' }] },
  { key: 'type', label: '구분', options: [{ value: '사원', label: '사원' }, { value: '임원', label: '임원' }] },
  { key: 'irp', label: 'IRP계좌', options: [{ value: '보유', label: '보유', chip: 'IRP 보유' }, { value: '미보유', label: '미보유', chip: 'IRP 미보유' }] },
]

const EMPTY_FILTERS: Record<FilterKey, string[]> = { status: [], type: [], irp: [] }

function toMember(item: Awaited<ReturnType<typeof getDbMembers>>[0]): Member {
  return {
    id: String(item.id),
    name: item.name,
    rrnMasked: item.rrnMasked ?? '-',
    position: item.position ?? '-',
    joinDate: item.joinDate ?? '-',
    status: item.status === '퇴직' ? '퇴직' : '재직',
    irp: item.hasIrpAccount === 'Y' ? '보유' : '미보유',
  }
}

function memberValue(m: Member, key: FilterKey): string {
  switch (key) {
    case 'status': return m.status
    case 'type': return m.position
    case 'irp': return m.irp
  }
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

export function MemberManagement() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // 적용된 필터 / 팝업 내 임시 선택
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>(EMPTY_FILTERS)
  const [pending, setPending] = useState<Record<FilterKey, string[]>>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getDbMembers(controller.signal)
      .then(data => setMembers(data.map(toMember)))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const openFilter = () => {
    setPending(filters)
    setFilterOpen(true)
  }
  const applyFilter = () => {
    setFilters(pending)
    setFilterOpen(false)
  }
  const togglePending = (key: FilterKey, value: string) =>
    setPending(prev => ({ ...prev, [key]: toggle(prev[key], value) }))
  const removeChip = (key: FilterKey, value: string) =>
    setFilters(prev => ({ ...prev, [key]: prev[key].filter(v => v !== value) }))

  const activeCount = FILTER_GROUPS.reduce((sum, g) => sum + filters[g.key].length, 0)
  const labelOf = (key: FilterKey, value: string) => {
    const opt = FILTER_GROUPS.find(g => g.key === key)?.options.find(o => o.value === value)
    return opt?.chip ?? opt?.label ?? value
  }

  // 검색 + 필터 + 이름 가나다순 정렬
  const filteredMembers = members
    .filter((m) => m.name.includes(searchTerm))
    .filter((m) => FILTER_GROUPS.every(g => filters[g.key].length === 0 || filters[g.key].includes(memberValue(m, g.key))))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

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
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="이름으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white/50 border-white/50 rounded-xl input-glow focus:bg-white/80 transition-all"
              />
            </div>

            {/* 필터 버튼 + 팝업 */}
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
                  {/* 바깥 클릭 시 닫기 */}
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
                        onClick={() => setPending(EMPTY_FILTERS)}
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
                filters[group.key].map((value) => (
                  <span key={`${group.key}-${value}`} className="flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {labelOf(group.key, value)}
                    <button onClick={() => removeChip(group.key, value)} className="rounded-full hover:bg-primary/20 p-0.5 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                전체 해제
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="glass border-0 overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="border-b border-white/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">가입자 명부</CardTitle>
            <span className="text-sm text-muted-foreground">
              총 <span className="text-foreground font-semibold">{filteredMembers.length}</span>명
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
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      가입자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <tr
                      key={member.id}
                      onClick={() => router.push(`/pension/db/members/${member.id}`)}
                      className="border-b border-white/20 cursor-pointer hover:bg-primary/10 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${(idx + 3) * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{member.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.rrnMasked}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.position}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.joinDate}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          member.status === '재직'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
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
        </CardContent>
      </Card>
    </div>
  )
}
