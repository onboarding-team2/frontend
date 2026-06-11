'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileText, Download, ExternalLink, Folder, ChevronRight, Sparkles } from 'lucide-react'

interface Document {
  id: string
  name: string
  description: string
  category: string
  fileType: 'pdf' | 'hwp' | 'doc'
  downloadUrl: string
}

const categories = [
  { id: 'all', name: '전체', count: 12 },
  { id: 'join', name: '가입 관련', count: 4 },
  { id: 'withdrawal', name: '인출/지급', count: 3 },
  { id: 'change', name: '변경 신청', count: 3 },
  { id: 'other', name: '기타', count: 2 },
]

const documents: Document[] = [
  { id: '1', name: '퇴직연금 가입신청서', description: 'DC형/DB형 퇴직연금 최초 가입 시 필요한 서류', category: 'join', fileType: 'pdf', downloadUrl: '#' },
  { id: '2', name: '가입자 추가 등록 신청서', description: '신규 직원 퇴직연금 가입 등록 시 필요', category: 'join', fileType: 'hwp', downloadUrl: '#' },
  { id: '3', name: '규약 변경 신청서', description: '퇴직연금 규약 내용 변경 시 제출', category: 'change', fileType: 'pdf', downloadUrl: '#' },
  { id: '4', name: '디폴트옵션 지정 신청서', description: 'DC형 사전지정운용제도 지정 신청', category: 'join', fileType: 'pdf', downloadUrl: '#' },
  { id: '5', name: '퇴직급여 지급 신청서', description: '퇴직자 퇴직금 지급 요청 시 사용', category: 'withdrawal', fileType: 'pdf', downloadUrl: '#' },
  { id: '6', name: '중도인출 신청서', description: 'DC형 중도인출 신청 시 필요', category: 'withdrawal', fileType: 'hwp', downloadUrl: '#' },
  { id: '7', name: '계약이전 신청서', description: '타 금융기관으로 퇴직연금 이전 시', category: 'change', fileType: 'pdf', downloadUrl: '#' },
  { id: '8', name: '부담금 납입 변경 신청서', description: '부담금 납입 일정 및 금액 변경', category: 'change', fileType: 'hwp', downloadUrl: '#' },
  { id: '9', name: '일시금 지급 신청서', description: '퇴직연금 일시금 지급 신청', category: 'withdrawal', fileType: 'pdf', downloadUrl: '#' },
  { id: '10', name: '운용지시서', description: 'DC형 운용 상품 변경 지시', category: 'other', fileType: 'pdf', downloadUrl: '#' },
  { id: '11', name: '대리인 지정 신청서', description: '퇴직연금 업무 대리인 지정', category: 'join', fileType: 'hwp', downloadUrl: '#' },
  { id: '12', name: '퇴직연금 해지 신청서', description: '퇴직연금 제도 해지 시 필요', category: 'other', fileType: 'pdf', downloadUrl: '#' },
]

const getFileTypeStyle = (type: Document['fileType']) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-500'
    case 'hwp':
      return 'bg-primary/15 text-primary'
    case 'doc':
      return 'bg-sky-100 text-sky-500'
  }
}

export function DocumentForms() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.includes(searchTerm) || doc.description.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">퇴직연금 양서식</h2>
            <p className="text-muted-foreground">필요한 서류를 검색하고 다운로드하세요</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 border-white/50 bg-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95" asChild>
          <a href="https://www.ibk.co.kr/agree/listAgree.ibk?pageId=CM01030100&category=T&clsfcd=A" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            IBK 공식 양식
          </a>
        </Button>
      </div>

      {/* Search */}
      <Card className="glass border-0 animate-slide-up">
        <CardContent className="p-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="서류 이름 또는 설명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white/50 border-white/50 rounded-xl input-glow focus:bg-white/80 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="glass border-0 lg:col-span-1 h-fit animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary" />
              카테고리
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <nav className="space-y-1">
              {categories.map((category, idx) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`menu-item w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'active bg-gradient-to-r from-primary to-accent text-white shadow-md'
                      : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
                  }`}
                  style={{ transitionDelay: `${idx * 30}ms` }}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-md transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/50 text-muted-foreground'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between animate-slide-up">
            <p className="text-sm text-muted-foreground">
              총 <span className="text-foreground font-semibold">{filteredDocuments.length}</span>개의 서류
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc, idx) => (
              <Card 
                key={doc.id} 
                className="glass border-0 card-interactive"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase transition-transform duration-300 hover:scale-105 ${getFileTypeStyle(doc.fileType)}`}>
                          {doc.fileType}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                      <Button variant="link" className="px-0 h-auto mt-3 text-primary transition-all duration-300 hover:gap-2" asChild>
                        <a href={doc.downloadUrl} download>
                          <Download className="w-4 h-4 mr-1" />
                          다운로드
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot CTA */}
      <Card className="glass border-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 hover-lift animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-float glow-blue">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">필요한 서류를 찾기 어려우신가요?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI 챗봇에게 상황을 설명하시면 필요한 양식을 안내해드립니다
                </p>
              </div>
            </div>
            <Button className="btn-hover bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2 shrink-0 px-6 shadow-lg glow-blue transition-all duration-300 hover:scale-105 active:scale-95">
              챗봇 상담하기
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
