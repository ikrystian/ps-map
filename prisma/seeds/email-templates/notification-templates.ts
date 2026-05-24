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
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Witaj {odbiorca},</h2>
<p style="margin: 0 0 16px 0;">Otrzymałeś nową wiadomość w systemie komunikacji <strong>ProstaSprawa</strong> od użytkownika <strong>{nadawca}</strong>.</p>

<div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 10px;">Skrót wiadomości:</h3>
  <div style="font-style: italic; color: #535146; line-height: 1.6; padding: 12px; background-color: #ffffff; border: 1px solid #ede9de; border-radius: 6px;">
    "{fragmentWiadomosci}..."
  </div>
</div>

<p style="margin: 0 0 24px 0;">Aby przeczytać pełną treść i sprawnie odpowiedzieć nadawcy, kliknij poniższy przycisk przechodząc bezpośrednio do bezpiecznego czatu.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoWiadomosci}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Odpowiedz na wiadomość</a>
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
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Witaj {kancelaria},</h2>
<p style="margin: 0 0 16px 0;">Klient <strong>{klient}</strong> właśnie wystawił nową opinię o współpracy z Twoją kancelarią.</p>

<div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <div style="text-align: center; margin-bottom: 16px;">
    <span style="font-size: 14px; color: #83827d; font-weight: 500; display: block; margin-bottom: 4px;">Ocena klienta:</span>
    <span style="font-size: 26px; font-weight: bold; color: #f59e0b; letter-spacing: 2px;">{ocena} / 5 ⭐</span>
  </div>
  <h3 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 600; color: #3d3929; margin-top: 0; margin-bottom: 8px; border-top: 1px solid #ede9de; padding-top: 12px;">Komentarz klienta:</h3>
  <div style="font-style: italic; color: #535146; line-height: 1.6; padding: 12px; background-color: #ffffff; border: 1px solid #ede9de; border-radius: 6px;">
    "{komentarz}"
  </div>
</div>

<p style="margin: 0 0 24px 0;">Wspaniała opinia to najlepsza reklama Twoich usług w naszym portalu. Kliknij przycisk poniżej, aby przejść do swojego publicznego profilu.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoProfilu}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(201, 100, 66, 0.2); text-align: center;">Zobacz opinie na profilu</a>
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
    typ: EmailType.PROSBA_O_OCENE,
    nazwa: 'Prośba o ocenę prawnika - dla klienta',
    temat: 'Jak oceniasz współpracę z kancelarią {kancelaria}?',
    tresc: `Witaj {klient},

Minęły 3 dni od momentu, w którym zaakceptowałeś ofertę kancelarii {kancelaria}. Chcielibyśmy zapytać, jak oceniasz dotychczasową współpracę oraz przebieg kontaktu?

Twoja opinia jest dla nas niezwykle ważna. Pomaga innym użytkownikom wybrać odpowiednią pomoc prawną oraz motywuje kancelarie do świadczenia usług na najwyższym poziomie.

Kliknij w poniższy link, aby wystawić ocenę i napisać krótką opinię:
{linkDoOceny}

Dziękujemy za zaufanie i korzystanie z serwisu Prosta Sprawa.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">Witaj {klient},</h2>
<p style="margin: 0 0 16px 0;">Minęło kilka dni od momentu, kiedy zaakceptowałeś ofertę pomocy prawnej od kancelarii <strong>{kancelaria}</strong>.</p>
<p style="margin: 0 0 16px 0;">Chcielibyśmy zapytać, jak oceniasz dotychczasowy kontakt, fachowość oraz przebieg współpracy?</p>

<div style="background-color: #faf9f5; border-left: 4px solid #c96442; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #3d3929; font-weight: 600; display: block; margin-bottom: 6px;">💡 Dlaczego Twoja opinia jest ważna?</strong>
  <span style="font-size: 14px; color: #535146; line-height: 1.5; display: block;">Pomaga to setkom innych użytkowników naszego serwisu w wyborze profesjonalnego i zaangażowanego adwokata czy radcy prawnego, a także dodatkowo motywuje kancelarie do podtrzymywania najwyższych standardów obsługi.</span>
</div>

<p style="margin: 0 0 24px 0;">Kliknij przycisk poniżej, aby w kilka sekund ocenić współpracę za pomocą gwiazdek oraz krótkiego komentarza.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkDoOceny}" class="btn" style="display: inline-block; background-color: #f59e0b; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2); text-align: center;">⭐ Wystaw ocenę prawnikowi</a>
</div>`,
    zmienne: ['{klient}', '{kancelaria}', '{linkDoOceny}'],
    opisZmiennych: {
      '{klient}': 'Imię klienta',
      '{kancelaria}': 'Nazwa kancelarii',
      '{linkDoOceny}': 'Link do wystawienia oceny na profilu kancelarii',
    },
    triggery: ['request_for_review_delayed'],
  },
]
