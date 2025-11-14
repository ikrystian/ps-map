"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Settings,
} from "lucide-react"

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
  { value: "REJESTRACJA_KANCELARIA", label: "Rejestracja - kancelaria" },
  { value: "RESET_HASLA", label: "Reset hasła" },
  { value: "POTWIERDZENIE_EMAIL", label: "Potwierdzenie email" },
  { value: "PLATNOSC_POTWIERDZONA", label: "Płatność potwierdzona" },
  { value: "SUBSKRYPCJA_WYGASA", label: "Subskrypcja wygasa" },
  { value: "NISKI_STAN_PUNKTOW", label: "Niski stan punktów" },
  { value: "CUSTOM", label: "Własny szablon" },
]

const availableVariables: Record<string, string[]> = {
  NOWA_SPRAWA: ["{nazwaSprawi}", "{kategoria}", "{klient}", "{budżet}"],
  NOWA_OFERTA: ["{kancelaria}", "{kwota}", "{nazwaSprawi}"],
  AKCEPTACJA_OFERTY: ["{kancelaria}", "{klient}", "{nazwaSprawi}", "{kwota}"],
  ODRZUCENIE_OFERTY: ["{kancelaria}", "{klient}", "{nazwaSprawi}"],
  REJESTRACJA_KLIENT: ["{imie}", "{nazwisko}", "{email}"],
  REJESTRACJA_KANCELARIA: ["{nazwa}", "{email}", "{nip}"],
  CUSTOM: [],
}

export default function EmailManagementPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
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
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data
      const mockTemplates: EmailTemplate[] = [
        {
          id: "1",
          nazwa: "Nowa sprawa - powiadomienie dla kancelarii",
          temat: "Nowa sprawa w Twojej kategorii: {nazwaSprawi}",
          tresc: "Witaj {kancelaria},\n\nNowa sprawa została dodana...",
          trescHtml: "<p>Witaj <strong>{kancelaria}</strong>,</p><p>Nowa sprawa...</p>",
          typ: "NOWA_SPRAWA",
          aktywny: true,
          triggery: ["case_created"],
          zmienne: ["{nazwaSprawi}", "{kategoria}", "{klient}", "{budżet}"],
          opisZmiennych: {
            "{nazwaSprawi}": "Nazwa sprawy",
            "{kategoria}": "Kategoria sprawy",
            "{klient}": "Imię i nazwisko klienta",
            "{budżet}": "Budżet sprawy",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          nazwa: "Akceptacja oferty - powiadomienie dla kancelarii",
          temat: "Twoja oferta została zaakceptowana!",
          tresc: "Gratulacje {kancelaria}!\n\nKlient {klient} zaakceptował...",
          trescHtml: "<p>Gratulacje <strong>{kancelaria}</strong>!</p><p>Klient...</p>",
          typ: "AKCEPTACJA_OFERTY",
          aktywny: true,
          triggery: ["offer_accepted"],
          zmienne: ["{kancelaria}", "{klient}", "{nazwaSprawi}", "{kwota}"],
          opisZmiennych: {
            "{kancelaria}": "Nazwa kancelarii",
            "{klient}": "Imię i nazwisko klienta",
            "{nazwaSprawi}": "Nazwa sprawy",
            "{kwota}": "Kwota oferty",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setTemplates(mockTemplates)
    } catch (error) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(
        selectedTemplate
          ? "Szablon został zaktualizowany"
          : "Szablon został utworzony"
      )
      setEditDialogOpen(false)
      fetchTemplates()
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania szablonu")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return

    setSendingTest(true)
    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(`Email testowy został wysłany na ${testEmail}`)
      setTestEmail("")
    } catch (error) {
      toast.error("Nie udało się wysłać emaila testowego")
    } finally {
      setSendingTest(false)
    }
  }

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(
        template.aktywny
          ? "Szablon został dezaktywowany"
          : "Szablon został aktywowany"
      )
      fetchTemplates()
    } catch (error) {
      toast.error("Nie udało się zmienić statusu szablonu")
    }
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Czy na pewno chcesz usunąć szablon "${template.nazwa}"?`)) {
      return
    }

    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Szablon został usunięty")
      fetchTemplates()
    } catch (error) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zarządzanie emailami</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj szablonami emaili, ich wyglądem i warunkami wysyłki
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nowy szablon
        </Button>
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
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
                  <div className="p-4 border rounded-lg bg-white">
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.trescHtml }}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-3">
                <Label>Wyślij email testowy</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="adres@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleSendTest}
                    disabled={!testEmail || sendingTest}
                  >
                    {sendingTest ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Wyślij
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
