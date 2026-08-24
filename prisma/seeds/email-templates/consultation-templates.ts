import { EmailType } from '@prisma/client'

export const consultationTemplates = [
  {
    typ: EmailType.NOWA_KONSULTACJA,
    nazwa: 'Nowa prośba o konsultację (dla eksperta)',
    temat: 'Nowa prośba o konsultację od {klient}',
    tresc: `Witaj {ekspert},

{klient} wysłał prośbę o konsultację prawną.

Temat: {temat}
Czas trwania: {czas}
Proponowany termin: {termin}

Zaloguj się do panelu eksperta, aby zaakceptować lub odrzucić tę prośbę.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Nowa prośba o konsultację</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 20px 0;">Klient <strong>{klient}</strong> wysłał prośbę o konsultację prawną.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Szczegóły prośby:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Temat:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{temat}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Czas trwania:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{czas}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Proponowany termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przejdź do panelu</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{temat}', '{czas}', '{termin}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{temat}': 'Temat konsultacji',
      '{czas}': 'Czas trwania (np. 30 min)',
      '{termin}': 'Proponowany termin spotkania',
      '{linkDoPanelu}': 'Link do panelu eksperta',
    },
    triggery: ['consultation_booking_created'],
  },
  {
    typ: EmailType.KONSULTACJA_ZAAKCEPTOWANA,
    nazwa: 'Konsultacja zaakceptowana (dla klienta)',
    temat: 'Twoja konsultacja z {ekspert} została zaakceptowana',
    tresc: `Witaj {klient},

Twoja prośba o konsultację z {ekspert} została zaakceptowana!

Termin spotkania: {termin}

Link do spotkania Google Meet zostanie wygenerowany i przesłany na 5 minut przed planowaną godziną.

Szczegóły konsultacji znajdziesz w swoim panelu klienta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Konsultacja zaakceptowana!</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{klient}</strong>,</p>
<p style="margin: 0 0 20px 0;">Twoja prośba o konsultację z <strong>{ekspert}</strong> została zaakceptowana.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Ekspert:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{ekspert}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
  </table>
</div>

<div style="background-color: #0d2420; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">Link do spotkania</strong>
  <span style="font-size: 14px; color: #d4d4d4;">Wirtualny pokój Google Meet zostanie wygenerowany i przesłany na 5 minut przed planowanym rozpoczęciem spotkania.</span>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz szczegóły konsultacji</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{termin}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{klient}': 'Imię i nazwisko klienta',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{termin}': 'Termin spotkania',
      '{linkDoPanelu}': 'Link do panelu klienta',
    },
    triggery: ['consultation_booking_accepted'],
  },
  {
    typ: EmailType.KONSULTACJA_ZAAKCEPTOWANA_EKSPERT,
    nazwa: 'Potwierdzenie akceptacji konsultacji (dla eksperta)',
    temat: 'Potwierdzenie zaakceptowania konsultacji z {klient}',
    tresc: `Witaj {ekspert},

Potwierdzamy zaakceptowanie konsultacji z klientem {klient}.

Termin spotkania: {termin}

Link do spotkania Google Meet zostanie wygenerowany i przesłany na 5 minut przed planowaną godziną.

Szczegóły i listę wszystkich konsultacji znajdziesz w swoim panelu eksperta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Potwierdzenie akceptacji konsultacji</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 20px 0;">Potwierdzamy zaakceptowanie konsultacji z klientem <strong>{klient}</strong>.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
  </table>
</div>

<div style="background-color: #0d2420; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">Link do spotkania</strong>
  <span style="font-size: 14px; color: #d4d4d4;">Wirtualny pokój Google Meet zostanie wygenerowany i przesłany na 5 minut przed planowanym rozpoczęciem spotkania.</span>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zarządzaj konsultacjami</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{termin}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{termin}': 'Termin spotkania',
      '{linkDoPanelu}': 'Link do panelu eksperta',
    },
    triggery: ['consultation_booking_accepted'],
  },
  {
    typ: EmailType.KONSULTACJA_ODRZUCONA,
    nazwa: 'Konsultacja odrzucona (dla klienta)',
    temat: 'Twoja prośba o konsultację z {ekspert} została odrzucona',
    tresc: `Witaj {klient},

Niestety, Twoja prośba o konsultację z {ekspert} została odrzucona.

Możesz spróbować umówić konsultację z innym ekspertem lub wybrać inny termin.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Prośba o konsultację odrzucona</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{klient}</strong>,</p>
<p style="margin: 0 0 20px 0;">Niestety, Twoja prośba o konsultację z <strong>{ekspert}</strong> została odrzucona.</p>

<p style="margin: 0 0 24px 0; color: #a3a3a3;">Możesz spróbować umówić konsultację z innym ekspertem lub wybrać inny termin.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przejdź do panelu</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{klient}': 'Imię i nazwisko klienta',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{linkDoPanelu}': 'Link do panelu klienta',
    },
    triggery: ['consultation_booking_rejected'],
  },
  {
    typ: EmailType.KONSULTACJA_ZAPLACONA,
    nazwa: 'Potwierdzenie płatności za konsultację (dla klienta)',
    temat: 'Płatność za konsultację z {ekspert} potwierdzona',
    tresc: `Witaj {klient},

Płatność za konsultację z {ekspert} została potwierdzona.

Twoja konsultacja jest opłacona i gotowa do realizacji. Link do spotkania Google Meet zostanie przesłany na 5 minut przed planowaną godziną.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Płatność potwierdzona</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{klient}</strong>,</p>
<p style="margin: 0 0 20px 0;">Płatność za konsultację z <strong>{ekspert}</strong> została potwierdzona.</p>

<div style="background-color: #0d2420; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 4px;">Konsultacja opłacona</strong>
  <span style="font-size: 14px; color: #d4d4d4;">Link do spotkania Google Meet zostanie wygenerowany i przesłany na 5 minut przed planowaną godziną.</span>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz szczegóły konsultacji</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{klient}': 'Imię i nazwisko klienta',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{linkDoPanelu}': 'Link do panelu klienta',
    },
    triggery: ['consultation_payment_confirmed'],
  },
  {
    typ: EmailType.KONSULTACJA_ANULOWANA,
    nazwa: 'Konsultacja anulowana',
    temat: 'Konsultacja została anulowana przez {inicjator}',
    tresc: `Witaj {odbiorca},

Konsultacja została anulowana przez {inicjator}.

Jeśli masz pytania, możesz skontaktować się z nami przez panel.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Konsultacja anulowana</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{odbiorca}</strong>,</p>
<p style="margin: 0 0 20px 0;">Konsultacja została anulowana przez <strong>{inicjator}</strong>.</p>

<p style="margin: 0 0 24px 0; color: #a3a3a3;">Jeśli masz pytania lub chcesz umówić nową konsultację, przejdź do panelu.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przejdź do panelu</a>
</div>`,
    zmienne: ['{odbiorca}', '{inicjator}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{odbiorca}': 'Imię odbiorcy (klient lub ekspert)',
      '{inicjator}': 'Kto anulował (klient lub ekspert)',
      '{linkDoPanelu}': 'Link do panelu odbiorcy',
    },
    triggery: ['consultation_booking_cancelled'],
  },
  {
    typ: EmailType.PRZYPOMNIENIE_KONSULTACJI,
    nazwa: 'Przypomnienie o nadchodzącej konsultacji',
    temat: 'Przypomnienie: Twoja konsultacja z {ekspert} już za godzinę',
    tresc: `Witaj {odbiorca},

Przypominamy o nadchodzącej konsultacji.

Ekspert: {ekspert}
Klient: {klient}
Termin: {termin}
Link do spotkania: {linkDoSpotkania}

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Przypomnienie o konsultacji</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{odbiorca}</strong>,</p>
<p style="margin: 0 0 20px 0;">Przypominamy o nadchodzącej konsultacji, która odbędzie się już za godzinę.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Ekspert:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{ekspert}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSpotkania}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Dołącz do Google Meet</a>
</div>`,
    zmienne: ['{odbiorca}', '{ekspert}', '{klient}', '{termin}', '{linkDoSpotkania}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{odbiorca}': 'Imię odbiorcy (klient lub ekspert)',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{termin}': 'Termin spotkania',
      '{linkDoSpotkania}': 'Link do Google Meet',
      '{linkDoPanelu}': 'Link do panelu odbiorcy',
    },
    triggery: ['consultation_reminder_1h'],
  },
  {
    typ: EmailType.LINK_KONSULTACJI,
    nazwa: 'Link do konsultacji Google Meet (5 min przed)',
    temat: 'Twoja konsultacja zaczyna się za 5 minut – dołącz teraz',
    tresc: `Witaj {odbiorca},

