"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  Link as LinkIcon,
  HelpCircle,
  Package,
  CreditCard,
  FileText,
  Settings,
  MessageSquare,
  Users,
} from "lucide-react"

interface HelpItem {
  id: string
  category: string
  question: string
  answer: string
}

const categories = [
  { id: "all", name: "Wszystkie", icon: HelpCircle },
  { id: "pakiety", name: "Pakiety i subskrypcje", icon: Package },
  { id: "platnosci", name: "Płatności i faktury", icon: CreditCard },
  { id: "sprawy", name: "Sprawy i oferty", icon: FileText },
  { id: "profil", name: "Profil i ustawienia", icon: Settings },
  { id: "kontakt", name: "Kontakt z klientami", icon: MessageSquare },
  { id: "konto", name: "Zarządzanie kontem", icon: Users },
]

const helpItems: HelpItem[] = [
  // Pakiety i subskrypcje
  {
    id: "pakiety-wybor",
    category: "pakiety",
    question: "Jak wybrać odpowiedni pakiet dla mojej kancelarii?",
    answer: "Wybór pakietu zależy od wielkości Twojej kancelarii i liczby spraw, które chcesz obsługiwać. Pakiet Podstawowy jest idealny dla małych kancelarii (do 10 spraw miesięcznie), Standard dla średnich (do 20 spraw), Premium dla większych (nielimitowane sprawy), a Biznes dla dużych kancelarii z wieloma kategoriami specjalizacji. Możesz w każdej chwili zmienić pakiet w sekcji 'Pakiet'.",
  },
  {
    id: "pakiety-zmiana",
    category: "pakiety",
    question: "Czy mogę zmienić pakiet w trakcie okresu subskrypcji?",
    answer: "Tak, możesz zmienić pakiet w dowolnym momencie. Przy zmianie na wyższy pakiet, różnica w cenie zostanie proporcjonalnie przeliczona. Nowy pakiet aktywuje się natychmiast, a punkty z poprzedniego pakietu pozostają na Twoim koncie.",
  },
  {
    id: "pakiety-punkty",
    category: "pakiety",
    question: "Co to są punkty gratis i jak je wykorzystać?",
    answer: "Punkty gratis to dodatkowe punkty, które otrzymujesz przy zakupie pakietu subskrypcji. Możesz je wykorzystać do promowania swojego profilu, wyróżniania ofert lub zakupu dodatkowych funkcji. Punkty nie wygasają i możesz je wykorzystać w dowolnym momencie.",
  },
  {
    id: "pakiety-anulowanie",
    category: "pakiety",
    question: "Jak anulować subskrypcję?",
    answer: "Subskrypcję możesz anulować w każdej chwili w ustawieniach konta. Pakiet pozostanie aktywny do końca opłaconego okresu. Po zakończeniu okresu konto automatycznie przejdzie na pakiet Podstawowy (darmowy).",
  },

  // Płatności i faktury
  {
    id: "platnosci-metody",
    category: "platnosci",
    question: "Jakie metody płatności są dostępne?",
    answer: "Akceptujemy płatności kartą kredytową/debetową, przelewy bankowe oraz płatności przez PayU i Przelewy24. Wszystkie płatności są zabezpieczone i szyfrowane.",
  },
  {
    id: "faktury-vat",
    category: "platnosci",
    question: "Czy otrzymam fakturę VAT?",
    answer: "Tak, dla wszystkich płatnych pakietów automatycznie wystawiamy faktury VAT. Faktura jest generowana natychmiast po dokonaniu płatności i jest dostępna w sekcji 'Faktury'. Możesz ją pobrać w formacie PDF.",
  },
  {
    id: "faktury-dane",
    category: "platnosci",
    question: "Jak zmienić dane do faktury?",
    answer: "Dane do faktury pobierane są automatycznie z Twojego profilu kancelarii (nazwa firmy, NIP, adres). Aby je zmienić, przejdź do sekcji 'Profil' i zaktualizuj dane firmy. Zmiany będą uwzględnione w kolejnych fakturach.",
  },
  {
    id: "platnosci-bezpieczenstwo",
    category: "platnosci",
    question: "Czy płatności są bezpieczne?",
    answer: "Tak, wszystkie płatności są procesowane przez zweryfikowanych operatorów płatności (PayU, Przelewy24) i są w pełni zabezpieczone. Nie przechowujemy danych Twojej karty. Wszystkie transakcje są szyfrowane protokołem SSL.",
  },

  // Sprawy i oferty
  {
    id: "sprawy-dostep",
    category: "sprawy",
    question: "Jak uzyskać dostęp do nowych spraw?",
    answer: "Nowe sprawy dopasowane do Twojej specjalizacji i lokalizacji pojawiają się automatycznie w sekcji 'Sprawy'. Otrzymasz również powiadomienie e-mail o nowych sprawach (jeśli masz włączone powiadomienia w ustawieniach).",
  },
  {
    id: "sprawy-oferta",
    category: "sprawy",
    question: "Jak złożyć ofertę na sprawę?",
    answer: "Wejdź w szczegóły sprawy, przeczytaj opis i wymagania klienta, a następnie kliknij 'Złóż ofertę'. Wypełnij formularz z proponowaną ceną, terminem realizacji i opisem swojego podejścia do sprawy. Po wysłaniu, klient otrzyma Twoją ofertę i może się z Tobą skontaktować.",
  },
  {
    id: "sprawy-limit",
    category: "sprawy",
    question: "Czy jest limit ofert, które mogę złożyć?",
    answer: "Limit ofert zależy od Twojego pakietu. Pakiet Podstawowy pozwala na 10 ofert miesięcznie, Standard na 20, Premium i Biznes nie mają limitu. Możesz sprawdzić wykorzystanie limitu w panelu głównym.",
  },
  {
    id: "sprawy-kategorie",
    category: "sprawy",
    question: "Jak dodać nowe kategorie specjalizacji?",
    answer: "Przejdź do sekcji 'Profil', przewiń do 'Zakres usług' i kliknij 'Dodaj specjalizację'. Wybierz kategorie z listy. Liczba kategorii zależy od Twojego pakietu (Podstawowy: 2, Standard: 5, Premium: 10, Biznes: nielimitowane).",
  },

  // Profil i ustawienia
  {
    id: "profil-uzupelnienie",
    category: "profil",
    question: "Dlaczego warto uzupełnić profil w 100%?",
    answer: "Kompletny profil zwiększa Twoją wiarygodność i szanse na pozyskanie klientów. Klienci chętniej wybierają prawników z pełnymi profilami, zdjęciami, opisem doświadczenia i opiniami. Uzupełniony profil jest również wyżej w wynikach wyszukiwania.",
  },
  {
    id: "profil-zdjecia",
    category: "profil",
    question: "Jak dodać zdjęcia do profilu?",
    answer: "W sekcji 'Profil' znajdziesz opcję 'Logo' oraz 'Galeria zdjęć'. Możesz przesłać logo swojej kancelarii oraz zdjęcia biura, zespołu lub certyfikatów. Zalecane formaty to JPG lub PNG, maksymalny rozmiar pliku to 5MB.",
  },
  {
    id: "profil-opinie",
    category: "profil",
    question: "Jak zdobyć pierwsze opinie?",
    answer: "Po pomyślnej realizacji sprawy, poproś klienta o wystawienie opinii. Możesz wysłać mu link do formularza opinii bezpośrednio z systemu. Pozytywne opinie znacznie zwiększają Twoją widoczność i zaufanie potencjalnych klientów.",
  },

  // Kontakt z klientami
  {
    id: "kontakt-wiadomosci",
    category: "kontakt",
    question: "Jak się komunikować z klientami?",
    answer: "System wiadomości znajdziesz w sekcji 'Wiadomości'. Możesz tam rozmawiać z klientami, którzy zainteresowali się Twoją ofertą. Wszystkie wiadomości są zabezpieczone i dostępne tylko dla Ciebie i klienta.",
  },
  {
    id: "kontakt-powiadomienia",
    category: "kontakt",
    question: "Jak ustawić powiadomienia o nowych wiadomościach?",
    answer: "Przejdź do 'Ustawienia' -> 'Powiadomienia' i zaznacz opcje powiadomień, które chcesz otrzymywać (e-mail, SMS). Możesz dostosować częstotliwość i rodzaj powiadomień.",
  },
  {
    id: "kontakt-dane",
    category: "kontakt",
    question: "Czy mogę udostępnić klientowi swój numer telefonu?",
    answer: "Tak, Twój numer telefonu jest widoczny w profilu publicznym. Klienci mogą również kontaktować się przez system wiadomości na platformie. Możesz ukryć numer telefonu w ustawieniach prywatności, jeśli wolisz kontakt tylko przez platformę.",
  },

  // Zarządzanie kontem
  {
    id: "konto-bezpieczenstwo",
    category: "konto",
    question: "Jak zabezpieczyć swoje konto?",
    answer: "Zalecamy używanie silnego hasła (min. 8 znaków, wielkie i małe litery, cyfry, znaki specjalne) oraz włączenie uwierzytelniania dwuskładnikowego w ustawieniach konta. Nigdy nie udostępniaj swojego hasła innym osobom.",
  },
  {
    id: "konto-haslo",
    category: "konto",
    question: "Jak zmienić hasło do konta?",
    answer: "Przejdź do 'Ustawienia' -> 'Bezpieczeństwo' i kliknij 'Zmień hasło'. Wprowadź obecne hasło i nowe hasło (dwukrotnie). Po zapisaniu zostaniesz wylogowany i będziesz musiał zalogować się ponownie nowym hasłem.",
  },
  {
    id: "konto-usuniecie",
    category: "konto",
    question: "Jak usunąć konto?",
    answer: "Jeśli chcesz usunąć konto, skontaktuj się z naszym działem obsługi klienta. Przed usunięciem konta upewnij się, że nie masz aktywnych spraw i rozliczeń. Usunięcie konta jest nieodwracalne.",
  },
]

