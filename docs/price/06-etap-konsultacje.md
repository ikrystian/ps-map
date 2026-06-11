# Etap 6 — Konsultacje online + Google Meet

**Cel etapu:** pełny cykl płatnych konsultacji: ekspert definiuje dostępność (dni tygodnia, przedziały godzin, ceny 15/30 min) → klient rezerwuje slot na wizytówce → ekspert akceptuje/odrzuca → klient płaci → system automatycznie tworzy pokój Google Meet ~5 minut przed terminem i wysyła linki oraz przypomnienia.

**Zależności:** Etap 1 (scheduler-framework), Etap 3 (wizytówka — punkt wejścia rezerwacji), Etap 8 (płatność za konsultację), Etap 12 (7 szablonów e-mail cyklu konsultacji).

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 6.1 | Konfiguracja dostępności eksperta | Formularz `ConsultationHoursForm` w `/panel-eksperta/konsultacje`: dla każdego dnia tygodnia przedział `startTime`–`endTime` oraz ceny `price15min`/`price30min`; model `ConsultationAvailability` (unikalność dzień+kancelaria); API odczytu/zapisu dostępności; walidacje przedziałów | 20 | 12 | 32 | 5 440 zł |
| 6.2 | Kalendarz konsultacji (komponenty) | Własny moduł kalendarza (12 komponentów): widoki **miesiąc / tydzień / dzień / agenda**, przełącznik widoków, przyciski slotów, **selektor stref czasowych** z bazą stref, helpery dat, tooltips; używany w panelu eksperta do przeglądu rezerwacji | 72 | 8 | 80 | 13 600 zł |
| 6.3 | Widget rezerwacji na wizytówce | Zakładka „Konsultacje" profilu publicznego (referencja 21 kB): kalendarz dostępności wyliczany z konfiguracji eksperta, wybór dnia → slotu → długości (15/30 min z cenami), formularz rezerwacji (temat, dane kontaktowe), utworzenie `ConsultationBooking(PENDING)` + e-mail `NOWA_KONSULTACJA` do eksperta | 36 | 12 | 48 | 8 160 zł |
| 6.4 | Cykl życia rezerwacji + widoki paneli | Statusy PENDING → ACCEPTED/REJECTED → COMPLETED/CANCELLED + status płatności; **panel eksperta**: kalendarz + lista rezerwacji z akcjami akceptuj/odrzuć (e-maile do obu stron); **panel klienta** `/panel-klienta/konsultacje`: lista rezerwacji ze statusami, przycisk płatności po akceptacji, link Google Meet po opłaceniu; archiwizacja; endpointy `consultations`, `consultations/[id]` (akceptuj/odrzuć/anuluj/opłać), listy per klient/kancelaria | 36 | 28 | 64 | 10 880 zł |
| 6.5 | Integracja Google Meet | `lib/google-meet.ts` + Google Calendar API (`googleapis`): tworzenie wydarzenia z pokojem Meet; zadanie schedulera `google-meet-links` (co 1 min): dla opłaconych i zaakceptowanych rezerwacji startujących w ~5 min — generowanie `googleMeetUrl` + e-mail `LINK_KONSULTACJI` do obu stron; obsługa błędów API i ponowień; konfiguracja konta usługowego | 0 | 40 | 40 | 6 800 zł |
| 6.6 | Przypomnienia i e-maile cyklu konsultacji | Zadanie schedulera `consultation-reminders` (co 15 min): przypomnienia `PRZYPOMNIENIE_KONSULTACJI` przed terminem; podpięcie kompletu 7 typów e-maili cyklu (nowa → zaakceptowana klient+ekspert → odrzucona → zapłacona → anulowana → przypomnienie → link Meet) oraz powiadomień in-app (5 typów konsultacyjnych) | 0 | 32 | 32 | 5 440 zł |
| | **SUMA ETAPU 6** | | **164** | **132** | **296** | **50 320 zł** |

## Rezultaty (deliverables) etapu

- Działający end-to-end przepływ: dostępność → rezerwacja → akceptacja → płatność → Meet → przypomnienia.
- Reużywalny moduł kalendarza (4 widoki, strefy czasowe).

## Uwagi i założenia

- Wymagane konto Google Cloud z włączonym Calendar API i przejście weryfikacji aplikacji Google (proces po stronie klienta, wspieramy konfigurację); koszty konta poza wyceną.
- Płatność za konsultację realizowana mechanizmami etapu 8 (bramki płatności) — tu integrowana.
- Obsługa stref czasowych: rezerwacje zapisywane w UTC, prezentacja w strefie użytkownika.
