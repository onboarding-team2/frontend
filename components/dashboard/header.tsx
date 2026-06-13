'use client'

import { MessageCircle, Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onChatOpen: () => void
}

export function Header({ onChatOpen }: HeaderProps) {
  return (
    <header className="glass-strong border-b border-white/30 px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Chat Button - Highlighted */}
          <Button
            onClick={onChatOpen}
            className="btn-hover bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2 px-5 h-11 rounded-xl shadow-lg glow-blue transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">AI 상담</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
