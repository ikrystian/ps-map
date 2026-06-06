import { EmailType } from '@prisma/client'

export const billingTemplates = [
  {
    typ: EmailType.PLATNOSC_POTWIERDZONA,
    nazwa: 'Potwierdzenie płatności',
    temat: 'Potwierdzenie płatności - Prosta Sprawa',
    tresc: `Witaj {ekspert},

Twoja płatność została pomyślnie przetworzona!

Szczegóły zamówienia:
- Numer zamówienia: {numerZamowienia}
- Produkt: {produkt}
- Kwota: {kwota}
- Data: {data}

{szczegoly}

Faktura VAT została wygenerowana i jest dostępna w panelu eksperta.

Dziękujemy za zakup!
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 16px; color: #00b49e;">✓ Płatność zatwierdzona pomyślnie</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 16px 0;">Z przyjemnością informujemy, że Twoja płatność za zamówienie została zaksięgowana w systemie i pomyślnie przetworzona.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #222222; padding-bottom: 8px;">Szczegóły transakcji:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Numer zamówienia:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="65%">{numerZamowienia}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Zakupiony pakiet:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;">{produkt}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Kwota płatności:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 700; border-top: 1px solid #222222;">{kwota}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Data transakcji:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600; border-top: 1px solid #222222;">{data}</td>
    </tr>
  </table>
</div>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">ℹ️ Dodatkowe informacje:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">{szczegoly}</span>
</div>

<p style="margin: 0 0 24px 0;">Faktura VAT została pomyślnie wystawiona i jest już gotowa do pobrania w Twoim panelu administracyjnym.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoFaktury}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Pobierz fakturę VAT</a>
</div>`,
    zmienne: ['{ekspert}', '{numerZamowienia}', '{produkt}', '{kwota}', '{data}', '{szczegoly}', '{linkDoFaktury}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
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
    tresc: `Witaj {ekspert},

Informujemy, że Twoja subskrypcja pakietu {nazwaSubskrypcji} w serwisie Prosta Sprawa wygasa za {dniDoWygasniecia} dni.

Data wygaśnięcia: {dataWygasniecia}

Po wygaśnięciu subskrypcji stracisz dostęp do:
{listaFunkcji}

Aby przedłużyć subskrypcję i zachować wszystkie korzyści, zaloguj się do panelu eksperta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 16px; color: #f59e0b;">⚠️ Twoja subskrypcja wygasa</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 16px 0;">Chcemy przypomnieć, że Twój active pakiet subskrypcyjny <strong>{nazwaSubskrypcji}</strong> wygaśnie za <strong>{dniDoWygasniecia} dni</strong>.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="40%">Pakiet:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 600;" width="60%">{nazwaSubskrypcji}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Data wygaśnięcia:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #f59e0b; font-weight: 600; border-top: 1px solid #222222;">{dataWygasniecia}</td>
    </tr>
  </table>
</div>

<div style="background-color: #1c1c1a; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">❌ Utracisz dostęp do zaawansowanych możliwości:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">{listaFunkcji}</span>
</div>

<p style="margin: 0 0 24px 0;">Przedłuż subskrypcję już dziś, aby zachować ciągłość napływu nowych spraw i nie utracić kontaktu z obecnymi klientami.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPakietow}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przedłuż subskrypcję teraz</a>
</div>`,
    zmienne: ['{ekspert}', '{nazwaSubskrypcji}', '{dniDoWygasniecia}', '{dataWygasniecia}', '{listaFunkcji}', '{linkDoPakietow}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
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
    tresc: `Witaj {ekspert},

Twoje saldo punktów w systemie Prosta Sprawa jest niskie.

Aktualny stan: {aktualnyStanPunktow} punktów

Z tego powodu możesz nie móc:
- Promować swojego profilu
- Wyróżniać ofert
- Zwiększać widoczności w wynikach wyszukiwania

Uzupełnij saldo, aby dalej korzystać ze wszystkich możliwości platformy!

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 16px; color: #f59e0b;">⚠️ Niski stan punktów</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 16px 0;">Zauważyliśmy, że stan Twojego konta punktowego w serwisie <strong>ProstaSprawa</strong> jest bardzo niski. Może to wkrótce uniemożliwić promowanie ofert i profilu.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
  <span style="font-size: 14px; color: #a3a3a3; font-weight: 500; display: block; margin-bottom: 8px;">Aktualne saldo konta:</span>
  <strong style="font-size: 32px; color: #00b49e; font-family: 'Poppins', sans-serif;">{aktualnyStanPunktow} <span style="font-size: 18px; font-weight: 500; color: #d4d4d4;">punktów</span></strong>
</div>

<h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 24px; margin-bottom: 12px;">Bez wystarczającej liczby punktów nie możesz:</h3>
<ul style="margin: 0 0 24px 0; padding-left: 20px; color: #d4d4d4; line-height: 1.6;">
  <li style="margin-bottom: 8px;">Promować swojego profilu w wynikach wyszukiwania.</li>
  <li style="margin-bottom: 8px;">Wyróżniać składanych ofert, by trafiały na szczyt skrzynki klienta.</li>
  <li style="margin-bottom: 0;">Skutecznie rywalizować z innymi ekspertami o najciekawsze zlecenia.</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSklepu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zasil konto punktami</a>
</div>`,
    zmienne: ['{ekspert}', '{aktualnyStanPunktow}', '{linkDoSklepu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{aktualnyStanPunktow}': 'Aktualna liczba punktów',
      '{linkDoSklepu}': 'Link do sklepu z punktami',
    },
    triggery: ['points_low'],
  },
  {
    typ: EmailType.SUBSKRYPCJA_KONIEC,
    nazwa: 'Koniec pakietu subskrypcji - dla ekspertów',
    temat: 'Twój pakiet subskrypcyjny {nazwaSubskrypcji} wygasł',
    tresc: `Witaj {ekspert},

Informujemy, że Twój pakiet subskrypcyjny {nazwaSubskrypcji} w serwisie Prosta Sprawa wygasł z dniem {dataWygasniecia}.

Z tego powodu dostęp do zaawansowanych funkcji Twojego konta został ograniczony. Nie możesz teraz składać nowych ofert ani promować swojego profilu.

Aby przywrócić pełną funkcjonalność konta i dalej pozyskiwać klientów, wybierz i opłać jeden z dostępnych pakietów subskrypcji.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 16px; color: #ef4444;">⚠️ Twój pakiet subskrypcyjny wygasł</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 16px 0;">Informujemy, że Twój dotychczasowy pakiet subskrypcji <strong>{nazwaSubskrypcji}</strong> wygasł z dniem <strong>{dataWygasniecia}</strong>.</p>

<div style="background-color: #241414; border-left: 4px solid #ef4444; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">❌ Funkcje Twojego konta zostały czasowo ograniczone:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Obecnie nie możesz składać nowych ofert klientom ani promować swojego profilu w wynikach wyszukiwania serwisu.</span>
</div>

<p style="margin: 0 0 24px 0;">Aby natychmiast przywrócić pełną funkcjonalność konta i dalej skutecznie pozyskiwać wartościowych klientów, przejdź do panelu i aktywuj jeden z dostępnych pakietów subskrypcji.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPakietow}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Wybierz pakiet subskrypcji</a>
</div>`,
    zmienne: ['{ekspert}', '{nazwaSubskrypcji}', '{dataWygasniecia}', '{linkDoPakietow}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{nazwaSubskrypcji}': 'Nazwa pakietu subskrypcyjnego',
      '{dataWygasniecia}': 'Data wygaśnięcia subskrypcji',
      '{linkDoPakietow}': 'Link do wyboru pakietów w panelu',
    },
    triggery: ['subscription_ended'],
  },
]
