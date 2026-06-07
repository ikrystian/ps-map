"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LawFirmMessageDetailsPage() {
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      router.replace(`/panel-eksperta/wiadomosci?conversationId=${id}`)
    }
  }, [id, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

