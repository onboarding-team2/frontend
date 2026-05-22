'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Send, Bot, User, Sparkles, FileText, ChevronDown, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  attachments?: { name: string; url: string }[]
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

const faqSuggestions = [
  '디폴트옵션이 뭔가요?',
  '부담금 납입 방법',
  '퇴직금 지급 절차',
  '가입자 추가 등록',
]

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'bot',
    content: '안녕하세요! IBK 퇴직연금 AI 상담사입니다.\n\n퇴직연금에 관해 궁금한 점이 있으시면 무엇이든 물어보세요. DC형, DB형 관련 질문, 양서식 안내, 기일 도래 알림 등 다양한 도움을 드릴 수 있습니다.',
    timestamp: new Date(),
  },
]

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      let response = ''
      let attachments: { name: string; url: string }[] = []

      if (userMessage.includes('디폴트옵션') || userMessage.includes('사전지정')) {
        response = '디폴트옵션(사전지정운용제도)은 DC형 퇴직연금에서 가입자가 별도의 운용 지시를 하지 않을 경우, 미리 정해진 방법으로 적립금을 운용하는 제도입니다.\n\n주요 특징:\n• 가입자의 운용 무관심으로 인한 손실 방지\n• 장기 안정적인 수익 추구\n• 고용노동부 승인 상품으로 안정성 확보\n\n디폴트옵션 지정이 필요하시면 아래 양식을 다운로드해주세요.'
        attachments = [{ name: '디폴트옵션 지정 신청서.pdf', url: '#' }]
      } else if (userMessage.includes('부담금') || userMessage.includes('납입')) {
        response = 'DC형 퇴직연금 부담금 납입에 대해 안내드립니다.\n\n납입 기한:\n• 연 1회 이상 납입이 원칙\n• 월별/분기별/연별 납입 선택 가능\n\n납입 방법:\n• 가상계좌 입금\n• 자동이체 설정\n• i-ONE Bank 기업뱅킹\n\n다음 납입 예정일: 2026-05-25\n예정 금액: 125,000,000원'
      } else if (userMessage.includes('퇴직금') || userMessage.includes('지급')) {
        response = '퇴직금 지급 절차를 안내드립니다.\n\n필요 서류:\n1. 퇴직급여 지급 신청서\n2. 퇴직증명서 또는 사직서 사본\n3. 신분증 사본\n\n처리 기간:\n• 서류 접수 후 14일 이내 지급\n\n아래에서 필요한 양식을 다운로드하세요.'
        attachments = [{ name: '퇴직급여 지급 신청서.pdf', url: '#' }]
      } else if (userMessage.includes('가입자') || userMessage.includes('등록')) {
        response = '신규 가입자 등록 방법을 안내드립니다.\n\n등록 절차:\n1. 가입자 추가 등록 신청서 작성\n2. 신규 직원 정보 입력\n3. 부담금 납입 계획 설정\n4. 디폴트옵션 지정 (DC형)\n\n필요한 서류를 첨부해드립니다.'
        attachments = [{ name: '가입자 추가 등록 신청서.hwp', url: '#' }]
      } else {
        response = '네, 말씀하신 내용을 확인했습니다.\n\n더 자세한 안내가 필요하시면 구체적인 상황을 알려주시거나, 아래 문의 채널을 이용해 주세요.\n\n고객센터: 1566-2566\n담당 지점: IBK 퇴직연금센터'
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: response,
        timestamp: new Date(),
        attachments,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    simulateBotResponse(inputValue)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    simulateBotResponse(suggestion)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className={`fixed z-50 glass-strong flex flex-col transition-all duration-500 ease-out ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-16 rounded-2xl'
          : 'bottom-4 right-4 w-[420px] h-[650px] rounded-3xl animate-scale-in'
      } max-h-[calc(100vh-2rem)] shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/30 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue transition-transform duration-300 hover:scale-105">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                AI 상담사
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </h3>
              <p className="text-xs text-muted-foreground">
                {isTyping ? '입력 중...' : '항상 대기 중'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2.5 rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4 text-muted-foreground" /> : <Minimize2 className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-slide-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-accent shadow-md'
                      : 'bg-gradient-to-br from-primary/20 to-accent/20'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm shadow-md'
                        : 'bg-white/70 text-foreground rounded-tl-sm border border-white/50'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-all duration-300 text-left border border-primary/20 hover:shadow-md hover-scale-sm"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-xs text-foreground font-medium">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 animate-slide-up">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="p-4 bg-white/70 rounded-2xl rounded-tl-sm border border-white/50">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  자주 묻는 질문
                </p>
                <div className="flex flex-wrap gap-2">
                  {faqSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 text-xs bg-white/50 hover:bg-white/80 border border-white/50 rounded-xl text-foreground transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-3"
              >
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 h-12 bg-white/50 border-white/50 rounded-xl input-glow focus:bg-white/80 transition-all"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                  className="btn-hover w-12 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shrink-0 shadow-lg glow-blue transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-3">
                i-ONE Bank 기업 퇴직연금 AI 상담
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
