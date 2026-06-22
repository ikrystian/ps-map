# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 0: Wstęp i Konfiguracja Środowiska Testowego

Niniejsza dokumentacja stanowi kompletny przewodnik dla testera manualnego systemu ProstaSprawa.pl. Znajdują się w niej wszystkie ścieżki (Test Cases), które należy przejść, aby zagwarantować pełne przetestowanie funkcjonalności oraz widoków platformy. 

### 1. Środowisko Testowe i Narzędzia
1. **Adres platformy:** Zostanie dostarczony (np. `http://localhost:3000` dla środowiska dev lub dedykowany link stage).
2. **Narzędzia:** 
   - Przeglądarka: Chrome (rekomendowana), Firefox, Safari.
   - Narzędzia developerskie (F12) – zakładka Network i Console w celu weryfikacji ewentualnych błędów.
   - Dwa różne profile przeglądarki (np. normalne okno + tryb incognito), aby jednocześnie zalogować się jako Klient i Ekspert (niezbędne do testowania czatu i procesu licytacji).

### 2. Baza Danych i Konta Testowe
Przed przystąpieniem do testów upewnij się, że na środowisku testowym uruchomiono skrypt wypełniający bazę danymi (seed). Otrzymasz dostęp do predefiniowanych kont:

*   **Administrator:** `admin@ps-dev.com.pl` / `ADmin123`
*   **Klient:** `test-client@ps-dev.com.pl` / `Password123`
*   **Ekspert:** `test-law-firm@ps-dev.com.pl` / `Password123`

*Uwaga:* Zalecane jest również ręczne przejście procesu rejestracji dla stworzenia zupełnie nowych kont do testów ("od zera").

### 3. Założenia Ogólne podczas Testowania (Do sprawdzania w każdym widoku)
Podczas przechodzenia ścieżek zwracaj uwagę na:
*   **Design i UX:** Aplikacja ma nowoczesny design, tryb ciemny (Dark Mode), efekty glassmorphism i animacje (Framer Motion). Żaden z widoków nie powinien wyglądać na "zepsuty", a animacje powinny być płynne.
*   **Responsywność (RWD):** Każdy widok musi być testowany pod kątem szerokości mobilnej (np. szerokość iPhone 13) oraz desktopowej.
*   **Walidacja:** Czy formularze poprawnie zgłaszają błędy po wpisaniu nieprawidłowych danych (np. zły format e-mail, puste pola wymagane). Błędy powinny pojawiać się przy polach tekstowych.
*   **Ładowanie (Loading states):** Czy przy wysyłaniu formularzy przyciski mają stan ładowania (np. spinner) i blokują się przed podwójnym kliknięciem.
*   **Wyskakujące powiadomienia (Toasty):** Czy system wyświetla odpowiednie komunikaty sukcesu/błędu (zielone/czerwone powiadomienia w rogu ekranu).

---
**Kolejne kroki testowe znajdziesz w następnych plikach instrukcji.**
