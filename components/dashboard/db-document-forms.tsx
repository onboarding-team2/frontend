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
  fileType: 'pdf' | 'hwp' | 'zip' | 'xls' | 'xlsm'
  downloadUrl: string
}

const categories = [
  { id: 'all', name: '전체', count: 15 },
  { id: 'join', name: '가입/신규 관련', count: 5 },
  { id: 'withdrawal', name: '인출/지급/퇴직', count: 6 },
  { id: 'change', name: '변경/이전 신청', count: 3 },
  { id: 'other', name: '기타/안내서', count: 1 },
]

const documents: Document[] = [
  { id: '1', name: '확정급여형DB 일괄 신규 서류 단면', description: 'DB형 퇴직연금 제도 최초 계약 시 필요한 신규 제출 서류 일체', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381941&fileName=확정급여형DB 일괄 신규 서류 단면 (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618404331281111952738878.pdf&category=AGREE_M_A' },
  { id: '2', name: '퇴직연금규약(변경) 신고방법 및 양서식', description: '퇴직연금 규약 신규 및 변경 신고 시 필요한 고용노동부 제출 서식 안내', category: 'change', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387581&fileName=퇴직연금규약(변경) 신고방법 및 양서식.zip&fullName=/fup/customer/form/2026040618353231280801009682128.zip&category=AGREE_M_A' },
  { id: '3', name: '(견본) (퇴직연금) 확정급여형(DB) 일괄 신규 서류', description: 'DB형 일괄 신규 계약 서류 작성법 참고용 가이드 견본 파일', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387972&fileName=(견본) (퇴직연금) 확정급여형(DB) 일괄 신규 서류 (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618454131281410348605755.pdf&category=AGREE_M_A' },
  { id: '4', name: '제도정보등록(변경)신청서 [DB／DC／기업형IRP]', description: 'DB형 기업 퇴직연금제도 마스터 정보 등록 및 변경용 신청서', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=388744&fileName=제도정보등록(변경)신청서[DB／DC／기업형IRP] (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618100531279274084590501.pdf&category=AGREE_M_A' },
  { id: '5', name: '확정급여형[DB] 퇴직연금 간편설명서', description: '확정급여형(DB) 제도의 특징 및 프로세스를 요약한 간편 매뉴얼', category: 'other', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409792&fileName=확정급여형[DB] 퇴직연금 간편설명서 (2026.2.2.).pdf&fullName=/fup/customer/form/2026052109020535134409182778355.pdf&category=AGREE_M_A' },
  { id: '6', name: '퇴직연금 통지서비스 신청서(개인, 기업)', description: '제도 관리 서비스 안내 및 운용보고서 통지를 위한 공통 신청서', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=360896&fileName=퇴직연금 통지서비스 신청서(개인, 기업).zip&fullName=/fup/customer/form/2026012916144625483554546459287.zip&category=AGREE_M_A' },
  { id: '7', name: '매수예정상품등록신청서 [공통]', description: 'DB형 적립금 부담금 예치 시 신규 매수할 운용상품 사전 등록 신청서', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381950&fileName=매수예정상품등록신청서[공통] (2025.9.1.).pdf&fullName=/fup/customer/form/2026013013352125560390022446789.pdf&category=AGREE_M_A' },
  { id: '8', name: '보유상품변경신청서 [공통]', description: 'DB형 신탁재산 적립금의 정기예금 등 보유 상품을 리밸런싱할 때 제출', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381953&fileName=보유상품변경신청서[공통] (2025.9.1.).pdf&fullName=/fup/customer/form/2026021117371626611719027983720.pdf&category=AGREE_M_A' },
  { id: '9', name: '(퇴직연금) 퇴직급여지급신청서 [DB]', description: 'DB형 제도 가입 법인에서 퇴직 근로자 발생 시 급여 지급을 요청하는 서류', category: 'withdrawal', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=1165&fileName=(퇴직연금) 퇴직급여지급신청서 [DB] (2025.6.9.).pdf&fullName=/fup/customer/form/202506090928115241557720990882.pdf&category=AGREE_M_A' },
  { id: '10', name: '확정급여형(DB)가입자추가서류', description: 'DB형 제도 하에 명부에 새로 등록될 사원 정보를 일괄 추가 제출하는 양식', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381951&fileName=확정급여형(DB)가입자추가서류.zip&fullName=/fup/customer/form/202503311459276792509196897572.zip&category=AGREE_M_A' },
  { id: '11', name: '확정급여형퇴직연금 규약', description: '확정급여형(DB) 표준 퇴직연금규약 서식 표준 양식', category: 'withdrawal', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387971&fileName=확정급여형퇴직연금 규약(2024.1.11).pdf&fullName=/fup/customer/form/2024011019171616060427310635574.pdf&category=withdrawal' },
  { id: '12', name: '퇴직자명부 일괄등록파일(신규계약용) [DB]', description: 'DB제도 최초 가입 시 전 임직원의 명부를 시스템에 일괄 등록하기 위한 엑셀 양식', category: 'withdrawal', fileType: 'xls', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409777&fileName=퇴직자명부 일괄등록파일(신규계약용) [DB] (2019.3).xls&fullName=/fup/customer/form/2026031016354928940832903476818.xls&category=AGREE_M_A' },
  { id: '13', name: '계약해지 신청서 [DB, DC, 기업형IRP]', description: 'DB형 제도를 폐지하거나 다른 제도로 변경 전환하기 위해 전체 해지 시 신청', category: 'withdrawal', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409793&fileName=계약해지 신청서[DB,DC,기업형IRP].zip&fullName=/fup/customer/form/2026031017363628944479967344468.zip&category=AGREE_M_A' },
  { id: '14', name: '무급부퇴직 일괄등록파일 (DB)', description: '퇴직금 정산 결과 지급할 급여가 없는 임직원 퇴직 처리를 위한 대량 업로드 엑셀 파일', category: 'withdrawal', fileType: 'xlsm', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409796&fileName=무급부퇴직 일괄등록파일 (DB).xlsm&fullName=/fup/customer/form/2026031017402128944705012675197.xlsm&category=AGREE_M_A' },
  { id: '15', name: '퇴직신청 일괄등록파일 (DB)', description: 'DB형 다수 임직원 퇴직 시 퇴직 프로세스를 일괄 처리하기 위한 대형 데이터 연동 파일', category: 'withdrawal', fileType: 'xlsm', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409797&fileName=퇴직신청 일괄등록파일 (DB).xlsm&fullName=/fup/customer/form/2026031017443328944956058205503.xlsm&category=AGREE_M_A' },
]

const getFileTypeStyle = (type: Document['fileType']) => {
  switch (type) {
    case 'pdf': return 'bg-red-100 text-red-500'
    case 'hwp': return 'bg-primary/15 text-primary'
    case 'zip': return 'bg-amber-100 text-amber-600'
    case 'xls': case 'xlsm': return 'bg-green-100 text-green-600'
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
                      {/* 1. 배지와 제목의 정렬을 위해 items-start로 변경하는 것이 좋습니다 */}
                      <div className="flex items-start gap-2 justify-between">
                        {/* 2. truncate를 제거하고 break-keep(단어 단위 줄바꿈)과 w-full 등을 적용 */}
                        <h3 className="font-semibold text-foreground break-keep whitespace-pre-wrap flex-1">
                          {doc.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase transition-transform duration-300 hover:scale-105 shrink-0 ${getFileTypeStyle(doc.fileType)}`}>
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
