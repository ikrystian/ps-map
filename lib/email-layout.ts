/**
 * Wspólna ramka maili ProstaSprawa (nagłówek z logo PNG + stopka).
 *
 * Układ na tabelach i logo w PNG, bo Gmail i Outlook nie pokazują SVG,
 * a Outlook rozsypuje układ oparty na divach. Plik nie importuje modułów
 * Node — korzysta z niego też podgląd szablonów w panelu admina.
 *
 * Miejsca do podstawienia: {{PREHEADER}} (ukryty tekst podglądu w skrzynce,
 * może zostać pusty) i {{TRESC}} (pole „Treść HTML” szablonu).
 */
export const EMAIL_FRAME_HTML = `<!DOCTYPE html>
<html lang="pl" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>ProstaSprawa.pl</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Inter:wght@400;600;700&display=swap" rel="stylesheet"><!--<![endif]-->
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  body { margin:0; padding:0; width:100% !important; background-color:#181816; }
  img { border:0; outline:none; text-decoration:none; display:block; }
  a { color:#3CCFB9; }
  @media only screen and (max-width:620px) {
    .ps-karta { width:100% !important; border-radius:0 !important; }
    .ps-pad { padding-left:22px !important; padding-right:22px !important; }
    h1 { font-size:26px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#181816;">
{{PREHEADER}}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#181816" style="background-color:#181816;">
  <tr><td align="center" style="padding:28px 10px;">
    <table role="presentation" class="ps-karta" width="600" border="0" cellpadding="0" cellspacing="0" bgcolor="#20201D" style="width:600px;max-width:600px;background-color:#20201D;border:1px solid #34342F;border-radius:24px;">
      <tr><td class="ps-pad" style="padding:26px 40px 22px 40px;border-bottom:1px solid #34342F;" align="left">
        <a href="https://prostasprawa.pl" style="text-decoration:none;"><img src="https://prostasprawa.pl/images/logo-mail.png" width="190" alt="prostasprawa" style="display:block;width:190px;height:auto;max-width:190px;color:#E9E6DE;font-family:'Playfair Display', Georgia, 'Times New Roman', serif;font-size:22px;"></a>
      </td></tr>
      <tr><td class="ps-pad" style="padding:36px 40px 34px 40px;font-family:Inter, 'Segoe UI', Arial, Helvetica, sans-serif;font-size:16px;line-height:1.65;color:#C9C6BE;">
{{TRESC}}
      </td></tr>
    </table>
    <table role="presentation" class="ps-karta" width="600" border="0" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
      <tr><td class="ps-pad" style="padding:24px 40px 8px 40px;font-family:Inter, 'Segoe UI', Arial, Helvetica, sans-serif;font-size:13px;line-height:1.7;color:#98958D;">
        Pytania? Napisz na <a href="mailto:bok@prostasprawa.pl" style="color:#C8A864;text-decoration:none;">bok@prostasprawa.pl</a> albo zajrzyj do <a href="https://prostasprawa.pl/pomoc" style="color:#C8A864;text-decoration:none;">centrum pomocy</a>.<br>
        <a href="https://prostasprawa.pl/regulamin" style="color:#98958D;">Regulamin</a> &nbsp;·&nbsp; <a href="https://prostasprawa.pl/polityka-prywatnosci" style="color:#98958D;">Polityka prywatności</a>
      </td></tr>
      <tr><td class="ps-pad" style="padding:6px 40px 26px 40px;font-family:Inter, 'Segoe UI', Arial, Helvetica, sans-serif;font-size:11px;line-height:1.6;color:#6F6D66;">
        Ta wiadomość dotyczy Twojego konta w serwisie ProstaSprawa.pl i została wysłana automatycznie.<br>
        Serwis prowadzi Polska Grupa Identyfikacji Firm sp. z o.o., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, KRS 0000768210, NIP 9592020678.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

// Ukryty div preheadera na samym początku treści (tak przygotowane są szablony z panelu)
const LEADING_PREHEADER_RE = /^\s*(<div\b[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>)/i

/**
 * Oddziela ukryty preheader z początku treści, żeby trafił na początek <body>
 * (klienci poczty biorą tekst podglądu z pierwszego tekstu w dokumencie).
 */
export function splitPreheader(contentHtml: string): { preheaderHtml: string; bodyHtml: string } {
  const match = contentHtml.match(LEADING_PREHEADER_RE)
  if (!match) return { preheaderHtml: "", bodyHtml: contentHtml }
  return { preheaderHtml: match[1], bodyHtml: contentHtml.slice(match[0].length) }
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Ukryty preheader w tym samym stylu, co w szablonach z panelu. */
export function buildPreheaderHtml(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#20201D;opacity:0;">${escapeHtml(text)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>`
}

/**
 * Owija treść w ramkę. Preheader z początku treści ma pierwszeństwo przed
 * `preheaderText` (tekstem podawanym przez maile generowane w kodzie).
 */
export function renderEmailFrame(contentHtml: string, preheaderText: string = ""): string {
  const { preheaderHtml, bodyHtml } = splitPreheader(contentHtml)
  const preheader = preheaderHtml || (preheaderText ? buildPreheaderHtml(preheaderText) : "")

  // Funkcje zamiast stringów — `$` w treści nie może być interpretowany jako wzorzec podstawienia
  return EMAIL_FRAME_HTML
    .replace("{{PREHEADER}}", () => preheader)
    .replace("{{TRESC}}", () => bodyHtml)
}
