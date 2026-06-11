# Katalog komponentów (`components/`, `blocks/`)

## Komponenty globalne (katalog główny `components/`)

| Komponent | Rozmiar | Rola |
|---|---|---|
| `PublicHeader` | 58 kB | Nagłówek publiczny: logo, mega-menu kategorii (prywatne/firmowe), wyszukiwarka, CTA logowania/rejestracji, menu zalogowanego użytkownika, wersja mobilna (sheet) |
| `PublicFooter` | 10 kB | Stopka: kolumny linków, dane kontaktowe, social media, linki prawne (strony CMS) |
| `UserMenu` | 11 kB | Dropdown użytkownika (avatar, linki do panelu wg roli, wylogowanie) |
| `NotificationBell` | 7 kB | Dzwonek powiadomień in-app: licznik, lista, oznaczanie przeczytanych (`/api/notifications`) |
| `MessagesBell` | 1 kB | Licznik nieprzeczytanych wiadomości (`/api/conversations/unread-count`) |
| `AdminNotificationBell` | 11 kB | Wersja dla admina |
| `bell-icon` | | animowana ikona dzwonka |
| `HelpCenter` | 18 kB | Pełne centrum pomocy (kategorie, wyszukiwarka FAQ, głosowanie pomocności) — używane w panelach |
| `ChatAssistant` | 11 kB | Pływający asystent czatowy (endpoint `/api/chat`) |
| `ContactForm` | 7 kB | Formularz kontaktowy (imię i nazwisko, e-mail, telefon, temat, wiadomość, załącznik) |
| `DynamicPageContent` | 1,5 kB | Render stron CMS (moduły `PageModule` przez `module-parser`) |
| `law-firm-list-item` | 18 kB | Karta eksperta na listach wyszukiwania (logo, ocena, specjalizacje, lokalizacja, badge promocji, CTA) |
| `law-firm-card-wrapper` | | wrapper karty |
| `PromotedLawFirmCard` | 5 kB | Karta promowanego eksperta (sekcje strony głównej) |
| `PromotionBadge` | 1 kB | Znaczek typu promocji na karcie |
| `ad-banner` | 8 kB | Render reklamy (obrazek lub HTML) + tracking impressions/clicks |
| `PanelFooter` | 4 kB | Stopka paneli |
| `ParticlesBackground`, `magic-card`, `theme-provider` | | efekty wizualne / motyw |

## `components/ui/` — biblioteka bazowa (shadcn-style, ~60 plików)

Prymitywy Radix: `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `collapsible`, `command` (cmdk), `dialog`, `dropdown-menu`, `form` (RHF), `input`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toast`/`toaster`/`sonner`, `toggle`, `tooltip`.

Rozszerzenia własne/efektowe: `3d-card`, `animated-testimonials` (karuzela opinii strony głównej), `avatar-group`, `bento-grid`, `border-beam`, `chart` (Recharts wrapper), `confirm-delete-dialog`, `date-time-picker`, `focus-cards`, `heading`, `image-cropper` + `image-upload` + `image-upload-with-crop` (react-image-crop), `info-dialog`, `interactive-hover-button`, `layout-grid`, `masonry-grid`, `number-ticker`, `responsive-breadcrumbs`, `rich-text-editor` (15 kB — Editor.js z pluginami), `shadcn-io/` (dodatki).

## Komponenty domenowe

### `components/homepage/` (14 plików)
Sekcje strony głównej — opisane w [04-czesc-publiczna.md](04-czesc-publiczna.md): `hero-section`, `benefits-section`, `search-help-section`, `categories-grid`, `business-categories-grid`, `recommended-lawyers` (14 kB), `most-consulted-categories` (18 kB), `expert-cta`, `new-experts`, `how-it-works-section` (+ `how-it-works-platform`), `latest-articles`, `cities-list`, `newsletter-section`.

### `components/messages/` (czat)
- `EnhancedMessengerLayout` — układ dwukolumnowy,
- `EnhancedConversationList` (16 kB) — lista konwersacji: wyszukiwanie, archiwum, liczniki, ostatnia wiadomość,
- `EnhancedChatArea` (34 kB) — okno czatu: bąbelki, statusy (SENT/DELIVERED/READ), typing indicator, emoji picker, upload PDF, lightbox, blokowanie, status online,
- `UserInfoDialog` — profil rozmówcy, `UnreadMessagesBadge`,
- starsze: `ChatArea`, `ConversationList` (poprzednia wersja UI).

### `components/ekspert/` (wizytówka publiczna)
`AboutTab` (12 kB), `ServicesTab`, `ReviewsSection` (42 kB — opinie + formularz + odpowiedzi + zgłaszanie), `BlogTab`, `ConsultationBooking` (21 kB — kalendarz rezerwacji).

### `components/calendar/` (12 plików)
Własny kalendarz konsultacji: `calendar` (kontener), widoki `month-view`/`week-view`/`day-view`/`agenda-view`, `view-switcher`, `slot-btn`, `timezone-selector` + `timezones`, `helpers`, `types`, `tooltip`.

### `components/admin/`
`blog-post-form` (33 kB), `category-form` (21 kB), `page-builder` (13 kB — kompozytor stron CMS), `block-importer` (import bloków z `blocks/`), `icon-picker` (10 kB — wybór ikon Lucide), `EmailLogsTab` (16 kB), `ScheduledEmailsTab` (30 kB), `AdminPageTitle` + `AdminTitleContext`.

### `components/law-firm/` (panel eksperta — wspólne)
`AccountManagerWidget` (8 kB — kontakt z opiekunem), `BadgesSection`, `BusinessPackageWelcomeModal` (powitalny darmowy pakiet Biznes), `NotificationSettingsPromptModal` (12 kB — wymuszenie konfiguracji powiadomień).

### `components/panel-eksperta/`
`ConsultationHoursForm` (12 kB — godziny dostępności + ceny 15/30 min), `PageHeader`, podkatalog `profil/` (sekcje edycji wizytówki).

### `components/permissions/`
`ExpiredPackageModal`, `FeatureLockedCard`, `LimitIndicator`, `PackageBadge`, `UpgradeAlert` — UI systemu uprawnień ([03](03-autentykacja-i-autoryzacja.md)).

### `components/expert-panel/`
`ExpertTourManager` (20 kB — onboardingowy tour po panelu), `ExpertTourButton`.

### `components/auth/`
`auth-layout`, `login-history` (11 kB — tabela logowań), `social-registration-buttons` (Google/Facebook/Apple).

### `components/for-lawyers/`
`lawyer-benefits-section` — sekcja landingu `/dla-prawnika`.

### `components/unlumen-ui/`
Dodatkowa biblioteka efektów UI.

## `blocks/` — bloki marketingowe CMS

`hero`, `features`, `team` (13 kB), `testimonials` (9,5 kB), `contact`, `cta` + `index.ts` (rejestr) — importowalne do CMS przez `block-importer` i renderowane przez `/api/admin/blocks/[key]/render`.
