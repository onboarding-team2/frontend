'use client'

import { createContext, useContext } from 'react'

const ChatContext = createContext<(() => void) | null>(null)

export function ChatProvider({
  openChat,
  children,
}: {
  openChat: () => void
  children: React.ReactNode
}) {
  return <ChatContext.Provider value={openChat}>{children}</ChatContext.Provider>
}

export function useChat() {
  return useContext(ChatContext) ?? (() => {})
}
