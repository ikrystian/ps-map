"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"

export default function ClientMessagesPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Wiadomości</h1>
      <EnhancedMessengerLayout />
    </div>
  )
}
