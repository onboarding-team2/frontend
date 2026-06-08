'use client'

import { useState } from 'react'
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

interface Member {
  id: string
  name: string
  joinDate: string
  irpAccount: '개설완료' | '미개설'
  defaultOption: string
  balance: string
}

const initialMembers: Member[] = [
  { id: '1', name: '홍길동', joinDate: '2020-03-15', irpAccount: '개설완료', defaultOption: '설정완료', balance: '45,230,000' },
  { id: '2', name: '김영희', joinDate: '2019-07-20', irpAccount: '미개설', defaultOption: '미설정', balance: '67,890,000' },
  { id: '3', name: '이철수', joinDate: '2018-01-10', irpAccount: '개설완료', defaultOption: '-', balance: '89,120,000' },
  { id: '4', name: '박지민', joinDate: '2021-05-05', irpAccount: '개설완료', defaultOption: '설정완료', balance: '23,450,000' },
  { id: '5', name: '최수진', joinDate: '2017-09-12', irpAccount: '미개설', defaultOption: '-', balance: '112,340,000' },
  { id: '6', name: '정민수', joinDate: '2022-02-28', irpAccount: '미개설', defaultOption: '미설정', balance: '15,670,000' },
  { id: '7', name: '강하나', joinDate: '2020-11-15', irpAccount: '개설완료', defaultOption: '설정완료', balance: '38,900,000' },
  { id: '8', name: '윤서연', joinDate: '2019-04-22', irpAccount: '개설완료', defaultOption: '-', balance: '72,100,000' },
]

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIrp, setFilterIrp] = useState<'all' | '개설완료' | '미개설'>('all')
  const [filterDefault, setFilterDefault] = useState<'all' | 'set' | 'unset'>('all')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.includes(searchTerm)
    const matchesIrp = filterIrp === 'all' || member.irpAccount === filterIrp
    const matchesDefault =
      filterDefault === 'all' ||
      (filterDefault === 'set' && member.defaultOption === '설정완료') ||
      (filterDefault === 'unset' && member.defaultOption === '미설정')
    return matchesSearch && matchesIrp && matchesDefault
  })

  const handleEdit = (member: Member) => {
    setEditingMember({ ...member })
    setIsEditOpen(true)
  }

  const handleEditSave = () => {
    if (editingMember) {
      setMembers(prev =>
        prev.map(m => m.id === editingMember.id ? editingMember : m)
      )
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
        <Button className="btn-hover gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg glow-blue transition-all duration-300 hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4" />
          가입자 등록
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-white/50 rounded-xl p-1 border border-white/50">
                {(['all', '개설완료', '미개설'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterIrp(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filterIrp === type
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    {type === 'all' ? '전체' : type}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95">
                <Filter className="w-4 h-4" />
                필터
              </Button>
              <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" />
                내보내기
              </Button>
            </div>
          </div>

          {/* Quick Filters for Default Option */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'all', label: '전체 보기', color: 'primary' },
              { id: 'unset', label: '디폴트옵션 미설정', color: 'destructive' },
              { id: 'set', label: '설정 완료', color: 'emerald' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterDefault(filter.id as 'all' | 'set' | 'unset')}
                className={`px-4 py-2 rounded-xl text-sm border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  filterDefault === filter.id
                    ? filter.color === 'primary'
                      ? 'border-primary bg-primary/15 text-primary shadow-sm'
                      : filter.color === 'destructive'
                      ? 'border-destructive bg-destructive/15 text-destructive shadow-sm'
                      : 'border-emerald-500 bg-emerald-100 text-emerald-600 shadow-sm'
                    : 'border-white/50 bg-white/30 text-muted-foreground hover:border-primary/30 hover:bg-white/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">디폴트옵션</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">적립금</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, idx) => (
                  <tr
                    key={member.id}
                    className="border-b border-white/20 hover:bg-white/40 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${(idx + 3) * 50}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                          <span className="text-xs font-semibold text-primary">{member.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
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
                      {member.defaultOption === '미설정' ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-500 transition-all duration-300 hover:scale-105">
                          미설정
                        </span>
                      ) : member.defaultOption === '설정완료' ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-600 transition-all duration-300 hover:scale-105">
                          설정완료
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-foreground">{member.balance}원</td>
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
                ))}
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="defaultOption">디폴트옵션</Label>
                  <Select
                    value={editingMember.defaultOption}
                    onValueChange={(value) => setEditingMember({ ...editingMember, defaultOption: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="설정완료">설정완료</SelectItem>
                      <SelectItem value="미설정">미설정</SelectItem>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
    </div>
  )
}