Twoja konsultacja zaczyna się za chwilę!

Ekspert: {ekspert}
Klient: {klient}
Termin: {termin}

Link do spotkania Google Meet: {linkDoSpotkania}

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Twój link do konsultacji jest gotowy!</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{odbiorca}</strong>,</p>
<p style="margin: 0 0 20px 0;">Za chwilę rozpoczyna się Twoja konsultacja. Kliknij poniżej, aby dołączyć do spotkania.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Ekspert:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{ekspert}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Klient:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{klient}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoSpotkania}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Dołącz do Google Meet</a>
</div>

<p style="margin: 16px 0 0 0; font-size: 12px; color: #737373; text-align: center;">Spotkanie wideo jest ważne przez 1 godzinę.</p>`,
    zmienne: ['{odbiorca}', '{ekspert}', '{klient}', '{termin}', '{linkDoSpotkania}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{odbiorca}': 'Imię odbiorcy (klient lub ekspert)',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{termin}': 'Termin spotkania',
      '{linkDoSpotkania}': 'Link do Google Meet',
      '{linkDoPanelu}': 'Link do panelu odbiorcy',
    },
    triggery: ['consultation_meet_link_ready'],
  },
  {
    typ: EmailType.NOWE_ZAPYTANIE_KONSULTACJI,
    nazwa: 'Nowe zapytanie o konsultację (dla eksperta)',
    temat: 'Nowe zapytanie o konsultację: {temat}',
    tresc: `Witaj {ekspert},

