"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronsUpDown,
  Info,
  ListOrdered,
  Loader2,
  Send,
  User
} from "lucide-react"
import { useEffect, useState } from "react"

// Types
type NotificationType =
  | "NOWA_OFERTA"
  | "NOWA_WIADOMOSC"
  | "ZMIANA_STATUSU"
  | "NOWA_OPINIA"
  | "MALY_STAN_PUNKTOW"
  | "KONIEC_SUBSKRYPCJI"
  | "NOWA_KONSULTACJA"
  | "KONSULTACJA_ZAAKCEPTOWANA"
  | "KONSULTACJA_ODRZUCONA"
  | "KONSULTACJA_ZAPLACONA"
  | "KONSULTACJA_ANULOWANA"
  | "SYSTEM"

interface NotificationHistory {
  id: string
  userId: string
  typ: string
  tytul: string
  tresc: string
  linkUrl: string | null
  przeczytane: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
    role: string
  }
}

interface TestFormData {
  userId: string
  type: NotificationType | ""
  title: string
  content: string
  linkUrl: string
  force: boolean
}

export default function NotificationsAdminPage() {
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState("test")
  const [formData, setFormData] = useState<TestFormData>({
    userId: "",
    type: "SYSTEM",
    title: "",
    content: "",
    linkUrl: "",
    force: false,
  })

  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    if (!userSearchOpen) return

    const controller = new AbortController()
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        const res = await fetch(`/api/admin/users?limit=20&search=${encodeURIComponent(userSearchQuery)}`, {
          signal: controller.signal
        })
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Błąd pobierania użytkowników:", err)
        }
      } finally {
        setLoadingUsers(false)
      }
    }

    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [userSearchQuery, userSearchOpen])

  const handleSelectUserFromHistory = (user: { id: string; name: string | null; email: string; role: string }) => {
    setSelectedUser(user)
    setFormData(prev => ({ ...prev, userId: user.id }))
    setActiveTab("test")
    toast.success(`Wybrano użytkownika: ${user.name || user.email}`)
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/notifications?limit=50")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setHistory(data)
    } catch (error) {
      toast.error("Błąd pobierania historii powiadomień")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.userId || !formData.type || !formData.title || !formData.content) {
      toast.error("Wypełnij wymagane pola (ID Użytkownika, Typ, Tytuł, Treść)")
      return
    }

    try {
      setSending(true)
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Wystąpił błąd")
      }

      toast.success("Powiadomienie wysłane!")

      // Clear form except user ID and type for convenience
      setFormData(prev => ({
        ...prev,
        title: "",
        content: "",
        linkUrl: ""
      }))

      // Refresh history
      fetchHistory()

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    if (type.includes("KONSULTACJA")) return "bg-blue-100 text-blue-800 border-blue-200"
    if (type === "SYSTEM") return "bg-slate-100 text-slate-800 border-slate-200"
    if (type === "NOWA_WIADOMOSC") return "bg-purple-100 text-purple-800 border-purple-200"
    if (type === "NOWA_OFERTA") return "bg-emerald-100 text-emerald-800 border-emerald-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centrum Powiadomień</h1>
          <p className="text-muted-foreground mt-1">
            Testuj wysyłkę, śledź historię i zarządzaj ścieżkami powiadomień w systemie.
          </p>
        </div>
        <Bell className="h-10 w-10 text-muted-foreground opacity-20" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="test"><Activity className="w-4 h-4 mr-2" /> Testowanie</TabsTrigger>
          <TabsTrigger value="history"><ListOrdered className="w-4 h-4 mr-2" /> Historia</TabsTrigger>
          <TabsTrigger value="triggers"><Info className="w-4 h-4 mr-2" /> Ścieżki / Triggery</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Wyślij testowe powiadomienie</CardTitle>
              <CardDescription>
                Symuluj wysyłkę powiadomienia do konkretnego użytkownika.
                Skrypt automatycznie zweryfikuje ustawienia użytkownika i wyśle maila tylko jeśli ma to włączone (chyba, że zaznaczysz "Wymuś").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSubmit} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="mb-1 block">Użytkownik *</Label>
                    <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="userId"
                          variant="outline"
                          role="combobox"
                          aria-expanded={userSearchOpen}
                          className={cn(
                            "w-full justify-between font-normal text-left h-auto py-2 min-h-[40px] border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                            !formData.userId && "text-muted-foreground"
                          )}
                        >
                          {selectedUser ? (
                            <div className="flex flex-col items-start leading-tight">
                              <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                                {selectedUser.name || "Nieznany"}
                                <Badge variant="outline" className="text-sm py-0 px-1.5 font-normal uppercase">
                                  {selectedUser.role}
                                </Badge>
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">{selectedUser.email}</span>
                            </div>
                          ) : (
                            <span className="truncate">Wybierz użytkownika...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Szukaj po imieniu, nazwisku lub emailu..."
                            value={userSearchQuery}
                            onValueChange={setUserSearchQuery}
                          />
                          <CommandList>
                            {loadingUsers && (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                <span className="text-sm text-muted-foreground">Wyszukiwanie...</span>
                              </div>
                            )}
                            {!loadingUsers && users.length === 0 && (
                              <CommandEmpty>Nie znaleziono użytkownika.</CommandEmpty>
                            )}
                            <CommandGroup className="max-h-[250px] overflow-auto">
                              {users.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={() => {
                                    setSelectedUser(user)
                                    setFormData(p => ({ ...p, userId: user.id }))
                                    setUserSearchOpen(false)
                                  }}
                                  className="flex flex-col items-start gap-1 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                >
                                  <div className="font-medium flex items-center gap-2">
                                    {user.name || "Nieznany"}
                                    <Badge variant="outline" className="text-sm py-0 px-1 font-normal uppercase">
                                      {user.role}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Typ powiadomienia *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: NotificationType) => setFormData(p => ({ ...p, type: v }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                        <SelectItem value="NOWA_WIADOMOSC">NOWA_WIADOMOSC</SelectItem>
                        <SelectItem value="NOWA_OFERTA">NOWA_OFERTA</SelectItem>
                        <SelectItem value="ZMIANA_STATUSU">ZMIANA_STATUSU</SelectItem>
                        <SelectItem value="NOWA_OPINIA">NOWA_OPINIA</SelectItem>
                        <SelectItem value="KONSULTACJA_ZAAKCEPTOWANA">KONSULTACJA_ZAAKCEPTOWANA</SelectItem>
                        <SelectItem value="KONSULTACJA_ODRZUCONA">KONSULTACJA_ODRZUCONA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Tytuł *</Label>
                  <Input
                    id="title"
                    placeholder="Np. Nowa wiadomość"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Treść *</Label>
                  <Textarea
                    id="content"
                    placeholder="Treść powiadomienia..."
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link (opcjonalny)</Label>
                  <Input
                    id="linkUrl"
                    placeholder="Np. /panel-klienta/wiadomosci"
                    value={formData.linkUrl}
                    onChange={e => setFormData(p => ({ ...p, linkUrl: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="force"
                    className="rounded border-gray-300"
                    checked={formData.force}
                    onChange={e => setFormData(p => ({ ...p, force: e.target.checked }))}
                  />
                  <Label htmlFor="force" className="font-normal cursor-pointer">Wymuś wysłanie maila (ignoruj ustawienia użytkownika)</Label>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={sending}>
                  {sending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Wyślij powiadomienie</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historia powiadomień</CardTitle>
                <CardDescription>Ostatnie 50 powiadomień w systemie</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
                Odśwież
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border rounded-lg">
                  Brak wysłanych powiadomień
                </div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Odbiorca</th>
                        <th className="px-4 py-3">Typ</th>
                        <th className="px-4 py-3">Tytuł / Treść</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3 text-center">Status in-app</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {history.map((item) => (
                        <tr key={item.id} className="group bg-card hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <div className="text-sm font-semibold">{item.user.name || "Nieznany"}</div>
                                  <div className="text-xs text-muted-foreground">{item.user.email}</div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                onClick={() => handleSelectUserFromHistory({
                                  id: item.userId,
                                  name: item.user.name,
                                  email: item.user.email,
                                  role: item.user.role
                                })}
                              >
                                Wybierz
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={getTypeBadgeColor(item.typ)}>
                              {item.typ}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{item.tytul}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.tresc}>
                              {item.tresc}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString('pl-PL')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.przeczytane ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Przeczytane
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Nieprzeczytane
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ścieżki i Triggery</CardTitle>
              <CardDescription>
                Mapowanie pomiędzy typami powiadomień a ustawieniami użytkownika.
                To zestawienie pokazuje, które powiadomienia wymuszają maila, a które zależą od zgód.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-lg flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> Zależne od ustawień</h3>
                    <p className="text-sm text-muted-foreground mb-4">Te powiadomienia wyślą e-mail tylko wtedy, gdy użytkownik ma zaznaczony odpowiedni checkbox w swoim profilu.</p>

                    <ul className="space-y-3 text-sm">
                      <li className="flex flex-col gap-1 border-b pb-2">
                        <span className="font-medium">NOWA_OFERTA</span>
                        <span className="text-xs text-muted-foreground">Flaga: <code className="bg-muted px-1 rounded">emailNoweOferty</code></span>
                      </li>
                      <li className="flex flex-col gap-1 border-b pb-2">
                        <span className="font-medium">NOWA_WIADOMOSC</span>
                        <span className="text-xs text-muted-foreground">Flaga: <code className="bg-muted px-1 rounded">emailWiadomosci</code></span>
                      </li>
                      <li className="flex flex-col gap-1 border-b pb-2">
                        <span className="font-medium">ZMIANA_STATUSU, KONSULTACJE</span>
                        <span className="text-xs text-muted-foreground">Flaga: <code className="bg-muted px-1 rounded">emailStatusy</code></span>
                      </li>
                      <li className="flex flex-col gap-1 pb-2">
                        <span className="font-medium">MALY_STAN_PUNKTOW, KONIEC_SUBSKRYPCJI</span>
                        <span className="text-xs text-muted-foreground">Flaga: <code className="bg-muted px-1 rounded">ofertPromocje</code></span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-lg flex items-center"><Info className="w-5 h-5 mr-2 text-blue-500" /> Kluczowe / Systemowe</h3>
                    <p className="text-sm text-muted-foreground mb-4">Te powiadomienia są uznawane za kluczowe dla działania serwisu i zazwyczaj wymuszają e-mail niezależnie od odznaczonych podstawowych checkboxów (wymagają włączonych zgód na powiadomienia kluczowe).</p>

                    <ul className="space-y-3 text-sm">
                      <li className="flex flex-col gap-1 border-b pb-2">
                        <span className="font-medium">SYSTEM</span>
                        <span className="text-xs text-muted-foreground">Wszelkie powiadomienia twarde (np. wygenerowanie hasła, dodanie sprawy pomyślnie).</span>
                      </li>
                      <li className="flex flex-col gap-1 pb-2">
                        <span className="font-medium">NOWA_OPINIA</span>
                        <span className="text-xs text-muted-foreground">Gdy nowa opinia zostanie wystawiona do prawnika.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-lg p-4 mt-6">
                  <h4 className="font-semibold mb-2 text-sm">Jak działa system?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Każde powiadomienie tworzone w kodzie przez funkcję <code>sendSystemNotification()</code> przechodzi przez analizę profilu <code>NotificationSettings</code>.
                    1. System zawsze tworzy powiadomienie "in-app" (dostępne pod dzwoneczkiem w aplikacji).<br />
                    2. Jeśli użytkownik pozwala na maile dla danego typu – system wysyła dodatkowo email z taką samą treścią (lub z użyciem specjalnego szablonu HTML e-mail).<br />
                    3. Jeśli admin użyje flagi <code>force: true</code> wysyłając powiadomienie z kodu – email wyjdzie zawsze, omijając restrykcje (np. do resetu hasła).
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
