import { EmailType } from '@prisma/client'

export const referralTemplates = [
  {
    typ: EmailType.POLECENIE_SPRAWY,
    nazwa: 'Polecenie sprawy przez eksperta (dla klienta)',
    temat: '{ekspert} poleca Ci założenie sprawy w Prosta Sprawa',
    tresc: `Witaj,

Ekspert {ekspert} przygotował dla Ciebie zgłoszenie sprawy w serwisie Prosta Sprawa.

Zakres: {kategorie}
Lokalizacja: {lokalizacja}
Proponowana nazwa sprawy: {nazwaSprawy}

Wiadomość od eksperta:
{wiadomosc}

Aby dokończyć zgłoszenie, otwórz poniższy link, załóż konto (lub zaloguj się) i uzupełnij pozostałe informacje o sprawie:
{linkPolecenia}

Link jest ważny do {waznyDo} i możesz z niego skorzystać tylko raz.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Ekspert poleca Ci założenie sprawy</h2>
<p style="margin: 0 0 16px 0;">Ekspert <strong>{ekspert}</strong> przygotował dla Ciebie wstępne zgłoszenie sprawy w serwisie <strong>ProstaSprawa</strong>. Wystarczy, że dokończysz kilka pozostałych informacji.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Przygotowane przez eksperta:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Sprawa:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{nazwaSprawy}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Zakres:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{kategorie}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Lokalizacja:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{lokalizacja}</td>
    </tr>
  </table>
</div>

<div style="background-color: #10201d; border-left: 3px solid #00b49e; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
  <p style="margin: 0 0 8px 0; font-size: 13px; color: #a3a3a3; font-weight: 500;">Wiadomość od eksperta:</p>
  <p style="margin: 0; font-size: 14px; color: #e5e5e5; font-style: italic;">{wiadomosc}</p>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkPolecenia}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Dokończ zgłoszenie sprawy</a>
</div>

<p style="margin: 0; font-size: 13px; color: #a3a3a3; text-align: center;">Link jest ważny do <strong style="color: #e5e5e5;">{waznyDo}</strong> i można z niego skorzystać tylko raz.</p>`,
    zmienne: ['{ekspert}', '{kategorie}', '{lokalizacja}', '{nazwaSprawy}', '{wiadomosc}', '{linkPolecenia}', '{waznyDo}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta polecającego',
      '{kategorie}': 'Kategorie sprawy wybrane przez eksperta',
      '{lokalizacja}': 'Miasto i województwo sprawy',
      '{nazwaSprawy}': 'Proponowana nazwa sprawy',
      '{wiadomosc}': 'Wiadomość od eksperta do klienta',
      '{linkPolecenia}': 'Jednorazowy link polecający',
      '{waznyDo}': 'Data ważności linku',
    },
    triggery: ['case_referral_created'],
  },
  {
    typ: EmailType.POLECENIE_SPRAWA_UTWORZONA,
    nazwa: 'Klient z polecenia utworzył sprawę (dla eksperta)',
    temat: 'Klient z Twojego polecenia dodał sprawę: {nazwaSprawy}',
    tresc: `Witaj {ekspert},

Dobra wiadomość! Klient {klient} ({email}), którego poleciłeś, założył konto i dodał sprawę.

Sprawa: {nazwaSprawy}
Kategorie: {kategorie}

Sprawa jest widoczna w Twoim panelu — możesz od razu złożyć ofertę:
{linkDoSprawy}

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Twoje polecenie przyniosło sprawę</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 20px 0;">Klient, którego poleciłeś, założył konto i dodał sprawę w serwisie <strong>ProstaSprawa</strong>.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Sprawa:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{nazwaSprawy}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Kategorie:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{kategorie}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">E-mail:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{email}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSprawy}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz sprawę i złóż ofertę</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{email}', '{nazwaSprawy}', '{kategorie}', '{linkDoSprawy}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta polecającego',
      '{klient}': 'Imię i nazwisko klienta',
      '{email}': 'Adres e-mail klienta',
      '{nazwaSprawy}': 'Tytuł utworzonej sprawy',
      '{kategorie}': 'Kategorie sprawy',
      '{linkDoSprawy}': 'Link do sprawy w panelu eksperta',
    },
    triggery: ['case_referral_completed'],
  },
]
