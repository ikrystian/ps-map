"use client"

import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"

export default function LawFirmMessagesPage() {
  return (
    <div id="tour-messages-container" className="space-y-6">
      <PageHeader
        title="Wiadomości"
        subtitle="Zarządzaj konwersacjami z klientami"
      />
      <EnhancedMessengerLayout />
    </div>
  )
}
