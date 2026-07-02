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
        <li><strong>1. Platforma</strong> - serwis internetowy Prosta Sprawa dostępny pod adresem www.prosta-sprawa.pl</li>
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
            <li>Przeglądanie profili eksperta</li>
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
      <p class="mb-2"><strong>1.</strong> Reklamacje dotyczące działania Platformy można zgłaszać pod adresem e-mail: kontakt@prosta-sprawa.pl.</p>
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
      <a href="mailto:kontakt@prosta-sprawa.pl" class="text-[#E2B13C] hover:underline">kontakt@prosta-sprawa.pl</a>
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
        <p>Email: iod@prosta-sprawa.pl</p>
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
      name: 'O nas - Hero i Misja',
      description: 'Główna sekcja hero oraz misja portalu na stronie O nas',
      type: ModuleType.EDITABLE_HTML,
      code: `
<div class="container mx-auto px-4 py-12 max-w-6xl">
  <!-- Hero Section -->
  <div class="text-center mb-16">
    <div class="inline-flex items-center justify-center p-3 bg-neutral-900 border border-neutral-800 rounded-full mb-4">
      <svg class="h-8 w-8 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-bold mb-4">O Prosta Sprawa</h1>
    <p class="text-xl text-neutral-400 max-w-3xl mx-auto">
      Łączymy osoby potrzebujące pomocy prawnej z najlepszymi ekspertami w Polsce
    </p>
  </div>

  <!-- Mission Statement -->
  <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-12 shadow-sm">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4 text-white">Nasza Misja</h2>
      <p class="text-lg leading-relaxed text-neutral-300 max-w-3xl mx-auto">
        Demokratyzujemy dostęp do usług prawnych, umożliwiając każdemu znalezienie odpowiedniej
        pomocy prawnej w przystępnej cenie. Wspieramy rozwój ekspertów prawnych poprzez
        nowoczesne narzędzia marketingowe i dostęp do klientów z całej Polski.
      </p>
    </div>
  </div>

  <!-- Statistics -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="text-4xl font-bold text-[#E2B13C] mb-2">1000+</div>
      <p class="text-neutral-400">Aktywnych Eksperta</p>
    </div>
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="text-4xl font-bold text-[#E2B13C] mb-2">5000+</div>
      <p class="text-neutral-400">Rozwiązanych Spraw</p>
    </div>
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="text-4xl font-bold text-[#E2B13C] mb-2">98%</div>
      <p class="text-neutral-400">Zadowolonych Klientów</p>
    </div>
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      <div class="text-4xl font-bold text-[#E2B13C] mb-2">24/7</div>
      <p class="text-neutral-400">Dostępność Platformy</p>
    </div>
  </div>
</div>
`
    }
  })

  const oNasValuesModule = await prisma.module.create({
    data: {
      name: 'O nas - Wartości i Historia',
      description: 'Historia firmy oraz sekcja z głównymi wartościami',
      type: ModuleType.EDITABLE_HTML,
      code: `
<div class="container mx-auto px-4 py-6 max-w-6xl">
  <!-- Our Story -->
  <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-8 mb-12 shadow-sm text-neutral-300">
    <h3 class="text-2xl font-bold mb-4 text-white">Nasza Historia</h3>
    <div class="space-y-4">
      <p class="leading-relaxed">
        Prosta Sprawa powstała z frustracji związanej z tradycyjnym procesem szukania pomocy prawnej.
        Założyciele platformy, po własnych doświadczeniach z trudnościami w znalezieniu odpowiedniej
        eksperta, postanowili stworzyć rozwiązanie, które uprości ten proces.
      </p>
      <p class="leading-relaxed">
        Dziś Prosta Sprawa to największa polska platforma łącząca klientów z ekspertami prawnymi.
        Obsługujemy wszystkie 16 województw, oferując dostęp do szerokiego spektrum specjalizacji
        prawnych.
      </p>
    </div>
  </div>

  <!-- Our Values -->
  <div class="mb-16">
    <h2 class="text-3xl font-bold text-center mb-8 text-white">Nasze Wartości</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h4 class="text-lg font-bold mb-2 text-white flex items-center gap-2">
          <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Bezpieczeństwo
        </h4>
        <p class="text-sm text-neutral-400">
          Wszyscy eksperci są weryfikowani. Twoje dane są chronione najwyższymi standardami bezpieczeństwa zgodnie z RODO.
        </p>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h4 class="text-lg font-bold mb-2 text-white flex items-center gap-2">
          <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Szybkość
        </h4>
        <p class="text-sm text-neutral-400">
          Pierwsze oferty już po kilku godzinach. Uproszczony proces pozwala zaoszczędzić czas i energię.
        </p>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h4 class="text-lg font-bold mb-2 text-white flex items-center gap-2">
          <svg class="h-5 w-5 text-[#E2B13C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
          </svg>
          Transparentność
        </h4>
        <p class="text-sm text-neutral-400">
          Jasne ceny, szczegółowe profile eksperta, prawdziwe opinie klientów. Żadnych ukrytych kosztów.
        </p>
      </div>
    </div>
  </div>
</div>
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
      <a href="mailto:kontakt@prosta-sprawa.pl" class="text-neutral-400 hover:text-[#E2B13C] block text-sm mb-1">kontakt@prosta-sprawa.pl</a>
      <a href="mailto:pomoc@prosta-sprawa.pl" class="text-neutral-400 hover:text-[#E2B13C] block text-sm">pomoc@prosta-sprawa.pl</a>
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
      metaTitle: 'O nas - Poznaj Prosta Sprawa',
      metaDescription: 'Kim jesteśmy? Poznaj naszą historię, misję oraz wartości stojące za platformą Prosta Sprawa.',
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
