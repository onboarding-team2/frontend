'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Send, Bot, User, Sparkles, ChevronDown, Minimize2, Maximize2, Expand, Shrink } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  relatedQuestions?: string[]
}

interface ChatSource {
  type?: string
  id?: string
  title?: string
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

const CHAT_STREAM_URL =
  process.env.NEXT_PUBLIC_CHAT_STREAM_URL ?? 'http://127.0.0.1:8002/api/chat/stream'

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
  const [isExpanded, setIsExpanded] = useState(false)
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

  const handleToggleMinimized = () => {
    setIsMinimized((prev) => !prev)
  }

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev)
    setIsMinimized(false)
  }

  const appendBotMessage = (
    messageId: string,
    content: string,
    sources?: ChatSource[],
    currentQuestion?: string,
  ) => {
    setMessages((prev) => {
      const relatedQuestions = sources
        ?.filter((source) => source.type === 'FAQ' && source.title && source.title !== currentQuestion)
        .map((source) => source.title as string)
      const existingMessage = prev.find((message) => message.id === messageId)

      if (existingMessage) {
        return prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content,
                relatedQuestions: relatedQuestions ?? message.relatedQuestions,
              }
            : message,
        )
      }

      return [
        ...prev,
        {
          id: messageId,
          role: 'bot',
          content,
          timestamp: new Date(),
          relatedQuestions,
        },
      ]
    })
  }

  const sendMessageToAi = async (userMessage: string) => {
    setIsTyping(true)
    const botMessageId = `bot-${Date.now()}`
    let answer = ''
    let pendingLine = ''

    try {
      const response = await fetch(CHAT_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          company_id: 'poc',
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API returned ${response.status}`)
      }

      if (!response.body) {
        throw new Error('AI API response stream is empty.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        pendingLine += decoder.decode(value, { stream: true })
        const lines = pendingLine.split('\n')
        pendingLine = lines.pop() ?? ''

        for (const rawLine of lines) {
          const line = rawLine.trim().replace(/^data:\s*/, '')
          if (!line) continue

          const payload = JSON.parse(line)

          if (payload.t) {
            answer += payload.t
            appendBotMessage(botMessageId, answer)
            setIsTyping(false)
          }

          if (payload.sources) {
            appendBotMessage(botMessageId, answer, payload.sources, userMessage)
          }

          if (payload.done) {
            break
          }
        }
      }

      if (pendingLine.trim()) {
        const payload = JSON.parse(pendingLine.trim().replace(/^data:\s*/, ''))
        if (payload.t) {
          answer += payload.t
        }
        appendBotMessage(botMessageId, answer, payload.sources, userMessage)
      }

      if (!answer.trim()) {
        appendBotMessage(botMessageId, '응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error(error)
      appendBotMessage(
        botMessageId,
        'AI 서버와 연결하지 못했습니다. AI 서버가 실행 중인지, NEXT_PUBLIC_CHAT_STREAM_URL 설정이 맞는지 확인해주세요.',
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    const trimmedMessage = inputValue.trim()
    if (!trimmedMessage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    sendMessageToAi(trimmedMessage)
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
    sendMessageToAi(suggestion)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 animate-fade-in ${isExpanded ? 'bg-foreground/70' : ''}`}
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className={`fixed z-50 glass-strong flex flex-col transition-all duration-500 ease-out ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-16 rounded-2xl'
          : isExpanded
            ? 'inset-4 md:inset-6 rounded-3xl animate-scale-in'
            : 'bottom-4 right-4 w-[min(calc(100vw-2rem),520px)] h-[min(calc(100vh-2rem),760px)] rounded-3xl animate-scale-in'
      } shadow-2xl`}>
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
            {!isMinimized && (
              <button
                type="button"
                title={isExpanded ? '창 크기 줄이기' : '전체화면으로 보기'}
                onClick={handleToggleExpanded}
                className="p-2.5 rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isExpanded ? <Shrink className="w-4 h-4 text-muted-foreground" /> : <Expand className="w-4 h-4 text-muted-foreground" />}
              </button>
            )}
            <button
              type="button"
              title={isMinimized ? '창 열기' : '창 접기'}
              onClick={handleToggleMinimized}
              className="p-2.5 rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4 text-muted-foreground" /> : <Minimize2 className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button
              type="button"
              title="닫기"
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
                  <div className={`${isExpanded ? 'max-w-[82%]' : 'max-w-[78%]'} ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm shadow-md'
                        : 'bg-white/70 text-foreground rounded-tl-sm border border-white/50'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-muted-foreground text-left">관련 질문</p>
                        {message.relatedQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(question)}
                            disabled={isTyping}
                            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-left transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            <span className="truncate text-xs text-foreground">{question}</span>
                          </button>
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
            <div className="px-4 py-3 border-t border-white/30 bg-white/35">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <ChevronDown className="w-3 h-3" />
                자주 묻는 질문
              </p>
              <div className="flex flex-wrap gap-2">
                {faqSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="px-3 py-2 text-xs bg-white/70 hover:bg-white/95 border border-white/70 rounded-xl text-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/30 bg-white/40">
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
                IBK 퇴직연금 관리시스템
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
