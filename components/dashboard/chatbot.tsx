'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authHeaders } from '@/lib/api'
import {
  X, Send, Bot, User, Sparkles, FileText, Download,
  ChevronDown, Minimize2, Maximize2,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  intent?: ChatIntent
  attachments?: { name: string; url: string }[]
}

type ChatIntent = 'faq' | 'regulation' | 'site_guide' | 'business_query' | 'forms' | 'general' | 'guardrail' | 'unknown'

interface ChatHistoryPayload {
  role: 'user' | 'assistant'
  content: string
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

type MessageSegment =
  | { kind: 'text'; text: string }
  | { kind: 'file'; label: string; url: string }

const INLINE_URL_RE = /(https?:\/\/[^\s)]+)/g

const intentLabels: Record<ChatIntent, string> = {
  faq: 'FAQ',
  regulation: '규정',
  site_guide: '사이트 안내',
  business_query: '업무 조회',
  forms: '양서식',
  general: '일반',
  guardrail: '가드레일',
  unknown: '분류 미확인',
}

const intentBadgeClass: Record<ChatIntent, string> = {
  faq: 'border-sky-200 bg-sky-50 text-sky-700',
  regulation: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  site_guide: 'border-violet-200 bg-violet-50 text-violet-700',
  business_query: 'border-amber-200 bg-amber-50 text-amber-700',
  forms: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  general: 'border-slate-200 bg-slate-50 text-slate-600',
  guardrail: 'border-rose-200 bg-rose-50 text-rose-700',
  unknown: 'border-slate-200 bg-slate-50 text-slate-500',
}

function normalizeIntent(value: unknown): ChatIntent {
  if (
    value === 'faq' ||
    value === 'regulation' ||
    value === 'site_guide' ||
    value === 'business_query' ||
    value === 'forms' ||
    value === 'general' ||
    value === 'guardrail'
  ) {
    return value
  }
  return 'unknown'
}

