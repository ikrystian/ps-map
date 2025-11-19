/**
 * Centralized Type Exports
 *
 * This file re-exports all types from the types directory
 * to provide a single import point for all application types.
 *
 * Usage:
 * import type { Case, Offer, LawFirm, ChatMessage } from "@/types"
 */

// Case types
export type {
  CaseStatus,
  CaseBase,
  Case,
  CaseWithDetails,
  CaseReference,
} from "./cases"

// Category types
export type {
  CategoryBase,
  Category,
  CategoryWithChildren,
  CategoryReference,
} from "./categories"

// CMS types
export type {
  ModuleType,
  Module,
  ModuleForBuilder,
  PageModule,
  PageModuleForBuilder,
  Page,
  PageWithModules,
} from "./cms"

export {
  toModuleForBuilder,
  toPageModuleForBuilder,
} from "./cms"

// Conversation and messaging types
export type {
  ConversationClient,
  ConversationLawFirm,
  Conversation,
  ConversationDetails,
  MessageStatus,
  MessageAttachment,
  ChatMessage,
  EnhancedChatMessage,
  ConversationWithMessages,
  ConversationDetailsWithMessages,
} from "./conversations"

// Law firm types
export type {
  LawFirmBase,
  LawFirmWithLocation,
  LawFirm,
  LawFirmProfile,
  LawFirmReference,
} from "./lawfirms"

// Offer types
export type {
  OfferBase,
  OfferWithCase,
  OfferWithDetails,
  OfferReference,
  OffersResponse,
} from "./offers"
