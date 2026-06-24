/**
 * Centralized conversation and messaging types
 * Used across messaging components and API endpoints
 */

/**
 * User data for conversation participants
 */
export interface ConversationClient {
  id: string
  name: string
  image?: string
  email?: string
  createdAt?: string
  client: {
    imie: string
    nazwisko: string
    opis?: string
  }
}

export interface ConversationLawFirm {
  id: string
  name: string
  image?: string
  email?: string
  createdAt?: string
  lawFirm: {
    id: string
    nazwa: string
    nazwa?: string
    logo?: string
    opis?: string
  }
}

/**
 * Base conversation interface (for lists)
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

/**
 * Full conversation with complete participant data
 */
export interface ConversationDetails {
  id: string
  clientUser: ConversationClient
  lawFirmUser: ConversationLawFirm
}

/**
 * Message status types
 */
export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ" | "ERROR"

/**
 * Message attachment
 */
export interface MessageAttachment {
  url: string
  filename: string
  size: number
}

/**
 * Base message interface
 */
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
    role?: string
  }
}

/**
 * Extended message with status and attachments
 */
export interface EnhancedChatMessage extends ChatMessage {
  readAt?: string
  status: MessageStatus
  deliveredAt?: string
  attachments?: MessageAttachment[]
}

/**
 * Conversation with messages
 */
export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[]
}

/**
 * Full conversation details with messages
 */
export interface ConversationDetailsWithMessages extends ConversationDetails {
  messages: EnhancedChatMessage[]
}
