"use client"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SurveyToggle({ id, aktywna }: { id: string; aktywna: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(aktywna)

  const toggle = async () => {
    setLoading(true)
    const next = !value
    try {
      const res = await fetch(`/api/admin/ankiety/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktywna: next }),
      })
      if (!res.ok) throw new Error()
      setValue(next)
      toast.success(next ? "Ankieta aktywowana" : "Ankieta dezaktywowana")
      router.refresh()
    } catch {
      toast.error("Błąd podczas zmiany statusu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Switch checked={value} onCheckedChange={toggle} disabled={loading} />
      <Badge variant={value ? "default" : "secondary"} className="w-20 justify-center">
        {value ? "Aktywna" : "Nieaktywna"}
      </Badge>
    </div>
  )
}
