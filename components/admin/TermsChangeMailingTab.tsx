"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, Send } from "lucide-react"
import { useEffect, useState } from "react"

type Audience = "ALL" | "CLIENT" | "LAW_FIRM"

const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL: "Wszyscy użytkownicy",
  CLIENT: "Tylko klienci",
  LAW_FIRM: "Tylko eksperci",
}

/**
 * Ręczna wysyłka maila ZMIANA_REGULAMINU do użytkowników. Maile trafiają do kolejki
 * (zakładka „Zaplanowane”) i wychodzą paczkami co minutę.
 */
export default function TermsChangeMailingTab() {
  const [counts, setCounts] = useState<Record<Audience, number> | null>(null)
  const [templateActive, setTemplateActive] = useState(true)
  const [dataWejscia, setDataWejscia] = useState("")
  const [podsumowanieZmian, setPodsumowanieZmian] = useState("")
  const [odbiorcy, setOdbiorcy] = useState<Audience>("ALL")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/admin/emails/terms-change")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setCounts(data.counts)
        setTemplateActive(data.templateActive)
      })
      .catch(() => toast.error("Nie udało się pobrać liczby odbiorców"))
  }, [])

  const recipientCount = counts?.[odbiorcy] ?? 0

  const handleSend = async () => {
    if (!confirm(`Wysłać informację o zmianie regulaminu do ${recipientCount} odbiorców? Tej operacji nie da się cofnąć.`)) {
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/emails/terms-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataWejscia, podsumowanieZmian, odbiorcy }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Nie udało się zaplanować wysyłki")
      toast.success(`Zaplanowano ${data.queued} maili. Postęp w zakładce „Zaplanowane”.`)
      setPodsumowanieZmian("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaplanować wysyłki")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacja o zmianie regulaminu</CardTitle>
        <CardDescription>
          Wysyła szablon „Zmiana regulaminu” do wybranych użytkowników. Treść maila edytujesz w zakładce Szablony;
          tutaj podajesz datę i podsumowanie zmian.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 max-w-2xl">
        {!templateActive && (
          <div className="flex gap-2 rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Szablon „Zmiana regulaminu” nie istnieje albo jest wyłączony — wysyłka jest niemożliwa.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="terms-date">Data wejścia zmian w życie</Label>
          <Input
            id="terms-date"
            type="date"
            value={dataWejscia}
            onChange={(e) => setDataWejscia(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms-summary">Podsumowanie najważniejszych zmian</Label>
          <Textarea
            id="terms-summary"
            rows={6}
            value={podsumowanieZmian}
            onChange={(e) => setPodsumowanieZmian(e.target.value)}
            placeholder="Każda zmiana w osobnej linii"
          />
          <p className="text-xs text-muted-foreground">Trafia do maila w miejsce {"{podsumowanieZmian}"}. Nowe linie zostają zachowane.</p>
        </div>

        <div className="space-y-2">
          <Label>Odbiorcy</Label>
          <Select value={odbiorcy} onValueChange={(value) => setOdbiorcy(value as Audience)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {AUDIENCE_LABELS[key]}
                  {counts ? ` (${counts[key]})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSend}
          disabled={submitting || !templateActive || !dataWejscia || !podsumowanieZmian.trim() || recipientCount === 0}
        >
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Wyślij do {recipientCount} odbiorców
        </Button>
      </CardContent>
    </Card>
  )
}
