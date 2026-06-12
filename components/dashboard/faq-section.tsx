'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, ChevronDown, ChevronRight, Folder, Sparkles, MessageCircleQuestion } from 'lucide-react'
import { useChat } from '@/lib/chat-context'
import { getFaqsByPlan, faqCategoryLabels, type FaqCategory } from '@/lib/faq-data'

interface FaqSectionProps {
  planType: 'DB' | 'DC'
}

export function FaqSection({ planType }: FaqSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const openChat = useChat()

  const faqs = useMemo(() => getFaqsByPlan(planType === 'DB' ? 'db' : 'dc'), [planType])

  const categories = useMemo(() => {
    const counts = faqs.reduce<Record<string, number>>((acc, faq) => {
      acc[faq.category] = (acc[faq.category] ?? 0) + 1
      return acc
    }, {})
    const list = (Object.keys(counts) as FaqCategory[]).map((id) => ({
      id,
      name: faqCategoryLabels[id],
      count: counts[id],
    }))
    return [{ id: 'all', name: '전체', count: faqs.length }, ...list]
  }, [faqs])

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.includes(searchTerm) ||
      faq.answer.includes(searchTerm) ||
      faq.keywords.some((k) => k.includes(searchTerm))
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">자주 묻는 질문 (FAQ)</h2>
            <p className="text-muted-foreground">{planType}형 퇴직연금 운영 시 주요 문의사항을 안내드립니다.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="glass border-0 animate-slide-up">
        <CardContent className="px-4 space-y-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="궁금한 내용을 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white/50 border-white/50 border border-blue-100/50 rounded-xl input-glow focus:bg-white/80 transition-all"
            />
          </div>
          <button
            onClick={openChat}
            className="flex items-center gap-2 text-sm px-3 py-2 border-slate-500/10 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all group self-start"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">원하는 답변을 찾지 못하셨다면?</span>
            <br />
            <span className="text-primary font-semibold">AI 챗봇에게 물어보기</span>
            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        {/* Categories Sidebar */}
        <Card className="glass border-0 lg:col-span-1 h-fit animate-slide-up gap-0 p-2">
          <CardHeader className="p-5 pb-1">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left group active:scale-[0.99] ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                  style={{ transitionDelay: `${idx * 30}ms` }}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-md transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-white/50 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between animate-slide-up">
            <p className="text-sm text-muted-foreground">
              총 <span className="text-foreground font-semibold">{filteredFaqs.length}</span>개의 질문
            </p>
          </div>

          {filteredFaqs.length === 0 ? (
            <Card className="glass border-0">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-2">
                <MessageCircleQuestion className="w-10 h-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.has(faq.id)
                return (
                  <Card key={faq.id} className="glass border-0 card-interactive overflow-hidden py-3 gap-0">
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full text-left p-5 flex items-start gap-4 py-3"
                      aria-expanded={isOpen}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 transition-transform duration-300">
                        <span className="text-primary font-bold">Q</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 justify-between">
                          <h3 className="font-semibold text-foreground break-keep flex-1">{faq.question}</h3>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-primary' : ''
                            }`}
                          />
                        </div>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                          {faqCategoryLabels[faq.category]}
                        </span>
                      </div>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-2 pl-[4.5rem]">
                          <div className="flex items-start gap-3 rounded-xl bg-white/40 p-4">
                            <span className="text-accent font-bold shrink-0">A</span>
                            <p className="text-sm text-muted-foreground leading-relaxed break-keep">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
