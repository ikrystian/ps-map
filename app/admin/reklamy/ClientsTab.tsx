"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2, Check, CheckCircle2, Edit, Eye, FileText, Loader2, Mail,
  MousePointerClick, Percent, Phone, Plus, Search,
  Trash2, User,
} from "lucide-react"
import { useState } from "react"
import type { AdClient } from "./types"

interface ClientsTabProps {
  clients: AdClient[]
  onRefresh: () => void
}

export function ClientsTab({ clients, onRefresh }: ClientsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<AdClient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "", contactName: "", contactEmail: "", contactPhone: "", notes: "", active: true,
  })

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contactName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openDialog = (client?: AdClient) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        contactName: client.contactName || "",
        contactEmail: client.contactEmail || "",
        contactPhone: client.contactPhone || "",
        notes: client.notes || "",
        active: client.active,
      })
    } else {
      setEditingClient(null)
      setFormData({ name: "", contactName: "", contactEmail: "", contactPhone: "", notes: "", active: true })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.error("Nazwa klienta jest wymagana"); return }

    setIsSubmitting(true)
    const payload = {
      name: formData.name.trim(),
      contactName: formData.contactName.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      contactPhone: formData.contactPhone.trim() || null,
      notes: formData.notes.trim() || null,
      active: formData.active,
    }

    try {
      const url = editingClient ? `/api/admin/ad-clients/${editingClient.id}` : "/api/admin/ad-clients"
      const method = editingClient ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || "Błąd zapisu")
      toast.success(editingClient ? "Zapisano zmiany klienta" : "Dodano nowego klienta")
      setIsDialogOpen(false)
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć klienta? Reklamy zostaną odpięte.")) return
    try {
      const res = await fetch(`/api/admin/ad-clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Klient usunięty")
      onRefresh()
    } catch {
      toast.error("Nie udało się usunąć klienta")
    }
  }

  const getClientStats = (client: AdClient) => {
    const ads = client.ads || []
    const impressions = ads.reduce((s, a) => s + a.impressions, 0)
    const clicks = ads.reduce((s, a) => s + a.clicks, 0)
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const activeAds = ads.filter(a => a.active).length
    return { impressions, clicks, ctr, activeAds, total: ads.length }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj klienta..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => openDialog()} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Dodaj klienta
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="font-semibold text-lg">Brak klientów reklamowych</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {searchQuery ? "Brak wyników." : "Dodaj pierwszego klienta reklamowego, aby zarządzać kampaniami."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => {
            const stats = getClientStats(client)
            return (
              <Card key={client.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${client.active ? "bg-primary" : "bg-muted"}`} />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{client.name}</h3>
                      {client.contactName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" /> {client.contactName}
                        </p>
                      )}
                    </div>
                    <Badge variant={client.active ? "default" : "secondary"} className="shrink-0 text-xs">
                      {client.active ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-4">
                    {client.contactEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{client.contactEmail}</span>
                      </p>
                    )}
                    {client.contactPhone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {client.contactPhone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border mb-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mb-0.5">
                        <Eye className="h-3 w-3" /> Wyśw.
                      </p>
                      <p className="font-bold text-sm">{stats.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mb-0.5">
                        <MousePointerClick className="h-3 w-3" /> Klik.
                      </p>
                      <p className="font-bold text-sm">{stats.clicks.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mb-0.5">
                        <Percent className="h-3 w-3" /> CTR
                      </p>
                      <p className="font-bold text-sm text-primary">{stats.ctr.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Reklamy: <strong>{stats.activeAds}</strong>/{stats.total} aktywne
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-border shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Header z tłem akcentowym */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-sm shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {editingClient ? "Edytuj klienta" : "Dodaj klienta reklamowego"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    {editingClient
                      ? "Zaktualizuj dane kontaktowe i ustawienia konta klienta."
                      : "Wprowadź dane identyfikacyjne nowego reklamodawcy."}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Treść formularza */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Sekcja 1: Identyfikacja */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>Dane identyfikacyjne</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="client-name" className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>Nazwa klienta / firmy <span className="text-destructive">*</span></span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="client-name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="np. Kancelaria Kowalski & Wspólnicy"
                      className="pl-9 bg-background/50 focus:bg-background transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sekcja 2: Dane kontaktowe */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Osoba kontaktowa i dane</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="contact-name" className="text-xs font-medium">Osoba kontaktowa</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-name"
                        value={formData.contactName}
                        onChange={e => setFormData(p => ({ ...p, contactName: e.target.value }))}
                        placeholder="Jan Kowalski"
                        className="pl-9 bg-background/50 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-medium">Adres e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.contactEmail}
                        onChange={e => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                        placeholder="kontakt@firma.pl"
                        className="pl-9 bg-background/50 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone" className="text-xs font-medium">Numer telefonu</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-phone"
                        value={formData.contactPhone}
                        onChange={e => setFormData(p => ({ ...p, contactPhone: e.target.value }))}
                        placeholder="+48 123 456 789"
                        className="pl-9 bg-background/50 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja 3: Notatki */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="client-notes" className="text-xs font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Notatki wewnętrzne
                </Label>
                <Textarea
                  id="client-notes"
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Wpisz istotne informacje dotyczące umowy, ustaleń lub preferencji klienta..."
                  className="h-20 bg-background/50 focus:bg-background transition-colors resize-none text-xs"
                />
              </div>

              {/* Sekcja 4: Status aktywacji */}
              <div className="pt-2">
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  formData.active
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/40 border-border"
                }`}>
                  <div className="space-y-0.5">
                    <Label htmlFor="client-active" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${formData.active ? "text-primary" : "text-muted-foreground"}`} />
                      Klient aktywny
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.active
                        ? "Reklamy tego klienta będą mogły być emitowane na portalu."
                        : "Konto wyłączone – wszystkie kampanie tego klienta zostaną wstrzymane."}
                    </p>
                  </div>
                  <Switch
                    id="client-active"
                    checked={formData.active}
                    onCheckedChange={v => setFormData(p => ({ ...p, active: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-muted/30 border-t border-border/80 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-5">
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-5 gap-2 font-medium">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    {editingClient ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingClient ? "Zapisz zmiany" : "Dodaj klienta"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
