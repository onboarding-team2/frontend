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
  { id: 'all', name: '전체', count: 22 },
  { id: 'join', name: '가입/신규 관련', count: 10 },
  { id: 'withdrawal', name: '인출/지급/퇴직', count: 4 },
  { id: 'change', name: '변경/이전 신청', count: 6 },
  { id: 'other', name: '기타/안내서', count: 2 },
]

const documents: Document[] = [
  { id: '1', name: '제도정보등록(변경)신청서 [표준형DC]', description: '표준형DC 퇴직연금 제도 정보 등록 및 변경 신청서', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409782&fileName=(퇴직연금) 제도정보등록(변경)신청서[표준형DC] (2025.4.1.).pdf&fullName=/fup/customer/form/2026031017104928942932143705443.pdf&category=AGREE_M_A' },
  { id: '2', name: '확정기여형DC 일괄 신규 서류 단면', description: 'DC형 퇴직연금 최초 도입 및 가입 시 필요한 일괄 신규 서류', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381942&fileName=확정기여형DC 일괄 신규 서류 단면 (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618370331280892033703195.pdf&category=AGREE_M_A' },
  { id: '3', name: '표준형확정기여형DC 일괄 신규 서류 단면', description: '표준형 DC제도 신규 가입 시 제출 서류', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381946&fileName=표준형확정기여형DC 일괄 신규 서류 단면 (2026.2.2.).pdf&fullName=/fup/customer/form/2026013014113125562559734707626.pdf&category=AGREE_M_A' },
  { id: '4', name: '확정기여형(DC) 가입자추가서류', description: '기존 DC형 제도에 신규 가입 가입자를 추가할 때 필요한 서식 모음', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381948&fileName=확정기여형(DC) 가입자추가서류.zip&fullName=/fup/customer/form/2026013014142325562731228076167.zip&category=AGREE_M_A' },
  { id: '5', name: '퇴직연금규약(변경) 신고방법 및 양서식', description: '퇴직연금 규약 제정 및 변경 신고 서식 안내', category: 'change', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387581&fileName=퇴직연금규약(변경) 신고방법 및 양서식.zip&fullName=/fup/customer/form/2026040618353231280801009682128.zip&category=AGREE_M_A' },
  { id: '6', name: '(퇴직연금) 확정기여형(DC) 규약일괄서류', description: 'DC형 퇴직연금 규약 신고를 위한 일괄 제출 서류', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387973&fileName=(퇴직연금) 확정기여형(DC) 규약일괄서류 (2026.2.2.).pdf&fullName=/fup/customer/form/2026013013544025561548947943195.pdf&category=AGREE_M_A' },
  { id: '7', name: '(견본) (퇴직연금) 확정기여형(DC) 일괄 신규 서류', description: 'DC형 일괄 신규 서류 작성 참고용 견본', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=387974&fileName=(견본) (퇴직연금) 확정기여형(DC) 일괄 신규 서류 (2026.2.2).pdf&fullName=/fup/customer/form/2026040618444731281356063212351.pdf&category=AGREE_M_A' },
  { id: '8', name: '제도정보등록(변경)신청서 [DB／DC／기업형IRP]', description: '제도 정보 신규 등록 및 정보 변경 신청서', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=388744&fileName=제도정보등록(변경)신청서[DB／DC／기업형IRP] (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618100531279274084590501.pdf&category=AGREE_M_A' },
  { id: '9', name: '(견본) (퇴직연금) 확정기여형DC 가입자추가 일괄서류', description: 'DC 가입자 추가 일괄 서류 작성 참고용 견본', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409772&fileName=(견본) (퇴직연금) 확정기여형DC 가입자추가 일괄서류 (2026.2.2.).pdf&fullName=/fup/customer/form/2026040618432431281272793688718.pdf&category=AGREE_M_A' },
  { id: '10', name: '확정기여형[DC] 퇴직연금 간편설명서', description: 'DC형 퇴직연금 제도의 핵심 내용을 담은 간편 설명서', category: 'other', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409780&fileName=확정기여형[DC] 퇴직연금 간편설명서 (2026.2.2.).pdf&fullName=/fup/customer/form/2026031017065628942699431696726.pdf&category=AGREE_M_A' },
  { id: '11', name: '퇴직연금 통지서비스 신청서(개인, 기업)', description: '퇴직연금 운용 및 대금 통지서비스 신청용 서식', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=360896&fileName=퇴직연금 통지서비스 신청서(개인, 기업).zip&fullName=/fup/customer/form/2026012916144625483554546459287.zip&category=AGREE_M_A' },
  { id: '12', name: '매수예정상품등록신청서 [공통]', description: '퇴직연금 부담금 입금 시 매수할 상품을 사전에 지정하는 신청서', category: 'join', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381950&fileName=매수예정상품등록신청서[공통] (2025.9.1.).pdf&fullName=/fup/customer/form/2026013013352125560390022446789.pdf&category=AGREE_M_A' },
  { id: '13', name: '보유상품변경신청서 [공통]', description: '현재 운용 중인 적립금의 상품을 변경(교체매매)하고자 할 때 제출', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381953&fileName=보유상품변경신청서[공통] (2025.9.1.).pdf&fullName=/fup/customer/form/2026021117371626611719027983720.pdf&category=AGREE_M_A' },
  { id: '14', name: '사전지정운용방법(디폴트옵션) 선정·변경신청서 [DC／IRP가입자용]', description: 'DC형 퇴직연금 사전지정운용제도(디폴트옵션) 신규 지정 및 변경 신청 서식', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=385169&fileName=사전지정운용방법(디폴트옵션) 선정·변경신청서[DC／IRP가입자용] (2025.9.1.).pdf&fullName=/fup/customer/form/2026013013353925560407473400445.pdf&category=AGREE_M_A' },
  { id: '15', name: '표준형 확정기여형[DC] 퇴직연금 간편설명서', description: '표준형 DC 가입자를 위한 간편 핵심 안내서', category: 'other', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409781&fileName=표준형 확정기여형[DC] 퇴직연금 간편설명서 (2025.9.1.).pdf&fullName=/fup/customer/form/2026031017085228942815154858384.pdf&category=AGREE_M_A' },
  { id: '16', name: '(퇴직연금) 퇴직급여지급신청서 [DC／기업형IRP]', description: 'DC형 가입 근로자 퇴직 시 퇴직급여 지급을 요청하는 신청서', category: 'withdrawal', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=381949&fileName=(퇴직연금) 퇴직급여지급신청서 [DC／기업형IRP] (2025.6.9.).pdf&fullName=/fup/customer/form/202506090931235241749786674449.pdf&category=AGREE_M_A' },
  { id: '17', name: '중도인출신청서 [DC／IRP]', description: '법정 중도인출 사유 해당 시 적립금 중도인출을 신청하는 서류', category: 'withdrawal', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=360889&fileName=중도인출신청서 [DC／IRP] (2025.05.30.).pdf&fullName=/fup/customer/form/2025082918205612271922843808474.pdf&category=AGREE_M_A' },
  { id: '18', name: '운용자산 매도순위 지정신청서 [공통]', description: '퇴직급여 지급이나 자산 교체 시 매도할 자산의 순위를 지정', category: 'change', fileType: 'pdf', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=385171&fileName=운용자산 매도순위 지정신청서[공통] (2025.4.1.).pdf&fullName=/fup/customer/form/202503311514036793385257082310.pdf&category=AGREE_M_A' },
  { id: '19', name: '(DC형) 규약 한글파일모음', description: 'DC형 퇴직연금 규약 작성을 위한 한글(HWP) 서식 모음 zip', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=389005&fileName=(DC형) 규약 한글파일모음.zip&fullName=/fup/customer/form/202503311510276793169402049658.zip&category=AGREE_M_A' },
  { id: '20', name: '퇴직신청 일괄등록파일 (DC, 기업IRP)', description: '대규모 인원 퇴직 시 일괄로 등록할 수 있는 엑셀(매크로) 파일', category: 'withdrawal', fileType: 'xlsm', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409798&fileName=퇴직신청 일괄등록파일 (DC, 기업IRP).xlsm&fullName=/fup/customer/form/2026031017450228944985683315031.xlsm&category=AGREE_M_A' },
  { id: '21', name: '확정기여형(DC) 부담금납입서류', description: '회차별 퇴직연금 부담금 산정 및 납입(등록) 요청 시 필요한 서식 모음', category: 'join', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=360891&fileName=확정기여형(DC)부담금납입서류(2023.2).zip&fullName=/fup/customer/form/2023021318434851563682628895365.zip&category=AGREE_M_A' },
  { id: '22', name: '계약해지 신청서 [DB, DC, 기업형IRP]', description: '퇴직연금 제도 자체를 해지하고자 할 때 제출하는 서류', category: 'withdrawal', fileType: 'zip', downloadUrl: 'https://www.ibk.co.kr/common/download.ibk?seq=409793&fileName=계약해지 신청서[DB,DC,기업형IRP].zip&fullName=/fup/customer/form/2026031017363628944479967344468.zip&category=AGREE_M_A' },
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
