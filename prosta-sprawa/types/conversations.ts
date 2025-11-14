/**
 * Centralized conversation and messaging types
 * Used across messaging components and API endpoints
 */

export interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    image?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    isFromMe: boolean
    isRead: boolean
  } | null
  unreadCount: number
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  sender?: {
    id: string
    name: string
    image?: string
  }
}

export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[]
}
