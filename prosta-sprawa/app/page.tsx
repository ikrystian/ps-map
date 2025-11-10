"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { MapPin, Star, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  logo?: string
  opis?: string
  miasto: string
  voivodeship: {
    nazwa: string
  }
  zweryfikowana: boolean
  categories: Array<{
    nazwa: string
    slug: string
  }>
  avgRating: number
  reviewCount: number
}

export default function Home() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const response = await fetch("/api/law-firms?limit=8")
        if (response.ok) {
          const data = await response.json()
          setLawFirms(data.lawFirms)
        }
      } catch (error) {
        console.error("Error fetching law firms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLawFirms()
  }, [])

  return (
    <div>
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold text-blue-600">Prosta Sprawa</div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/szukaj-prawnika" className="px-4 py-2">Szukaj prawnika</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/kategorie" className="px-4 py-2">Sprawy firmowe</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/kategorie" className="px-4 py-2">Sprawy prywatne</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/jak-to-dziala" className="px-4 py-2 text-green-500 font-bold">Z nami wygrywasz</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/rejestracja/kancelaria" className="px-4 py-2">Dla prawnika</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <Link href="/panel-klienta/sprawy/dodaj">
            <Button variant="outline">Dodaj sprawę</Button>
          </Link>
          <Link href="/logowanie">Zaloguj</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto text-center py-20">
        <h1 className="text-5xl font-bold">tu rozwiązujemy Twoje problemy prawne</h1>
        <p className="text-xl mt-4">Opisz i dodaj swoją sprawę. Znajdź prawnika</p>
        <p className="text-xl">Wybierz najlepszą dla siebie ofertę!</p>
        <div className="mt-8">
          <Link href="/panel-klienta/sprawy/dodaj">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">Dodaj sprawę</Button>
          </Link>
        </div>
      </main>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Zmieniamy grę w świecie prawa!</h2>
          <Tabs defaultValue="private" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private">SPRAWY PRYWATNE</TabsTrigger>
              <TabsTrigger value="corporate">SPRAWY FIRMOWE</TabsTrigger>
            </TabsList>
            <TabsContent value="private">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <Card><CardContent className="p-6">Dostęp do doświadczonych prawników</CardContent></Card>
                    <Card><CardContent className="p-6">Szybki proces zgłoszenia sprawy</CardContent></Card>
                    <Card><CardContent className="p-6">Porównywanie ofert</CardContent></Card>
                    <Card><CardContent className="p-6">Bezpieczeństwo i poufność</CardContent></Card>
                    <Card><CardContent className="p-6">Elastyczność w wyborze prawnika</CardContent></Card>
                    <Card><CardContent className="p-6">Wygoda i oszczędność czasu</CardContent></Card>
                </div>
            </TabsContent>
            <TabsContent value="corporate">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <Card><CardContent className="p-6">Kompleksowa obsługa prawna dla firm</CardContent></Card>
                    <Card><CardContent className="p-6">Doradztwo biznesowe</CardContent></Card>
                    <Card><CardContent className="p-6">Reprezentacja w sporach gospodarczych</CardContent></Card>
                    <Card><CardContent className="p-6">Pomoc w zakładaniu spółek</CardContent></Card>
                    <Card><CardContent className="p-6">Audyt prawny</CardContent></Card>
                    <Card><CardContent className="p-6">Obsługa umów i kontraktów</CardContent></Card>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-gray-500">MASZ PROBLEM?</h3>
            <h2 className="text-4xl font-bold mt-2">Powiedz nam jakiej pomocy szukasz</h2>
            <p className="mt-4 text-gray-600">Dodaj swoją sprawę bez zbędnych formalności, czekaj na ofertę i wybierz tę, która najlepiej odpowiada Twoim potrzebom.</p>
            <Link href="/panel-klienta/sprawy/dodaj">
              <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">Dodaj sprawę</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8">
             <Card><CardContent className="p-6"><h4 className="font-bold">Kompleksowa obsługa ekspertów</h4><p className="text-sm text-gray-600 mt-2">Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci doświadczonych prawników i ekspertów z całego kraju.</p></CardContent></Card>
             <Card><CardContent className="p-6"><h4 className="font-bold">Proces dodawania Twojej sprawy</h4><p className="text-sm text-gray-600 mt-2">Nasz portal umożliwia dodawanie sprawy całkowicie za darmo. Wystarczy kilka kliknięć, aby opisać Twoją sytuację.</p></CardContent></Card>
             <Card><CardContent className="p-6"><h4 className="font-bold">Załatwianie spraw bez wychodzenia z domu</h4><p className="text-sm text-gray-600 mt-2">Prosta Sprawa to miejsce gdzie wszystko załatwisz online, bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy.</p></CardContent></Card>
          </div>
        </div>
      </section>

      {/* Lawyers Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Znajdź prawnika dla siebie</h2>
              <Link href="/szukaj-prawnika">
                <Button variant="outline">Zobacz wszystkich</Button>
              </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ładowanie kancelarii...</p>
            </div>
          ) : lawFirms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lawFirms.map((firm) => (
                <Link key={firm.id} href={`/kancelaria/${firm.id}`}>
                  <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      {firm.logo ? (
                        <div className="relative mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-2">
                          <Image
                            src={firm.logo}
                            alt={firm.nazwa}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="mx-auto w-24 h-24 mb-4">
                          <AvatarFallback>{firm.nazwa.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <CardTitle className="text-lg">{firm.nazwa}</CardTitle>
                        {firm.zweryfikowana && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {firm.categories.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {firm.categories[0].nazwa}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{firm.miasto}, {firm.voivodeship.nazwa}</span>
                      </div>
                      {firm.reviewCount > 0 && (
                        <div className="flex items-center justify-center">
                          <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
                          <span className="font-bold ml-1">{firm.avgRating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({firm.reviewCount} {firm.reviewCount === 1 ? "opinia" : "opinii"})
                          </span>
                        </div>
                      )}
                      {firm.categories.length > 1 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-3">
                          {firm.categories.slice(1, 3).map((cat) => (
                            <Badge key={cat.slug} variant="secondary" className="text-xs">
                              {cat.nazwa}
                            </Badge>
                          ))}
                          {firm.categories.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{firm.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Brak kancelarii do wyświetlenia</p>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                 <h3 className="font-bold text-lg mb-4">Prosta Sprawa</h3>
                 <p className="text-sm text-gray-400">Tu rozwiązujemy Twoje problemy prawne.</p>
            </div>
            <div>
                 <h3 className="font-bold text-lg mb-4">Wyszukaj</h3>
                 <ul className="text-sm text-gray-400 space-y-2">
                     <li><a href="#" className="hover:underline">Kancelaria adwokacka Warszawa</a></li>
                     <li><a href="#" className="hover:underline">Kancelaria adwokacka Kraków</a></li>
                     <li><a href="#" className="hover:underline">Adwokat Warszawa</a></li>
                     <li><a href="#" className="hover:underline">Prawnik Warszawa</a></li>
                     <li><a href="#" className="hover:underline">Radca prawny Warszawa</a></li>
                 </ul>
            </div>
            <div>
                 <h3 className="font-bold text-lg mb-4">Kategorie</h3>
                 <ul className="text-sm text-gray-400 space-y-2">
                     <li><a href="#" className="hover:underline">Długi, windykacja, egzekucje</a></li>
                     <li><a href="#" className="hover:underline">Dziedziczenie, spadki, testamenty</a></li>
                     <li><a href="#" className="hover:underline">Pożyczki i kredyty</a></li>
                     <li><a href="#" className="hover:underline">Zatrudnienie i umowy</a></li>
                     <li><a href="#" className="hover:underline">Dotacje unijne</a></li>
                 </ul>
            </div>
             <div>
                 <h3 className="font-bold text-lg mb-4">Dołącz do nas</h3>
                 <Link href="/panel-klienta/sprawy/dodaj">
                   <Button>Dodaj sprawę</Button>
                 </Link>
            </div>
        </div>
        <Separator className="my-8 bg-gray-700" />
        <div className="container mx-auto text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Prosta Sprawa. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
