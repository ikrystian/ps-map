"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Inter } from "next/font/google"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import { useLandingEffects } from "@/hooks/use-landing-effects"
import "../dla-prawnika/dla-prawnika.css"
import "./dla-eksperta.css"
import { EXPERT_AREAS, EXPERT_FAQ } from "./content"

// Landing korzysta z Intera — reszta aplikacji z Poppinsa, wiec ladujemy go lokalnie
const inter = Inter({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
})

const REGISTER_HREF = "/rejestracja/ekspert"

// Kategorie z przykładowych spraw w sekcji problemów
const SEARCH_PHRASES = [
    "Nieruchomości",
    "Odszkodowania",
    "Cudzoziemcy",
    "Rozliczenia PIT",
    "Przepisy BHP",
    "RODO i ochrona danych osobowych",
]

export default function ForExpertsClientPage() {
    const rootRef = useRef<HTMLDivElement>(null)
    const [areaTab, setAreaTab] = useState(0)
    const [marketingTab, setMarketingTab] = useState(0)

    useLandingEffects(rootRef, SEARCH_PHRASES)

    return (
        <>
            {/* Breadcrumbs Banner */}
            <div
                className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-border/60 on-dark"
                style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
                <div className="absolute inset-0 bg-black/10" />
                <div className="container mx-auto px-4 relative z-10">
                    <ResponsiveBreadcrumbs
                        items={[
                            { label: "Home", href: "/" },
                            { label: "Dla eksperta" },
                        ]}
                    />
                </div>
            </div>

            {/* Landing ma własny arkusz (dla-prawnika.css + dla-eksperta.css) z paletą `--lp-*`,
                która przełącza się razem z motywem aplikacji. Sekcje leżące na
                ciemnym zdjęciu (hero) i makiety produktu zostają ciemne — mają
                `on-dark` na swoich kontenerach. */}
            <div ref={rootRef} className={`ps-lp ${inter.variable}`}>
                {/* Section 1: Hero */}
                <section className="hero" id="hero">
                    <div className="hero-bg" id="heroBg">
                        <img src="/backgrounds/1.webp" alt="" className="hero-bg-img" fetchPriority="high" />
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="hero-decor" id="heroDecor" aria-hidden="true">
                        <div className="hero-glow hero-glow-teal"></div>
                        <div className="hero-glow hero-glow-gold"></div>
                    </div>
                    <div className="container hero-container-layout">
                        <div className="hero-left">
                            <div className="hero-badge"><span className="badge-dot"></span> DLA EKSPERTA</div>
                            <h1 className="hero-title">
                                <span className="title-line">
                                    <span className="title-line-inner">Prawnik ma paragraf.</span>
                                </span>
                                {" "}
                                <span className="title-line">
                                    <span className="title-line-inner text-shine">Ty masz dowód.</span>
                                </span>
                            </h1>
                            <p className="hero-subtitle">Wiele spraw rozstrzyga nie przepis, tylko wycena, pomiar, opinia albo tłumaczenie z pieczęcią. Na ProstaSprawa.pl ludzie i firmy opisują swoje sprawy, a Ty <strong>odpowiadasz na te ze swojej dziedziny</strong>. Bez katalogu, w którym wisisz obok setki innych, i bez telefonów od kogoś, kto „tylko pyta o cenę”.</p>
                            <div className="hero-actions">
                                <Link className="btn-primary" href={REGISTER_HREF}>
                                    <span>Załóż darmowy profil</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="hero-trust">
                                <div className="trust-text">Pakiet Podstawowy za <strong>0 zł</strong>, bez prowizji od zleceń.</div>
                            </div>
                        </div>
                        <div className="hero-right">
                            <div className="live-cases-mockup">
                                <div className="mockup-header">
                                    <div className="mockup-dots">
                                        <span className="dot-red"></span>
                                        {" "}
                                        <span className="dot-yellow"></span>
                                        {" "}
                                        <span className="dot-green"></span>
                                    </div>
                                    <div className="mockup-title">BAZA SPRAW</div>
                                </div>
                                <div className="mockup-body">
                                    <div className="mockup-search-bar">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                        <span className="search-typing">
                                            <span id="searchTypeText">Wyszukaj kategorię...</span>
                                            <span className="search-caret" aria-hidden="true"></span>
                                        </span>
                                    </div>
                                    <div className="case-list">
                                        <div className="case-item active">
                                            <div className="case-item-header">
                                                <span className="case-cat">Nieruchomości</span>
                                                {" "}
                                                <span className="case-badge badge-gold">Do sądu</span>
                                            </div>
                                            <h4 className="case-item-title">Wycena domu do podziału majątku po rozwodzie</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg>Kraków (Małopolskie)</span>
                                                {" "}
                                                <span className="meta-tag text-green">Szac. budżet: ~2 500 PLN</span>
                                            </div>
                                        </div>
                                        <div className="case-item">
                                            <div className="case-item-header">
                                                <span className="case-cat">Odszkodowania</span>
                                                {" "}
                                                <span className="case-badge badge-green">Nowa sprawa</span>
                                            </div>
                                            <h4 className="case-item-title">Kalkulacja naprawy auta po szkodzie z OC</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg>Poznań (Wielkopolskie)</span>
                                                {" "}
                                                <span className="meta-tag text-green">Szac. budżet: ~800 PLN</span>
                                            </div>
                                        </div>
                                        <div className="case-item">
                                            <div className="case-item-header">
                                                <span className="case-cat">Cudzoziemcy</span>
                                                {" "}
                                                <span className="case-badge badge-gray">Online</span>
                                            </div>
                                            <h4 className="case-item-title">Tłumaczenie przysięgłe aktu urodzenia z języka niemieckiego</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg>Zdalnie (Online)</span>
                                                {" "}
                                                <span className="meta-tag text-green">Szac. budżet: ~200 PLN</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="#problemy" className="scroll-indicator" id="scrollIndicator" aria-label="Przewiń w dół">
                        <span className="scroll-indicator-label">Przewiń</span>
                        {" "}
                        <span className="scroll-indicator-track">
                            <span className="scroll-indicator-dot"></span>
                        </span>
                    </a>
                </section>

                {/* Section 2: Z czym przychodzą klienci */}
                <section className="benefits" id="problemy">
                    <div className="section-dark-bg">
                        <div className="container">
                            <div className="benefits-header">
                                <span className="section-label">Z CZYM PRZYCHODZĄ KLIENCI</span>
                                <h2 className="section-title-light">Sprawy, w których potrzebny jest ekspert, nie paragraf</h2>
                                <p className="ex-lead">Wybierz swoją dziedzinę. Tak ludzie i firmy opisują swoje kłopoty, kiedy jeszcze nie wiedzą, kogo szukać. Nad każdym przykładem jest kategoria, w której taka sprawa ląduje w serwisie.</p>
                            </div>
                            <div className="ex-tabs" role="tablist" aria-label="Dziedziny">
                                {EXPERT_AREAS.map((area, i) => (
                                    <button
                                        key={area.label}
                                        type="button"
                                        role="tab"
                                        aria-selected={areaTab === i}
                                        className={`ex-tab${areaTab === i ? " is-on" : ""}`}
                                        onClick={() => setAreaTab(i)}
                                    >
                                        {area.label}
                                    </button>
                                ))}
                            </div>
                            {EXPERT_AREAS.map((area, i) => (
                                <div key={area.label} role="tabpanel" className={`ex-panel${areaTab === i ? " is-on" : ""}`}>
                                    <div className="ex-problemy">
                                        {area.problems.map((problem) => (
                                            <div key={problem.quote} className="ex-problem">
                                                <span className="ex-problem-cat">{problem.category}</span>
                                                <p className="ex-problem-q">{problem.quote}</p>
                                                <span className="ex-problem-who">Pomoże: <strong>{problem.profession}</strong></span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="ex-zawody-w-panelu">
                                        <span className="ex-mini-label">Zawody w tej dziedzinie</span>
                                        <ul className="ex-chips">
                                            {area.professions.map((profession) => (
                                                <li key={profession}>{profession}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                            <p className="ex-dopisek">Ponad 30 zawodów eksperckich. Nie widzisz swojego? Napisz na <a href="mailto:bok@prostasprawa.pl">bok@prostasprawa.pl</a>.</p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Jak to działa */}
                <section className="benefits" id="jak-to-dziala">
                    <div className="gain-clients">
                        <div className="gain-clients-bg">
                            <img src="/backgrounds/3.webp" alt="" className="gain-bg-img" loading="lazy" />
                            <div className="gain-overlay"></div>
                        </div>
                        <div className="container gain-clients-layout">
                            <div className="gain-left animate-on-scroll">
                                <div className="analytics-mockup ex-rej">
                                    <div className="analytics-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>
                                            {" "}
                                            <span className="dot-yellow"></span>
                                            {" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">ZAKŁADANIE PROFILU · KROK 2 Z 3</div>
                                    </div>
                                    <div className="analytics-body">
                                        <div className="ex-kroki">
                                            <span className="ex-krok done">1 Działalność</span>
                                            <span className="ex-krok on">2 Kategorie</span>
                                            <span className="ex-krok">3 Kontakt</span>
                                        </div>
                                        <p className="ex-rej-pyt">W jakich sprawach chcesz dostawać zapytania?</p>
                                        <div className="ex-rej-opcje">
                                            <span className="ex-opcja wybrana">✓ Wyceny i ekspertyzy</span>
                                            <span className="ex-opcja wybrana">✓ Nieruchomości</span>
                                            <span className="ex-opcja">Prawo budowlane</span>
                                            <span className="ex-opcja">Rodzina</span>
                                        </div>
                                        <div className="ex-rej-limit">
                                            <span>Wybrane kategorie</span>
                                            <strong>2 z 2</strong>
                                        </div>
                                        <div className="progress-bar-wrapper">
                                            <div className="progress-bar-fill" style={{ width: "100%" }}></div>
                                        </div>
                                        <p className="ex-rej-woj">Województwo: <strong>małopolskie</strong></p>
                                        <span className="ex-rej-dalej">Dalej</span>
                                    </div>
                                </div>
                            </div>
                            <div className="gain-right animate-on-scroll">
                                <span className="section-label">JAK TO DZIAŁA</span>
                                <h2 className="section-title">Od rejestracji <br />do pierwszej sprawy</h2>
                                <ul className="check-list">
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div><strong>Zakładasz konto.</strong> Podajesz, czym się zajmujesz i gdzie pracujesz. Zajmuje to kilka minut.</div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div><strong>Wybierasz kategorie i województwo.</strong> Od nich zależy, jakie sprawy zobaczysz w panelu.</div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div><strong>Wysyłasz dokumenty do weryfikacji.</strong> Uprawnienia, wpis do rejestru albo zaświadczenie biegłego. Po sprawdzeniu profil dostaje oznaczenie.</div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div><strong>Odpowiadasz na wybrane sprawy.</strong> Zakres, termin i cenę ustalasz z klientem sam, a on płaci Tobie.</div>
                                    </li>
                                </ul>
                                <Link className="btn-primary" href={REGISTER_HREF}>
                                    <span>Załóż darmowy profil</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Cennik */}
                <section className="ex-cena" id="cennik">
                    <div className="container ex-cena-layout">
                        <div className="ex-cena-tekst">
                            <span className="section-label">ILE TO KOSZTUJE</span>
                            <h2 className="section-title">Zaczynasz za 0 zł. <br />I możesz tak zostać.</h2>
                            <p className="section-subtitle-left">Pakiet Podstawowy jest darmowy na stałe. Nie ma okresu próbnego, po którym nagle pojawia się opłata.</p>
                            <p className="section-subtitle-left">Od zleceń nie bierzemy procentu. Pieniądze za wycenę, pomiar czy tłumaczenie trafiają od klienta prosto do Ciebie.</p>
                        </div>
                        <div className="ex-cena-karta">
                            <div className="ex-cena-gora">
                                <span className="ex-cena-nazwa">Pakiet Podstawowy</span>
                                <div className="ex-cena-kwota">
                                    <strong>0 zł</strong>
                                    <span>miesięcznie, bez limitu czasu</span>
                                </div>
                            </div>
                            <ul className="ex-cena-lista">
                                <li><span>✓</span>do 10 spraw w miesiącu</li>
                                <li><span>✓</span>1 województwo</li>
                                <li><span>✓</span>2 kategorie spraw</li>
                                <li><span>✓</span>profil z weryfikacją dokumentów</li>
                                <li><span>✓</span>opiekun profilu</li>
                                <li><span>✓</span>20 punktów na promocje na start</li>
                                <li><span>✓</span>0% prowizji od zleceń</li>
                            </ul>
                            <Link className="btn-primary" href={REGISTER_HREF}>
                                <span>Załóż darmowy profil</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <p className="ex-cena-wyzej">Więcej spraw, województw i kategorii dają pakiety od 80 zł brutto miesięcznie.</p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Skąd są klienci */}
                <section className="ex-skad" id="klienci">
                    <div className="container">
                        <div className="benefits-header">
                            <span className="section-label">SKĄD SĄ KLIENCI</span>
                            <h2 className="section-title-light">Klientów szukamy my. <br />Ty robisz swoje.</h2>
                        </div>
                        <div className="ex-grid3">
                            <div className="benefit-card ex-skad-karta">
                                <h3 className="benefit-title">Reklamy do ludzi z problemem</h3>
                                <p className="benefit-text">Prowadzimy kampanie w mediach społecznościowych i w Google, skierowane do osób i firm, które właśnie szukają pomocy.</p>
                                <span className="benefit-number">01</span>
                            </div>
                            <div className="benefit-card ex-skad-karta">
                                <h3 className="benefit-title">Strony kategorii i poradniki</h3>
                                <p className="benefit-text">Ponad 150 stron kategorii i artykuły na blogu odpowiadają na pytania, które ludzie wpisują w wyszukiwarkę.</p>
                                <span className="benefit-number">02</span>
                            </div>
                            <div className="benefit-card ex-skad-karta">
                                <h3 className="benefit-title">Dodanie sprawy jest darmowe</h3>
                                <p className="benefit-text">Klient opisuje problem bez opłat i bez zobowiązań. Łatwiej mu zacząć, więc spraw jest więcej.</p>
                                <span className="benefit-number">03</span>
                            </div>
                        </div>
                        <div className="ex-uczciwie"><strong>Uczciwie:</strong> serwis jest młody. Kto dołącza teraz, ma w swojej kategorii i województwie mniej konkurencji niż ci, którzy przyjdą za rok.</div>
                    </div>
                </section>

                {/* Section 6: Dom mediowy 4Connection */}
                <section className="mx-sekcja" id="marketing">
                    <div className="container">
                        <div className="mx-uklad">
                            <div className="mx-lewa">
                                <span className="section-label">DOM MEDIOWY 4CONNECTION</span>
                                <h2 className="section-title mx-tytul">Strona, social media i druk w jednych rękach</h2>
                                <p className="mx-wstep">ProstaSprawa.pl prowadzi dom mediowy 4Connection. Ten sam zespół zadba o to, jak wyglądasz w sieci i na papierze.</p>
                                <div className="ex-tabs mx-tabs" role="tablist">
                                    <button type="button" className={`ex-tab${marketingTab === 0 ? " is-on" : ""}`} role="tab" aria-selected={marketingTab === 0} onClick={() => setMarketingTab(0)}>Strona www</button>
                                    <button type="button" className={`ex-tab${marketingTab === 1 ? " is-on" : ""}`} role="tab" aria-selected={marketingTab === 1} onClick={() => setMarketingTab(1)}>Social media</button>
                                    <button type="button" className={`ex-tab${marketingTab === 2 ? " is-on" : ""}`} role="tab" aria-selected={marketingTab === 2} onClick={() => setMarketingTab(2)}>Katalogi i druk</button>
                                </div>
                                <div className={`mx-opis${marketingTab === 0 ? " is-on" : ""}`} role="tabpanel">
                                    <p className="section-subtitle-left">Strona, na której klient w minutę sprawdzi, czym się zajmujesz, gdzie pracujesz i jak się z Tobą umówić. Piszemy treści, robimy zdjęcia i ustawiamy ją tak, żeby Google ją znalazło.</p>
                                    <ul className="mx-lista">
                                        <li>Projekt i teksty pod Twoje usługi</li>
                                        <li>Telefon, formularz i mapa dojazdu zawsze pod ręką</li>
                                        <li>Szybka na telefonie, przygotowana pod wyszukiwarkę</li>
                                    </ul>
                                </div>
                                <div className={`mx-opis${marketingTab === 1 ? " is-on" : ""}`} role="tabpanel">
                                    <p className="section-subtitle-left">Prowadzimy Twój profil: plan publikacji, posty, rolki i odpowiedzi na komentarze. Ty zatwierdzasz, my publikujemy.</p>
                                    <ul className="mx-lista">
                                        <li>Rolki z Twoją wiedzą, nagrane w biurze albo w terenie</li>
                                        <li>Posty, które odpowiadają na pytania klientów</li>
                                        <li>Stały rytm publikacji zamiast zrywów raz na kwartał</li>
                                    </ul>
                                </div>
                                <div className={`mx-opis${marketingTab === 2 ? " is-on" : ""}`} role="tabpanel">
                                    <p className="section-subtitle-left">Projektujemy i składamy katalogi produktowe, cenniki, ulotki, wizytówki i teczki ofertowe. Pliki przygotowujemy według wymagań drukarni.</p>
                                    <ul className="mx-lista">
                                        <li>Katalogi i cenniki produktów</li>
                                        <li>Ulotki, wizytówki i teczki ofertowe</li>
                                        <li>Skład, korekta i przygotowanie plików do druku</li>
                                    </ul>
                                </div>
                                <p className="mx-cena">W pakietach Premium i Biznes masz wsparcie marketingowe i promowanie profilu w serwisie. Stronę, social media i druk wyceniamy osobno, po krótkiej rozmowie.</p>
                                <a className="btn-primary" href="mailto:bok@prostasprawa.pl?subject=Marketing%20dla%20eksperta">
                                    <span>Zapytaj o wycenę</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                            <div className="mx-prawa">
                                <div className={`mx-panel${marketingTab === 0 ? " is-on" : ""}`} role="tabpanel">
                                    <div className="mx-stage mx-www">
                                        <div className="ex-browser mx-browser">
                                            <div className="mockup-header">
                                                <div className="mockup-dots">
                                                    <span className="dot-red"></span>
                                                    {" "}
                                                    <span className="dot-yellow"></span>
                                                    {" "}
                                                    <span className="dot-green"></span>
                                                </div>
                                                <div className="ex-url">🔒 www.twojanazwa.pl</div>
                                            </div>
                                            <div className="mx-site">
                                                <div className="mx-nav">
                                                    <span className="mx-logo"><b>RM</b>Rzeczoznawca majątkowy</span>
                                                    <span className="mx-menu">
                                                        <i>Usługi</i>
                                                        <i>O mnie</i>
                                                        <i>Kontakt</i>
                                                        <em>Zadzwoń</em>
                                                    </span>
                                                </div>
                                                <div className="mx-hero">
                                                    <div className="mx-hero-txt">
                                                        <span className="mx-label">KRAKÓW I MAŁOPOLSKA</span>
                                                        <div className="mx-h">Wycena domu i mieszkania, którą przyjmie sąd i bank</div>
                                                        <p>Operaty szacunkowe do podziału majątku, kredytu i spadku. Oględziny w całej Małopolsce.</p>
                                                        <div className="mx-btns">
                                                            <span className="mx-btn">Umów wycenę</span>
                                                            <span className="mx-btn2">Zobacz cennik</span>
                                                        </div>
                                                    </div>
                                                    <div className="mx-hero-img">
                                                        <img src="/dla-eksperta/www-hero.webp" alt="" />
                                                        <span className="mx-badge">✓ Uprawnienia zawodowe</span>
                                                    </div>
                                                </div>
                                                <div className="mx-uslugi">
                                                    <div><b>01</b>Operat szacunkowy</div>
                                                    <div><b>02</b>Podział majątku</div>
                                                    <div><b>03</b>Opinia dla sądu</div>
                                                    <div><b>04</b>Wycena do kredytu</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`mx-panel${marketingTab === 1 ? " is-on" : ""}`} role="tabpanel">
                                    <div className="mx-stage mx-social">
                                        <div className="mx-phone mx-phone-a">
                                            <div className="ex-phone-notch"></div>
                                            <div className="mx-ig-top">
                                                <div className="mx-ig-av">RM</div>
                                                <div className="mx-ig-stats">
                                                    <span>
                                                        <b>Posty</b>
                                                    </span>
                                                    <span>
                                                        <b>Rolki</b>
                                                    </span>
                                                    <span>
                                                        <b>Opinie</b>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mx-ig-name">
                                                <b>Rzeczoznawca majątkowy · Kraków</b>
                                                <span>Wyceny domów i mieszkań. Tłumaczę po ludzku, ile jest warta Twoja nieruchomość.</span>
                                            </div>
                                            <div className="ex-ig-btns">
                                                <span>Obserwuj</span>
                                                <span>Wiadomość</span>
                                            </div>
                                            <div className="mx-ig-high">
                                                <i>Wyceny</i>
                                                <i>Sąd</i>
                                                <i>Kredyt</i>
                                                <i>FAQ</i>
                                            </div>
                                            <div className="mx-ig-grid">
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-1.webp" alt="" />
                                                    <span className="mx-kafel-t">Ile jest wart dom po rozwodzie?</span>
                                                </div>
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-2.webp" alt="" />
                                                    <span className="mx-kafel-play">▶</span>
                                                </div>
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-3.webp" alt="" />
                                                    <span className="mx-kafel-t">Rysa na ścianie. Groźna?</span>
                                                </div>
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-4.webp" alt="" />
                                                    <span className="mx-kafel-t">Wycena do banku krok po kroku</span>
                                                </div>
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-5.webp" alt="" />
                                                    <span className="mx-kafel-t">Odbiór mieszkania</span>
                                                </div>
                                                <div className="mx-kafel">
                                                    <img src="/dla-eksperta/social-kafel-6.webp" alt="" />
                                                    <span className="mx-kafel-play">▶</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mx-phone mx-phone-b">
                                            <div className="ex-phone-notch"></div>
                                            <div className="mx-post-top">
                                                <div className="mx-ig-av mx-av-s">RM</div>
                                                <b>rzeczoznawca.twojamarka</b>
                                            </div>
                                            <div className="mx-post">
                                                <span className="mx-post-nr">1 / 5</span>
                                                <div className="mx-post-h">3 rzeczy, które obniżają wycenę domu</div>
                                                <ol>
                                                    <li>Brak odbioru rozbudowy</li>
                                                    <li>Zawilgocona piwnica</li>
                                                    <li>Stara instalacja elektryczna</li>
                                                </ol>
                                                <span className="mx-post-dalej">Przesuń →</span>
                                            </div>
                                            <div className="mx-post-ikony">♡ &nbsp;💬 &nbsp;↗</div>
                                            <p className="mx-post-opis"><b>rzeczoznawca.twojamarka</b> Zanim wystawisz dom na sprzedaż, sprawdź te trzy rzeczy.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`mx-panel${marketingTab === 2 ? " is-on" : ""}`} role="tabpanel">
                                    <div className="mx-stage mx-druk">
                                        <img className="mx-okladka" src="/dla-eksperta/druk-okladka.webp" alt="Okładka katalogu produktów Enerpor 2026" />
                                        <div className="mx-rozkladowka">
                                            <img src="/dla-eksperta/druk-rozkladowka-1.webp" alt="Katalog Enerpor, strona o producencie" />
                                            <img src="/dla-eksperta/druk-rozkladowka-2.webp" alt="Katalog Enerpor, spis treści" />
                                        </div>
                                        <img className="mx-produkt" src="/dla-eksperta/druk-produkt.webp" alt="Katalog Enerpor, strona produktu EPS S PANDA" />
                                        <img className="mx-ulotka" src="/dla-eksperta/druk-ulotka.webp" alt="Ulotka nowości EPS S 033 PANDA" />
                                    </div>
                                    <p className="mx-podpis">Katalog produktów Enerpor 2026 (32 strony) i ulotka nowości, które przygotowaliśmy dla producenta styropianu.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: Narzędzia w panelu */}
                <section className="ex-narzedzia" id="narzedzia">
                    <div className="online-consultations">
                        <div className="consultations-glow-bg"></div>
                        <div className="container consultations-layout">
                            <div className="consultations-left animate-on-scroll">
                                <span className="section-label">NARZĘDZIA W PANELU</span>
                                <h2 className="section-title-light mb-4">Mniej telefonów, <br />więcej czasu na pracę</h2>
                                <p className="section-subtitle-left">Pierwszy kontakt z klientem załatwiasz w serwisie. Bez osobnego kalendarza, komunikatora i maili z załącznikami.</p>
                                <div className="consultations-features-grid">
                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Kalendarz rezerwacji</h4>
                                            <p>Ustawiasz godziny pracy, a klient sam wybiera wolny termin rozmowy.</p>
                                        </div>
                                    </div>
                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M23 7l-7 5 7 5V7z" />
                                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Rozmowa wideo</h4>
                                            <p>Przed spotkaniem przychodzi link do Google Meet. Klient niczego nie instaluje.</p>
                                        </div>
                                    </div>
                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Czat i pliki</h4>
                                            <p>Zdjęcia szkody, akt notarialny czy dokumentacja medyczna trafiają do jednego szyfrowanego wątku.</p>
                                        </div>
                                    </div>
                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Opiekun profilu</h4>
                                            <p>Pomaga ustawić profil, kategorie i obszar działania, żeby trafiały do Ciebie właściwe sprawy.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="consultations-cta-row">
                                    <Link className="btn-primary" href={REGISTER_HREF}>
                                        <span>Załóż darmowy profil</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            <div className="consultations-right animate-on-scroll">
                                <div className="consultation-mockup-card" data-tilt="5">
                                    <div className="mockup-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>
                                            {" "}
                                            <span className="dot-yellow"></span>
                                            {" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">TWÓJ KALENDARZ · PODGLĄD</div>
                                    </div>
                                    <div className="mockup-body">
                                        <div className="consultation-mockup-settings">
                                            <div className="settings-title-row">
                                                <span className="settings-label">Godziny pracy</span>
                                                {" "}
                                                <span className="status-badge-active"><span className="badge-dot"></span>  Klient rezerwuje sam</span>
                                            </div>
                                            <div className="schedule-days-bar">
                                                <span className="day-pill active">Pon - Pt 8:00 - 16:00</span>
                                                {" "}
                                                <span className="day-pill">Sob nieczynne</span>
                                            </div>
                                            <div className="settings-prices">
                                                <div className="price-chip">
                                                    <span className="chip-duration">Zakres opinii (15 min)</span>
                                                    {" "}
                                                    <span className="chip-val">Twoja cena</span>
                                                </div>
                                                <div className="price-chip highlight">
                                                    <span className="chip-duration">Konsultacja (30 min)</span>
                                                    {" "}
                                                    <span className="chip-val">Twoja cena</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="consultation-booking-preview">
                                            <div className="booking-top-row">
                                                <div className="client-info">
                                                    <div className="client-avatar">AM</div>
                                                    <div>
                                                        <h4 className="client-name">Anna M.</h4>
                                                        <span className="booking-topic">Wycena domu</span>
                                                    </div>
                                                </div>
                                                <span className="booking-status-badge">Zaakceptowana</span>
                                            </div>
                                            <div className="booking-meta-row">
                                                <div className="meta-item">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    <span>Jutro, 10:00</span>
                                                </div>
                                                <div className="meta-item">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span>30 min</span>
                                                </div>
                                                <div className="meta-item text-green">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                    <span>Przypomnienie wysłane</span>
                                                </div>
                                            </div>
                                            <div className="consultation-timer-box">
                                                <div className="timer-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0da192" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span>Rozmowa za:</span>
                                                    {" "}
                                                    <strong className="timer-val" id="consultTimer">17h : 42m : 05s</strong>
                                                </div>
                                                <div className="meet-link-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                                        <path d="M23 7l-7 5 7 5V7z" />
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                                    </svg>
                                                    <span className="meet-text">Google Meet:</span>
                                                    {" "}
                                                    <span className="meet-url">meet.google.com/wyc-ena-dom</span>
                                                </div>
                                            </div>
                                            <div className="booking-actions-row">
                                                <button className="mockup-btn-chat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>Czat z klientem</button>
                                                <button className="mockup-btn-join">Otwórz rozmowę</button>
                                            </div>
                                        </div>
                                        <div className="mockup-summary-pills">
                                            <span className="summary-pill">📅 Terminy bez telefonów</span>
                                            {" "}
                                            <span className="summary-pill">✉️ Przypomnienie dla obu stron</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 8: FAQ (te same dane trafiają do JSON-LD w page.tsx) */}
                <section className="ex-faq" id="faq">
                    <div className="container">
                        <div className="benefits-header">
                            <span className="section-label">PYTANIA EKSPERTÓW</span>
                            <h2 className="section-title-light">Zanim założysz profil</h2>
                        </div>
                        <div className="ex-faq-list">
                            {EXPERT_FAQ.map((item, i) => (
                                <details key={item.question} className="ex-faq-item" open={i === 0}>
                                    <summary>{item.question}</summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 9: Kontakt */}
                <section className="contact-section" id="contact">
                    <div className="container">
                        <h2 className="contact-title animate-on-scroll"><span className="contact-line"></span> Załóż profil eksperta <span className="contact-line"></span></h2>
                        <p className="section-subtitle animate-on-scroll" style={{ textAlign: "center" }}>Ustaw kategorie i województwo, a zobaczysz, z czym klienci przychodzą w Twojej okolicy. Na start nic nie płacisz.</p>
                        <div className="contact-card animate-on-scroll">
                            <div className="contact-row">
                                <div className="contact-icon phone-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <span className="contact-info">tel. +48 534 888 555</span>
                            </div>
                            <div className="contact-row">
                                <div className="contact-icon mail-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <a href="mailto:bok@prostasprawa.pl" className="contact-btn">NAPISZ DO NAS</a>
                            </div>
                            <div className="contact-row">
                                <div className="contact-icon gear-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M9 12l2 2 4-4" stroke="#5a9a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <Link className="contact-btn" href={REGISTER_HREF}>ZAŁÓŻ DARMOWY PROFIL</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
