"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Send,
  Settings,
  Trash2
} from "lucide-react"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface EmailTemplate {
  id: string
  nazwa: string
  temat: string
  tresc: string
  trescHtml: string
  typ: string
  aktywny: boolean
  triggery: string[]
  zmienne: string[]
  opisZmiennych: Record<string, string>
  createdAt: string
  updatedAt: string
}

const emailTypes = [
  { value: "NOWA_SPRAWA", label: "Nowa sprawa" },
  { value: "NOWA_OFERTA", label: "Nowa oferta" },
  { value: "AKCEPTACJA_OFERTY", label: "Akceptacja oferty" },
  { value: "ODRZUCENIE_OFERTY", label: "Odrzucenie oferty" },
  { value: "NOWA_WIADOMOSC", label: "Nowa wiadomość" },
  { value: "NOWA_OPINIA", label: "Nowa opinia" },
  { value: "REJESTRACJA_KLIENT", label: "Rejestracja - klient" },
  { value: "REJESTRACJA_KANCELARIA", label: "Rejestracja - ekspert" },
  { value: "RESET_HASLA", label: "Reset hasła" },
  { value: "POTWIERDZENIE_EMAIL", label: "Potwierdzenie email" },
  { value: "PLATNOSC_POTWIERDZONA", label: "Płatność potwierdzona" },
  { value: "SUBSKRYPCJA_WYGASA", label: "Subskrypcja wygasa" },
  { value: "NISKI_STAN_PUNKTOW", label: "Niski stan punktów" },
  { value: "POTWIERDZENIE_DODANIA_SPRAWY", label: "Potwierdzenie dodania sprawy (klient)" },
  { value: "SUBSKRYPCJA_KONIEC", label: "Koniec subskrypcji" },
  { value: "PROSBA_O_OCENE", label: "Prośba o ocenę po 3 dniach" },
  { value: "NOWA_KONSULTACJA", label: "Konsultacja - nowa prośba (ekspert)" },
  { value: "KONSULTACJA_ZAAKCEPTOWANA", label: "Konsultacja - zaakceptowana (klient)" },
  { value: "KONSULTACJA_ZAAKCEPTOWANA_EKSPERT", label: "Konsultacja - potwierdzenie akceptacji (ekspert)" },
  { value: "KONSULTACJA_ODRZUCONA", label: "Konsultacja - odrzucona (klient)" },
  { value: "KONSULTACJA_ZAPLACONA", label: "Konsultacja - płatność potwierdzona (klient)" },
  { value: "KONSULTACJA_ANULOWANA", label: "Konsultacja - anulowana" },
  { value: "PRZYPOMNIENIE_KONSULTACJI", label: "Konsultacja - przypomnienie (1h przed)" },
  { value: "LINK_KONSULTACJI", label: "Konsultacja - link Google Meet (5 min przed)" },
  { value: "CUSTOM", label: "Własny szablon" },
]

const availableVariables: Record<string, string[]> = {
  NOWA_SPRAWA: ["{ekspert}", "{nazwaSprawi}", "{kategoria}", "{klient}", "{budżet}", "{linkDoPanelu}"],
  NOWA_OFERTA: ["{klient}", "{ekspert}", "{nazwaSprawi}", "{kwota}", "{termin}", "{linkDoPanelu}"],
  AKCEPTACJA_OFERTY: ["{ekspert}", "{klient}", "{nazwaSprawi}", "{kwota}", "{emailKlienta}", "{telefonKlienta}", "{linkDoPanelu}"],
  ODRZUCENIE_OFERTY: ["{ekspert}", "{klient}", "{nazwaSprawi}", "{linkDoSpraw}"],
  NOWA_WIADOMOSC: ["{odbiorca}", "{nadawca}", "{fragmentWiadomosci}", "{linkDoWiadomosci}"],
  NOWA_OPINIA: ["{ekspert}", "{klient}", "{ocena}", "{komentarz}", "{linkDoProfilu}"],
  REJESTRACJA_KLIENT: ["{imie}", "{nazwisko}", "{email}", "{linkDodajSprawa}"],
  REJESTRACJA_KANCELARIA: ["{nazwa}", "{email}", "{nip}", "{linkDoPanelu}"],
  RESET_HASLA: ["{email}", "{linkResetHasla}"],
  POTWIERDZENIE_EMAIL: ["{imie}", "{email}", "{linkPotwierdzenia}", "{kod}"],
  PLATNOSC_POTWIERDZONA: ["{ekspert}", "{numerZamowienia}", "{produkt}", "{kwota}", "{data}", "{szczegoly}", "{linkDoFaktury}"],
  SUBSKRYPCJA_WYGASA: ["{ekspert}", "{nazwaSubskrypcji}", "{dniDoWygasniecia}", "{dataWygasniecia}", "{listaFunkcji}", "{linkDoPakietow}"],
  NISKI_STAN_PUNKTOW: ["{ekspert}", "{aktualnyStanPunktow}", "{linkDoSklepu}"],
  POTWIERDZENIE_DODANIA_SPRAWY: ["{klient}", "{nazwaSprawy}", "{kategoria}", "{budzet}", "{linkDoSprawy}"],
  SUBSKRYPCJA_KONIEC: ["{ekspert}", "{nazwaSubskrypcji}", "{dataWygasniecia}", "{linkDoPakietow}"],
  PROSBA_O_OCENE: ["{klient}", "{ekspert}", "{linkDoOceny}"],
  NOWA_KONSULTACJA: ["{ekspert}", "{klient}", "{temat}", "{czas}", "{termin}", "{linkDoPanelu}"],
  KONSULTACJA_ZAAKCEPTOWANA: ["{klient}", "{ekspert}", "{termin}", "{linkDoPanelu}"],
  KONSULTACJA_ZAAKCEPTOWANA_EKSPERT: ["{ekspert}", "{klient}", "{termin}", "{linkDoPanelu}"],
  KONSULTACJA_ODRZUCONA: ["{klient}", "{ekspert}", "{linkDoPanelu}"],
  KONSULTACJA_ZAPLACONA: ["{klient}", "{ekspert}", "{linkDoPanelu}"],
  KONSULTACJA_ANULOWANA: ["{odbiorca}", "{inicjator}", "{linkDoPanelu}"],
  PRZYPOMNIENIE_KONSULTACJI: ["{odbiorca}", "{ekspert}", "{klient}", "{termin}", "{linkDoSpotkania}", "{linkDoPanelu}"],
  LINK_KONSULTACJI: ["{odbiorca}", "{ekspert}", "{klient}", "{termin}", "{linkDoSpotkania}", "{linkDoPanelu}"],
  CUSTOM: [],
}

