# Konfiguracja wysyłania emaili

System wysyłania emaili został zaimplementowany przy użyciu własnego klienta SMTP (bez zewnętrznych zależności).

## Wymagania

Aby wysyłać prawdziwe emaile, musisz skonfigurować serwer SMTP. Możesz użyć:
- **Gmail** (zalecane dla testów)
- **SendGrid**
- **Mailgun**
- **Własny serwer SMTP**

## Konfiguracja dla Gmail

### 1. Włącz weryfikację dwuetapową

1. Przejdź do https://myaccount.google.com/security
2. Włącz "Weryfikację dwuetapową"

### 2. Wygeneruj hasło aplikacji

1. Przejdź do https://myaccount.google.com/apppasswords
2. Wybierz "Poczta" i "Inne (nazwa niestandardowa)"
3. Wpisz "Prosta Sprawa"
4. Kliknij "Generuj"
5. Skopiuj 16-znakowe hasło (zapisz je bezpiecznie)

### 3. Dodaj konfigurację do .env

Skopiuj plik `.env.example` do `.env`:

```bash
cp .env.example .env
```

Edytuj plik `.env` i ustaw następujące wartości:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="twoj-email@gmail.com"
EMAIL_SERVER_PASSWORD="twoje-haslo-aplikacji-16-znakow"
EMAIL_FROM="noreply@prostaspawa.pl"
```

**UWAGA:** Użyj hasła aplikacji (16 znaków), NIE swojego normalnego hasła do Gmail!

## Konfiguracja dla innych dostawców

### SendGrid

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="twoj-klucz-api-sendgrid"
EMAIL_FROM="noreply@twojadomena.pl"
```

### Mailgun

```env
EMAIL_SERVER_HOST="smtp.mailgun.org"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="postmaster@twojadomena.pl"
EMAIL_SERVER_PASSWORD="twoj-klucz-api-mailgun"
EMAIL_FROM="noreply@twojadomena.pl"
```

### Własny serwer SMTP

```env
EMAIL_SERVER_HOST="smtp.twojadomena.pl"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="twoj-uzytkownik"
EMAIL_SERVER_PASSWORD="twoje-haslo"
EMAIL_FROM="noreply@twojadomena.pl"
```

**Porty:**
- `587` - STARTTLS (zalecane)
- `465` - SSL/TLS
- `25` - Niezaszyfrowane (nie zalecane)

## Testowanie

### 1. Uruchom serwer deweloperski

```bash
npm run dev
```

### 2. Zaloguj się jako administrator

Przejdź do http://localhost:3000/admin/emails

### 3. Wyślij email testowy

1. Wybierz szablon emaila
2. Kliknij "Podgląd"
3. Wpisz swój adres email
4. Kliknij "Wyślij"

### 4. Sprawdź wynik

**Jeśli SMTP jest skonfigurowany:**
- Email zostanie wysłany na podany adres
- Sprawdź swoją skrzynkę email (również spam)
- W konsoli zobaczysz: `✅ Email sent successfully to: adres@example.com`

**Jeśli SMTP NIE jest skonfigurowany (tryb development):**
- Email zostanie wylogowany do konsoli
- W konsoli zobaczysz treść emaila
- Nic nie zostanie wysłane

## Rozwiązywanie problemów

### Email nie przychodzi

1. **Sprawdź folder spam** - pierwsze emaile często trafiają do spamu
2. **Sprawdź hasło aplikacji** - użyj hasła aplikacji, nie normalnego hasła
3. **Sprawdź port** - upewnij się że port 587 nie jest zablokowany przez firewall
4. **Sprawdź logi** - w konsoli serwera powinny być szczegóły błędu

### Błąd "SMTP not configured"

Upewnij się że wszystkie wymagane zmienne środowiskowe są ustawione:
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### Błąd "Connection timeout"

1. Sprawdź czy port 587 nie jest zablokowany przez firewall
2. Spróbuj użyć portu 465 (zmień `EMAIL_SERVER_PORT="465"`)
3. Sprawdź czy adres SMTP jest poprawny

### Błąd "Authentication failed"

1. Sprawdź czy hasło aplikacji jest poprawne
2. Sprawdź czy weryfikacja dwuetapowa jest włączona (dla Gmail)
3. Sprawdź czy nazwa użytkownika jest poprawna

## Tryb Development vs Production

### Development (bez konfiguracji SMTP)
- Emaile są logowane do konsoli
- Nic nie jest wysyłane
- Przydatne do testowania treści emaili

### Development (z konfiguracją SMTP)
- Emaile są wysyłane prawdziwie
- Przydatne do testowania integracji

### Production
- Zawsze wymaga konfiguracji SMTP
- Błąd jeśli SMTP nie jest skonfigurowany

## Użycie w kodzie

```typescript
import { sendEmail } from "@/lib/email"

await sendEmail({
  to: "klient@example.com",
  subject: "Nowa oferta",
  html: "<p>Otrzymałeś nową ofertę!</p>",
  text: "Otrzymałeś nową ofertę!",
})
```

## Szablony emaili

Szablony emaili są zarządzane przez panel administracyjny:
- http://localhost:3000/admin/emails

Możesz:
- Tworzyć nowe szablony
- Edytować istniejące
- Wysyłać emaile testowe
- Aktywować/dezaktywować szablony

## Wsparcie

Jeśli masz problemy z konfiguracją emaili, sprawdź:
1. Logi serwera (`npm run dev`)
2. Panel administracyjny (`/admin/emails`)
3. Dokumentację dostawcy SMTP (Gmail, SendGrid, etc.)