Klient {klient} szuka eksperta na płatną konsultację online.

Temat: {temat}
Dziedzina: {kategoria}
Forma: {forma}
Budżet: {budzet}

Zgłoś zainteresowanie, proponując termin i cenę. Klient porówna zgłoszenia i wybierze jedno.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Nowe zapytanie o konsultację</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 20px 0;">Klient <strong>{klient}</strong> szuka eksperta na płatną konsultację online. Zgłoś zainteresowanie, proponując termin i cenę.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Szczegóły zapytania:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Temat:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{temat}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Dziedzina:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{kategoria}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Forma:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{forma}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Budżet klienta:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{budzet}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zgłoś zainteresowanie</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{temat}', '{kategoria}', '{forma}', '{budzet}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{temat}': 'Temat konsultacji',
      '{kategoria}': 'Dziedzina prawa',
      '{forma}': 'Forma konsultacji (wideo / telefon)',
      '{budzet}': 'Budżet wskazany przez klienta',
      '{linkDoPanelu}': 'Link do zapytania w panelu eksperta',
    },
    triggery: ['consultation_request_created'],
  },
  {
    typ: EmailType.NOWE_ZAINTERESOWANIE_KONSULTACJA,
    nazwa: 'Ekspert zgłosił się do konsultacji (dla klienta)',
    temat: '{ekspert} zgłosił się do Twojej konsultacji',
    tresc: `Witaj {klient},

Ekspert {ekspert} zgłosił zainteresowanie przeprowadzeniem Twojej konsultacji.

Temat: {temat}
Proponowany termin: {termin}
Czas trwania: {czas}
Cena: {cena}
Forma: {forma}

Porównaj zgłoszenia w panelu i wybierz eksperta, z którym chcesz się spotkać.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Nowe zgłoszenie do Twojej konsultacji</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{klient}</strong>,</p>
<p style="margin: 0 0 20px 0;">Ekspert <strong>{ekspert}</strong> zgłosił zainteresowanie przeprowadzeniem Twojej konsultacji.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Propozycja eksperta:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Temat:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{temat}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Proponowany termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Czas trwania:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{czas}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Cena:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{cena}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Forma:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{forma}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Porównaj zgłoszenia</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{temat}', '{termin}', '{czas}', '{cena}', '{forma}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{klient}': 'Imię i nazwisko klienta',
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{temat}': 'Temat konsultacji',
      '{termin}': 'Proponowany termin spotkania',
      '{czas}': 'Czas trwania (np. 30 min)',
      '{cena}': 'Proponowana cena konsultacji',
      '{forma}': 'Forma konsultacji (wideo / telefon)',
      '{linkDoPanelu}': 'Link do zapytania w panelu klienta',
    },
    triggery: ['consultation_interest_created'],
  },
  {
    typ: EmailType.ZAINTERESOWANIE_ZAAKCEPTOWANE,
    nazwa: 'Klient wybrał Twoje zgłoszenie (dla eksperta)',
    temat: 'Konsultacja umówiona: {temat}',
    tresc: `Gratulacje {ekspert}!

Klient {klient} wybrał Twoje zgłoszenie. Konsultacja została umówiona.

Temat: {temat}
Termin: {termin}
Czas trwania: {czas}
Cena: {cena}
Forma: {forma}
Telefon do klienta: {telefon}

Szczegóły oraz link do spotkania znajdziesz w panelu eksperta.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Konsultacja umówiona</h2>
<p style="margin: 0 0 16px 0;">Gratulacje <strong>{ekspert}</strong>!</p>
<p style="margin: 0 0 20px 0;">Klient <strong>{klient}</strong> wybrał Twoje zgłoszenie spośród nadesłanych propozycji.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Szczegóły konsultacji:</h3>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500;" width="35%">Temat:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600;" width="65%">{temat}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Termin:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{termin}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Czas trwania:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{czas}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Cena:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #00b49e; font-weight: 600; border-top: 1px solid #222222;">{cena}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Forma:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{forma}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #a3a3a3; font-weight: 500; border-top: 1px solid #222222;">Telefon do klienta:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #e5e5e5; font-weight: 600; border-top: 1px solid #222222;">{telefon}</td>
    </tr>
  </table>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Przejdź do konsultacji</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{temat}', '{termin}', '{czas}', '{cena}', '{forma}', '{telefon}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{temat}': 'Temat konsultacji',
      '{termin}': 'Termin spotkania',
      '{czas}': 'Czas trwania (np. 30 min)',
      '{cena}': 'Cena konsultacji',
      '{forma}': 'Forma konsultacji (wideo / telefon)',
      '{telefon}': 'Numer telefonu klienta',
      '{linkDoPanelu}': 'Link do panelu konsultacji eksperta',
    },
    triggery: ['consultation_interest_accepted'],
  },
  {
    typ: EmailType.ZAINTERESOWANIE_ODRZUCONE,
    nazwa: 'Zgłoszenie do konsultacji odrzucone (dla eksperta)',
    temat: 'Zgłoszenie do konsultacji nie zostało wybrane',
    tresc: `Witaj {ekspert},

Klient {klient} nie wybrał Twojego zgłoszenia do konsultacji "{temat}".

Nie zniechęcaj się – w panelu czekają kolejne zapytania od klientów szukających konsultacji online.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Zgłoszenie nie zostało wybrane</h2>
<p style="margin: 0 0 16px 0;">Witaj <strong>{ekspert}</strong>,</p>
<p style="margin: 0 0 20px 0;">Klient <strong>{klient}</strong> nie wybrał Twojego zgłoszenia do konsultacji <strong>{temat}</strong>.</p>
<p style="margin: 0 0 20px 0;">Nie zniechęcaj się – w panelu czekają kolejne zapytania od klientów szukających konsultacji online.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoPanelu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz otwarte zapytania</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{temat}', '{linkDoPanelu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa kancelarii / eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{temat}': 'Temat konsultacji',
      '{linkDoPanelu}': 'Link do listy zapytań w panelu eksperta',
    },
    triggery: ['consultation_interest_rejected'],
  },
]
