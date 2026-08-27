import { ModuleType, PrismaClient } from '@prisma/client'

export async function seedStaticPages(originalPrisma: PrismaClient) {
  console.log('Seeding static pages and modules...')

  await originalPrisma.$transaction(async (prisma) => {
    // 1. Create Modules
    const regulaminModule = await prisma.module.create({
      data: {
        name: 'Regulamin - Zawartość główna',
        description: 'Domyślna treść regulaminu platformy Prosta Sprawa',
        type: ModuleType.EDITABLE_HTML,
        code: `
<div class="container mx-auto px-4 py-12 max-w-5xl">
  <!-- Header -->
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center p-3 bg-neutral-900 border border-neutral-800 rounded-full mb-4">
      <svg class="h-8 w-8 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    </div>
    <h1 class="text-4xl font-bold mb-4">Regulamin Platformy Prosta Sprawa</h1>
    <p class="text-lg text-neutral-400 max-w-2xl mx-auto">
      Zasady korzystania z platformy łączącej klientów z ekspertami prawnymi
    </p>
    <p class="text-sm text-neutral-500 mt-2">
      Ostatnia aktualizacja: ${new Date().toLocaleDateString('pl-PL')}
    </p>
  </div>

  <!-- Quick Links Card -->
  <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 shadow-sm">
    <h3 class="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
      <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Spis treści
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <a href="#definicje" class="text-[#E2B13C] hover:underline">1. Definicje</a>
      <a href="#postanowienia" class="text-[#E2B13C] hover:underline">2. Postanowienia ogólne</a>
      <a href="#uslugi" class="text-[#E2B13C] hover:underline">3. Zakres usług</a>
      <a href="#rejestracja" class="text-[#E2B13C] hover:underline">4. Rejestracja i konto</a>
      <a href="#klienci" class="text-[#E2B13C] hover:underline">5. Zasady dla klientów</a>
      <a href="#eksperci" class="text-[#E2B13C] hover:underline">6. Zasady dla ekspertów</a>
      <a href="#platnosci" class="text-[#E2B13C] hover:underline">7. Płatności i rozliczenia</a>
      <a href="#odpowiedzialnosc" class="text-[#E2B13C] hover:underline">8. Odpowiedzialność</a>
      <a href="#wlasnosc" class="text-[#E2B13C] hover:underline">9. Własność intelektualna</a>
      <a href="#dane" class="text-[#E2B13C] hover:underline">10. Ochrona danych</a>
      <a href="#reklamacje" class="text-[#E2B13C] hover:underline">11. Reklamacje</a>
      <a href="#koncowe" class="text-[#E2B13C] hover:underline">12. Postanowienia końcowe</a>
    </div>
  </div>

  <!-- Content Sections -->
  <div class="space-y-8 text-neutral-300">
    <div id="definicje" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§1. Definicje</h3>
      <p class="mb-3">Użyte w Regulaminie pojęcia oznaczają:</p>
      <ul class="space-y-2 pl-4 list-disc">
        <li><strong>1. Platforma</strong> - serwis internetowy Prosta Sprawa dostępny pod adresem www.prostasprawa.pl</li>
        <li><strong>2. Usługodawca</strong> - właściciel platformy Prosta Sprawa z siedzibą w Warszawie</li>
        <li><strong>3. Użytkownik</strong> - każda osoba korzystająca z Platformy</li>
        <li><strong>4. Klient</strong> - osoba fizyczna, firma lub organizacja poszukująca pomocy prawnej</li>
        <li><strong>5. Ekspert</strong> - ekspert prawny, radca prawny, adwokat lub inny podmiot świadczący usługi prawne</li>
        <li><strong>6. Sprawa</strong> - zgłoszenie klienta opisujące potrzebę pomocy prawnej</li>
        <li><strong>7. Oferta</strong> - propozycja świadczenia usług prawnych złożona przez Eksperta</li>
        <li><strong>8. Pakiet</strong> - abonament subskrypcyjny dla Eksperta</li>
        <li><strong>9. Punkty</strong> - wirtualna waluta używana przez ekspertów</li>
        <li><strong>10. Konto</strong> - panel użytkownika umożliwiający korzystanie z funkcji Platformy</li>
      </ul>
    </div>

    <div id="postanowienia" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§2. Postanowienia ogólne</h3>
      <p class="mb-2"><strong>1.</strong> Regulamin określa zasady korzystania z Platformy Prosta Sprawa.</p>
      <p class="mb-2"><strong>2.</strong> Korzystanie z Platformy jest równoznaczne z akceptacją niniejszego Regulaminu.</p>
      <p class="mb-2"><strong>3.</strong> Platforma służy do kojarzenia klientów poszukujących pomocy prawnej z ekspertami prawnymi.</p>
      <p class="mb-2"><strong>4.</strong> Usługodawca nie świadczy usług prawnych - pełni wyłącznie rolę pośrednika.</p>
      <p class="mb-2"><strong>5.</strong> Użytkownik zobowiązany jest do korzystania z Platformy zgodnie z prawem i dobrymi obyczajami.</p>
    </div>

    <div id="uslugi" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§3. Zakres usług Platformy</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-2 text-white">Dla Klientów (bezpłatnie):</h4>
          <ul class="list-disc pl-4 space-y-1 text-sm text-neutral-400">
            <li>Publikacja spraw prawnych</li>
            <li>Otrzymywanie ofert od eksperta</li>
            <li>Przeglądanie profili ekspertów</li>
            <li>Komunikacja z ekspertami</li>
            <li>System ocen i opinii</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-2 text-white">Dla Ekspertów (odpłatnie):</h4>
          <ul class="list-disc pl-4 space-y-1 text-sm text-neutral-400">
            <li>Dostęp do zgłoszonych spraw</li>
            <li>Możliwość składania ofert</li>
            <li>Profil z certyfikatami i certyfikacją</li>
            <li>System promowania i pozycjonowania</li>
            <li>Pakiety abonamentowe</li>
          </ul>
        </div>
      </div>
    </div>

    <div id="rejestracja" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§4. Rejestracja i konto użytkownika</h3>
      <p class="mb-2"><strong>1.</strong> Korzystanie z pełnej funkcjonalności Platformy wymaga rejestracji.</p>
      <p class="mb-2"><strong>2.</strong> Rejestracja jest bezpłatna i dobrowolna.</p>
      <p class="mb-2"><strong>3.</strong> Użytkownik może zarejestrować się jako Klient lub Ekspert prawny / Prawnik.</p>
      <p class="mb-2"><strong>4.</strong> Do rejestracji wymagane są prawdziwe dane: imię, nazwisko, adres e-mail, numer telefonu.</p>
    </div>

    <div id="klienci" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§5. Zasady dla klientów</h3>
      <p class="mb-2"><strong>1.</strong> Klient może bezpłatnie publikować sprawy prawne.</p>
      <p class="mb-2"><strong>2.</strong> Opis sprawy musi być zgodny z prawdą i zawierać rzetelne informacje.</p>
      <p class="mb-2"><strong>3.</strong> Zawarcie umowy i płatności za usługi prawne odbywają się bezpośrednio między klientem a ekspertem.</p>
    </div>

    <div id="eksperci" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§6. Zasady dla ekspertów prawnych</h3>
      <p class="mb-2"><strong>1.</strong> Ekspert musi posiadać aktywny pakiet abonamentowy lub punkty.</p>
      <p class="mb-2"><strong>2.</strong> Ekspert zobowiązana jest do podania prawdziwych danych, uprawnień i kwalifikacji zawodowych.</p>
      <p class="mb-2"><strong>3.</strong> Oferta składana klientowi musi być rzetelna i precyzyjna.</p>
    </div>

    <div id="platnosci" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§7. Płatności i rozliczenia</h3>
      <p class="mb-2"><strong>1.</strong> Usługi dla klientów są całkowicie bezpłatne.</p>
      <p class="mb-2"><strong>2.</strong> Eksperci ponoszą opłaty za pakiety abonamentowe oraz promowanie profili.</p>
      <p class="mb-2"><strong>3.</strong> Płatności obsługiwane są za pośrednictwem bezpiecznych bramek płatności.</p>
    </div>

    <div id="odpowiedzialnosc" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§8. Odpowiedzialność</h3>
      <p class="mb-2"><strong>1.</strong> Usługodawca pełni jedynie rolę pośrednika i nie odpowiada za jakość porad prawnych.</p>
      <p class="mb-2"><strong>2.</strong> Ekspert ponosi pełną i wyłączną odpowiedzialność za świadczone usługi prawne.</p>
    </div>

    <div id="wlasnosc" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§9. Własność intelektualna</h3>
      <p class="mb-2"><strong>1.</strong> Wszelkie prawa autorskie do kodu, logotypu i wyglądu serwisu należą do Usługodawcy.</p>
    </div>

    <div id="dane" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§10. Ochrona danych osobowych</h3>
      <p class="mb-2"><strong>1.</strong> Administratorem danych osobowych Użytkowników jest Usługodawca. Szczegóły określa Polityka Prywatności.</p>
    </div>

    <div id="reklamacje" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§11. Reklamacje</h3>
      <p class="mb-2"><strong>1.</strong> Reklamacje dotyczące działania Platformy można zgłaszać pod adresem e-mail: kontakt@prostasprawa.pl.</p>
    </div>

    <div id="koncowe" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">§12. Postanowienia końcowe</h3>
      <p class="mb-2"><strong>1.</strong> Regulamin wchodzi w życie z dniem jego publikacji na Platformie.</p>
    </div>
  </div>

  <!-- Footer Info Box -->
  <div class="mt-12 p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center">
    <p class="font-semibold mb-2 text-white">Pytania dotyczące Regulaminu?</p>
    <p class="text-sm text-neutral-400 mb-4">Skontaktuj się z nami:</p>
    <div class="flex justify-center gap-4 text-sm">
      <a href="mailto:kontakt@prostasprawa.pl" class="text-[#E2B13C] hover:underline">kontakt@prostasprawa.pl</a>
      <span class="text-neutral-600">|</span>
      <a href="tel:+48123456789" class="text-[#E2B13C] hover:underline">+48 123 456 789</a>
    </div>
  </div>
</div>
`
      }
    })

    const politykaModule = await prisma.module.create({
      data: {
        name: 'Polityka prywatności - Zawartość główna',
        description: 'Domyślna treść polityki prywatności platformy Prosta Sprawa',
        type: ModuleType.EDITABLE_HTML,
        code: `
<div class="container mx-auto px-4 py-12 max-w-5xl">
  <!-- Header -->
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center p-3 bg-neutral-900 border border-neutral-800 rounded-full mb-4">
      <svg class="h-8 w-8 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h1 class="text-4xl font-bold mb-4">Polityka Prywatności</h1>
    <p class="text-lg text-neutral-400 max-w-2xl mx-auto">
      Twoja prywatność jest dla nas najważniejsza. Dowiedz się, jak przetwarzamy i chronimy Twoje dane osobowe.
    </p>
    <p class="text-sm text-neutral-500 mt-2">
      Ostatnia aktualizacja: ${new Date().toLocaleDateString('pl-PL')}
    </p>
  </div>

  <!-- Quick Links Card -->
  <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 shadow-sm">
    <h3 class="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
      <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      Skróty do sekcji
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      <a href="#administrator" class="text-[#E2B13C] hover:underline">1. Administrator danych</a>
      <a href="#zakres" class="text-[#E2B13C] hover:underline">2. Zakres zbieranych danych</a>
      <a href="#cel" class="text-[#E2B13C] hover:underline">3. Cel przetwarzania</a>
      <a href="#podstawa" class="text-[#E2B13C] hover:underline">4. Podstawa prawna</a>
      <a href="#odbiorcy" class="text-[#E2B13C] hover:underline">5. Odbiorcy danych</a>
      <a href="#prawa" class="text-[#E2B13C] hover:underline">6. Twoje prawa</a>
      <a href="#pliki" class="text-[#E2B13C] hover:underline">7. Pliki cookies</a>
      <a href="#bezpieczenstwo" class="text-[#E2B13C] hover:underline">8. Bezpieczeństwo</a>
    </div>
  </div>

  <!-- Content -->
  <div class="space-y-8 text-neutral-300">
    <div id="administrator" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">1. Administrator danych osobowych</h3>
      <p class="mb-4">
        Administratorem Twoich danych osobowych jest właściciel platformy Prosta Sprawa z siedzibą w Warszawie.
      </p>
      <div class="bg-neutral-950 p-4 border border-neutral-800 rounded-lg text-sm">
        <p class="font-semibold mb-2 text-white">Dane kontaktowe:</p>
        <p>Email: iod@prostasprawa.pl</p>
        <p>Adres: ul. Przykładowa 123, 00-001 Warszawa</p>
      </div>
    </div>

    <div id="zakres" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">2. Zakres zbieranych danych osobowych</h3>
      <p class="mb-3">W ramach świadczonych usług zbieramy następujące dane:</p>
      <ul class="space-y-2 pl-4 list-disc text-neutral-400 text-sm">
        <li><strong>Dane rejestracyjne:</strong> Imię, nazwisko, e-mail, telefon, hasło (zaszyfrowane).</li>
        <li><strong>Dane klientów:</strong> Szczegóły zgłaszanych spraw, załączniki.</li>
        <li><strong>Dane eksperta:</strong> Nazwa, NIP, adres, licencje zawodowe.</li>
        <li><strong>Dane techniczne:</strong> IP, ciasteczka (cookies), system operacyjny.</li>
      </ul>
    </div>

    <div id="cel" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">3. Cel przetwarzania danych</h3>
      <p class="mb-2">Przetwarzamy dane w celu świadczenia usług platformy, obsługi konta, kojarzenia spraw, obsługi płatności, przesyłania powiadomień oraz wsparcia technicznego.</p>
    </div>

    <div id="podstawa" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">4. Podstawa prawna</h3>
      <p class="mb-2">Podstawą przetwarzania jest realizacja umowy (regulamin), zgoda na marketing/newsletter oraz obowiązki księgowo-prawne administratora.</p>
    </div>

    <div id="odbiorcy" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">5. Odbiorcy danych osobowych</h3>
      <p class="mb-2">Odbiorcami danych są wybrane przez klienta eksperci, procesorzy płatności, dostawcy serwerów oraz podmioty księgowo-prawne.</p>
    </div>

    <div id="prawa" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">6. Twoje prawa</h3>
      <p class="mb-2">Masz prawo dostępu do danych, ich sprostowania, usunięcia ("prawo do bycia zapomnianym"), ograniczenia przetwarzania, przenoszenia danych oraz wniesienia skargi do PUODO.</p>
    </div>

    <div id="pliki" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">7. Pliki cookies</h3>
      <p class="mb-2">Używamy ciasteczek w celu ułatwienia logowania, statystyk oraz optymalizacji działania serwisu. Możesz je wyłączyć w przeglądarce.</p>
    </div>

    <div id="bezpieczenstwo" class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-white">8. Bezpieczeństwo</h3>
      <p class="mb-2">Stosujemy zaawansowane szyfrowanie SSL, hashing haseł, regularne backupy oraz fizyczną ochronę serwerów przed nieuprawnionym dostępem.</p>
    </div>
  </div>
</div>
`
      }
    })

    const oNasHeroModule = await prisma.module.create({
      data: {
        name: 'O nas - Hero, historia i liczby',
        description: 'Sekcja hero, historia powstania platformy oraz ProstaSprawa.pl w liczbach',
        type: ModuleType.EDITABLE_HTML,
        code: `
<!-- HERO -->
<section class="relative bg-background py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border">
  <div class="absolute -top-20 left-1/4 w-[420px] h-[420px] bg-primary/10 rounded-full blur-[130px] pointer-events-none"></div>
  <div class="absolute -bottom-24 right-1/5 w-[480px] h-[480px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
  <div class="max-w-4xl mx-auto relative z-10 text-center">
    <p class="text-primary text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-6">O nas</p>
    <h1 class="font-playfair text-4xl sm:text-5xl lg:text-6xl text-foreground font-light tracking-tight leading-tight mb-6">
      Zbudowaliśmy to, czego <span class="font-bold">sami nie mogliśmy znaleźć</span>
    </h1>
    <p class="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
      ProstaSprawa.pl nie powstała z analizy rynku. Powstała z naszych własnych spraw, z którymi nie wiedzieliśmy, co zrobić.
    </p>
  </div>
</section>

<!-- HISTORIA -->
<section class="bg-background-sec py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
  <div class="max-w-3xl mx-auto">
    <div class="space-y-6 text-muted-foreground text-sm sm:text-base leading-relaxed">
      <p>
        Znamy ten moment od środka. Przychodzi pismo z sądu albo umowa napisana tak, że nie wiadomo, co się właściwie podpisuje, i zaczyna się szukanie. Wpisujesz coś w wyszukiwarkę, otwierasz dwadzieścia kart, dzwonisz do kolejnych kancelarii. Jedna nie odbiera, druga nie prowadzi takich spraw, trzecia oddzwoni w przyszłym tygodniu. Mija kilka dni, a Ty jesteś w tym samym punkcie, tylko bardziej zmęczony i o kilka dni bliżej terminu.
      </p>
      <p>
        Przeszliśmy przez to tyle razy, że w końcu zadaliśmy sobie pytanie: dlaczego to musi tak wyglądać? Po jednej stronie jest człowiek z konkretnym problemem. Po drugiej specjalista, który zajmuje się dokładnie takimi sprawami. Obaj szukają siebie nawzajem, a brakuje tylko miejsca, w którym się spotkają.
      </p>
    </div>

    <p class="font-playfair text-2xl sm:text-3xl lg:text-4xl text-foreground font-light text-center my-10 md:my-12">
      Tak powstała <span class="font-bold">ProstaSprawa.pl</span>.
    </p>

    <div class="border-l-2 border-primary pl-5 sm:pl-6">
      <p class="text-foreground/80 text-sm sm:text-base leading-relaxed">
        Dziś łączymy klientów z prawnikami i ekspertami z całej Polski. Działamy we wszystkich 16 województwach, obejmujemy 44 kategorie spraw i ponad 100 specjalizacji, prywatnych i firmowych.
      </p>
    </div>
  </div>
</section>

<!-- LICZBY -->
<section class="relative bg-background py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[320px] bg-gradient-to-r from-primary/5 to-primary/10 blur-[120px] pointer-events-none"></div>
  <div class="max-w-6xl mx-auto relative z-10">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light text-center mb-12">
      ProstaSprawa.pl <span class="font-bold">w liczbach</span>
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="font-playfair text-4xl text-primary mb-2">44</div>
        <p class="text-foreground text-sm font-semibold mb-1">kategorie spraw</p>
        <p class="text-muted-foreground text-sm leading-relaxed">22 prywatne i 22 firmowe</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="font-playfair text-4xl text-primary mb-2">100+</div>
        <p class="text-foreground text-sm font-semibold mb-1">podkategorii</p>
        <p class="text-muted-foreground text-sm leading-relaxed">od rozwodu i spadku po RODO i spory z pracownikami</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="font-playfair text-4xl text-primary mb-2">16</div>
        <p class="text-foreground text-sm font-semibold mb-1">województw</p>
        <p class="text-muted-foreground text-sm leading-relaxed">specjaliści z całej Polski</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6 sm:col-span-2 lg:col-span-1">
        <div class="font-playfair text-4xl text-secondary mb-2">0 zł</div>
        <p class="text-foreground text-sm font-semibold mb-1">prowizji od każdej sprawy</p>
        <p class="text-muted-foreground text-sm leading-relaxed">dla obu stron</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6 sm:col-span-2">
        <div class="font-playfair text-4xl text-secondary mb-2">3 miesiące</div>
        <p class="text-foreground text-sm font-semibold mb-1">bezpłatnego testu</p>
        <p class="text-muted-foreground text-sm leading-relaxed">dla nowego specjalisty</p>
      </div>
    </div>
  </div>
</section>
`
      }
    })

    const oNasValuesModule = await prisma.module.create({
      data: {
        name: 'O nas - Jak działamy, wartości i CTA',
        description: 'Odwrócony model zgłoszeń, brak prowizji, zakres specjalistów, wartości, CTA i dane spółki',
        type: ModuleType.EDITABLE_HTML,
        code: `
<!-- ODWRACAMY KOLEJNOŚĆ -->
<section class="bg-background-sec py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
  <div class="max-w-5xl mx-auto">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light mb-4">
      Odwracamy <span class="font-bold">kolejność</span>
    </h2>
    <p class="text-foreground/80 text-base sm:text-lg leading-relaxed mb-10 max-w-3xl">
      U nas to nie klient szuka specjalisty. To specjaliści zgłaszają się do jego sprawy.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-background border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="font-playfair text-2xl text-primary">01</span>
          <span class="h-px flex-1 bg-border"></span>
        </div>
        <h3 class="text-foreground text-base font-semibold mb-2">Opisujesz sprawę</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Własnymi słowami, bez prawniczego języka. Wybierasz kategorię i lokalizację. Tyle wystarczy, a rejestracja i dodanie sprawy nic nie kosztują.
        </p>
      </div>

      <div class="bg-background border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="font-playfair text-2xl text-primary">02</span>
          <span class="h-px flex-1 bg-border"></span>
        </div>
        <h3 class="text-foreground text-base font-semibold mb-2">Zgłaszają się specjaliści</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Twoja sprawa nie wisi publicznie w internecie. Trafia wyłącznie do tych specjalistów, których profil i doświadczenie do niej pasują. Oni odpowiadają konkretną propozycją: co zrobią, w jakim zakresie i za ile.
        </p>
      </div>

      <div class="bg-background border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="font-playfair text-2xl text-primary">03</span>
          <span class="h-px flex-1 bg-border"></span>
        </div>
        <h3 class="text-foreground text-base font-semibold mb-2">Porównujesz i wybierasz</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Możesz też nie wybrać nikogo, bo dodanie sprawy do niczego nie zobowiązuje.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- BRAK PROWIZJI -->
<section class="relative bg-background py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[300px] bg-gradient-to-r from-primary/5 to-primary/10 blur-[120px] pointer-events-none"></div>
  <div class="max-w-3xl mx-auto relative z-10">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light mb-4">
      Nie bierzemy <span class="font-bold">prowizji od spraw</span>
    </h2>
    <p class="text-secondary text-base sm:text-lg mb-8">
      Ani od klienta, ani od specjalisty. Teraz i w przyszłości.
    </p>
    <div class="space-y-5 text-muted-foreground text-sm sm:text-base leading-relaxed">
      <p>
        Prowizja podnosi cenę klientowi i zabiera specjaliście część wynagrodzenia za pracę, której nie wykonaliśmy. Dlatego płacisz wyłącznie za realną pomoc i płacisz bezpośrednio wybranemu specjaliście, na warunkach, które ustalicie między sobą. Nie stoimy w środku tej płatności.
      </p>
      <p>
        Utrzymujemy się z pakietów, które specjaliści kupują, żeby być bardziej widocznymi. To cały nasz model i nie ma w nim drugiego dna.
      </p>
    </div>
  </div>
</section>

<!-- NIE TYLKO PRAWNICY -->
<section class="bg-background-sec py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
  <div class="max-w-4xl mx-auto">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light mb-6">
      To nie są <span class="font-bold">wyłącznie prawnicy</span>
    </h2>
    <div class="space-y-5 text-muted-foreground text-sm sm:text-base leading-relaxed mb-10">
      <p>
        Sprawy z życia rzadko mieszczą się w jednej dziedzinie. Rozwód to zwykle także podział majątku i podatek. Zakup mieszkania to umowa, ale i opinia rzeczoznawcy. Spór z wykonawcą kończy się na dokumentacji i kosztorysie.
      </p>
      <p>
        Dlatego obok adwokatów, radców prawnych i aplikantów działają u nas doradcy podatkowi i finansowi, księgowi, rzeczoznawcy, architekci oraz specjaliści BHP i PPOŻ.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 mb-8">
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Adwokaci</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Radcowie prawni</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Aplikanci</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Doradcy podatkowi</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Doradcy finansowi</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Księgowi</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Rzeczoznawcy</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">Architekci</span>
      <span class="bg-background border border-border text-foreground/80 text-xs sm:text-sm rounded-full px-4 py-2">BHP i PPOŻ</span>
    </div>

    <p class="font-playfair text-xl sm:text-2xl text-foreground font-light">
      Jedna sprawa, jedno miejsce, kilka głów, które mogą się nią zająć.
    </p>
  </div>
</section>

<!-- NA CZYM NAM ZALEŻY -->
<section class="bg-background py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
  <div class="max-w-6xl mx-auto">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light text-center mb-12">
      Na czym nam <span class="font-bold">zależy</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <svg class="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 class="text-foreground text-lg font-semibold">Sprawdzamy, kto tu odpowiada</h3>
        </div>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Każdy profil weryfikuje administrator platformy, zanim specjalista zacznie odpowiadać na sprawy. Sprawdzamy dokumenty zawodowe i przynależność do samorządu, czyli OIRP albo ORA.
        </p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <svg class="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="text-foreground text-lg font-semibold">Twoje dane zostają Twoje</h3>
        </div>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Sprawę widzą tylko dopasowani specjaliści, nigdy cały internet. Opinie na profilach wystawiają wyłącznie klienci, którzy naprawdę współpracowali, i każda przechodzi moderację.
        </p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <svg class="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 class="text-foreground text-lg font-semibold">Wybór zamiast działania w ciemno</h3>
        </div>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Zanim zdecydujesz, wchodzisz na profil: specjalizacje, doświadczenie, publikacje, certyfikaty, opinie innych klientów. Wybierasz świadomie, a nie na podstawie pierwszego wyniku w wyszukiwarce.
        </p>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-3">
          <svg class="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 class="text-foreground text-lg font-semibold">Konkret zamiast darmowych porad</h3>
        </div>
        <p class="text-muted-foreground text-sm leading-relaxed">
          To nie jest forum z poradami. Specjalista, który odpowiada na Twoją sprawę, chce się nią zająć i od razu mówi, na jakich warunkach.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- CTA KLIENT -->
<section class="relative bg-background-sec py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[340px] bg-gradient-to-r from-primary/5 to-primary/10 blur-[120px] pointer-events-none"></div>
  <div class="max-w-5xl mx-auto relative z-10">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light text-center mb-12">
      Masz sprawę <span class="font-bold">do załatwienia?</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      <div class="bg-background border border-border rounded-xl p-6">
        <h3 class="text-foreground text-base font-semibold mb-2">Dodaj sprawę</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Opisz problem, wybierz kategorię i lokalizację. Zajmie Ci to kilka minut i nic nie kosztuje. Możesz podać widełki cenowe i termin, jeśli goni Cię czas.
        </p>
      </div>

      <div class="bg-background border border-border rounded-xl p-6">
        <h3 class="text-foreground text-base font-semibold mb-2">Porównaj oferty</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Zamiast jednej wyceny dostajesz kilka. Widzisz zakres pomocy, warunki i cenę, a obok pełny profil osoby, która je proponuje.
        </p>
      </div>

      <div class="bg-background border border-border rounded-xl p-6">
        <h3 class="text-foreground text-base font-semibold mb-2">Prowadź sprawę w jednym miejscu</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Czat z wybranym specjalistą, statusy, dokumenty i cała historia zgłoszeń w Twoim panelu. Bez przekopywania skrzynki mailowej.
        </p>
      </div>
    </div>

    <div class="text-center">
      <a href="/dodaj-sprawe" class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm sm:text-base font-semibold rounded-full px-8 py-3.5 transition-colors">
        Dodaj sprawę
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- CTA SPECJALISTA -->
<section class="bg-background py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
  <div class="max-w-3xl mx-auto">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light mb-6">
      Jesteś prawnikiem <span class="font-bold">albo ekspertem?</span>
    </h2>

    <div class="space-y-5 text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
      <p>
        Zamiast szukać klientów, wybierasz sprawy. Trafiają do Ciebie zapytania dopasowane do specjalizacji, a Ty decydujesz, które bierzesz i na jakich warunkach.
      </p>
      <p>
        Konto zakładasz za darmo, pierwsze 3 miesiące są bezpłatne i bez zobowiązań. Od spraw nie pobieramy prowizji, więc to, co ustalisz z klientem, zostaje u Ciebie w całości.
      </p>
      <p>
        W panelu masz sprawy ze statusami, czat, historię kontaktów, faktury i statystyki. Możesz publikować artykuły eksperckie, które budują Twoją widoczność w wyszukiwarkach i w odpowiedziach sztucznej inteligencji. Nad profilem czuwa opiekun, a zaplecze marketingowe zapewnia dom mediowy 4Connection.
      </p>
    </div>

    <a href="/rejestracja/ekspert" class="inline-flex items-center justify-center gap-2 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-sm sm:text-base font-semibold rounded-full px-8 py-3.5 transition-colors">
      Dołącz jako specjalista
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  </div>
</section>

<!-- KTO ZA TYM STOI -->
<section class="bg-background-sec py-16 md:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto">
    <h2 class="font-playfair text-3xl sm:text-4xl text-foreground font-light mb-6">
      Kto <span class="font-bold">za tym stoi</span>
    </h2>

    <p class="text-muted-foreground text-sm sm:text-base leading-relaxed mb-10">
      ProstaSprawa.pl prowadzi Polska Grupa Identyfikacji Firm Sp. z o.o. z Kielc. Platformę budujemy z zespołem, który na co dzień zajmuje się marketingiem i produkcją internetową, więc dobrze wiemy, ile kosztuje dotarcie do klienta i dlaczego dobry specjalista nie powinien walczyć o to sam.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="bg-background border border-border rounded-xl p-6">
        <p class="text-foreground text-sm font-semibold mb-3">Polska Grupa Identyfikacji Firm Sp. z o.o.</p>
        <p class="text-muted-foreground text-sm leading-relaxed mb-3">
          ul. Gen. Mariana Langiewicza 16 lok. 3<br />
          25-381 Kielce
        </p>
        <p class="text-muted-foreground text-xs leading-relaxed">
          KRS 0000768210<br />
          NIP 9592020678<br />
          REGON 382401289
        </p>
      </div>

      <div class="bg-background border border-border rounded-xl p-6">
        <p class="text-foreground text-sm font-semibold mb-3">Kontakt</p>
        <p class="mb-2">
          <a href="mailto:bok@prostasprawa.pl" class="text-primary hover:text-primary-hover text-sm transition-colors">bok@prostasprawa.pl</a>
        </p>
        <p>
          <a href="tel:+48534888555" class="text-primary hover:text-primary-hover text-sm transition-colors">+48 534 888 555</a>
        </p>
      </div>
    </div>
  </div>
</section>
`
      }
    })

    const kontaktModule = await prisma.module.create({
      data: {
        name: 'Kontakt - Formularz i Dane',
        description: 'Sekcja z formularzem kontaktowym, danymi adresowymi i mapą',
        type: ModuleType.EDITABLE_HTML,
        code: `
<div class="container mx-auto px-4 py-12 max-w-6xl">
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold mb-4 text-white">Skontaktuj się z nami</h1>
    <p class="text-lg text-neutral-400 max-w-2xl mx-auto">
      Masz pytania? Chętnie na nie odpowiemy. Skorzystaj z formularza kontaktowego lub skontaktuj się z nami bezpośrednio.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
    <!-- Info Card 1 -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="inline-flex p-3 bg-neutral-950 border border-neutral-800 rounded-full mb-3">
        <svg class="h-6 w-6 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="font-semibold text-white mb-2">Email</h3>
      <a href="mailto:kontakt@prostasprawa.pl" class="text-neutral-400 hover:text-[#E2B13C] block text-sm mb-1">kontakt@prostasprawa.pl</a>
      <a href="mailto:pomoc@prostasprawa.pl" class="text-neutral-400 hover:text-[#E2B13C] block text-sm">pomoc@prostasprawa.pl</a>
    </div>

    <!-- Info Card 2 -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="inline-flex p-3 bg-neutral-950 border border-neutral-800 rounded-full mb-3">
        <svg class="h-6 w-6 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
      <h3 class="font-semibold text-white mb-2">Telefon</h3>
      <a href="tel:+48123456789" class="text-neutral-400 hover:text-[#E2B13C] block text-sm">+48 123 456 789</a>
      <p class="text-xs text-neutral-500 mt-1">pon-pt: 9:00 - 17:00</p>
    </div>

    <!-- Info Card 3 -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="inline-flex p-3 bg-neutral-950 border border-neutral-800 rounded-full mb-3">
        <svg class="h-6 w-6 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 class="font-semibold text-white mb-2">Adres</h3>
      <p class="text-sm text-neutral-400">
        ul. Przykładowa 123<br />
        00-001 Warszawa, Polska
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
    <!-- Form placement -->
    <div class="lg:col-span-2">
      {contact-form}
    </div>

    <!-- Extra Sidebar info -->
    <div class="space-y-6">
      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h4 class="font-bold text-white mb-3 flex items-center gap-2">
          <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Godziny otwarcia
        </h4>
        <div class="space-y-2 text-sm text-neutral-400">
          <div class="flex justify-between">
            <span>Poniedziałek - Piątek</span>
            <span class="text-white font-medium">9:00 - 17:00</span>
          </div>
          <div class="flex justify-between">
            <span>Sobota - Niedziela</span>
            <span class="text-neutral-500">Nieczynne</span>
          </div>
        </div>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
        <svg class="h-10 w-10 text-[#E2B13C] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h4 class="font-bold text-white mb-1">Działamy w całej Polsce</h4>
        <p class="text-xs text-neutral-400">Platforma obsługuje ekspertów oraz sprawy z każdego zakątka kraju.</p>
      </div>
    </div>
  </div>

  <!-- Map Card -->
  <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
    <h3 class="font-bold text-white mb-4">Lokalizacja biura</h3>
    <div class="aspect-video w-full rounded-lg overflow-hidden h-[300px]">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.3287367871634!2d21.01223431593449!3d52.22967797975674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sPalace%20of%20Culture%20and%20Science!5e0!3m2!1sen!2spl!4v1234567890123!5m2!1sen!2spl"
        width="100%"
        height="100%"
        style="border: 0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Lokalizacja na mapie"
      ></iframe>
    </div>
  </div>
</div>
`
      }
    })

    // 2. Create Pages
    console.log('Creating page entities...')

    // Page 1: Regulamin
    const regulaminPage = await prisma.page.create({
      data: {
        title: 'Regulamin platformy',
        slug: 'regulamin',
        metaTitle: 'Regulamin Platformy - Prosta Sprawa',
        metaDescription: 'Zasady korzystania z platformy łączącej klientów z ekspertami prawnymi Prosta Sprawa.',
        published: true,
        publishedAt: new Date(),
      }
    })

    await prisma.pageModule.create({
      data: {
        pageId: regulaminPage.id,
        moduleId: regulaminModule.id,
        order: 0
      }
    })

    // Page 2: Polityka prywatności
    const politykaPage = await prisma.page.create({
      data: {
        title: 'Polityka prywatności',
        slug: 'polityka-prywatnosci',
        metaTitle: 'Polityka Prywatności - Prosta Sprawa',
        metaDescription: 'Dowiedz się jak przetwarzamy i dbamy o bezpieczeństwo Twoich danych osobowych w Prosta Sprawa.',
        published: true,
        publishedAt: new Date(),
      }
    })

    await prisma.pageModule.create({
      data: {
        pageId: politykaPage.id,
        moduleId: politykaModule.id,
        order: 0
      }
    })

    // Page 3: O nas
    const oNasPage = await prisma.page.create({
      data: {
        title: 'O nas',
        slug: 'o-nas',
        metaTitle: 'O nas | ProstaSprawa.pl - platforma bez prowizji od spraw',
        metaDescription: 'Opisujesz sprawę, a zweryfikowani prawnicy i eksperci sami składają oferty. Bez prowizji, bez zobowiązań. Poznaj ProstaSprawa.pl.',
        published: true,
        publishedAt: new Date(),
      }
    })

    await prisma.pageModule.create({
      data: {
        pageId: oNasPage.id,
        moduleId: oNasHeroModule.id,
        order: 0
      }
    })

    await prisma.pageModule.create({
      data: {
        pageId: oNasPage.id,
        moduleId: oNasValuesModule.id,
        order: 1
      }
    })

    // Page 4: Kontakt
    const kontaktPage = await prisma.page.create({
      data: {
        title: 'Kontakt',
        slug: 'kontakt',
        metaTitle: 'Kontakt - Napisz do nas',
        metaDescription: 'Masz pytania lub potrzebujesz pomocy? Skontaktuj się z nami poprzez formularz kontaktowy lub telefonicznie.',
        published: true,
        publishedAt: new Date(),
      }
    })

    await prisma.pageModule.create({
      data: {
        pageId: kontaktPage.id,
        moduleId: kontaktModule.id,
        order: 0
      }
    })
  })

  console.log('✅ Static pages and modules seeded successfully!')
}
