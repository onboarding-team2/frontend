'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Edit2, Trash2, Filter, Download, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { getPensionMembers, getPensionMemberDetail, EmployeeDetail } from '@/lib/api'
import { SubscriberDetailModal, SubscriberDetail } from './subscriber-detail-modal'

interface Member {
  id: string
  name: string
  joinDate: string
  irpAccount: '개설완료' | '미개설'
  balance: string
  status: string
}

function toMember(item: Awaited<ReturnType<typeof getPensionMembers>>[0]): Member {
  return {
    id: String(item.id),
    name: item.name,
    joinDate: item.joinDate ?? '-',
    irpAccount: item.hasIrpAccount === 'Y' ? '개설완료' : '미개설',
    balance: item.balance != null ? item.balance.toLocaleString() : '-',
    status: item.status ?? '재직',
  }
}

function toSubscriberDetail(detail: EmployeeDetail): SubscriberDetail {
  return {
    id: String(detail.id),
    employeeId: String(detail.id),
    name: detail.name,
    company: detail.company?.companyName ?? '',
    accountType: (detail.company?.planType as 'DC' | 'DB' | 'IRP') ?? 'DB',
    joinDate: detail.retirement?.joinDate ?? '',
    startDate: detail.retirement?.startDate ?? undefined,
    terminationDate: detail.retirement?.terminationDate ?? undefined,
    effectiveDate: detail.retirement?.effectiveDate ?? undefined,
    defaultOption: null,
    employeeType: detail.retirement?.employeeType ?? undefined,
    balance: (detail.retirement?.balance as number) ?? 0,
  }
}

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIrp, setFilterIrp] = useState<'all' | '개설완료' | '미개설'>('all')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [newMember, setNewMember] = useState<Omit<Member, 'id'>>({
    name: '',
    joinDate: '',
    irpAccount: '미개설',
    balance: '',
    status: '재직',
  })
  const [regEmployeeType, setRegEmployeeType] = useState<'EMPLOYEE' | 'EXECUTIVE'>('EMPLOYEE')
  const [regRrn, setRegRrn] = useState('')

  const [subscriberDetail, setSubscriberDetail] = useState<SubscriberDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getPensionMembers(controller.signal)
      .then(data => setMembers(data.map(toMember)))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const formatRrn = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13)
    if (digits.length <= 6) return digits
    return `${digits.slice(0, 6)}-${digits.slice(6)}`
  }

  const handleRegisterSave = () => {
    if (!newMember.name || !newMember.joinDate) return
    setMembers(prev => [...prev, { ...newMember, id: String(Date.now()) }])
    setIsRegisterOpen(false)
    setNewMember({ name: '', joinDate: '', irpAccount: '미개설', balance: '', status: '재직' })
    setRegRrn('')
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.includes(searchTerm)
    const matchesIrp = filterIrp === 'all' || member.irpAccount === filterIrp
    return matchesSearch && matchesIrp
  })

  const handleNameClick = async (member: Member) => {
    setDetailLoading(true)
    try {
      const detail = await getPensionMemberDetail(Number(member.id))
      setSubscriberDetail(toSubscriberDetail(detail))
    } catch {
      setSubscriberDetail({
        id: member.id,
        employeeId: member.id,
        name: member.name,
        company: '',
        accountType: 'DB',
        joinDate: member.joinDate !== '-' ? member.joinDate : '',
        defaultOption: null,
        balance: 0,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember({ ...member })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m))
      setIsEditOpen(false)
      setEditingMember(null)
    }
  }

  const handleDelete = (member: Member) => {
    setDeletingMember(member)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingMember) {
      setMembers(prev => prev.filter(m => m.id !== deletingMember.id))
      setIsDeleteOpen(false)
      setDeletingMember(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">가입자 관리</h2>
            <p className="text-muted-foreground">퇴직연금 가입자 정보를 관리합니다</p>
          </div>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)} className="btn-hover gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg glow-blue transition-all duration-300 hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4" />
          가입자 등록
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-4 space-y-4">
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
            <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all">
              <Filter className="w-4 h-4" />
              필터
            </Button>
            <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </div>

          {/* IRP계좌 필터 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">IRP 계좌</span>
            <div className="flex items-center gap-2">
              {([
                { value: 'all', label: '전체', count: members.length },
                { value: '개설완료', label: '개설완료', count: members.filter(m => m.irpAccount === '개설완료').length },
                { value: '미개설', label: '미개설', count: members.filter(m => m.irpAccount === '미개설').length },
              ] as const).map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilterIrp(item.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    filterIrp === item.value
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'bg-white/50 text-muted-foreground hover:bg-white/80'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-xs font-bold ${filterIrp === item.value ? 'text-white/90' : 'text-foreground'}`}>{item.count}</span>
                </button>
              ))}
            </div>
          </div>
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">이름</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">가입일</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">IRP계좌</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">재직상태</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">적립금</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      가입자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <tr
                      key={member.id}
                      className="border-b border-white/20 hover:bg-white/40 transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${(idx + 3) * 50}ms` }}
                    >
                      <td className="p-4">
                        <button
                          onClick={() => handleNameClick(member)}
                          disabled={detailLoading}
                          className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left disabled:opacity-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                            <span className="text-xs font-semibold text-primary">{member.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground underline-offset-2 hover:underline">{member.name}</span>
                        </button>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{member.joinDate}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 ${
                          member.irpAccount === '개설완료'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-500'
                        }`}>
                          {member.irpAccount}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          member.status === '재직'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right font-medium text-foreground">
                        {member.balance !== '-' ? `${member.balance}원` : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-all duration-300 hover:scale-110 active:scale-95"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-white/30">
            <span className="text-sm text-muted-foreground">1-{filteredMembers.length} / 전체 {filteredMembers.length}명</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="border-white/50 bg-white/30 transition-all duration-300">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-md">
                1
              </Button>
              <Button variant="outline" size="sm" disabled className="border-white/50 bg-white/30 transition-all duration-300">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] glass-strong border-white/30">
          <DialogHeader>
            <DialogTitle>가입자 정보 수정</DialogTitle>
            <DialogDescription>
              가입자 정보를 수정합니다. 변경 사항을 저장하려면 저장 버튼을 클릭하세요.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="bg-white/50 border-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">가입일</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={editingMember.joinDate}
                    onChange={(e) => setEditingMember({ ...editingMember, joinDate: e.target.value })}
                    className="bg-white/50 border-white/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="irpAccount">IRP계좌</Label>
                <Select
                  value={editingMember.irpAccount}
                  onValueChange={(value: '개설완료' | '미개설') => setEditingMember({ ...editingMember, irpAccount: value })}
                >
                  <SelectTrigger className="bg-white/50 border-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="개설완료">개설완료</SelectItem>
                    <SelectItem value="미개설">미개설</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">적립금</Label>
                <Input
                  id="balance"
                  value={editingMember.balance}
                  onChange={(e) => setEditingMember({ ...editingMember, balance: e.target.value })}
                  className="bg-white/50 border-white/50"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-white/50 bg-white/30">
              취소
            </Button>
            <Button onClick={handleEditSave} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Member Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[500px] glass-strong border-white/30">
          <DialogHeader>
            <DialogTitle>가입자 등록</DialogTitle>
            <DialogDescription>
              새 가입자 정보를 입력합니다. 등록하려면 저장 버튼을 클릭하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">이름</Label>
                <Input
                  id="reg-name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="bg-white/50 border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-joinDate">가입일</Label>
                <Input
                  id="reg-joinDate"
                  type="date"
                  value={newMember.joinDate}
                  onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                  className="bg-white/50 border-white/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-rrn">주민번호</Label>
                <Input
                  id="reg-rrn"
                  value={regRrn}
                  onChange={(e) => setRegRrn(formatRrn(e.target.value))}
                  placeholder="000000-0000000"
                  maxLength={14}
                  className="bg-white/50 border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-employeeType">임직원</Label>
                <Select
                  value={regEmployeeType}
                  onValueChange={(value: 'EMPLOYEE' | 'EXECUTIVE') => setRegEmployeeType(value)}
                >
                  <SelectTrigger className="bg-white/50 border-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                    <SelectItem value="EXECUTIVE">EXECUTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-irpAccount">IRP계좌</Label>
                <Select
                  value={newMember.irpAccount}
                  onValueChange={(value: '개설완료' | '미개설') => setNewMember({ ...newMember, irpAccount: value })}
                >
                  <SelectTrigger className="bg-white/50 border-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="개설완료">개설완료</SelectItem>
                    <SelectItem value="미개설">미개설</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-balance">적립금</Label>
                <Input
                  id="reg-balance"
                  value={newMember.balance}
                  onChange={(e) => setNewMember({ ...newMember, balance: e.target.value })}
                  className="bg-white/50 border-white/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)} className="border-white/50 bg-white/30">
              취소
            </Button>
            <Button onClick={handleRegisterSave} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="glass-strong border-white/30">
          <AlertDialogHeader>
            <AlertDialogTitle>가입자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMember && (
                <>
                  <span className="font-semibold text-foreground">{deletingMember.name}</span>님의 정보를 삭제하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/50 bg-white/30">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 가입자 상세 모달 */}
      <SubscriberDetailModal
        subscriber={subscriberDetail}
        open={!!subscriberDetail}
        onClose={() => setSubscriberDetail(null)}
      />
    </div>
  )
}
