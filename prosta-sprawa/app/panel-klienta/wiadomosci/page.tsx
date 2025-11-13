"use client"

import { MessengerLayout } from "@/components/messages/MessengerLayout"

export default function ClientMessagesPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Wiadomości</h1>
      <MessengerLayout />
    </div>
  )
}
