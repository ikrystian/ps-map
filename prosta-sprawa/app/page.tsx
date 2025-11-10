import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar";
import { Search, MapPin, Star } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold text-blue-600">Prosta Sprawa</div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2">Szukaj prawnika</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2">Sprawy firmowe</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2">Sprawy prywatne</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2 text-green-500 font-bold">Z nami wygrywasz</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2">Dla prawnika</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <Button variant="outline">Dodaj sprawę</Button>
          <Button>Zaloguj</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto text-center py-20">
        <h1 className="text-5xl font-bold">tu rozwiązujemy Twoje problemy prawne</h1>
        <p className="text-xl mt-4">Opisz i dodaj swoją sprawę. Znajdź prawnika</p>
        <p className="text-xl">Wybierz najlepszą dla siebie ofertę!</p>
        <div className="mt-8">
          <Button size="lg" className="bg-green-500 hover:bg-green-600">Dodaj sprawę</Button>
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
              {/* Content for Sprawy Firmowe */}
              <p className="mt-4">Szczegóły dotyczące spraw firmowych pojawią się tutaj.</p>
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
            <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">Dodaj sprawę</Button>
          </div>
          <div className="grid grid-cols-1 gap-8">
             <Card><CardContent className="p-6"><h4 className="font-bold">Kompleksowa obsługa ekspertów</h4><p className="text-sm text-gray-600 mt-2">Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci doświadczonych prawników i ekspertow z całego kraju.</p></CardContent></Card>
             <Card><CardContent className="p-6"><h4 className="font-bold">Proces dodawania Twojej sprawy</h4><p className="text-sm text-gray-600 mt-2">Nasz portal umożliwia dodawanie sprawy całkowicie za darmo. Wystarczy kilka kliknięć, aby opisać Twoją sytuację.</p></CardContent></Card>
             <Card><CardContent className="p-6"><h4 className="font-bold">Załatwianie spraw bez wychodzenia z domu</h4><p className="text-sm text-gray-600 mt-2">Prosta Sprawa to miejsce gdzie wszystko załatwisz online, bez konieczności wychodzenia z domu czy tracenia czasu na dojazdy.</p></CardContent></Card>
          </div>
        </div>
      </section>

      {/* Lawyers Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Znajdź prawnika dla siebie</h2>
              <Button variant="outline">Zobacz wszystkich</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Repeat this card for each lawyer */}
            <Card className="text-center">
              <CardHeader>
                <Avatar className="mx-auto w-24 h-24 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Anna Lewandowska Kuśmierczyk" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <CardTitle>Anna Lewandowska Kuśmierczyk</CardTitle>
                <p className="text-sm text-gray-500">ADWOKAT</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  Strzebrzeszyn Pomorski, Kujawsko Pomorskie
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Star className="text-yellow-400 w-5 h-5" />
                  <span className="font-bold ml-1">5,0</span>
                  <span className="text-sm text-gray-500 ml-2">(11 opinii)</span>
                </div>
              </CardContent>
            </Card>
             <Card className="text-center">
              <CardHeader>
                <Avatar className="mx-auto w-24 h-24 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Joahim Mogba" />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <CardTitle>Joahim Mogba</CardTitle>
                <p className="text-sm text-gray-500">ADWOKAT</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                   Warszawa, Mazowieckie
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Star className="text-yellow-400 w-5 h-5" />
                  <span className="font-bold ml-1">5,0</span>
                  <span className="text-sm text-gray-500 ml-2">(11 opinii)</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
                 <Button>Dodaj sprawę</Button>
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
