import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, FileText, AlertCircle } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Polityka Prywatności</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Twoja prywatność jest dla nas najważniejsza. Dowiedz się, jak przetwarzamy i chronimy Twoje dane osobowe.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>

        {/* Quick Links */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Skróty do sekcji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#administrator" className="text-primary hover:underline">1. Administrator danych</a>
              <a href="#zakres" className="text-primary hover:underline">2. Zakres zbieranych danych</a>
              <a href="#cel" className="text-primary hover:underline">3. Cel przetwarzania</a>
              <a href="#podstawa" className="text-primary hover:underline">4. Podstawa prawna</a>
              <a href="#odbiorcy" className="text-primary hover:underline">5. Odbiorcy danych</a>
              <a href="#prawa" className="text-primary hover:underline">6. Twoje prawa</a>
              <a href="#pliki" className="text-primary hover:underline">7. Pliki cookies</a>
              <a href="#bezpieczenstwo" className="text-primary hover:underline">8. Bezpieczeństwo</a>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* 1. Administrator */}
          <Card id="administrator">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                1. Administrator danych osobowych
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Administratorem Twoich danych osobowych jest właściciel platformy Prosta Sprawa z siedzibą w Warszawie.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">Dane kontaktowe:</p>
                <p>Email: iod@prosta-sprawa.pl</p>
                <p>Adres: ul. Przykładowa 123, 00-001 Warszawa</p>
                <p>Telefon: +48 123 456 789</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Zakres zbieranych danych */}
          <Card id="zakres">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Zakres zbieranych danych osobowych
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>W ramach świadczonych usług zbieramy następujące dane:</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dane rejestracyjne:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Imię i nazwisko</li>
                    <li>Adres e-mail</li>
                    <li>Numer telefonu</li>
                    <li>Hasło (w formie zaszyfrowanej)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dane klientów:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Informacje o sprawach prawnych</li>
                    <li>Załączniki i dokumenty</li>
                    <li>Historia wiadomości z kancelariami</li>
                    <li>Preferencje kontaktu</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dane kancelarii prawnych:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Nazwa kancelarii/dane prawnika</li>
                    <li>NIP, REGON (dla firm)</li>
                    <li>Adres siedziby</li>
                    <li>Numer licencji zawodowej</li>
                    <li>Certyfikaty i uprawnienia</li>
                    <li>Zakres usług prawnych</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dane płatności:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Dane do faktury (nazwa, NIP, adres)</li>
                    <li>Historia transakcji i płatności</li>
                    <li>Informacje o pakietach i punktach</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dane techniczne:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Adres IP</li>
                    <li>Typ przeglądarki</li>
                    <li>System operacyjny</li>
                    <li>Cookies i dane sesji</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Cel przetwarzania */}
          <Card id="cel">
            <CardHeader>
              <CardTitle>3. Cel przetwarzania danych</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-semibold">Twoje dane osobowe przetwarzamy w celu:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Świadczenia usług platformy Prosta Sprawa (kojarzenie klientów z kancelariami)</li>
                  <li>Obsługi Twojego konta użytkownika</li>
                  <li>Umożliwienia komunikacji między klientami a kancelariami</li>
                  <li>Przetwarzania płatności i wystawiania faktur</li>
                  <li>Wysyłki powiadomień o nowych ofertach i wiadomościach</li>
                  <li>Personalizacji treści i rekomendacji</li>
                  <li>Zapewnienia bezpieczeństwa platformy</li>
                  <li>Wypełnienia obowiązków prawnych (np. przechowywanie faktur)</li>
                  <li>Prowadzenia statystyk i analiz (w formie zanonimizowanej)</li>
                  <li>Obsługi reklamacji i zapytań</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 4. Podstawa prawna */}
          <Card id="podstawa">
            <CardHeader>
              <CardTitle>4. Podstawa prawna przetwarzania</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Dane osobowe przetwarzamy na podstawie:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Zgody</strong> (art. 6 ust. 1 lit. a RODO) - dla newslettera i marketingu</li>
                  <li><strong>Umowy</strong> (art. 6 ust. 1 lit. b RODO) - dla świadczenia usług platformy</li>
                  <li><strong>Obowiązku prawnego</strong> (art. 6 ust. 1 lit. c RODO) - dla rozliczeń podatkowych</li>
                  <li><strong>Prawnie uzasadnionego interesu</strong> (art. 6 ust. 1 lit. f RODO) - dla bezpieczeństwa i statystyk</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Odbiorcy danych */}
          <Card id="odbiorcy">
            <CardHeader>
              <CardTitle>5. Odbiorcy danych osobowych</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Twoje dane mogą być udostępniane następującym podmiotom:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Kancelariom prawnym (w zakresie niezbędnym do obsługi sprawy)</li>
                  <li>Operatorom płatności (PayU, Przelewy24, PayPal)</li>
                  <li>Dostawcom usług IT (hosting, e-mail, backup)</li>
                  <li>Firmom księgowym (dla obsługi faktur)</li>
                  <li>Organom państwowym (na żądanie uprawnionych instytucji)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Wszystkie podmioty są związane umowami zapewniającymi odpowiedni poziom ochrony danych.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Prawa użytkownika */}
          <Card id="prawa">
            <CardHeader>
              <CardTitle>6. Twoje prawa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Zgodnie z RODO przysługują Ci następujące prawa:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Prawo dostępu</strong> - możesz uzyskać informację, jakie dane o Tobie przetwarzamy</li>
                  <li><strong>Prawo do sprostowania</strong> - możesz poprawić nieprawidłowe dane</li>
                  <li><strong>Prawo do usunięcia</strong> - możesz żądać usunięcia danych ("prawo do bycia zapomnianym")</li>
                  <li><strong>Prawo do ograniczenia przetwarzania</strong> - możesz ograniczyć sposób wykorzystania danych</li>
                  <li><strong>Prawo do przenoszenia danych</strong> - możesz otrzymać dane w formacie umożliwiającym przeniesienie</li>
                  <li><strong>Prawo sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu danych</li>
                  <li><strong>Prawo do cofnięcia zgody</strong> - w każdej chwili możesz cofnąć zgodę</li>
                </ul>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="font-semibold mb-2">Skontaktuj się z nami:</p>
                  <p>Email: iod@prosta-sprawa.pl</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Przysługuje Ci również prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Cookies */}
          <Card id="pliki">
            <CardHeader>
              <CardTitle>7. Pliki cookies i technologie śledzące</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Nasza strona wykorzystuje pliki cookies i podobne technologie w celu:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Zapewnienia prawidłowego działania platformy</li>
                  <li>Zapamiętania Twoich preferencji</li>
                  <li>Utrzymania sesji zalogowanego użytkownika</li>
                  <li>Analizy ruchu na stronie (Google Analytics)</li>
                  <li>Personalizacji treści</li>
                </ul>

                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold">Rodzaje cookies:</h4>
                  <ul className="space-y-2">
                    <li><strong>Niezbędne</strong> - wymagane do działania strony</li>
                    <li><strong>Funkcjonalne</strong> - zapamiętują Twoje preferencje</li>
                    <li><strong>Analityczne</strong> - pomagają nam rozumieć, jak korzystasz ze strony</li>
                    <li><strong>Marketingowe</strong> - służą do wyświetlania spersonalizowanych reklam</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  Możesz zarządzać plikami cookies w ustawieniach swojej przeglądarki.
                  Wyłączenie niektórych cookies może wpłynąć na funkcjonalność strony.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Bezpieczeństwo */}
          <Card id="bezpieczenstwo">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                8. Bezpieczeństwo danych
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Stosujemy najwyższe standardy bezpieczeństwa, w tym:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Szyfrowanie SSL/TLS dla całej komunikacji</li>
                  <li>Bezpieczne przechowywanie haseł (hashing)</li>
                  <li>Regularne kopie zapasowe danych</li>
                  <li>Monitoring i ochrona przed atakami</li>
                  <li>Ograniczony dostęp do danych osobowych</li>
                  <li>Regularne audyty bezpieczeństwa</li>
                  <li>Szkolenia pracowników z zakresu ochrony danych</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Period */}
          <Card>
            <CardHeader>
              <CardTitle>9. Okres przechowywania danych</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Twoje dane przechowujemy przez okres:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Trwania umowy i świadczenia usług</li>
                  <li>Wymagany przepisami prawa (np. 5 lat dla faktur)</li>
                  <li>Do czasu cofnięcia zgody (dla marketingu)</li>
                  <li>Do realizacji prawnie uzasadnionego interesu</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Po upływie tego okresu dane są bezpowrotnie usuwane lub anonimizowane.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                10. Zmiany polityki prywatności
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej polityce prywatności.
                O wszelkich istotnych zmianach poinformujemy Cię za pośrednictwem e-mail lub
                powiadomienia na platformie. Aktualna wersja polityki jest zawsze dostępna na tej stronie.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Pytania dotyczące przetwarzania danych osobowych?</p>
          <p className="mt-2">
            Skontaktuj się z nami: <a href="mailto:iod@prosta-sprawa.pl" className="text-primary hover:underline">iod@prosta-sprawa.pl</a>
          </p>
        </div>
      </div>
    </div>
  )
}
