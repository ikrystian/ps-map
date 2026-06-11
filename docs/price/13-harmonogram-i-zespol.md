# Harmonogram, zespół i plan płatności

## 1. Skład zespołu

| Rola | Osoby | Zaangażowanie | Okres | Zakres odpowiedzialności |
|---|---|---|---|---|
| Tech Lead / Architekt | 1 | ~50% etatu | cały projekt | architektura, code review, decyzje techniczne, integracje krytyczne (KSeF, płatności) |
| Senior Full-stack Developer | 2 | 100% | cały projekt | moduły krytyczne: auth, płatności, scheduler, czat, silnik promocji |
| Mid Full-stack Developer | 2 | 100% | od tygodnia 5 | część publiczna, panele, CRUD-y admina, integracje UI |
| UI/UX Designer | 1 | ~50% | tygodnie 1–24 | makiety, design system, przeglądy implementacji |
| QA Engineer | 1 | 100% | od tygodnia 9 | scenariusze, testy manualne i regresyjne, testy płatności/sandboxów, wsparcie UAT |
| Project Manager | 1 | ~50% | cały projekt | planowanie sprintów, demo co 2 tyg., komunikacja, zarządzanie zakresem |
| DevOps Engineer | 1 | ad hoc (160 h) | punktowo | CI/CD, środowiska, backupy, monitoring, wdrożenie produkcyjne |

Szczytowa wielkość zespołu: 7–8 osób; przepustowość deweloperska ~4,2 FTE — wystarczająca na 5 088 h dev w ~9 miesięcy + stabilizacja.

## 2. Harmonogram etapów (40 tygodni ≈ 10 miesięcy)

Praca iteracyjna (sprinty 2-tygodniowe, demo po każdym sprincie). Etapy częściowo równoległe — sekcje panelu admina budowane przyrostowo za modułami domenowymi.

| Etap | Nazwa | Tygodnie | Czas trwania |
|---|---|---|---|
| 1 | Fundamenty i architektura | 1–4 | 4 tyg. |
| 2 | Autentykacja, konta i uprawnienia | 4–7 | 3 tyg. |
| 12 | Warstwa przekrojowa (e-maile, powiadomienia) — start wcześnie | 6–9 | 3 tyg. |
| 3 | Część publiczna | 6–12 | 6 tyg. |
| 4 | Marketplace: sprawy i oferty | 8–13 | 5 tyg. |
| 5 | Komunikacja (czat) | 12–16 | 4 tyg. |
| 6 | Konsultacje + Google Meet | 15–18 | 4 tyg. |
| 7 | Monetyzacja (pakiety, punkty, promocje, ranking) | 16–21 | 5 tyg. |
| 8 | Sklep, płatności, faktury, KSeF | 19–24 | 6 tyg. |
| 9 | Panel eksperta (pozostałe sekcje + integracja) | 21–27 | 6 tyg. |
| 10 | Panel klienta (pozostałe sekcje + integracja) | 26–28 | 2 tyg. |
| 11 | Panel administratora (przyrostowo) | 14–34 | 20 tyg. (równolegle) |
| — | Integracja końcowa, asystent AI, poprawki | 33–36 | 4 tyg. |
| — | **Stabilizacja, UAT, wdrożenie produkcyjne** | 37–40 | 4 tyg. |

### Oś czasu (poglądowo, M = miesiąc)

```
M1   M2   M3   M4   M5   M6   M7   M8   M9   M10
[E1 ][E2]
     [E12 ][E3        ]
        [E4      ][E5    ][E6  ][E7    ]
                      [E11 — panel admina, przyrostowo            ]
                                [E8       ][E9       ][E10]
                                                      [integr.][UAT]
```

## 3. Kamienie milowe i kryteria odbioru

| # | Kamień milowy | Koniec tyg. | Kryterium odbioru |
|---|---|---|---|
| M1 | Fundamenty gotowe | 4 | aplikacja na staging, schemat DB + seedy, CI/CD, design system |
| M2 | Konta i logowanie | 7 | rejestracja+weryfikacja+logowanie (hasło/OAuth) dla 3 ról, system uprawnień |
| M3 | Część publiczna | 12 | strona główna, wyszukiwarka, wizytówka, blog, kategorie — działające na danych seed |
| M4 | Rdzeń marketplace | 13 | pełny przepływ sprawa → oferta → akceptacja/negocjacja → zamknięcie |
| M5 | Komunikacja i konsultacje | 18 | czat E2E + rezerwacja konsultacji z akceptacją |
| M6 | Monetyzacja | 21 | pakiety z limitami, punkty, promocje z boostami, ranking |
| M7 | Pieniądze | 24 | płatności na sandboxach 3 bramek, faktury, KSeF (środowisko testowe MF) |
| M8 | Panele kompletne | 28 | panel eksperta i klienta w pełnym zakresie |
| M9 | Admin + integracja | 36 | 28 sekcji admina, CMS publikuje strony, scheduler 8 zadań na prod-config |
| M10 | **GO-LIVE** | 40 | UAT zaakceptowany, wdrożenie produkcyjne, przekazanie dokumentacji |

## 4. Harmonogram płatności (proponowany)

Płatności powiązane z odbiorem kamieni milowych; wartości od kwoty bazowej **1 437 722 zł netto**.

| Transza | Moment | Udział | Kwota netto |
|---|---|---:|---:|
| 0 | Zaliczka przy podpisaniu umowy | 10% | 143 772 zł |
| 1 | Odbiór M1 (fundamenty) | 8% | 115 018 zł |
| 2 | Odbiór M2–M3 (konta + część publiczna) | 14% | 201 281 zł |
| 3 | Odbiór M4–M5 (marketplace + komunikacja/konsultacje) | 16% | 230 036 zł |
| 4 | Odbiór M6–M7 (monetyzacja + płatności/KSeF) | 18% | 258 790 zł |
| 5 | Odbiór M8 (panele) | 12% | 172 527 zł |
| 6 | Odbiór M9 (admin + integracja) | 12% | 172 527 zł |
| 7 | GO-LIVE + odbiór końcowy | 10% | 143 771 zł |
| | **RAZEM** | **100%** | **1 437 722 zł** |

## 5. Zasady współpracy i zarządzanie zakresem

- **Zamrożenie zakresu per etap**: zakres etapu potwierdzany przed jego startem; zmiany przez procedurę Change Request (wycena wpływu na czas i budżet przed decyzją).
- **Demo co 2 tygodnie** + dostęp klienta do środowiska staging przez cały projekt.
- **Definition of Done**: code review, testy QA przechodzą, brak błędów krytycznych/wysokich, funkcja na staging.
- **Dostępność klienta**: decyzje produktowe i odpowiedzi na pytania w ≤ 2 dni robocze (opóźnienia decyzji przesuwają harmonogram 1:1).
- **Gwarancja**: 4 tygodnie po wdrożeniu — poprawki błędów bez dodatkowych kosztów; dalej rekomendowana umowa SLA (od ~8 000 zł netto/mies.: monitoring, backupy, drobne poprawki, aktualizacje zależności).

## 6. Założenia harmonogramu

- Materiały od klienta (treści, logotypy, dostępy do kont: Google Cloud, bramki płatności, KSeF, SMTP, OAuth) dostarczane zgodnie z planem etapów.
- Środowisko testowe KSeF (MF) i sandboxy bramek dostępne od etapu 8.
- UAT prowadzony przez klienta w tygodniach 37–39 z bieżącym zgłaszaniem uwag.
- Harmonogram zakłada stabilny skład zespołu; urlopy planowane między etapami.
