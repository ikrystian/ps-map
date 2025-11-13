import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, Users, CreditCard, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Regulamin Platformy Prosta Sprawa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zasady korzystania z platformy łączącej klientów z kancelariami prawnymi
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
              Spis treści
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#definicje" className="text-primary hover:underline">1. Definicje</a>
              <a href="#postanowienia" className="text-primary hover:underline">2. Postanowienia ogólne</a>
              <a href="#uslugi" className="text-primary hover:underline">3. Zakres usług</a>
              <a href="#rejestracja" className="text-primary hover:underline">4. Rejestracja i konto</a>
              <a href="#klienci" className="text-primary hover:underline">5. Zasady dla klientów</a>
              <a href="#kancelarie" className="text-primary hover:underline">6. Zasady dla kancelarii</a>
              <a href="#platnosci" className="text-primary hover:underline">7. Płatności i rozliczenia</a>
              <a href="#odpowiedzialnosc" className="text-primary hover:underline">8. Odpowiedzialność</a>
              <a href="#wlasnosc" className="text-primary hover:underline">9. Własność intelektualna</a>
              <a href="#dane" className="text-primary hover:underline">10. Ochrona danych</a>
              <a href="#reklamacje" className="text-primary hover:underline">11. Reklamacje</a>
              <a href="#koncowe" className="text-primary hover:underline">12. Postanowienia końcowe</a>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-8">
          {/* 1. Definicje */}
          <Card id="definicje">
            <CardHeader>
              <CardTitle>§1. Definicje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>Użyte w Regulaminie pojęcia oznaczają:</p>
                <ul className="space-y-2">
                  <li><strong>1. Platforma</strong> - serwis internetowy Prosta Sprawa dostępny pod adresem www.prosta-sprawa.pl</li>
                  <li><strong>2. Usługodawca</strong> - właściciel platformy Prosta Sprawa z siedzibą w Warszawie</li>
                  <li><strong>3. Użytkownik</strong> - każda osoba korzystająca z Platformy</li>
                  <li><strong>4. Klient</strong> - osoba fizyczna, firma lub organizacja poszukująca pomocy prawnej</li>
                  <li><strong>5. Kancelaria</strong> - kancelaria prawna, radca prawny, adwokat lub inny podmiot świadczący usługi prawne</li>
                  <li><strong>6. Sprawa</strong> - zgłoszenie klienta opisujące potrzebę pomocy prawnej</li>
                  <li><strong>7. Oferta</strong> - propozycja świadczenia usług prawnych złożona przez Kancelarię</li>
                  <li><strong>8. Pakiet</strong> - abonament subskrypcyjny dla Kancelarii (Podstawowy, Standard, Premium, Biznes)</li>
                  <li><strong>9. Punkty</strong> - wirtualna waluta używana przez Kancelarie do promowania profili</li>
                  <li><strong>10. Konto</strong> - panel użytkownika umożliwiający korzystanie z funkcji Platformy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Postanowienia ogólne */}
          <Card id="postanowienia">
            <CardHeader>
              <CardTitle>§2. Postanowienia ogólne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Regulamin określa zasady korzystania z Platformy Prosta Sprawa.</p>
                <p><strong>2.</strong> Korzystanie z Platformy jest równoznaczne z akceptacją niniejszego Regulaminu.</p>
                <p><strong>3.</strong> Platforma służy do kojarzenia klientów poszukujących pomocy prawnej z kancelariami prawnymi.</p>
                <p><strong>4.</strong> Usługodawca nie świadczy usług prawnych - pełni wyłącznie rolę pośrednika.</p>
                <p><strong>5.</strong> Użytkownik zobowiązany jest do korzystania z Platformy zgodnie z prawem i dobrymi obyczajami.</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Zakres usług */}
          <Card id="uslugi">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                §3. Zakres usług Platformy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dla Klientów (bezpłatnie):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Publikacja spraw prawnych</li>
                    <li>Otrzymywanie ofert od kancelarii</li>
                    <li>Przeglądanie profili kancelarii</li>
                    <li>Komunikacja z kancelariami</li>
                    <li>Porównywanie ofert</li>
                    <li>System ocen i opinii</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dla Kancelarii (odpłatnie):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Dostęp do zgłoszonych spraw</li>
                    <li>Możliwość składania ofert</li>
                    <li>Profil kancelarii z certyfikatami</li>
                    <li>System promowania i pozycjonowania</li>
                    <li>Blog prawniczy</li>
                    <li>Statystyki i analizy</li>
                    <li>Pakiety abonamentowe z różnymi limitami</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Rejestracja */}
          <Card id="rejestracja">
            <CardHeader>
              <CardTitle>§4. Rejestracja i konto użytkownika</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Korzystanie z pełnej funkcjonalności Platformy wymaga rejestracji.</p>
                <p><strong>2.</strong> Rejestracja jest bezpłatna i dobrowolna.</p>
                <p><strong>3.</strong> Użytkownik może zarejestrować się jako:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Klient (osoba fizyczna, firma, organizacja)</li>
                  <li>Kancelaria prawna / Prawnik</li>
                </ul>
                <p><strong>4.</strong> Do rejestracji wymagane są prawdziwe dane: imię, nazwisko, adres e-mail, numer telefonu.</p>
                <p><strong>5.</strong> Kancelarie zobowiązane są dodatkowo podać: nazwę, NIP, adres siedziby, numer licencji zawodowej.</p>
                <p><strong>6.</strong> Użytkownik ponosi odpowiedzialność za zachowanie poufności hasła.</p>
                <p><strong>7.</strong> Konto może zostać usunięte na żądanie użytkownika lub przez Usługodawcę w przypadku naruszenia Regulaminu.</p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Zasady dla klientów */}
          <Card id="klienci">
            <CardHeader>
              <CardTitle>§5. Zasady dla klientów</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Klient może bezpłatnie publikować sprawy prawne.</p>
                <p><strong>2.</strong> Opis sprawy musi być zgodny z prawdą i zawierać minimum 100 znaków.</p>
                <p><strong>3.</strong> Klient może dołączyć maksymalnie 5 plików do sprawy.</p>
                <p><strong>4.</strong> Klient otrzymuje oferty od zainteresowanych kancelarii.</p>
                <p><strong>5.</strong> Klient ma prawo:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Zaakceptować wybraną ofertę</li>
                  <li>Odrzucić ofertę</li>
                  <li>Negocjować warunki</li>
                  <li>Wycofać sprawę w każdej chwili</li>
                </ul>
                <p><strong>6.</strong> Zawarcie umowy i płatności odbywają się bezpośrednio między klientem a kancelarią.</p>
                <p><strong>7.</strong> Platforma nie ponosi odpowiedzialności za jakość świadczonych usług prawnych.</p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Zasady dla kancelarii */}
          <Card id="kancelarie">
            <CardHeader>
              <CardTitle>§6. Zasady dla kancelarii prawnych</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Kancelaria musi posiadać aktywny pakiet abonamentowy lub punkty.</p>
                <p><strong>2.</strong> Dostępne pakiety:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li><strong>Podstawowy</strong> - 440 zł/rok - 5 spraw/miesiąc, 3 kategorie, 1 województwo</li>
                  <li><strong>Standard</strong> - 880 zł/rok - 15 spraw/miesiąc, 5 kategorii, 3 województwa</li>
                  <li><strong>Premium</strong> - 1320 zł/rok - 30 spraw/miesiąc, 10 kategorii, 5 województw</li>
                  <li><strong>Biznes</strong> - 1980 zł/rok - nielimitowane sprawy, wszystkie kategorie, cała Polska</li>
                </ul>
                <p><strong>3.</strong> Kancelaria zobowiązana jest do:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Podania prawdziwych danych i kwalifikacji</li>
                  <li>Aktualności certyfikatów i uprawnień</li>
                  <li>Profesjonalnej komunikacji z klientami</li>
                  <li>Przestrzegania zasad etyki zawodowej</li>
                </ul>
                <p><strong>4.</strong> Oferta musi zawierać: kwotę (netto/brutto), termin realizacji, zakres usług.</p>
                <p><strong>5.</strong> Kancelaria ponosi pełną odpowiedzialność za świadczone usługi prawne.</p>
                <p><strong>6.</strong> Zakazane jest:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Kontaktowanie się z klientami poza Platformą przed akceptacją oferty</li>
                  <li>Składanie ofert na sprawy spoza wykupionego pakietu</li>
                  <li>Publikowanie nieprawdziwych informacji</li>
                  <li>Manipulowanie opiniami</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 7. Płatności */}
          <Card id="platnosci">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                §7. Płatności i rozliczenia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Usługi dla klientów są bezpłatne.</p>
                <p><strong>2.</strong> Kancelarie płacą za:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Pakiety abonamentowe (roczne, półroczne, miesięczne)</li>
                  <li>Punkty do promowania profilu</li>
                  <li>Dodatkowe opcje pozycjonowania</li>
                </ul>
                <p><strong>3.</strong> Dostępne metody płatności: PayU, Przelewy24, PayPal, przelew bankowy.</p>
                <p><strong>4.</strong> Ceny podane są w PLN i zawierają VAT 23%.</p>
                <p><strong>5.</strong> Faktury VAT wystawiane są automatycznie po opłaceniu zamówienia.</p>
                <p><strong>6.</strong> Pakiety nie podlegają zwrotowi po aktywacji.</p>
                <p><strong>7.</strong> Niewykorzystane punkty i limity nie przechodzą na kolejny okres rozliczeniowy.</p>
                <p><strong>8.</strong> Kancelaria może w każdej chwili zmienić pakiet lub dokupić punkty.</p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Odpowiedzialność */}
          <Card id="odpowiedzialnosc">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                §8. Odpowiedzialność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Usługodawca zapewnia dostępność Platformy przez 95% czasu w skali roku.</p>
                <p><strong>2.</strong> Usługodawca nie ponosi odpowiedzialności za:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Jakość usług prawnych świadczonych przez kancelarie</li>
                  <li>Działania lub zaniechania użytkowników</li>
                  <li>Szkody wynikłe z nieprawidłowego korzystania z Platformy</li>
                  <li>Przerwy techniczne i konserwacje</li>
                  <li>Utratę danych w przypadku siły wyższej</li>
                </ul>
                <p><strong>3.</strong> Użytkownik ponosi pełną odpowiedzialność za:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Prawdziwość podanych danych</li>
                  <li>Treści publikowane na Platformie</li>
                  <li>Naruszenie praw osób trzecich</li>
                  <li>Bezpieczeństwo swojego konta</li>
                </ul>
                <p><strong>4.</strong> Kancelaria ponosi pełną odpowiedzialność prawną i finansową za świadczone usługi.</p>
                <p><strong>5.</strong> Usługodawca zastrzega prawo do moderacji treści i usuwania niewłaściwych publikacji.</p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Własność intelektualna */}
          <Card id="wlasnosc">
            <CardHeader>
              <CardTitle>§9. Własność intelektualna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Wszystkie prawa do Platformy (kod, grafika, logo, nazwa) należą do Usługodawcy.</p>
                <p><strong>2.</strong> Zabronione jest kopiowanie, modyfikowanie lub rozpowszechnianie elementów Platformy bez zgody.</p>
                <p><strong>3.</strong> Treści publikowane przez użytkowników (opisy spraw, oferty, opinie) pozostają ich własnością.</p>
                <p><strong>4.</strong> Użytkownik udziela Usługodawcy niewyłącznej licencji na publikację treści w ramach Platformy.</p>
                <p><strong>5.</strong> Usługodawca ma prawo do wykorzystywania zanonimizowanych danych statystycznych.</p>
              </div>
            </CardContent>
          </Card>

          {/* 10. Ochrona danych */}
          <Card id="dane">
            <CardHeader>
              <CardTitle>§10. Ochrona danych osobowych</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Administratorem danych osobowych jest Usługodawca.</p>
                <p><strong>2.</strong> Szczegółowe zasady przetwarzania danych określa
                  <a href="/polityka-prywatnosci" className="text-primary hover:underline ml-1">Polityka Prywatności</a>.
                </p>
                <p><strong>3.</strong> Dane osobowe przetwarzane są zgodnie z RODO.</p>
                <p><strong>4.</strong> Użytkownik ma prawo do dostępu, sprostowania, usunięcia i przenoszenia danych.</p>
                <p><strong>5.</strong> Kontakt w sprawie danych: iod@prosta-sprawa.pl</p>
              </div>
            </CardContent>
          </Card>

          {/* 11. Reklamacje */}
          <Card id="reklamacje">
            <CardHeader>
              <CardTitle>§11. Reklamacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Reklamacje dotyczące działania Platformy można składać:</p>
                <ul className="list-disc list-inside space-y-1 ml-8">
                  <li>Przez formularz kontaktowy</li>
                  <li>E-mail: reklamacje@prosta-sprawa.pl</li>
                  <li>Pocztą: ul. Przykładowa 123, 00-001 Warszawa</li>
                </ul>
                <p><strong>2.</strong> Reklamacja powinna zawierać: dane kontaktowe, opis problemu, żądanie.</p>
                <p><strong>3.</strong> Reklamacje rozpatrywane są w ciągu 14 dni roboczych.</p>
                <p><strong>4.</strong> Odpowiedź wysyłana jest na adres e-mail lub pocztowy podany w reklamacji.</p>
                <p><strong>5.</strong> Reklamacje dotyczące usług prawnych należy kierować bezpośrednio do kancelarii.</p>
              </div>
            </CardContent>
          </Card>

          {/* 12. Postanowienia końcowe */}
          <Card id="koncowe">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                §12. Postanowienia końcowe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>1.</strong> Usługodawca zastrzega sobie prawo do zmiany Regulaminu.</p>
                <p><strong>2.</strong> O zmianach użytkownicy zostaną poinformowani z 7-dniowym wyprzedzeniem.</p>
                <p><strong>3.</strong> Kontynuowanie korzystania z Platformy po zmianach oznacza akceptację nowego Regulaminu.</p>
                <p><strong>4.</strong> W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego.</p>
                <p><strong>5.</strong> Spory rozstrzygane są przez sąd właściwy dla siedziby Usługodawcy.</p>
                <p><strong>6.</strong> Jeśli którekolwiek postanowienie Regulaminu jest nieważne, pozostałe pozostają w mocy.</p>
                <p><strong>7.</strong> Regulamin wchodzi w życie z dniem publikacji.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <p className="font-semibold mb-2">Pytania dotyczące Regulaminu?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Skontaktuj się z naszym działem obsługi klienta
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="mailto:kontakt@prosta-sprawa.pl" className="text-primary hover:underline">
              kontakt@prosta-sprawa.pl
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="tel:+48123456789" className="text-primary hover:underline">
              +48 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
