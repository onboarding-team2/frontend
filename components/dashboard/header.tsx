'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, MessageCircle, Menu, Search, Sparkles, Check, AlertTriangle, Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  onChatOpen: () => void
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: 'urgent' | 'warning' | 'info'
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'DC형 부담금 납입 기한 임박',
    description: '5월 정기 부담금 납입 기한이 6일 남았습니다.',
    time: '10분 전',
    type: 'urgent',
    read: false,
  },
  {
    id: '2',
    title: '디폴트옵션 미설정 알림',
    description: '2명의 가입자가 디폴트옵션 미설정 상태입니다.',
    time: '1시간 전',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'DB형 추계액 산정 안내',
    description: '상반기 추계액 산정 기한이 27일 남았습니다.',
    time: '3시간 전',
    type: 'info',
    read: true,
  },
  {
    id: '4',
    title: '신규 가입자 등록 완료',
    description: '홍길동님의 퇴직연금 가입이 완료되었습니다.',
    time: '어제',
    type: 'info',
    read: true,
  },
]

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'urgent':
      return AlertTriangle
    case 'warning':
      return Clock
    default:
      return Info
  }
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'urgent':
      return 'bg-red-100 text-red-500'
    case 'warning':
      return 'bg-amber-100 text-amber-600'
    default:
      return 'bg-primary/15 text-primary'
  }
}

export function Header({ onChatOpen }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <header className="glass-strong border-b border-white/30 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="pl-11 h-11 bg-white/50 border-white/50 rounded-xl input-glow focus:bg-white/80 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 rounded-xl bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 glass-strong rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-50 animate-scale-in">
                <div className="p-4 border-b border-white/30 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">알림</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      모두 읽음
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      알림이 없습니다
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      const iconStyles = getNotificationStyles(notification.type)
                      return (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 border-b border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/50 ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyles}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                              <p className="text-xs text-muted-foreground/60 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-3 border-t border-white/30">
                  <button className="w-full text-center text-sm text-primary hover:underline py-2">
                    모든 알림 보기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Button - Highlighted */}
          <Button
            onClick={onChatOpen}
            className="btn-hover bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2 px-5 h-11 rounded-xl shadow-lg glow-blue transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">AI 상담</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