function buildChatHistory(messages: Message[]): ChatHistoryPayload[] {
  return messages
    .filter((message) => message.id !== '1')
    .map((message): ChatHistoryPayload => ({
      role: message.role === 'bot' ? 'assistant' : 'user',
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
}

/** href 로 안전하게 쓰도록 URL 안의 공백만 인코딩한다. (IBK 링크는 fileName 파라미터에 한글·공백이 그대로 들어있음) */
function toSafeHref(url: string): string {
  return url.trim().replace(/ /g, '%20')
}

/**
 * 봇 답변 본문을 파싱한다.
 * "http 로 시작하는 줄"은 바로 위의 파일명 줄을 라벨로 묶어 다운로드 카드로 만들고,
 * 나머지는 텍스트로 둔다. (양서식 답변: `N. 파일명`/`- 파일명` + 다음 줄 링크 형태)
 * URL 자체에 공백이 포함될 수 있으므로 \S+ 가 아니라 "줄 전체가 URL"로 판단한다.
 */
function parseMessageSegments(content: string): MessageSegment[] {
  const lines = content.split('\n')
  const segments: MessageSegment[] = []
  let textBuffer: string[] = []

  const flushText = () => {
    const text = textBuffer.join('\n').trim()
    if (text) segments.push({ kind: 'text', text })
    textBuffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!/^https?:\/\//.test(trimmed)) {
      textBuffer.push(line)
      continue
    }

    // 직전 비어있지 않은 줄을 파일 라벨로 끌어온다.
    let label = ''
    for (let j = textBuffer.length - 1; j >= 0; j -= 1) {
      if (textBuffer[j].trim()) {
        label = textBuffer[j].trim()
        textBuffer.splice(j, 1)
        break
      }
    }
    flushText()
    const cleanLabel = label.replace(/^(\d+\.\s*|[-•]\s*)/, '').trim() || '첨부 파일'
    segments.push({ kind: 'file', label: cleanLabel, url: trimmed })
  }

  flushText()
  return segments
}

/** **bold** 마크다운과 URL을 동시에 처리한다. */
const INLINE_SEGMENT_RE = /(\*\*[^*\n]+\*\*)|(https?:\/\/[^\s)]+)/g

function renderTextWithLinks(text: string) {
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  INLINE_SEGMENT_RE.lastIndex = 0
  while ((match = INLINE_SEGMENT_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      result.push(<strong key={match.index}>{match[1].slice(2, -2)}</strong>)
    } else if (match[2]) {
      result.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium underline underline-offset-2 hover:text-accent break-all"
        >
          {match[2]}
        </a>
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex))
  return result
}

function MessageContent({ content }: { content: string }) {
  const segments = parseMessageSegments(content)

  return (
    <div className="space-y-2">
      {segments.map((segment, index) =>
        segment.kind === 'file' ? (
          <a
            key={index}
            href={toSafeHref(segment.url)}
            target="_blank"
            rel="noopener noreferrer"
            title={segment.label}
            className="group flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/8 p-3 transition-all duration-300 hover:border-primary/40 hover:bg-primary/15 hover:shadow-md"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 break-words text-xs font-medium leading-snug text-foreground">
              {segment.label}
            </span>
            <Download className="h-4 w-4 shrink-0 text-primary/50 transition-colors group-hover:text-primary" />
          </a>
        ) : (
          <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed">
            {renderTextWithLinks(segment.text)}
          </p>
        ),
      )}
    </div>
  )
}

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isCheckingContext, setIsCheckingContext] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, isTyping, isCheckingContext])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const handleToggleExpanded = () => setIsExpanded((prev) => !prev)

  const appendBotMessage = (
    messageId: string,
    content: string,
    attachments?: { name: string; url: string }[],
    intent?: ChatIntent,
  ) => {
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === messageId)
      if (existing) {
        return prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content,
                intent: intent ?? m.intent,
                attachments: attachments ?? m.attachments,
              }
            : m,
        )
      }
      return [
        ...prev,
        {
          id: messageId,
          role: 'bot',
          content,
          timestamp: new Date(),
          intent,
          attachments,
        },
      ]
    })
  }

  const sendMessageToAi = async (userMessage: string, history: ChatHistoryPayload[]) => {
    setIsTyping(true)
    setIsCheckingContext(false)
    const botMessageId = `bot-${Date.now()}`
    let answer = ''
    let pendingLine = ''
    let intent: ChatIntent | undefined
    let hasFirstChunk = false

    const slowResponseTimer = window.setTimeout(() => {
      if (!hasFirstChunk) {
        setIsCheckingContext(true)
      }
    }, 2500)

    try {
      const response = await fetch(CHAT_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: userMessage, company_id: 'poc', history }),
      })

      if (!response.ok) throw new Error(`AI API returned ${response.status}`)
      if (!response.body) throw new Error('AI API response stream is empty.')

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
          if (payload.meta) {
            intent = normalizeIntent(payload.meta.intent)
            if (answer.trim()) appendBotMessage(botMessageId, answer, undefined, intent)
          }
          if (payload.t) {
            hasFirstChunk = true
            window.clearTimeout(slowResponseTimer)
            setIsCheckingContext(false)
            answer += payload.t
            appendBotMessage(botMessageId, answer, undefined, intent)
            setIsTyping(false)
          }
          if (payload.done) break
        }
      }

      if (pendingLine.trim()) {
        const payload = JSON.parse(pendingLine.trim().replace(/^data:\s*/, ''))
        if (payload.meta) intent = normalizeIntent(payload.meta.intent)
        if (payload.t) {
          hasFirstChunk = true
          window.clearTimeout(slowResponseTimer)
          setIsCheckingContext(false)
          answer += payload.t
        }
        appendBotMessage(
          botMessageId,
          answer,
          undefined,
          intent,
        )
      }

      if (!answer.trim()) {
        appendBotMessage(botMessageId, '응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.', undefined, intent)
      }
    } catch (error) {
      console.error(error)
      appendBotMessage(
        botMessageId,
        'AI 서버와 연결하지 못했습니다. AI 서버가 실행 중인지 확인해주세요.',
      )
    } finally {
      window.clearTimeout(slowResponseTimer)
      setIsCheckingContext(false)
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const history = buildChatHistory(messages)
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    sendMessageToAi(trimmed, history)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const history = buildChatHistory(messages)
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: suggestion, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    sendMessageToAi(suggestion, history)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Chat Window – RIGHT UI: solid white, real shadow, no backdrop */}
      <div
        className={`fixed z-50 flex flex-col transition-all duration-500 ease-out overflow-hidden border border-slate-200/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ${
          isExpanded
            ? 'inset-4 md:inset-6 rounded-3xl bg-white'
            : 'bottom-6 right-6 w-[420px] h-[650px] rounded-3xl bg-white'
        } max-h-[calc(100vh-2rem)]`}
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue transition-transform duration-300 hover:scale-105">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                AI 상담사
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-xs text-muted-foreground">
                {isTyping ? '입력 중...' : '항상 대기 중'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={isExpanded ? '기본 크기로' : '전체화면'}
              onClick={handleToggleExpanded}
              className="p-2.5 rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isExpanded
                ? <Minimize2 className="w-4 h-4 text-muted-foreground" />
                : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
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
                    {message.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`${isExpanded ? 'max-w-[82%]' : 'max-w-[75%]'} ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-50 text-foreground rounded-tl-sm border border-slate-200'
                    }`}>
                      {message.role === 'bot' ? (
                        <>
                          {message.intent && (
                            <div className="mb-2 flex justify-start">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${intentBadgeClass[message.intent]}`}>
                                의도: {intentLabels[message.intent]}
                              </span>
                            </div>
                          )}
                          <MessageContent content={message.content} />
                        </>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* 파일 첨부 (우측 UI) */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, i) => (
                          <a
                            key={i}
                            href={toSafeHref(attachment.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-all duration-300 text-left border border-primary/20 hover:shadow-md"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-xs text-foreground font-medium">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 animate-slide-up">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  {isCheckingContext ? (
                    <div className={`${isExpanded ? 'max-w-[82%]' : 'max-w-[75%]'} rounded-2xl rounded-tl-sm border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-sm`}>
                      <div className="flex items-start gap-3">
                        <span className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                          <span className="absolute h-3 w-3 rounded-full bg-primary/30 animate-ping" />
                          <span className="relative h-2 w-2 rounded-full bg-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-relaxed text-foreground">
                            정확한 답변을 위해 관련 자료를 확인하고 있습니다.
                          </p>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-sm border border-slate-200">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 자주 묻는 질문 – 메시지 2개 이하일 때만 표시 (우측 UI) */}
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
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isTyping}
                      className="px-3 py-2 text-xs bg-white/50 hover:bg-white/80 border border-white/50 rounded-xl text-foreground transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onSubmit={(e) => { e.preventDefault(); handleSend() }}
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
            </div>
      </div>
    </>
  )
}
