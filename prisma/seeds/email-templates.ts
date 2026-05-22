import { PrismaClient, EmailType } from '@prisma/client'

export async function seedEmailTemplates(prisma: PrismaClient) {
  console.log('Seeding email templates...')

  const templates = [
    {
      typ: EmailType.NOWA_SPRAWA,
      nazwa: 'Nowa sprawa - powiadomienie dla kancelarii',
      temat: 'Nowa sprawa w Twojej kategorii: {nazwaSprawi}',
      tresc: `Witaj {kancelaria},

W systemie Prosta Sprawa została dodana nowa sprawa, która może Cię zainteresować!

Szczegóły sprawy:
- Tytuł: {nazwaSprawi}
- Kategoria: {kategoria}
- Klient: {klient}
- Budżet: {budżet}

Zaloguj się do panelu, aby zobaczyć pełne szczegóły i złożyć ofertę.

Powodzenia!
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Witaj {kancelaria},</h2>
  <p>W systemie Prosta Sprawa została dodana nowa sprawa, która może Cię zainteresować!</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">Szczegóły sprawy:</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Tytuł:</strong> {nazwaSprawi}</li>
      <li><strong>Kategoria:</strong> {kategoria}</li>
      <li><strong>Klient:</strong> {klient}</li>
      <li><strong>Budżet:</strong> {budżet}</li>
    </ul>
  </div>

  <p>Zaloguj się do panelu, aby zobaczyć pełne szczegóły i złożyć ofertę.</p>

  <a href="{linkDoPanelu}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Zobacz sprawę</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Powodzenia!<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{nazwaSprawi}', '{kategoria}', '{klient}', '{budżet}', '{linkDoPanelu}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{nazwaSprawi}': 'Tytuł sprawy',
        '{kategoria}': 'Kategoria prawna',
        '{klient}': 'Imię i nazwisko klienta',
        '{budżet}': 'Zakres budżetu',
        '{linkDoPanelu}': 'Link do panelu kancelarii',
      },
      triggery: ['case_created'],
    },
    {
      typ: EmailType.NOWA_OFERTA,
      nazwa: 'Nowa oferta - powiadomienie dla klienta',
      temat: 'Otrzymałeś nową ofertę na sprawę: {nazwaSprawi}',
      tresc: `Witaj {klient},

Dobra wiadomość! Kancelaria {kancelaria} przesłała Ci ofertę dotyczącą sprawy "{nazwaSprawi}".

Szczegóły oferty:
- Kancelaria: {kancelaria}
- Kwota: {kwota}
- Termin realizacji: {termin}

Zaloguj się do swojego panelu, aby przejrzeć pełną ofertę i podjąć decyzję.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Witaj {klient},</h2>
  <p><strong>Dobra wiadomość!</strong> Kancelaria {kancelaria} przesłała Ci ofertę dotyczącą sprawy "{nazwaSprawi}".</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">Szczegóły oferty:</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Kancelaria:</strong> {kancelaria}</li>
      <li><strong>Kwota:</strong> {kwota}</li>
      <li><strong>Termin realizacji:</strong> {termin}</li>
    </ul>
  </div>

  <p>Zaloguj się do swojego panelu, aby przejrzeć pełną ofertę i podjąć decyzję.</p>

  <a href="{linkDoPanelu}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Zobacz ofertę</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{klient}', '{kancelaria}', '{nazwaSprawi}', '{kwota}', '{termin}', '{linkDoPanelu}'],
      opisZmiennych: {
        '{klient}': 'Imię klienta',
        '{kancelaria}': 'Nazwa kancelarii',
        '{nazwaSprawi}': 'Tytuł sprawy',
        '{kwota}': 'Kwota oferty',
        '{termin}': 'Termin realizacji',
        '{linkDoPanelu}': 'Link do panelu klienta',
      },
      triggery: ['offer_created'],
    },
    {
      typ: EmailType.AKCEPTACJA_OFERTY,
      nazwa: 'Akceptacja oferty - powiadomienie dla kancelarii',
      temat: 'Gratulacje! Twoja oferta została zaakceptowana',
      tresc: `Gratulacje {kancelaria}!

Klient {klient} zaakceptował Twoją ofertę dotyczącą sprawy "{nazwaSprawi}".

Szczegóły:
- Sprawa: {nazwaSprawi}
- Kwota: {kwota}
- Klient: {klient}
- Email: {emailKlienta}
- Telefon: {telefonKlienta}

Możesz teraz skontaktować się z klientem, aby ustalić szczegóły współpracy.

Powodzenia!
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #10b981;">Gratulacje {kancelaria}!</h2>
  <p>Klient {klient} zaakceptował Twoją ofertę dotyczącą sprawy "{nazwaSprawi}".</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">Szczegóły:</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Sprawa:</strong> {nazwaSprawi}</li>
      <li><strong>Kwota:</strong> {kwota}</li>
      <li><strong>Klient:</strong> {klient}</li>
      <li><strong>Email:</strong> {emailKlienta}</li>
      <li><strong>Telefon:</strong> {telefonKlienta}</li>
    </ul>
  </div>

  <p>Możesz teraz skontaktować się z klientem, aby ustalić szczegóły współpracy.</p>

  <a href="{linkDoPanelu}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Przejdź do panelu</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Powodzenia!<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{klient}', '{nazwaSprawi}', '{kwota}', '{emailKlienta}', '{telefonKlienta}', '{linkDoPanelu}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{klient}': 'Imię i nazwisko klienta',
        '{nazwaSprawi}': 'Tytuł sprawy',
        '{kwota}': 'Kwota oferty',
        '{emailKlienta}': 'Email klienta',
        '{telefonKlienta}': 'Telefon klienta',
        '{linkDoPanelu}': 'Link do panelu kancelarii',
      },
      triggery: ['offer_accepted'],
    },
    {
      typ: EmailType.ODRZUCENIE_OFERTY,
      nazwa: 'Odrzucenie oferty - powiadomienie dla kancelarii',
      temat: 'Oferta odrzucona: {nazwaSprawi}',
      tresc: `Witaj {kancelaria},

Informujemy, że klient {klient} odrzucił Twoją ofertę dotyczącą sprawy "{nazwaSprawi}".

Nie martw się - w systemie czeka wiele innych spraw!

Zapraszamy do przeglądania aktualnych spraw w panelu kancelarii.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Witaj {kancelaria},</h2>
  <p>Informujemy, że klient {klient} odrzucił Twoją ofertę dotyczącą sprawy "{nazwaSprawi}".</p>

  <p>Nie martw się - w systemie czeka wiele innych spraw!</p>

  <a href="{linkDoSpraw}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Przeglądaj sprawy</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{klient}', '{nazwaSprawi}', '{linkDoSpraw}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{klient}': 'Imię i nazwisko klienta',
        '{nazwaSprawi}': 'Tytuł sprawy',
        '{linkDoSpraw}': 'Link do listy spraw',
      },
      triggery: ['offer_rejected'],
    },
    {
      typ: EmailType.NOWA_WIADOMOSC,
      nazwa: 'Nowa wiadomość w systemie',
      temat: 'Masz nową wiadomość od {nadawca}',
      tresc: `Witaj {odbiorca},

Otrzymałeś nową wiadomość w systemie Prosta Sprawa.

Od: {nadawca}
Wiadomość: {fragmentWiadomosci}...

Zaloguj się do panelu, aby przeczytać pełną wiadomość i odpowiedzieć.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Witaj {odbiorca},</h2>
  <p>Otrzymałeś nową wiadomość w systemie Prosta Sprawa.</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Od:</strong> {nadawca}</p>
    <p><strong>Wiadomość:</strong></p>
    <p style="font-style: italic; color: #4b5563;">{fragmentWiadomosci}...</p>
  </div>

  <a href="{linkDoWiadomosci}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Przeczytaj wiadomość</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{odbiorca}', '{nadawca}', '{fragmentWiadomosci}', '{linkDoWiadomosci}'],
      opisZmiennych: {
        '{odbiorca}': 'Imię odbiorcy',
        '{nadawca}': 'Imię i nazwisko nadawcy',
        '{fragmentWiadomosci}': 'Fragment wiadomości (pierwsze 100 znaków)',
        '{linkDoWiadomosci}': 'Link do wiadomości',
      },
      triggery: ['message_received'],
    },
    {
      typ: EmailType.NOWA_OPINIA,
      nazwa: 'Nowa opinia - powiadomienie dla kancelarii',
      temat: 'Otrzymałeś nową opinię od klienta',
      tresc: `Witaj {kancelaria},

Klient {klient} wystawił Ci opinię!

Ocena: {ocena}/5
Komentarz: {komentarz}

Dziękujemy za świadczenie usług prawnych za pośrednictwem platformy Prosta Sprawa.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Witaj {kancelaria},</h2>
  <p>Klient {klient} wystawił Ci opinię!</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Ocena:</strong> <span style="color: #f59e0b; font-size: 24px;">{ocena}/5 ⭐</span></p>
    <p><strong>Komentarz:</strong></p>
    <p style="font-style: italic; color: #4b5563;">{komentarz}</p>
  </div>

  <a href="{linkDoProfilu}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Zobacz profil</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Dziękujemy za świadczenie usług prawnych za pośrednictwem platformy Prosta Sprawa.<br><br>Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{klient}', '{ocena}', '{komentarz}', '{linkDoProfilu}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{klient}': 'Imię i nazwisko klienta',
        '{ocena}': 'Ocena (1-5)',
        '{komentarz}': 'Treść opinii',
        '{linkDoProfilu}': 'Link do profilu kancelarii',
      },
      triggery: ['review_created'],
    },
    {
      typ: EmailType.REJESTRACJA_KLIENT,
      nazwa: 'Witamy nowego klienta',
      temat: 'Witamy w Prosta Sprawa!',
      tresc: `Witaj {imie}!

Dziękujemy za rejestrację w serwisie Prosta Sprawa - platformie łączącej klientów z najlepszymi kancelariami prawnymi w Polsce.

Twoje konto zostało utworzone pomyślnie:
Email: {email}

Co możesz teraz zrobić:
1. Dodaj swoją pierwszą sprawę
2. Przeglądaj profile kancelarii
3. Otrzymuj oferty od prawników
4. Porównuj i wybieraj najlepsze oferty

Rozpocznij od dodania swojej sprawy - to zajmie tylko kilka minut!

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb; text-align: center;">Witamy w Prosta Sprawa!</h1>

  <p>Witaj {imie}!</p>

  <p>Dziękujemy za rejestrację w serwisie Prosta Sprawa - platformie łączącej klientów z najlepszymi kancelariami prawnymi w Polsce.</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Twoje konto zostało utworzone pomyślnie:</strong></p>
    <p>Email: {email}</p>
  </div>

  <h3 style="color: #1f2937;">Co możesz teraz zrobić:</h3>
  <ol style="color: #4b5563; line-height: 1.8;">
    <li>Dodaj swoją pierwszą sprawę</li>
    <li>Przeglądaj profile kancelarii</li>
    <li>Otrzymuj oferty od prawników</li>
    <li>Porównuj i wybieraj najlepsze oferty</li>
  </ol>

  <a href="{linkDodajSprawa}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Dodaj pierwszą sprawę</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{imie}', '{nazwisko}', '{email}', '{linkDodajSprawa}'],
      opisZmiennych: {
        '{imie}': 'Imię użytkownika',
        '{nazwisko}': 'Nazwisko użytkownika',
        '{email}': 'Adres email',
        '{linkDodajSprawa}': 'Link do formularza dodawania sprawy',
      },
      triggery: ['user_registered_client'],
    },
    {
      typ: EmailType.REJESTRACJA_KANCELARIA,
      nazwa: 'Witamy nową kancelarię',
      temat: 'Witamy w Prosta Sprawa - Panel Kancelarii',
      tresc: `Witamy {nazwa}!

Dziękujemy za dołączenie do platformy Prosta Sprawa. Twoja rejestracja przebiegła pomyślnie.

Dane kancelarii:
Nazwa: {nazwa}
Email: {email}
NIP: {nip}

Status konta: Oczekuje na weryfikację

Kolejne kroki:
1. Uzupełnij profil swojej kancelarii
2. Dodaj usługi i ceny
3. Wybierz obszary działania
4. Poczekaj na weryfikację konta (1-2 dni robocze)
5. Po weryfikacji zacznij składać oferty na sprawy

Zespół Prosta Sprawa sprawdzi Twoje dane i skontaktuje się z Tobą w ciągu 48 godzin.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb; text-align: center;">Witamy w Prosta Sprawa!</h1>

  <p>Witamy {nazwa}!</p>

  <p>Dziękujemy za dołączenie do platformy Prosta Sprawa. Twoja rejestracja przebiegła pomyślnie.</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Dane kancelarii:</h3>
    <p><strong>Nazwa:</strong> {nazwa}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>NIP:</strong> {nip}</p>
    <p><strong>Status:</strong> <span style="color: #f59e0b;">⏳ Oczekuje na weryfikację</span></p>
  </div>

  <h3 style="color: #1f2937;">Kolejne kroki:</h3>
  <ol style="color: #4b5563; line-height: 1.8;">
    <li>Uzupełnij profil swojej kancelarii</li>
    <li>Dodaj usługi i ceny</li>
    <li>Wybierz obszary działania</li>
    <li>Poczekaj na weryfikację konta (1-2 dni robocze)</li>
    <li>Po weryfikacji zacznij składać oferty na sprawy</li>
  </ol>

  <p style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <strong>Informacja:</strong> Zespół Prosta Sprawa sprawdzi Twoje dane i skontaktuje się z Tobą w ciągu 48 godzin.
  </p>

  <a href="{linkDoPanelu}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Przejdź do panelu</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{nazwa}', '{email}', '{nip}', '{linkDoPanelu}'],
      opisZmiennych: {
        '{nazwa}': 'Nazwa kancelarii',
        '{email}': 'Adres email',
        '{nip}': 'Numer NIP',
        '{linkDoPanelu}': 'Link do panelu kancelarii',
      },
      triggery: ['user_registered_law_firm'],
    },
    {
      typ: EmailType.RESET_HASLA,
      nazwa: 'Reset hasła',
      temat: 'Reset hasła - Prosta Sprawa',
      tresc: `Witaj,

Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie Prosta Sprawa.

Aby ustawić nowe hasło, kliknij w poniższy link:
{linkResetHasla}

Link jest ważny przez 1 godzinę.

Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Reset hasła</h2>

  <p>Witaj,</p>

  <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie Prosta Sprawa.</p>

  <p>Aby ustawić nowe hasło, kliknij w poniższy przycisk:</p>

  <a href="{linkResetHasla}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Zresetuj hasło</a>

  <p style="color: #6b7280; font-size: 14px;">Link jest ważny przez 1 godzinę.</p>

  <p style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 14px;">
    <strong>Uwaga:</strong> Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.
  </p>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{email}', '{linkResetHasla}'],
      opisZmiennych: {
        '{email}': 'Adres email użytkownika',
        '{linkResetHasla}': 'Link do resetowania hasła',
      },
      triggery: ['password_reset_requested'],
    },
    {
      typ: EmailType.POTWIERDZENIE_EMAIL,
      nazwa: 'Potwierdzenie adresu email',
      temat: 'Potwierdź swój adres email - Prosta Sprawa',
      tresc: `Witaj {imie},

Dziękujemy za rejestrację w serwisie Prosta Sprawa.

Aby dokończyć proces rejestracji, potwierdź swój adres email klikając w poniższy link:
{linkPotwierdzenia}

Twój kod weryfikacyjny: {kod}

Link jest ważny przez 24 godziny.

Jeśli nie zakładałeś konta w Prosta Sprawa, zignoruj tę wiadomość.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Potwierdź swój adres email</h2>

  <p>Witaj {imie},</p>

  <p>Dziękujemy za rejestrację w serwisie Prosta Sprawa.</p>

  <p>Aby dokończyć proces rejestracji, potwierdź swój adres email klikając w poniższy przycisk:</p>

  <a href="{linkPotwierdzenia}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Potwierdź email</a>

  <p>Twój kod weryfikacyjny: <strong style="font-size: 24px; letter-spacing: 2px;">{kod}</strong></p>

  <p style="color: #6b7280; font-size: 14px;">Link jest ważny przez 24 godziny.</p>

  <p style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 14px;">
    <strong>Uwaga:</strong> Jeśli nie zakładałeś konta w Prosta Sprawa, zignoruj tę wiadomość.
  </p>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{imie}', '{email}', '{linkPotwierdzenia}', '{kod}'],
      opisZmiennych: {
        '{imie}': 'Imię użytkownika',
        '{email}': 'Adres email',
        '{linkPotwierdzenia}': 'Link do potwierdzenia adresu email',
        '{kod}': '6-cyfrowy kod weryfikacyjny',
      },
      triggery: ['email_verification_requested'],
    },
    {
      typ: EmailType.PLATNOSC_POTWIERDZONA,
      nazwa: 'Potwierdzenie płatności',
      temat: 'Potwierdzenie płatności - Prosta Sprawa',
      tresc: `Witaj {kancelaria},

Twoja płatność została pomyślnie przetworzona!

Szczegóły zamówienia:
- Numer zamówienia: {numerZamowienia}
- Produkt: {produkt}
- Kwota: {kwota}
- Data: {data}

{szczegoly}

Faktura VAT została wygenerowana i jest dostępna w panelu kancelarii.

Dziękujemy za zakup!
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #10b981;">✓ Płatność potwierdzona</h2>

  <p>Witaj {kancelaria},</p>

  <p>Twoja płatność została pomyślnie przetworzona!</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">Szczegóły zamówienia:</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Numer zamówienia:</strong> {numerZamowienia}</li>
      <li><strong>Produkt:</strong> {produkt}</li>
      <li><strong>Kwota:</strong> {kwota}</li>
      <li><strong>Data:</strong> {data}</li>
    </ul>
  </div>

  <div style="background-color: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
    {szczegoly}
  </div>

  <p>Faktura VAT została wygenerowana i jest dostępna w panelu kancelarii.</p>

  <a href="{linkDoFaktury}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Pobierz fakturę</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Dziękujemy za zakup!<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{numerZamowienia}', '{produkt}', '{kwota}', '{data}', '{szczegoly}', '{linkDoFaktury}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{numerZamowienia}': 'Numer zamówienia',
        '{produkt}': 'Nazwa produktu/pakietu',
        '{kwota}': 'Kwota płatności',
        '{data}': 'Data transakcji',
        '{szczegoly}': 'Dodatkowe szczegóły (np. liczba punktów)',
        '{linkDoFaktury}': 'Link do pobrania faktury',
      },
      triggery: ['payment_confirmed'],
    },
    {
      typ: EmailType.SUBSKRYPCJA_WYGASA,
      nazwa: 'Przypomnienie o wygasającej subskrypcji',
      temat: 'Twoja subskrypcja wygasa za {dniDoWygasniecia} dni',
      tresc: `Witaj {kancelaria},

Informujemy, że Twoja subskrypcja pakietu {nazwaSubskrypcji} w serwisie Prosta Sprawa wygasa za {dniDoWygasniecia} dni.

Data wygaśnięcia: {dataWygasniecia}

Po wygaśnięciu subskrypcji stracisz dostęp do:
{listaFunkcji}

Aby przedłużyć subskrypcję i zachować wszystkie korzyści, zaloguj się do panelu kancelarii.

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #f59e0b;">⚠️ Twoja subskrypcja wygasa</h2>

  <p>Witaj {kancelaria},</p>

  <p>Informujemy, że Twoja subskrypcja pakietu <strong>{nazwaSubskrypcji}</strong> w serwisie Prosta Sprawa wygasa za <strong>{dniDoWygasniecia} dni</strong>.</p>

  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
    <p style="margin: 0;"><strong>Data wygaśnięcia:</strong> {dataWygasniecia}</p>
  </div>

  <p><strong>Po wygaśnięciu subskrypcji stracisz dostęp do:</strong></p>
  {listaFunkcji}

  <p>Aby przedłużyć subskrypcję i zachować wszystkie korzyści, kliknij poniższy przycisk:</p>

  <a href="{linkDoPakietow}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Przedłuż subskrypcję</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{nazwaSubskrypcji}', '{dniDoWygasniecia}', '{dataWygasniecia}', '{listaFunkcji}', '{linkDoPakietow}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{nazwaSubskrypcji}': 'Nazwa pakietu subskrypcyjnego',
        '{dniDoWygasniecia}': 'Liczba dni do wygaśnięcia',
        '{dataWygasniecia}': 'Data wygaśnięcia subskrypcji',
        '{listaFunkcji}': 'Lista funkcji, do których stracisz dostęp',
        '{linkDoPakietow}': 'Link do wyboru pakietu',
      },
      triggery: ['subscription_expiring'],
    },
    {
      typ: EmailType.NISKI_STAN_PUNKTOW,
      nazwa: 'Przypomnienie o niskim stanie punktów',
      temat: 'Niski stan punktów - uzupełnij saldo',
      tresc: `Witaj {kancelaria},

Twoje saldo punktów w systemie Prosta Sprawa jest niskie.

Aktualny stan: {aktualnyStanPunktow} punktów

Z tego powodu możesz nie móc:
- Promować swojego profilu
- Wyróżniać ofert
- Zwiększać widoczności w wynikach wyszukiwania

Uzupełnij saldo, aby dalej korzystać ze wszystkich możliwości platformy!

Pozdrawiamy,
Zespół Prosta Sprawa`,
      trescHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #f59e0b;">⚠️ Niski stan punktów</h2>

  <p>Witaj {kancelaria},</p>

  <p>Twoje saldo punktów w systemie Prosta Sprawa jest niskie.</p>

  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; text-align: center;">
    <p style="margin: 0;"><strong>Aktualny stan:</strong></p>
    <p style="margin: 10px 0 0 0; font-size: 32px; color: #f59e0b; font-weight: bold;">{aktualnyStanPunktow} punktów</p>
  </div>

  <p><strong>Z tego powodu możesz nie móc:</strong></p>
  <ul style="color: #4b5563; line-height: 1.8;">
    <li>Promować swojego profilu</li>
    <li>Wyróżniać ofert</li>
    <li>Zwiększać widoczności w wynikach wyszukiwania</li>
  </ul>

  <a href="{linkDoSklepu}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Kup punkty</a>

  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Pozdrawiamy,<br>Zespół Prosta Sprawa</p>
</div>`,
      zmienne: ['{kancelaria}', '{aktualnyStanPunktow}', '{linkDoSklepu}'],
      opisZmiennych: {
        '{kancelaria}': 'Nazwa kancelarii',
        '{aktualnyStanPunktow}': 'Aktualna liczba punktów',
        '{linkDoSklepu}': 'Link do sklepu z punktami',
      },
      triggery: ['points_low'],
    },
  ]

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: {
        // Use a unique combination for upsert
        typ: template.typ as any,
      },
      update: {
        nazwa: template.nazwa,
        temat: template.temat,
        tresc: template.tresc,
        trescHtml: template.trescHtml,
        zmienne: JSON.stringify(template.zmienne),
        opisZmiennych: JSON.stringify(template.opisZmiennych),
        triggery: JSON.stringify(template.triggery),
        aktywny: true,
      },
      create: {
        typ: template.typ,
        nazwa: template.nazwa,
        temat: template.temat,
        tresc: template.tresc,
        trescHtml: template.trescHtml,
        zmienne: JSON.stringify(template.zmienne),
        opisZmiennych: JSON.stringify(template.opisZmiennych),
        triggery: JSON.stringify(template.triggery),
        aktywny: true,
      },
    })
  }

  console.log('Email templates seeded successfully!')
}