export default function HelpCenterPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredItems, setFilteredItems] = useState<HelpItem[]>(helpItems)
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Sprawdź czy jest hash w URL (deep link)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const item = helpItems.find((item) => item.id === hash)
      if (item) {
        setOpenItem(hash)
        // Przewiń do elementu po małym opóźnieniu
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
      }
    }
  }, [])

  useEffect(() => {
    let items = helpItems

    // Filtruj po kategorii
    if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory)
    }

    // Filtruj po wyszukiwaniu
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      )
    }

    setFilteredItems(items)
  }, [searchQuery, selectedCategory])

  const handleCopyLink = (itemId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${itemId}`
    navigator.clipboard.writeText(url)

    toast({
      title: "Link skopiowany!",
      description: "Link do tego tematu został skopiowany do schowka",
    })

    // Aktualizuj URL bez przeładowania strony
    window.history.pushState(null, "", `#${itemId}`)
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.icon || HelpCircle
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Centrum pomocy</h1>
        <p className="text-muted-foreground mt-2">
          Znajdź odpowiedzi na najczęściej zadawane pytania
        </p>
      </div>

      {/* Wyszukiwarka */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Szukaj w centrum pomocy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kategorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              const count = category.id === "all"
                ? helpItems.length
                : helpItems.filter((item) => item.category === category.id).length

              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant={isActive ? "secondary" : "outline"} className="ml-1">
                    {count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pytania i odpowiedzi */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery
              ? `Wyniki wyszukiwania (${filteredItems.length})`
              : selectedCategory === "all"
              ? "Wszystkie pytania"
              : categories.find((cat) => cat.id === selectedCategory)?.name}
          </CardTitle>
          {searchQuery && (
            <CardDescription>
              Znaleziono {filteredItems.length} {filteredItems.length === 1 ? "wynik" : "wyników"} dla "{searchQuery}"
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak wyników</h3>
              <p className="text-muted-foreground">
                Nie znaleziono pytań pasujących do Twojego wyszukiwania.
                <br />
                Spróbuj użyć innych słów kluczowych lub{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  wyczyść filtry
                </Button>
              </p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={setOpenItem}
              className="space-y-2"
            >
              {filteredItems.map((item) => {
                const CategoryIcon = getCategoryIcon(item.category)

                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    id={item.id}
                    className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 flex-1 text-left pr-4">
                        <CategoryIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="pl-8 space-y-3">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(item.id)}
                            className="gap-2"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Kopiuj link
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Udostępnij bezpośredni link do tego tematu
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Kontakt */}
      <Card>
        <CardHeader>
          <CardTitle>Nie znalazłeś odpowiedzi?</CardTitle>
          <CardDescription>
            Skontaktuj się z naszym zespołem wsparcia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">Czat na żywo</div>
                <div className="text-sm text-muted-foreground">
                  Dostępny pn-pt 9:00-22:00
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">kontakt@prostasprawa.pl</div>
                <div className="text-sm text-muted-foreground">
                  Odpowiadamy w ciągu 24h
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Skontaktuj się z nami
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
