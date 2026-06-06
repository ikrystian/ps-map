import { EmailType } from '@prisma/client'

export const notificationTemplates = [
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
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {odbiorca},</h2>
<p style="margin: 0 0 16px 0;">Otrzymałeś nową wiadomość w systemie komunikacji <strong>ProstaSprawa</strong> od użytkownika <strong>{nadawca}</strong>.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 10px;">Skrót wiadomości:</h3>
  <div style="font-style: italic; color: #d4d4d4; line-height: 1.6; padding: 12px; background-color: #0c0c0c; border: 1px solid #222222; border-radius: 6px;">
    "{fragmentWiadomosci}..."
  </div>
</div>

<p style="margin: 0 0 24px 0;">Aby przeczytać pełną treść i sprawnie odpowiedzieć nadawcy, kliknij poniższy przycisk przechodząc bezpośrednio do bezpiecznego czatu.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoWiadomosci}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Odpowiedz na wiadomość</a>
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
    nazwa: 'Nowa opinia - powiadomienie dla ekspertów',
    temat: 'Otrzymałeś nową opinię od klienta',
    tresc: `Witaj {ekspert},

Klient {klient} wystawił Ci opinię!

Ocena: {ocena}/5
Komentarz: {komentarz}

Dziękujemy za świadczenie usług prawnych za pośrednictwem platformy Prosta Sprawa.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {ekspert},</h2>
<p style="margin: 0 0 16px 0;">Klient <strong>{klient}</strong> właśnie wystawił nową opinię o współpracy ze współpracy z Tobą.</p>

<div style="background-color: #181818; border: 1px solid #222222; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <div style="text-align: center; margin-bottom: 16px;">
    <span style="font-size: 14px; color: #a3a3a3; font-weight: 500; display: block; margin-bottom: 4px;">Ocena klienta:</span>
    <span style="font-size: 26px; font-weight: bold; color: #f59e0b; letter-spacing: 2px;">{ocena} / 5 ⭐</span>
  </div>
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 8px; border-top: 1px solid #222222; padding-top: 12px;">Komentarz klienta:</h3>
  <div style="font-style: italic; color: #d4d4d4; line-height: 1.6; padding: 12px; background-color: #0c0c0c; border: 1px solid #222222; border-radius: 6px;">
    "{komentarz}"
  </div>
</div>

<p style="margin: 0 0 24px 0;">Wspaniała opinia to najlepsza reklama Twoich usług w naszym portalu. Kliknij przycisk poniżej, aby przejść do swojego publicznego profilu.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoProfilu}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Zobacz opinie na profilu</a>
</div>`,
    zmienne: ['{ekspert}', '{klient}', '{ocena}', '{komentarz}', '{linkDoProfilu}'],
    opisZmiennych: {
      '{ekspert}': 'Nazwa eksperta',
      '{klient}': 'Imię i nazwisko klienta',
      '{ocena}': 'Ocena (1-5)',
      '{komentarz}': 'Treść opinii',
      '{linkDoProfilu}': 'Link do profilu eksperta',
    },
    triggery: ['review_created'],
  },
  {
    typ: EmailType.PROSBA_O_OCENE,
    nazwa: 'Prośba o ocenę prawnika - dla klienta',
    temat: 'Jak oceniasz współpracę z ekspertem {ekspert}?',
    tresc: `Witaj {klient},

Minęły 3 dni od momentu, w którym zaakceptowałeś ofertę eksperta {ekspert}. Chcielibyśmy zapytać, jak oceniasz dotychczasową współpracę oraz przebieg kontaktu?

Twoja opinia jest dla nas niezwykle ważna. Pomaga innym użytkownikom wybrać odpowiednią pomoc prawną oraz motywuje ekspertów do świadczenia usług na najwyższym poziomie.

Kliknij w poniższy link, aby wystawić ocenę i napisać krótką opinię:
{linkDoOceny}

Dziękujemy za zaufanie i korzystanie z serwisu Prosta Sprawa.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Witaj {klient},</h2>
<p style="margin: 0 0 16px 0;">Minęło kilka dni od momentu, kiedy zaakceptowałeś ofertę pomocy prawnej od eksperta <strong>{ekspert}</strong>.</p>
<p style="margin: 0 0 16px 0;">Chcielibyśmy zapytać, jak oceniasz dotychczasowy kontakt, fachowość oraz przebieg współpracy?</p>

<div style="background-color: #1c1a12; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">💡 Dlaczego Twoja opinia jest ważna?</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Pomaga to setkom innych użytkowników naszego serwisu w wyborze profesjonalnego i zaangażowanego adwokata czy radcy prawnego, a także dodatkowo motywuje ekspertów do podtrzymywania najwyższych standardów obsługi.</span>
</div>

<p style="margin: 0 0 24px 0;">Kliknij przycisk poniżej, aby w kilka sekund ocenić współpracę za pomocą gwiazdek oraz krótkiego komentarza.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoOceny}" class="btn" style="display: inline-block; background-color: #f59e0b; color: #0f0a02 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); text-align: center; letter-spacing: 0.5px;">⭐ Wystaw ocenę prawnikowi</a>
</div>`,
    zmienne: ['{klient}', '{ekspert}', '{linkDoOceny}'],
    opisZmiennych: {
      '{klient}': 'Imię klienta',
      '{ekspert}': 'Nazwa eksperta',
      '{linkDoOceny}': 'Link do wystawienia oceny na profilu eksperta',
    },
    triggery: ['request_for_review_delayed'],
  },
]