import EmailLogsTab from "@/components/admin/EmailLogsTab"
import ScheduledEmailsTab from "@/components/admin/ScheduledEmailsTab"

export default function EmailManagementPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    nazwa: "",
    temat: "",
    tresc: "",
    trescHtml: "",
    typ: "CUSTOM",
    aktywny: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/email-templates")

      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Nie udało się pobrać szablonów email")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      nazwa: template.nazwa,
      temat: template.temat,
      tresc: template.tresc,
      trescHtml: template.trescHtml,
      typ: template.typ,
      aktywny: template.aktywny,
    })
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedTemplate(null)
    setFormData({
      nazwa: "",
      temat: "",
      tresc: "",
      trescHtml: "",
      typ: "CUSTOM",
      aktywny: true,
    })
    setEditDialogOpen(true)
  }

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setPreviewDialogOpen(true)
  }

  const handleOpenTest = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setTestDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = selectedTemplate
        ? `/api/email-templates/${selectedTemplate.id}`
        : "/api/email-templates"

      const method = selectedTemplate ? "PUT" : "POST"

      // Get variables for the selected type
      const zmienne = availableVariables[formData.typ as keyof typeof availableVariables] || []

      // Create descriptions for variables (you can customize this)
      const opisZmiennych: Record<string, string> = {}
      zmienne.forEach((variable) => {
        opisZmiennych[variable] = variable.replace(/[{}]/g, "")
      })

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          triggery: [],
          zmienne,
          opisZmiennych,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.message || "Failed to save template")
      }

      toast.success(
        selectedTemplate
          ? "Szablon został zaktualizowany"
          : "Szablon został utworzony"
      )
      setEditDialogOpen(false)
      fetchTemplates()
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error("Wystąpił błąd podczas zapisywania szablonu")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) {
      toast.error("Podaj adres email i wybierz szablon")
      return
    }

    setSendingTest(true)
    try {
      const response = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          templateId: selectedTemplate.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email")
      }

      toast.success(data.message || `Email testowy został wysłany na ${testEmail}`)
      setTestEmail("")
      setTestDialogOpen(false)
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Nie udało się wysłać emaila testowego"
      )
    } finally {
      setSendingTest(false)
    }
  }

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const response = await fetch(`/api/email-templates/${template.id}`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle template status")
      }

      toast.success(
        template.aktywny
          ? "Szablon został dezaktywowany"
          : "Szablon został aktywowany"
      )
      fetchTemplates()
    } catch (error) {
      console.error("Error toggling template status:", error)
      toast.error("Nie udało się zmienić statusu szablonu")
    }
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Czy na pewno chcesz usunąć szablon "${template.nazwa}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/email-templates/${template.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      toast.success("Szablon został usunięty")
      fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Nie udało się usunąć szablonu")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeaderSetter title="Zarządzanie emailami" subtitle="Zarządzaj szablonami emaili, ich wyglądem i logami wysyłki" />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Szablony</TabsTrigger>
          <TabsTrigger value="logs">Logi maili</TabsTrigger>
          <TabsTrigger value="scheduled">Zaplanowane</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nowy szablon
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{template.nazwa}</CardTitle>
                        <Badge variant={template.aktywny ? "default" : "secondary"}>
                          {template.aktywny ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Aktywny
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Nieaktywny
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          {emailTypes.find((t) => t.value === template.typ)?.label || template.typ}
                        </Badge>
                      </div>
                      <CardDescription>{template.temat}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Variables */}
                  {template.zmienne.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Dostępne zmienne:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.zmienne.map((variable) => (
                          <Badge key={variable} variant="outline" className="font-mono text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Triggers */}
                  {template.triggery.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Wyzwalacze:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.triggery.map((trigger) => (
                          <Badge key={trigger} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Podgląd
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTest(template)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Testuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(template)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {template.aktywny ? "Dezaktywuj" : "Aktywuj"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <EmailLogsTab />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledEmailsTab />
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edytuj szablon" : "Nowy szablon email"}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj szablon emaila, jego treść i warunki wysyłki
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nazwa">Nazwa szablonu *</Label>
                <Input
                  id="nazwa"
                  value={formData.nazwa}
                  onChange={(e) =>
                    setFormData({ ...formData, nazwa: e.target.value })
                  }
                  placeholder="np. Nowa sprawa - powiadomienie"
                  required
                />
              </div>

              <div>
                <Label htmlFor="typ">Typ emaila *</Label>
                <Select
                  value={formData.typ}
                  onValueChange={(value) =>
                    setFormData({ ...formData, typ: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="temat">Temat emaila *</Label>
              <Input
                id="temat"
                value={formData.temat}
                onChange={(e) =>
                  setFormData({ ...formData, temat: e.target.value })
                }
                placeholder="Możesz użyć zmiennych, np. {nazwaSprawi}"
                required
              />
            </div>

            <Tabs defaultValue="text" className="w-full">
              <TabsList>
                <TabsTrigger value="text">Tekst</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-2">
                <Label htmlFor="tresc">Treść tekstowa *</Label>
                <Textarea
                  id="tresc"
                  value={formData.tresc}
                  onChange={(e) =>
                    setFormData({ ...formData, tresc: e.target.value })
                  }
                  placeholder="Wpisz treść emaila w formacie tekstowym..."
                  rows={12}
                  required
                />
              </TabsContent>

              <TabsContent value="html" className="space-y-2">
                <Label htmlFor="trescHtml">Treść HTML</Label>
                <Textarea
                  id="trescHtml"
                  value={formData.trescHtml}
                  onChange={(e) =>
                    setFormData({ ...formData, trescHtml: e.target.value })
                  }
                  placeholder="<p>Wpisz treść emaila w formacie HTML...</p>"
                  rows={12}
                  className="font-mono text-xs"
                />
              </TabsContent>
            </Tabs>

            {availableVariables[formData.typ as keyof typeof availableVariables] && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Dostępne zmienne dla typu "{emailTypes.find((t) => t.value === formData.typ)?.label}":
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableVariables[formData.typ as keyof typeof availableVariables].map(
                    (variable) => (
                      <Badge
                        key={variable}
                        variant="secondary"
                        className="font-mono cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(variable)
                          toast.success("Zmienna skopiowana do schowka")
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {variable}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedTemplate ? "Zapisz zmiany" : "Utwórz szablon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Podgląd emaila</DialogTitle>
            <DialogDescription>{selectedTemplate?.nazwa}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Temat:</Label>
                <p className="text-lg font-semibold mt-1">{selectedTemplate.temat}</p>
              </div>

              <Separator />

              <Tabs defaultValue="text" className="w-full">
                <TabsList>
                  <TabsTrigger value="text">Wersja tekstowa</TabsTrigger>
                  <TabsTrigger value="html">Wersja HTML</TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedTemplate.tresc}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="html">
                  <div className="p-4 border border-border rounded-lg bg-background overflow-auto max-h-[400px] shadow-inner">
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.trescHtml }}
                      className="prose max-w-none text-foreground dark:prose-invert [&_h2]:!text-foreground [&_h3]:!text-foreground [&_p]:!text-foreground [&_li]:!text-foreground [&_strong]:!text-foreground [&_span]:!text-foreground [&_div]:!bg-muted/30 [&_div]:!border-border/50 [&_ul]:!bg-transparent [&_a]:!text-indigo-500 [&_table]:!bg-transparent [&_td]:!bg-transparent [&_tr]:!bg-transparent [&_th]:!bg-transparent [&_td]:!text-foreground [&_th]:!text-foreground [&_*]:border-border"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Zamknij
            </Button>
            <Button onClick={() => {
              setPreviewDialogOpen(false)
              setTestDialogOpen(true)
            }}>
              <Send className="h-4 w-4 mr-2" />
              Wyślij test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wyślij email testowy</DialogTitle>
            <DialogDescription>
              Szablon: {selectedTemplate?.nazwa}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Adres email odbiorcy</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="np. admin@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Email zostanie wysłany z przykładowymi danymi testowymi dla zmiennych.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={!testEmail || sendingTest}
            >
              {sendingTest && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Wyślij test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
