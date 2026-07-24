import { EmailType } from '@prisma/client'

export const newsletterTemplates = [
  {
    typ: EmailType.NEWSLETTER_POTWIERDZENIE,
    nazwa: 'Potwierdzenie zapisu do newslettera',
    temat: 'Potwierdź swój zapis do newslettera - Prosta Sprawa',
    tresc: `Witaj,

Dziękujemy za chęć zapisu do newslettera Prosta Sprawa (dla adresu: {email}).

Aby potwierdzić subskrypcję i zacząć otrzymywać praktyczne porady prawne, nowości oraz przydatne informacje, kliknij w poniższy link:
{linkPotwierdzenia}

Link jest ważny przez 24 godziny.

Jeśli to nie Ty wpisałeś swój adres email na naszej stronie, zignoruj tę wiadomość. Twój adres nie zostanie dodany do bazy dopóki nie potwierdzisz zapisu.

Pozdrawiamy,
Zespół Prosta Sprawa`,
    trescHtml: `<h2 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Potwierdź zapis do newslettera</h2>
<p style="margin: 0 0 16px 0;">Witaj,</p>
<p style="margin: 0 0 16px 0;">Dziękujemy za chęć zapisu do newslettera serwisu <strong>ProstaSprawa</strong> (dla adresu: <strong>{email}</strong>).</p>
<p style="margin: 0 0 24px 0;">Aby potwierdzić subskrypcję i zacząć otrzymywać praktyczne porady prawne, nowości oraz przydatne analizy, kliknij poniższy przycisk:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{linkPotwierdzenia}" class="btn" style="display: inline-block; background-color: #00b49e; color: #021a17 !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 180, 158, 0.3); text-align: center; letter-spacing: 0.5px;">Potwierdzam subskrypcję</a>
</div>

<div style="background-color: #122421; border-left: 4px solid #00b49e; border-radius: 4px; padding: 16px; margin: 24px 0;">
  <strong style="color: #ffffff; font-weight: 600; display: block; margin-bottom: 6px;">ℹ️ Ważna informacja:</strong>
  <span style="font-size: 14px; color: #d4d4d4; line-height: 1.5; display: block;">Link jest ważny przez 24 godziny. Jeśli to nie Ty wpisałeś swój adres email na naszej stronie, po prostu zignoruj tę wiadomość — Twój adres nie zostanie dodany do bazy dopóki nie klikniesz w powyższy przycisk.</span>
</div>`,
    zmienne: ['{email}', '{linkPotwierdzenia}'],
    opisZmiennych: {
      '{email}': 'Adres email zapisywany do newslettera',
      '{linkPotwierdzenia}': 'Link do potwierdzenia subskrypcji newslettera',
    },
    triggery: ['newsletter_subscription_requested'],
  },
]
