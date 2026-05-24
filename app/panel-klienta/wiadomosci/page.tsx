"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"

export default function ClientMessagesPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-playfair tracking-tight">Wiadomości</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Komunikuj się z ekspertami w sprawie swoich zapytań
        </p>
      </div>
      <EnhancedMessengerLayout />
    </div>
  )
}
