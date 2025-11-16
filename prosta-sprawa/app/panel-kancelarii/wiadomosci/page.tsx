"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"

export default function LawFirmMessagesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wiadomości</h1>
      <EnhancedMessengerLayout />
    </div>
  )
}
