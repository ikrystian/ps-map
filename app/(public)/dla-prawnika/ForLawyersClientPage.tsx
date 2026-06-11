"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import "./dla-prawnika.css"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

export default function ForLawyersClientPage() {
  const router = useRouter()
  const [activeCaseIdx, setActiveCaseIdx] = useState(0)
  const [highlightedFeature, setHighlightedFeature] = useState<number | null>(null)

  // Scroll animations IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delayAttr = entry.target.getAttribute("data-delay")
            const delay = delayAttr ? parseInt(delayAttr, 10) : 0
            setTimeout(() => {
              entry.target.classList.add("visible")
            }, delay)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    const elements = document.querySelectorAll(".animate-on-scroll")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  // Auto-cycle for live cases mockup
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCaseIdx((prev) => (prev + 1) % 3)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="lawyer-landing">
      {/* Breadcrumbs Banner */}
      <div
        className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Dla prawnika" },
            ]}
          />
        </div>
      </div>

      {/* Section 1: Hero */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src="/backgrounds/1.png" alt="" className="hero-bg-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-container-layout mx-auto">
          <div className="hero-left animate-on-scroll">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              PRZYSZŁOŚĆ PRAWA ONLINE
            </div>
            <h1 className="hero-title">
              Łatwy dostęp do spraw,<br />
              które pasują do Ciebie
            </h1>
            <p className="hero-subtitle">
              Sprawnie przeglądaj zgłoszenia, wybieraj sprawy zgodne z Twoją specjalizacją i ciesz się wygodą
              pracy – bez stresu, bezpośrednio z klientem, dokładnie <strong>na Twoich warunkach.</strong>
            </p>
            <div className="hero-actions">
              <Link href="/logowanie">
                <InteractiveHoverButton>Załóż bezpłatne konto!</InteractiveHoverButton>
              </Link>
              {/* <a href="#benefits" className="btn-secondary-outline">
                <span>Zobacz korzyści</span>
              </a> */}
            </div>
            {/* Trust / Social Proof Widget */}
            <div className="hero-trust">
              <div className="trust-text">
                Dołącz do dziesiątek <strong>prawników</strong> z całej Polski.
              </div>
            </div>
          </div>

          {/* Right Pane: Live Cases Mockup */}
          <div className="hero-right animate-on-scroll" data-delay="150">
            <div className="live-cases-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="mockup-title">BAZA SPRAW</div>
              </div>
              <div className="mockup-body">
                {/* Search & Filter bar */}
                <div className="mockup-search-bar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span>Wyszukaj specjalizację...</span>
                </div>

                <div className="case-list">
                  {/* Case Item 1 */}
                  <div
                    className={`case-item ${activeCaseIdx === 0 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCaseIdx(0)}
                  >
                    <div className="case-item-header">
                      <span className="case-cat">Prawo Rodzinne</span>
                      <span className="case-badge badge-gold">Wysoki budżet</span>
                    </div>
                    <h4 className="case-item-title">Podział majątku i sprawa rozwodowa</h4>
                    <div className="case-meta">
                      <span className="meta-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Warszawa (Mazowieckie)
                      </span>
                      <span className="meta-tag text-green">
                        Szac. budżet: ~12 000 PLN
                      </span>
                    </div>
                  </div>

                  {/* Case Item 2 */}
                  <div
                    className={`case-item ${activeCaseIdx === 1 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCaseIdx(1)}
                  >
                    <div className="case-item-header">
                      <span className="case-cat">Prawo Cywilne</span>
                      <span className="case-badge badge-green">Nowa sprawa</span>
                    </div>
                    <h4 className="case-item-title">Odszkodowanie za opóźniony lot i spór z OC</h4>
                    <div className="case-meta">
                      <span className="meta-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Gdańsk (Pomorskie)
                      </span>
                      <span className="meta-tag text-green">
                        Szac. budżet: ~4 500 PLN
                      </span>
                    </div>
                  </div>

                  {/* Case Item 3 */}
                  <div
                    className={`case-item ${activeCaseIdx === 2 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCaseIdx(2)}
                  >
                    <div className="case-item-header">
                      <span className="case-cat">Prawo Handlowe</span>
                      <span className="case-badge badge-gray">Stała obsługa</span>
                    </div>
                    <h4 className="case-item-title">Przygotowanie regulaminu SaaS i polityki prywatności</h4>
                    <div className="case-meta">
                      <span className="meta-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Zdalnie (Online)
                      </span>
                      <span className="meta-tag text-green">
                        Budżet: 3 000 PLN / msc
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Benefits */}
      <section className="benefits" id="benefits">
        <div className="section-dark-bg">
          <div className="container mx-auto">
            <div className="benefits-header animate-on-scroll">
              <span className="section-label">WYŻSZY STANDARD PRACY</span>
              <h2 className="section-title-light">
                Dlaczego warto założyć profil<br />na naszym portalu?
              </h2>
            </div>
            <div className="benefits-grid">
              {/* Card 1 */}
              <div className="benefit-card animate-on-scroll" data-delay="0">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="17" y1="11" x2="23" y2="11" />
                    </svg>
                  </div>
                </div>
                <h3 className="benefit-title">Nowe Zlecenia</h3>
                <p className="benefit-text">Strumień zweryfikowanych spraw od klientów z całej Polski. Koniec z
                  traceniem czasu na marketing i zimne telefony.</p>
                <span className="benefit-number">01</span>
              </div>
              {/* Card 2 */}
              <div className="benefit-card animate-on-scroll" data-delay="100">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                </div>
                <h3 className="benefit-title">Cyfrowa Wizytówka</h3>
                <p className="benefit-text">Profesjonalny, nowoczesny profil, który buduje zaufanie w sieci.
                  Przedstaw swoje specjalizacje i sukcesy.</p>
                <span className="benefit-number">02</span>
              </div>
              {/* Card 3 */}
              <div className="benefit-card animate-on-scroll" data-delay="200">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>
                <h3 className="benefit-title">Pozycjonowanie SEO</h3>
                <p className="benefit-text">Zadbamy o to, aby Twój profil znajdował się na czołowych pozycjach w
                  wyszukiwarce Google dla Twoich specjalizacji.</p>
                <span className="benefit-number">03</span>
              </div>
              {/* Card 4 */}
              <div className="benefit-card animate-on-scroll" data-delay="300">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                </div>
                <h3 className="benefit-title">Aktywny Rozwój</h3>
                <p className="benefit-text">Wsparcie dedykowanego doradcy oraz zautomatyzowane narzędzia statystyk
                  pomogą Ci maksymalizować przychody z portalu.</p>
                <span className="benefit-number">04</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-section: Gain clients */}
        <div className="gain-clients" id="features">
          <div className="gain-clients-bg">
            <img src="/backgrounds/3.png" alt="" className="gain-bg-img" />
            <div className="gain-overlay"></div>
          </div>
          <div className="container gain-clients-layout mx-auto">
            {/* Left Pane: Interactive statistics mockup card */}
            <div className="gain-left animate-on-scroll">
              <div className="analytics-mockup">
                <div className="analytics-header">
                  <div className="mockup-dots">
                    <span className="dot-red"></span>
                    <span className="dot-yellow"></span>
                    <span className="dot-green"></span>
                  </div>
                  <div className="mockup-title">&nbsp;</div>
                </div>
                <div className="analytics-body">
                  <div className="analytics-main-row">
                    <div className="analytics-main-value">
                      <span className="label">MIESIĘCZNY PRZYCHÓD</span>
                      <span className="val">+24 800 PLN</span>
                      <span className="growth">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>{" "}
                        +34.2% m/m
                      </span>
                    </div>
                    <div className="analytics-circle-container">
                      <svg className="analytics-circle" viewBox="0 0 36 36">
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="circle" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="circle-percentage">88%</div>
                    </div>
                  </div>
                  <div className="analytics-stats-grid">
                    <div className="mini-stat">
                      <span className="m-label">Otrzymane zapytania</span>
                      <span className="m-val">48</span>
                    </div>
                    <div className="mini-stat">
                      <span className="m-label">Wygrane zlecenia</span>
                      <span className="m-val">12</span>
                    </div>
                    <div className="mini-stat">
                      <span className="m-label">Średni współczynnik konwersji</span>
                      <span className="m-val">25.0%</span>
                    </div>
                    <div className="mini-stat">
                      <span className="m-label">Zadowoleni klienci</span>
                      <span className="m-val">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: List & CTA */}
            <div className="gain-right animate-on-scroll" data-delay="150">
              <span className="section-label">ZDOBYWAJ KLIENTÓW Z CAŁEGO KRAJU</span>
              <h2 className="section-title">
                Efektywny sposób<br />
                na pozyskiwanie nowych spraw<br />
                bez długich poszukiwań!
              </h2>
              <ul className="check-list">
                <li className="check-item">
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <strong>Łatwy dostęp do klientów</strong> – Pozyskuj sprawy od klientów w całej Polsce,
                    zgodnie z Twoją specjalizacją.
                  </div>
                </li>
                <li className="check-item">
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <strong>Budowanie reputacji</strong> – Zbieraj opinie i certyfikaty, które wzmacniają
                    Twój profesjonalny wizerunek.
                  </div>
                </li>
                <li className="check-item">
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <strong>Pełna kontrola nad zleceniami</strong> – Wybieraj sprawy, które najlepiej pasują
                    do Ciebie, i decyduj o warunkach.
                  </div>
                </li>
                <li className="check-item">
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <strong>Wsparcie w rozwoju</strong> – Dedykowany doradca i narzędzia promocji pomogą Ci
                    osiągnąć sukces zawodowy online.
                  </div>
                </li>
              </ul>
              <Link href="/logowanie">
                <InteractiveHoverButton>Testuj za darmo!</InteractiveHoverButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 & 4: Advisor */}
      <section className="advisor" id="advisor">
        <div className="container mx-auto">
          <div className="advisor-section-header mx-auto">
            <span className="section-label animate-on-scroll mx-auto">BĄDŹ LEPIEJ WIDOCZNY</span>
            <h2 className="section-title animate-on-scroll text-center">
              Twój doradca pomoże Ci<br />rozwinąć skrzydła
            </h2>
            <p className="section-subtitle animate-on-scroll text-center">
              Kompleksowe i indywidualne wsparcie, które przełoży się na więcej wygranych spraw i silniejszą markę
              w sieci.
            </p>
          </div>

          <div className="advisor-layout">
            {/* Left Pane: Interactive Mockup/Dashboard */}
            <div className="advisor-visual-card animate-on-scroll" data-delay="0">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="mockup-title">prostasprawa.pl — Panel Doradcy</div>
              </div>
              <div className="mockup-body">
                {/* Advisor Profile Widget */}
                <div className={`advisor-widget ${highlightedFeature === 2 ? "highlighted" : ""}`}>
                  <div className="advisor-avatar-container">
                    <div className="advisor-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="status-indicator online"></span>
                  </div>
                  <div className="advisor-info">
                    <h4 className="advisor-name">Katarzyna Nowak</h4>
                    <p className="advisor-role">Twój dedykowany doradca</p>
                  </div>
                  <div className="advisor-badge">Online</div>
                </div>

                {/* Advisor Chat Bubble */}
                <div className="chat-bubble-card">
                  <div className={`chat-bubble ${highlightedFeature === 3 ? "highlighted" : ""}`}>
                    <p>
                      Cześć! Przeanalizowałam Twój profil i mam dla Ciebie wskazówkę. Uzupełnienie zakładki
                      &quot;Certyfikaty&quot; zwiększy widoczność Twoich ofert o blisko <strong>40%</strong>.
                    </p>
                    <span className="chat-time">10:42</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mockup-stats-grid">
                  <div className={`stat-mini-card ${highlightedFeature === 0 ? "highlighted" : ""}`}>
                    <span className="stat-label">Moc profilu</span>
                    <div className="progress-ring-container">
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-fill" style={{ width: "85%" }}></div>
                      </div>
                      <span className="stat-value">85%</span>
                    </div>
                    <span className="stat-tip">Uzupełnij certyfikaty (+15%)</span>
                  </div>
                  <div className={`stat-mini-card ${highlightedFeature === 1 ? "highlighted" : ""}`}>
                    <span className="stat-label">Widoczność ofert</span>
                    <span className="stat-big-value text-gold">+148%</span>
                    <span className="stat-subtext">Wzrost w tym tygodniu</span>
                  </div>
                </div>

                {/* Checklist */}
                <div className={`mockup-checklist ${highlightedFeature === 3 ? "highlighted" : ""}`}>
                  <h5 className="checklist-title">Zadania dla Ciebie:</h5>
                  <div className="checklist-item done">
                    <div className="check-box">✓</div>
                    <span>Weryfikacja dokumentów zawodowych</span>
                  </div>
                  <div className="checklist-item done">
                    <div className="check-box">✓</div>
                    <span>Konfiguracja powiadomień SMS</span>
                  </div>
                  <div className="checklist-item active">
                    <div className="check-box"></div>
                    <span>Dodanie pierwszego certyfikatu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Stacked Benefit Cards */}
            <div className="advisor-features-stack">
              <div
                className="advisor-feature-item animate-on-scroll"
                data-delay="100"
                onMouseEnter={() => setHighlightedFeature(0)}
                onMouseLeave={() => setHighlightedFeature(null)}
              >
                <div className="feature-header">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="feature-title-group">
                    <h3 className="feature-title">Optymalizacja profilu</h3>
                    <span className="feature-badge badge-green">Wzrost konwersji</span>
                  </div>
                </div>
                <p className="feature-text">
                  Doradca podpowie Ci, jak uzupełnić profil, by wyróżnić swoją specjalizację i przyciągnąć
                  potencjalnych klientów.
                </p>
              </div>

              <div
                className="advisor-feature-item animate-on-scroll"
                data-delay="200"
                onMouseEnter={() => setHighlightedFeature(1)}
                onMouseLeave={() => setHighlightedFeature(null)}
              >
                <div className="feature-header">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="feature-title-group">
                    <h3 className="feature-title">Strategia zdobywania spraw</h3>
                    <span className="feature-badge badge-gold">Skuteczne oferty</span>
                  </div>
                </div>
                <p className="feature-text">
                  Otrzymasz profesjonalne wskazówki, jak odpowiadać na zgłoszenia, wyceniać sprawy i budować
                  przewagę nad konkurencją.
                </p>
              </div>

              <div
                className="advisor-feature-item animate-on-scroll"
                data-delay="300"
                onMouseEnter={() => setHighlightedFeature(2)}
                onMouseLeave={() => setHighlightedFeature(null)}
              >
                <div className="feature-header">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="feature-title-group">
                    <h3 className="feature-title">Wsparcie techniczne</h3>
                    <span className="feature-badge badge-gray">Reakcja &lt; 15 min</span>
                  </div>
                </div>
                <p className="feature-text">
                  Pomożemy Ci w pełnym wdrożeniu i szybko rozwiążemy wszelkie kwestie techniczne związane z
                  obsługą portalu.
                </p>
              </div>

              <div
                className="advisor-feature-item animate-on-scroll"
                data-delay="400"
                onMouseEnter={() => setHighlightedFeature(3)}
                onMouseLeave={() => setHighlightedFeature(null)}
              >
                <div className="feature-header">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="feature-title-group">
                    <h3 className="feature-title">Budowanie wizerunku</h3>
                    <span className="feature-badge badge-gold">Certyfikat Premium</span>
                  </div>
                </div>
                <p className="feature-text">
                  Dowiesz się, jak gromadzić opinie od klientów, budować zaufanie i uzyskiwać oficjalne
                  wyróżnienia profesjonalizmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Differentiators */}
      <section className="differentiators flex w-full justify-center" id="differentiators">
        <div className="container max-auto">
          <div className="diff-split-container">
            <div className="diff-card-left animate-on-scroll">
              <span className="section-label">TWÓJ PROFIL, TWOJA WIZYTÓWKA</span>
              <h2 className="section-title">
                Czym różnimy się od innych<br />portali? Wszystkim!
              </h2>
              <ul className="diff-list">
                <li className="diff-item">
                  <div className="diff-bullet"></div>
                  <div>
                    <strong>System ofertowy</strong> – Klient zgłasza sprawę, a prawnicy sami składają mu
                    indywidualne oferty wraz z cenami, co pozwala klientowi wybrać najkorzystniejszą opcję
                    bezpośrednio od prawnika.
                  </div>
                </li>
                <li className="diff-item">
                  <div className="diff-bullet"></div>
                  <div>
                    <strong>Możliwość pełnej prezentacji profilu</strong> – Prawnicy mogą budować swój
                    wizerunek, publikując certyfikaty, artykuły, zdobywając certyfikaty i zbierając opinie,
                    co wzmacnia ich profesjonalny profil.
                  </div>
                </li>
                <li className="diff-item">
                  <div className="diff-bullet"></div>
                  <div>
                    <strong>Aktywne pozycjonowanie</strong> – W prostasprawa.pl każdy prawnik korzysta z
                    rankingów, punktów i certyfikatów, by zwiększyć swoją widoczność na rynku prawnym, co
                    nie jest dostępne w Oferteo.
                  </div>
                </li>
                <li className="diff-item">
                  <div className="diff-bullet"></div>
                  <div>
                    <strong>Specjalistyczne wsparcie</strong> – Dedykowany opiekun pomaga prawnikom w
                    optymalizacji profilu i zdobywaniu klientów, co podnosi jakość i skuteczność ich
                    obecności na portalu.
                  </div>
                </li>
              </ul>
              <Link href="/logowanie">
                <InteractiveHoverButton>Tak, zakładam konto</InteractiveHoverButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Why Us */}
      <section className="why-us" id="why-us">
        <div className="container mx-auto">
          <div className="why-us-box text-center animate-on-scroll">
            <span className="section-label">DLACZEGO MY?</span>
            <h2 className="section-title">
              Jedno miejsce, przejrzyste<br />warunki współpracy
            </h2>
            <ul className="why-list max-w-4xl mx-auto">
              <li className="why-item">
                <div className="why-bullet"></div>
                <div>
                  <strong>Specjalizacja i bezpośrednia komunikacja</strong> – prostasprawa.pl koncentruje się
                  wyłącznie na branży prawnej, oferując system ofertowy, który pozwala prawnikom
                  dokładnie dopasować swoje usługi do potrzeb klientów w ich specjalizacji.
                </div>
              </li>
              <li className="why-item">
                <div className="why-bullet"></div>
                <div>
                  <strong>Bezpieczeństwo i poufność</strong> – komunikacja z klientem jest poufna i dostępna
                  tylko dla wybranego prawnika.
                </div>
              </li>
              <li className="why-item">
                <div className="why-bullet"></div>
                <div>
                  <strong>Bez prowizji od zleceń</strong> – wszystkie rozliczenia są bezpośrednie, co oznacza
                  brak dodatkowych kosztów.
                </div>
              </li>
              <li className="why-item">
                <div className="why-bullet"></div>
                <div>
                  <strong>Wsparcie i promocja</strong> – prawnicy korzystają z dedykowanego opiekuna, punktów
                  za aktywność oraz certyfikatów, co wzmacnia ich widoczność na portalu i pomaga w
                  zdobywaniu nowych klientów.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 7: Contact */}
      <section className="contact-section" id="contact">
        <div className="container mx-auto">
          <h2 className="contact-title animate-on-scroll">
            <span className="contact-line"></span>
            Masz pytania?
            <span className="contact-line"></span>
          </h2>
          <div className="contact-card animate-on-scroll">
            <div className="contact-row">
              <div className="contact-icon phone-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="contact-info">tel. 790-466-488</span>
            </div>
            <div className="contact-row">
              <div className="contact-icon mail-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <a href="mailto:kontakt@prostasprawa.pl" className="contact-btn">
                NAPISZ DO NAS
              </a>
            </div>
            <div className="contact-row">
              <div className="contact-icon gear-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M9 12l2 2 4-4" stroke="#5a9a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <Link href="/rejestracja/ekspert" className="contact-btn">
                ZAŁÓŻ DARMOWY PROFIL
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
