import { EmailType } from '@prisma/client'

export const authTemplates = [
  {
    typ: EmailType.REJESTRACJA_KLIENT,
    nazwa: 'Witamy nowego klienta',
    temat: 'Witamy w Prosta Sprawa!',
    tresc: `Witaj {imie}!

Dziękujemy za rejestrację w serwisie Prosta Sprawa - platformie łączącej klientów z najlepszymi ekspertami prawnymi w Polsce.

Twoje konto zostało utworzone pomyślnie:
Email: {email}

Co możesz teraz zrobić:
1. Dodaj swoją pierwszą sprawę
2. Przeglądaj profile eksperta
3. Otrzymuj oferty od prawników
4. Porównuj i wybieraj najlepsze oferty

Rozpocznij od dodania swojej sprawy - to zajmie tylko kilka minut!

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h1 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 26px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 20px; text-align: center;">Witamy w ProstaSprawa!</h1>
<p style="margin: 0 0 16px 0;">Witaj <strong>{imie}</strong>,</p>
<p style="margin: 0 0 16px 0;">Dziękujemy za rejestrację w serwisie <strong>ProstaSprawa</strong> – nowoczesnej platformie pomagającej szybko, wygodnie i bezstresowo rozwiązywać sprawy prawne łącząc Cię ze sprawdzonymi ekspertami.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 8px;">Dane Twojego konta:</strong>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">E-mail:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{email}</td>
    </tr>
  </table>
</div>

<h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 24px; margin-bottom: 12px;">Co możesz teraz zrobić?</h3>
<ul style="margin: 0 0 24px 0; padding-left: 20px; color: #d4d4d4; line-height: 1.6;">
  <li style="margin-bottom: 8px;"><strong>Dodaj swoją pierwszą sprawę:</strong> Opisz swój problem prawny w 2-3 prostych krokach.</li>
  <li style="margin-bottom: 8px;"><strong>Otrzymuj oferty:</strong> Zweryfikowani adwokaci i radcowie prawni przeanalizują sprawę i składają oferty.</li>
  <li style="margin-bottom: 0;"><strong>Wybierz profesjonalistę:</strong> Porównaj opinie, warunki finansowe i podejmij decyzję.</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDodajSprawa}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Opisz i dodaj sprawę</a>
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
    nazwa: 'Witamy nowego eksperta',
    temat: 'Witamy w Prosta Sprawa - Panel Eksperta',
    tresc: `Witamy {nazwa}!

Dziękujemy za dołączenie do platformy Prosta Sprawa. Twoja rejestracja przebiegła pomyślnie.

Dane eksperta:
Nazwa: {nazwa}
Email: {email}
NIP: {nip}

Status konta: Oczekuje na weryfikację

Kolejne kroki:
1. Uzupełnij profil swojej eksperta
2. Dodaj usługi i ceny
3. Wybierz obszary działania
4. Poczekaj na weryfikację konta (1-2 dni robocze)
5. Po weryfikacji zacznij składać oferty na sprawy

Zespół Prosta Sprawa sprawdzi Twoje dane i skontaktuje się z Tobą w ciągu 48 godzin.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h1 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 26px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 20px; text-align: center;">Witamy w ProstaSprawa!</h1>
<p style="margin: 0 0 16px 0;">Witamy eksperta <strong>{nazwa}</strong>,</p>
<p style="margin: 0 0 16px 0;">Cieszymy się, że dołączasz do grona profesjonalistów świadczących usługi prawne za pośrednictwem serwisu <strong>ProstaSprawa</strong>. Twoja rejestracja przebiegła pomyślnie.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Dane Twojego konta:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">Nazwa:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{nazwa}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">E-mail:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;">{email}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">NIP:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;">{nip}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Status:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #f59e0b; font-weight: 600; border-top: 1px solid #222222;">⏳ Oczekuje na weryfikację</td>
    </tr>
  </table>
</div>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">ℹ️ Co się teraz wydarzy?</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Nasz zespół weryfikacyjny sprawdzi poprawność wprowadzonych danych rejestrowych oraz uprawnienia zawodowe w ciągu 1-2 dni roboczych. Po pozytywnej weryfikacji otrzymasz powiadomienie e-mail i będziesz mógł zacząć składać oferty.</span>
</div>

<h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 24px; margin-bottom: 12px;">W międzyczasie uzupełnij swój profil:</h3>
<ul style="margin: 0 0 24px 0; padding-left: 20px; color: #d4d4d4; line-height: 1.6;">
  <li style="margin-bottom: 8px;">Dodaj logo ekspercie i profesjonalny opis zespołu.</li>
  <li style="margin-bottom: 8px;">Określ precyzyjnie specjalizacje i obszary działania.</li>
  <li style="margin-bottom: 0;">Skonfiguruj godziny pracy i formy kontaktu.</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Uzupełnij profil w panelu</a>
</div>`,
    zmienne: ['{nazwa}', '{email}', '{nip}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{nazwa}': 'Nazwa eksperta',
      '{email}': 'Adres email',
      '{nip}': 'Numer NIP',
      '{linkDoPanelu}': 'Link do panelu eksperta',
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

Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Towje hasło pozostanie bez zmian.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Resetowanie hasła</h2>
<p style="margin: 0 0 16px 0;">Witaj,</p>
<p style="margin: 0 0 16px 0;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie <strong>ProstaSprawa</strong>.</p>
<p style="margin: 0 0 24px 0;">Aby ustawić nowe hasło do konta, kliknij w poniższy przycisk:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkResetHasla}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zresetuj hasło</a>
</div>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">⚠️ Ważne informacje:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Link do zresetowania hasła jest aktywny przez 1 godzinę. Jeśli to nie Ty wysyłałeś tę prośbę, po prostu zignoruj tę wiadomość – Twoje dotychczasowe hasło pozostanie w pełni bezpieczne i niezmienione.</span>
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
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Potwierdź swój adres e-mail</h2>
<p style="margin: 0 0 16px 0;">Witaj {imie},</p>
<p style="margin: 0 0 16px 0;">Dziękujemy za rejestrację w portalu <strong>ProstaSprawa</strong>. Jesteśmy dumni, że z nami jesteś.</p>
<p style="margin: 0 0 24px 0;">Aby w pełni aktywować konto i zacząć korzystać z serwisu, potwierdź swój adres e-mail klikając poniższy przycisk:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkPotwierdzenia}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Potwierdź adres e-mail</a>
</div>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
  <span style="font-size: 14px; color: #a3a3a3; font-weight: 500; display: block; margin-bottom: 8px;">Twój kod weryfikacyjny:</span>
  <strong style="font-size: 26px; letter-spacing: 4px; color: #00b49e; font-family: monospace;">{kod}</strong>
</div>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">⚠️ Ważne informacje:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Link oraz kod weryfikacyjny są ważne przez 24 godziny. Jeśli nie zakładałeś konta, po prostu zignoruj ten e-mail.</span>
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
]
