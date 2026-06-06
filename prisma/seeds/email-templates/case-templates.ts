import { EmailType } from '@prisma/client'

export const caseTemplates = [
  {
    typ: EmailType.NOWA_SPRAWA,
    nazwa: 'Nowa sprawa - powiadomienie dla ekspertów',
    temat: 'Nowa sprawa w Twojej kategorii: {nazwaSprawi}',
    tresc: `Witaj {ekspert},

W systemie Prosta Sprawa została dodana nowa sprawa, która może Cię zainteresować!

Szczegóły sprawy:
- Tytuł: {nazwaSprawi}
- Kategoria: {kategoria}
- Klient: {klient}
- Budżet: {budżet}

Zaloguj się do panelu, aby zobaczyć pełne szczegóły i złożyć ofertę.

Powodzenia!
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {ekspert},</h2>
<p style="margin: 0 0 16px 0;">W systemie <strong>ProstaSprawa</strong> została dodana nowa sprawa w Twojej okolicy lub kategorii, która może Cię zainteresować.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Szczegóły sprawy:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">Tytuł:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{nazwaSprawi}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Kategoria:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{kategoria}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Budżet:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{budżet}</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 24px 0;">Zaloguj się do swojego panelu eksperta, aby zapoznać się z pełnym opisem i złożyć ofertę pomocy prawnej.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz szczegóły i złóż ofertę</a>
</div>`,
    zmienne: ['{ekspert}', '{nazwaSprawi}', '{kategoria}', '{klient}', '{budżet}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{nazwaSprawi}': 'Tytuł sprawy',
      '{kategoria}': 'Kategoria prawna',
      '{klient}': 'Imię i nazwisko klienta',
      '{budżet}': 'Zakres budżetu',
      '{linkDoPanelu}': 'Link do panelu eksperta',
    },
    triggery: ['case_created'],
  },
  {
    typ: EmailType.NOWA_OFERTA,
    nazwa: 'Nowa oferta - powiadomienie dla klienta',
    temat: 'Otrzymałeś nową ofertę na sprawę: {nazwaSprawi}',
    tresc: `Witaj {klient},

Dobra wiadomość! Ekspert {ekspert} przesłała Ci ofertę dotyczącą sprawy "{nazwaSprawi}".

Szczegóły oferty:
- Ekspert: {ekspert}
- Kwota: {kwota}
- Termin realizacji: {termin}

Zaloguj się do swojego panelu, aby przejrzeć pełną ofertę i podjąć decyzję.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {klient},</h2>
<p style="margin: 0 0 16px 0;"><strong>Świetne wieści!</strong> Ekspert {ekspert} przesłała nową ofertę dla Twojej sprawy "<strong>{nazwaSprawi}</strong>".</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Szczegóły oferty:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">Ekspert:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{ekspert}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Kwota oferty:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 700; border-top: 1px solid #222222;" width="70%">{kwota}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{termin}</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 24px 0;">Zaloguj się do swojego panelu klienta, aby zapoznać się ze szczegółami propozycji i zdecydować o nawiązaniu współpracy.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz szczegóły oferty</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{nazwaSprawi}', '{kwota}', '{termin}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{klient}': 'Imię klienta',
      '{ekspert}': 'Nazwa eksperta',
      '{nazwaSprawi}': 'Tytuł sprawy',
      '{kwota}': 'Kwota oferty',
      '{termin}': 'Termin realizacji',
      '{linkDoPanelu}': 'Link do panelu klienta',
    },
    triggery: ['offer_created'],
  },
  {
    typ: EmailType.AKCEPTACJA_OFERTY,
    nazwa: 'Akceptacja oferty - powiadomienie dla ekspertów',
    temat: 'Gratulacje! Twoja oferta została zaakceptowana',
    tresc: `Gratulacje {ekspert}!

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
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Gratulacje {ekspert}!</h2>
<p style="margin: 0 0 16px 0;">Klient <strong>{klient}</strong> właśnie zaakceptował Twoją ofertę pomocy prawnej dotyczącą sprawy "<strong>{nazwaSprawi}</strong>".</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Dane kontaktowe i szczegóły:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Kwota:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 700; border-top: 1px solid #222222;" width="70%">{kwota}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">E-mail:</td>
      <td style="padding: 6px 0; font-size: 14px; border-top: 1px solid #222222;" width="70%"><a href="mailto:{emailKlienta}" style="color: #00b49e; font-weight: 600; text-decoration: underline;">{emailKlienta}</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Telefon:</td>
      <td style="padding: 6px 0; font-size: 14px; border-top: 1px solid #222222;" width="70%"><a href="tel:{telefonKlienta}" style="color: #00b49e; font-weight: 600; text-decoration: underline;">{telefonKlienta}</a></td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 24px 0;">Skontaktuj się bezpośrednio z klientem jak najszybciej, aby ustalić szczegóły współpracy oraz podpisać umowę.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przejdź do panelu eksperta</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{nazwaSprawi}', '{kwota}', '{emailKlienta}', '{telefonKlienta}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{nazwaSprawi}': 'Tytuł sprawy',
      '{kwota}': 'Kwota oferty',
      '{emailKlienta}': 'Email klienta',
      '{telefonKlienta}': 'Telefon klienta',
      '{linkDoPanelu}': 'Link do panelu eksperta',
    },
    triggery: ['offer_accepted'],
  },
  {
    typ: EmailType.ODRZUCENIE_OFERTY,
    nazwa: 'Odrzucenie oferty - powiadomienie dla ekspertów',
    temat: 'Oferta odrzucona: {nazwaSprawi}',
    tresc: `Witaj {ekspert},

Informujemy, że klient {klient} odrzucił Twoją ofertę dotyczącą sprawy "{nazwaSprawi}".

Nie martw się - w systemie czeka wiele innych spraw!

Zapraszamy do przeglądania aktualnych spraw w panelu eksperta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {ekspert},</h2>
<p style="margin: 0 0 16px 0;">Chcemy poinformować, że klient <strong>{klient}</strong> zdecydował się odrzucić ofertę złożoną przez Twój profil dla sprawy "<strong>{nazwaSprawi}</strong>".</p>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">💡 Nasza wskazówka:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Nie zniechęcaj się! Na naszym portalu codziennie pojawiają się dziesiątki nowych spraw prawnych. Zwiększ szanse na sukces uzupełniając swój profil o dodatkowe opinie i precyzyjne opisy specjalizacji.</span>
</div>

<p style="margin: 0 0 24px 0;">Przejdź do listy nowych spraw i złóż kolejną ofertę.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSpraw}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przeglądaj nowe sprawy</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{nazwaSprawi}', '{linkDoSpraw}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{nazwaSprawi}': 'Tytuł sprawy',
      '{linkDoSpraw}': 'Link do listy spraw',
    },
    triggery: ['offer_rejected'],
  },
  {
    typ: EmailType.POTWIERDZENIE_DODANIA_SPRAWY,
    nazwa: 'Potwierdzenie dodania sprawy - dla klienta',
    temat: 'Twoja sprawa została pomyślnie dodana: {nazwaSprawy}',
    tresc: `Witaj {klient},

Twoja sprawa "{nazwaSprawy}" została pomyślnie dodana do serwisu Prosta Sprawa!

Szczegóły sprawy:
- Tytuł: {nazwaSprawy}
- Kategoria: {kategoria}
- Budżet: {budzet}

Nasi zweryfikowani prawnicy zostali powiadomieni i wkrótce mogą zacząć składać oferty pomocy. O każdej nowej ofercie poinformujemy Cię e-mailem.

Status swojej sprawy możesz śledzić w panelu klienta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {klient},</h2>
<p style="margin: 0 0 16px 0;">Twoja nowa sprawa "<strong>{nazwaSprawy}</strong>" została pomyślnie dodana i opublikowana w serwisie <strong>ProstaSprawa</strong>!</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Szczegóły zgłoszenia:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="30%">Tytuł:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="70%">{nazwaSprawy}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Kategoria:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{kategoria}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;" width="30%">Budżet:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;" width="70%">{budzet}</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 24px 0;">Nasi zweryfikowani prawnicy zostali już powiadomieni o Twojej sprawie i wkrótce zaczną przesyłać oferty pomocy. O każdej nowej ofercie poinformujemy Cię natychmiast drogą e-mailową.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSprawy}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Śledź swoją sprawę</a>
</div>`,
    zmienne: ['{klient}', '{nazwaSprawy}', '{kategoria}', '{budzet}', '{linkDoSprawy}'],
    opisZmiennych: {
      '{klient}': 'Imię i nazwisko klienta',
      '{nazwaSprawy}': 'Tytuł sprawy',
      '{kategoria}': 'Kategoria prawna',
      '{budzet}': 'Budżet sprawy',
      '{linkDoSprawy}': 'Link do szczegółów sprawy w panelu klienta',
    },
    triggery: ['case_created_client_notification'],
  },
]
