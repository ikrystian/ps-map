"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Inter } from "next/font/google"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import "./dla-prawnika.css"

// Landing korzysta z Intera — reszta aplikacji z Poppinsa, wiec ladujemy go lokalnie
const inter = Inter({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
})

const REGISTER_HREF = "/rejestracja/ekspert"

const SEARCH_PHRASES = [
    "Prawo rodzinne",
    "Prawo gospodarcze",
    "Odszkodowania",
    "Prawo pracy",
    "Nieruchomości",
    "Prawo spadkowe",
]

export default function ForLawyersClientPage() {
    const rootRef = useRef<HTMLDivElement>(null)

    // Cala warstwa interakcji przeniesiona 1:1 z ps-landing/script.js
    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const cleanups: Array<() => void> = []
        const timeouts: Array<ReturnType<typeof setTimeout>> = []
        const intervals: Array<ReturnType<typeof setInterval>> = []
        const later = (fn: () => void, ms: number) => {
            timeouts.push(setTimeout(fn, ms))
        }
        const on = <K extends keyof HTMLElementEventMap>(
            el: HTMLElement | Window,
            type: K,
            handler: (ev: HTMLElementEventMap[K]) => void,
            opts?: AddEventListenerOptions
        ) => {
            el.addEventListener(type, handler as EventListener, opts)
            cleanups.push(() => el.removeEventListener(type, handler as EventListener, opts))
        }
        const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)
        const $$ = <T extends HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel))

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const finePointer = window.matchMedia("(pointer: fine)").matches

        // ===== Scroll Animations =====
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    const delay = Number((entry.target as HTMLElement).dataset.delay || 0)
                    later(() => entry.target.classList.add("visible"), delay)
                })
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        )
        $$(".animate-on-scroll").forEach((el) => revealObserver.observe(el))
        cleanups.push(() => revealObserver.disconnect())

        // ===== Hero parallax & scroll indicator =====
        const heroBg = $("#heroBg")
        const scrollIndicator = $("#scrollIndicator")
        let scrollTicking = false
        const handleScrollFx = () => {
            const y = window.scrollY
            if (heroBg && y < window.innerHeight * 1.2) {
                const ty = Math.min(y * 0.18, 160)
                heroBg.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`
            }
            scrollIndicator?.classList.toggle("is-hidden", y > 120)
            scrollTicking = false
        }
        on(window, "scroll" as keyof HTMLElementEventMap, () => {
            if (!scrollTicking) {
                requestAnimationFrame(handleScrollFx)
                scrollTicking = true
            }
        }, { passive: true })
        handleScrollFx()

        // ===== Hero: parallax orbsow za kursorem =====
        const heroSection = $(".hero")
        const heroDecor = $("#heroDecor")
        if (heroSection && heroDecor && finePointer) {
            on(heroSection, "mousemove", (e) => {
                const r = heroSection.getBoundingClientRect()
                const x = (e.clientX - r.left) / r.width - 0.5
                const y = (e.clientY - r.top) / r.height - 0.5
                heroDecor.style.transform = `translate3d(${(x * 26).toFixed(1)}px, ${(y * 26).toFixed(1)}px, 0)`
            })
            on(heroSection, "mouseleave", () => {
                heroDecor.style.transform = ""
            })
        }

        // ===== Tilt 3D na kartach mockupow =====
        if (finePointer) {
            $$("[data-tilt]").forEach((el) => {
                const strength = parseFloat(el.dataset.tilt || "") || 5
                on(el, "mouseenter", () => {
                    el.style.transition = "transform 0.12s ease-out"
                })
                on(el, "mousemove", (e) => {
                    const r = el.getBoundingClientRect()
                    const x = (e.clientX - r.left) / r.width - 0.5
                    const y = (e.clientY - r.top) / r.height - 0.5
                    el.style.transform = `perspective(950px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`
                })
                on(el, "mouseleave", () => {
                    el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                    el.style.transform = ""
                })
            })
        }

        // ===== Spotlight: poswiata za kursorem na kartach =====
        $$(
            ".benefit-card, .advisor-feature-item, .consultation-feature-item, .trust-feature-item, .why-item, .laptop-screen-frame"
        ).forEach((card) => {
            on(card, "mousemove", (e) => {
                const r = card.getBoundingClientRect()
                card.style.setProperty("--mx", `${e.clientX - r.left}px`)
                card.style.setProperty("--my", `${e.clientY - r.top}px`)
            })
        })

        // ===== Animowane liczniki, paski i wykresy =====
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

        const animateCount = (el: HTMLElement) => {
            const target = parseFloat(el.dataset.count || "0")
            const decimals = parseInt(el.dataset.decimals || "0", 10)
            const prefix = el.dataset.prefix || ""
            const suffix = el.dataset.suffix || ""
            const duration = 1700
            const start = performance.now()
            const frame = (now: number) => {
                const p = Math.min((now - start) / duration, 1)
                const v = target * easeOutCubic(p)
                const text = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("pl-PL")
                el.textContent = prefix + text + suffix
                if (p < 1) {
                    requestAnimationFrame(frame)
                } else {
                    el.textContent =
                        prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString("pl-PL")) + suffix
                }
            }
            requestAnimationFrame(frame)
        }

        const countEls = $$("[data-count]")
        const barEls = $$("[data-bar]")
        const circleEl = root.querySelector<SVGPathElement>("[data-circle]")
        const rankChartEl = $(".rank-chart")

        barEls.forEach((bar) => {
            bar.dataset.targetWidth = bar.style.width || "0%"
            bar.style.width = "0%"
        })
        let circleTarget = 0
        if (circleEl) {
            const dash = circleEl.getAttribute("stroke-dasharray") || "0, 100"
            circleTarget = parseFloat(dash.split(",")[0]) || 0
            circleEl.setAttribute("stroke-dasharray", "0, 100")
        }

        const statsObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    const el = entry.target as HTMLElement
                    statsObserver.unobserve(el)

                    if (el.hasAttribute("data-count")) animateCount(el)

                    if (el.hasAttribute("data-bar")) {
                        requestAnimationFrame(() => {
                            el.style.width = el.dataset.targetWidth || "0%"
                        })
                    }

                    if (el.hasAttribute("data-circle")) {
                        const duration = 1700
                        const start = performance.now()
                        const frame = (now: number) => {
                            const p = Math.min((now - start) / duration, 1)
                            el.setAttribute("stroke-dasharray", `${(circleTarget * easeOutCubic(p)).toFixed(1)}, 100`)
                            if (p < 1) requestAnimationFrame(frame)
                        }
                        requestAnimationFrame(frame)
                    }

                    if (el.classList.contains("rank-chart")) el.classList.add("visible")
                })
            },
            { threshold: 0.4 }
        )
        countEls.forEach((el) => statsObserver.observe(el))
        barEls.forEach((el) => statsObserver.observe(el))
        if (circleEl) statsObserver.observe(circleEl)
        if (rankChartEl) statsObserver.observe(rankChartEl)
        cleanups.push(() => statsObserver.disconnect())

        // ===== Rysujace sie ikony =====
        if (!reducedMotion) {
            root.querySelectorAll(".benefit-icon svg :is(path, line, polyline, circle, rect)").forEach((el) =>
                el.setAttribute("pathLength", "1")
            )
            root.classList.add("fx-draw")
        }

        // ===== Hero: piszacy sie search w mockupie =====
        const typeEl = $("#searchTypeText")
        if (typeEl && !reducedMotion) {
            let phraseIdx = 0
            let charIdx = 0
            let deleting = false
            const tick = () => {
                const phrase = SEARCH_PHRASES[phraseIdx]
                if (!deleting) {
                    charIdx++
                    typeEl.textContent = phrase.slice(0, charIdx)
                    if (charIdx === phrase.length) {
                        deleting = true
                        later(tick, 1800)
                        return
                    }
                    later(tick, 60 + Math.random() * 60)
                } else {
                    charIdx--
                    typeEl.textContent = phrase.slice(0, charIdx)
                    if (charIdx === 0) {
                        deleting = false
                        phraseIdx = (phraseIdx + 1) % SEARCH_PHRASES.length
                        later(tick, 450)
                        return
                    }
                    later(tick, 28)
                }
            }
            later(() => {
                typeEl.textContent = ""
                tick()
            }, 2200)
        }

        // ===== Hero Live Feed Mockup Cycle =====
        const caseItems = $$(".hero-right .case-item")
        if (caseItems.length > 0) {
            let activeIdx = 0
            let cycleInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
                caseItems[activeIdx].classList.remove("active")
                activeIdx = (activeIdx + 1) % caseItems.length
                caseItems[activeIdx].classList.add("active")
            }, 3500)
            intervals.push(cycleInterval)

            caseItems.forEach((item, index) => {
                on(item, "mouseenter", () => {
                    if (cycleInterval) {
                        clearInterval(cycleInterval)
                        cycleInterval = null
                    }
                    caseItems.forEach((i) => i.classList.remove("active"))
                    item.classList.add("active")
                    activeIdx = index
                })
            })
        }

        // ===== Interactive Advisor Section Hover Effects =====
        const featureItems = $$(".advisor-feature-item")
        const advisorWidget = $(".advisor-widget")
        const chatBubble = $(".chat-bubble")
        const statCards = $$(".stat-mini-card")
        const checklist = $(".mockup-checklist")
        const clearHighlights = () => {
            advisorWidget?.classList.remove("highlighted")
            chatBubble?.classList.remove("highlighted")
            statCards.forEach((c) => c.classList.remove("highlighted"))
            checklist?.classList.remove("highlighted")
        }
        featureItems.forEach((item, index) => {
            on(item, "mouseenter", () => {
                clearHighlights()
                if (index === 0) statCards[0]?.classList.add("highlighted")
                else if (index === 1) statCards[1]?.classList.add("highlighted")
                else if (index === 2) advisorWidget?.classList.add("highlighted")
                else if (index === 3) {
                    checklist?.classList.add("highlighted")
                    chatBubble?.classList.add("highlighted")
                }
            })
            on(item, "mouseleave", clearHighlights)
        })

        // ===== Konsultacje: licznik odlicza na zywo =====
        const pad = (n: number) => String(n).padStart(2, "0")
        const consultTimer = $("#consultTimer")
        if (consultTimer) {
            let total = 24 * 60 + 10
            intervals.push(
                setInterval(() => {
                    total = total > 0 ? total - 1 : 24 * 60 + 10
                    const h = Math.floor(total / 3600)
                    const m = Math.floor((total % 3600) / 60)
                    const s = total % 60
                    consultTimer.textContent = `${pad(h)}h : ${pad(m)}m : ${pad(s)}s`
                }, 1000)
            )
        }

        // ===== Licznik czasu videorozmowy w laptopie =====
        const videoTimer = $("#videoCallTimer")
        if (videoTimer) {
            let callSeconds = 18 * 60 + 42
            intervals.push(
                setInterval(() => {
                    callSeconds++
                    const h = Math.floor(callSeconds / 3600)
                    const m = Math.floor((callSeconds % 3600) / 60)
                    const s = callSeconds % 60
                    videoTimer.textContent = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
                }, 1000)
            )
        }

        // ===== Magnetyczne przyciski CTA =====
        if (finePointer && !reducedMotion) {
            $$(".btn-primary").forEach((btn) => {
                on(btn, "mousemove", (e) => {
                    const r = btn.getBoundingClientRect()
                    const x = e.clientX - r.left - r.width / 2
                    const y = e.clientY - r.top - r.height / 2
                    btn.style.transform = `translate(${(x * 0.14).toFixed(1)}px, ${(y * 0.22 - 2).toFixed(1)}px)`
                })
                on(btn, "mouseleave", () => {
                    btn.style.transform = ""
                })
            })
        }

        return () => {
            cleanups.forEach((fn) => fn())
            timeouts.forEach(clearTimeout)
            intervals.forEach(clearInterval)
        }
    }, [])

    return (
        <>
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

            <div ref={rootRef} className={`ps-lp ${inter.variable}`}>
                {/* Section 1: Hero */}
                <section className="hero" id="hero">
                    <div className="hero-bg" id="heroBg">
                        <img src="/backgrounds/1.png" alt="" className="hero-bg-img" />
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="hero-decor" id="heroDecor" aria-hidden="true">
                        <div className="hero-glow hero-glow-teal"></div>
                        <div className="hero-glow hero-glow-gold"></div>
                    </div>
                    <div className="container hero-container-layout">
                        <div className="hero-left">
                            <div className="hero-badge">
                                <span className="badge-dot"></span>{" "}
                                DLA PRAWNIKA I SPECJALISTY
                            </div>
                            <h1 className="hero-title">
                                <span className="title-line"><span className="title-line-inner">Sprawy, które mają sens.</span></span>{" "}
                                <span className="title-line"><span className="title-line-inner text-shine">Bez prowizji, bez
                                    katalogu.</span></span>
                            </h1>
                            <p className="hero-subtitle">
                                Wiesz, jak to zwykle wygląda. Wisisz w katalogu obok setki innych prawników i czekasz, aż ktoś
                                Cię znajdzie, albo płacisz za leady i oddzwaniasz do kogoś, kto „tylko sprawdzał ceny&rdquo;.
                                ProstaSprawa.pl działa inaczej – zamiast przypadkowych zapytań dostajesz{" "}
                                <strong>konkretne sprawy</strong>{" "} od osób, które realnie szukają pomocy i są gotowe za nią
                                zapłacić.
                            </p>
                            <div className="hero-actions">
                                <Link href={REGISTER_HREF} className="btn-primary">
                                    <span>Załóż profil</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            {/* Trust / Social Proof Widget */}
                            <div className="hero-trust">
                                <div className="trust-text">
                                    Konto za darmo. Zero prowizji, <strong>teraz i w przyszłości</strong>.
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: Live Cases Mockup */}
                        <div className="hero-right">
                            <div className="live-cases-mockup">
                                <div className="mockup-header">
                                    <div className="mockup-dots">
                                        <span className="dot-red"></span>{" "}
                                        <span className="dot-yellow"></span>{" "}
                                        <span className="dot-green"></span>
                                    </div>
                                    <div className="mockup-title">BAZA SPRAW</div>

                                </div>
                                <div className="mockup-body">
                                    {/* Search & Filter bar */}
                                    <div className="mockup-search-bar">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                        <span className="search-typing"><span id="searchTypeText">Wyszukaj
                                            specjalizację...</span><span className="search-caret" aria-hidden="true"></span></span>
                                    </div>

                                    <div className="case-list">
                                        {/* Case Item 1 */}
                                        <div className="case-item active">
                                            <div className="case-item-header">
                                                <span className="case-cat">Prawo Rodzinne</span>{" "}
                                                <span className="case-badge badge-gold">Wysoki budżet</span>
                                            </div>
                                            <h4 className="case-item-title">Podział majątku i sprawa rozwodowa</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                        <circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    Warszawa (Mazowieckie)
                                                </span>{" "}
                                                <span className="meta-tag text-green">
                                                    Szac. budżet: ~12 000 PLN
                                                </span>
                                            </div>
                                        </div>

                                        {/* Case Item 2 */}
                                        <div className="case-item">
                                            <div className="case-item-header">
                                                <span className="case-cat">Prawo Cywilne</span>{" "}
                                                <span className="case-badge badge-green">Nowa sprawa</span>
                                            </div>
                                            <h4 className="case-item-title">Odszkodowanie za opóźniony lot i spór z OC</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                        <circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    Gdańsk (Pomorskie)
                                                </span>{" "}
                                                <span className="meta-tag text-green">
                                                    Szac. budżet: ~4 500 PLN
                                                </span>
                                            </div>
                                        </div>

                                        {/* Case Item 3 */}
                                        <div className="case-item">
                                            <div className="case-item-header">
                                                <span className="case-cat">Prawo Handlowe</span>{" "}
                                                <span className="case-badge badge-gray">Stała obsługa</span>
                                            </div>
                                            <h4 className="case-item-title">Przygotowanie regulaminu SaaS i polityki prywatności</h4>
                                            <div className="case-meta">
                                                <span className="meta-tag">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                        <circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    Zdalnie (Online)
                                                </span>{" "}
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
                    <a href="#benefits" className="scroll-indicator" id="scrollIndicator" aria-label="Przewiń w dół">
                        <span className="scroll-indicator-label">Przewiń</span>{" "}
                        <span className="scroll-indicator-track"><span className="scroll-indicator-dot"></span></span>
                    </a>
                </section>

                {/* Section 2: Benefits */}
                <section className="benefits" id="benefits">
                    <div className="section-dark-bg">
                        <div className="container">
                            <div className="benefits-header animate-on-scroll">
                                <span className="section-label">ZERO HACZYKÓW</span>
                                <h2 className="section-title-light">
                                    Dlaczego warto założyć profil<br />na ProstaSprawa.pl?
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
                                    <h3 className="benefit-title">Zero prowizji</h3>
                                    <p className="benefit-text">Konto zakładasz za darmo, bez opłaty rejestracyjnej. Od spraw nie
                                        pobieramy prowizji – ani teraz, ani później.</p>
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
                                    <h3 className="benefit-title">Konkretne sprawy</h3>
                                    <p className="benefit-text">Zapytania trafiają do Ciebie dopasowane do specjalizacji i
                                        lokalizacji. Żadnych „dzień dobry, ile kosztuje&rdquo;.</p>
                                    <span className="benefit-number">02</span>
                                </div>
                                {/* Card 3 */}
                                <div className="benefit-card animate-on-scroll" data-delay="200">
                                    <div className="benefit-icon-wrapper">
                                        <div className="benefit-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="2" y1="12" x2="22" y2="12" />
                                                <path
                                                    d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="benefit-title">Panel bez chaosu</h3>
                                    <p className="benefit-text">Wszystkie sprawy, historia kontaktu i statystyki w jednym miejscu.
                                        Czat, rozliczenia i faktury bez wychodzenia z platformy.</p>
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
                                    <h3 className="benefit-title">Profil, który pracuje na markę</h3>
                                    <p className="benefit-text">Specjalizacje, doświadczenie, certyfikaty. Skill Law Focus
                                        podpowiada klientowi, w czym naprawdę się specjalizujesz.</p>
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
                        <div className="container gain-clients-layout">
                            {/* Left Pane: Interactive statistics mockup card */}
                            <div className="gain-left animate-on-scroll">
                                <div className="analytics-mockup" data-tilt="5">
                                    <div className="analytics-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>{" "}
                                            <span className="dot-yellow"></span>{" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">&nbsp;</div>
                                    </div>
                                    <div className="analytics-body">
                                        <div className="analytics-main-row">
                                            <div className="analytics-main-value">
                                                <span className="label">MIESIĘCZNY PRZYCHÓD</span>{" "}
                                                <span className="val" data-count="24800" data-prefix="+" data-suffix=" PLN">+24 800
                                                    PLN</span>{" "}
                                                <span className="growth"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="3">
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    <polyline points="17 6 23 6 23 12" />
                                                </svg> <span data-count="34.2" data-decimals="1" data-prefix="+"
                                                    data-suffix="% m/m">+34.2% m/m</span></span>
                                            </div>
                                            <div className="analytics-circle-container">
                                                <svg className="analytics-circle" viewBox="0 0 36 36">
                                                    <path className="circle-bg"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                    <path className="circle" strokeDasharray="88, 100" data-circle
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                </svg>
                                                <div className="circle-percentage" data-count="88" data-suffix="%">88%</div>
                                            </div>
                                        </div>
                                        <div className="analytics-stats-grid">
                                            <div className="mini-stat">
                                                <span className="m-label">Otrzymane zapytania</span>{" "}
                                                <span className="m-val" data-count="48">48</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="m-label">Wygrane zlecenia</span>{" "}
                                                <span className="m-val" data-count="12">12</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="m-label">Średni współczynnik konwersji</span>{" "}
                                                <span className="m-val" data-count="25" data-decimals="1" data-suffix="%">25.0%</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="m-label">Zadowoleni klienci</span>{" "}
                                                <span className="m-val" data-count="100" data-suffix="%">100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: List & CTA */}
                            <div className="gain-right animate-on-scroll" data-delay="150">
                                <span className="section-label">JAK TO DZIAŁA</span>
                                <h2 className="section-title">
                                    Jak sprawa<br />
                                    trafia do Ciebie?
                                </h2>
                                <ul className="check-list">
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Klient opisuje problem</strong>{" "} – wybiera kategorię i lokalizację, dokładnie
                                            określając, czego potrzebuje.
                                        </div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Kierujemy sprawę do dopasowanych specjalistów</strong>{" "} – trafia do prawników,
                                            których profil i doświadczenie do niej pasują.
                                        </div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Dostajesz konkretne zapytanie</strong>{" "} – takie, które ma ręce i nogi, a nie
                                            kolejne „dzień dobry, ile kosztuje&rdquo;.
                                        </div>
                                    </li>
                                    <li className="check-item">
                                        <div className="check-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Ty decydujesz</strong>{" "} – wybierasz, które sprawy bierzesz i na jakich
                                            warunkach dogadujesz się z klientem. Nikt Ci niczego nie narzuca.
                                        </div>
                                    </li>
                                </ul>
                                <Link href={REGISTER_HREF} className="btn-primary align-self-start">
                                    <span>Testuj za darmo!</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sub-section: Spotkania Online */}
                    <div className="online-consultations" id="consultations">
                        <div className="consultations-glow-bg"></div>
                        <div className="container consultations-layout">
                            <div className="consultations-left animate-on-scroll">
                                <span className="section-label">SPOTKANIA ONLINE</span>
                                <h2 className="section-title-light mb-2">
                                    Rozmowę umawiasz raz,<br />bez dzwonienia w tę i z powrotem
                                </h2>
                                <p className="section-subtitle-left">
                                    Zwykle ustalenie jednej rozmowy to dwa telefony i seria maili. Tu klient wchodzi w Twój
                                    kalendarz, klika wolną godzinę i ma termin zarezerwowany. Ty w tej sprawie nie ruszasz palcem.
                                </p>

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
                                            <h4>Wolne terminy w kalendarzu</h4>
                                            <p>Zaznaczasz godziny, w których pracujesz, i na tym Twoja rola się kończy. Klient widzi
                                                tylko to, co wolne, i sam wybiera.</p>
                                        </div>
                                    </div>

                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                                <line x1="2" y1="10" x2="22" y2="10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Płatność przy rezerwacji</h4>
                                            <p>Klient płaci w chwili, gdy rezerwuje. Kto zapłacił, ten przychodzi, więc puste
                                                okienka po kimś, kto „się rozmyślił”, praktycznie znikają.</p>
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
                                            <h4>Link do Google Meet sam wskakuje</h4>
                                            <p>Generuje się 30 minut przed rozmową. Nie szukasz go po mailach, nie wysyłasz na
                                                ostatnią chwilę. Wchodzisz i rozmawiasz.</p>
                                        </div>
                                    </div>

                                    <div className="consultation-feature-item">
                                        <div className="consultation-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Przypomnienie dostają obie strony</h4>
                                            <p>Na maila i w dashboardzie, Ty i klient. Mniej sytuacji, w których ktoś zwyczajnie
                                                zapomniał, że miał dziś termin.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="consultations-cta-row">
                                    <Link href={REGISTER_HREF} className="btn-primary">
                                        <span>Załóż profil</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Visual Mockup Pane */}
                            <div className="consultations-right animate-on-scroll" data-delay="150">
                                <div className="consultation-mockup-card" data-tilt="5">
                                    <div className="mockup-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>{" "}
                                            <span className="dot-yellow"></span>{" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">KALENDARZ & REZERWACJA ONLINE</div>
                                    </div>
                                    <div className="mockup-body">
                                        {/* Settings Banner */}
                                        <div className="consultation-mockup-settings">
                                            <div className="settings-title-row">
                                                <span className="settings-label">Dostępne godziny</span>{" "}
                                                <span className="status-badge-active"><span className="badge-dot"></span>{" "} Rezerwacja
                                                    natychmiastowa</span>
                                            </div>
                                            <div className="schedule-days-bar">
                                                <span className="day-pill active">Pon - Pt 09:00 - 17:00</span>{" "}
                                                <span className="day-pill">Sob 10:00 - 14:00</span>
                                            </div>
                                            <div className="settings-prices">
                                                <div className="price-chip">
                                                    <span className="chip-duration">Szybka porada (15 min)</span>{" "}
                                                    <span className="chip-val">100 PLN</span>
                                                </div>
                                                <div className="price-chip highlight">
                                                    <span className="chip-duration">Konsultacja (30 min)</span>{" "}
                                                    <span className="chip-val">150 PLN</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upcoming Consultation Preview */}
                                        <div className="consultation-booking-preview">
                                            <div className="booking-top-row">
                                                <div className="client-info">
                                                    <div className="client-avatar">JK</div>
                                                    <div>
                                                        <h4 className="client-name">Jan Kowalski</h4>
                                                        <span className="booking-topic">Rozwód & podział majątku</span>
                                                    </div>
                                                </div>
                                                <span className="booking-status-badge">Zaakceptowana</span>
                                            </div>

                                            <div className="booking-meta-row">
                                                <div className="meta-item">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    <span>Dzisiaj, 15:30</span>
                                                </div>
                                                <div className="meta-item">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span>30 min</span>
                                                </div>
                                                <div className="meta-item text-green">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                    <span>Opłacone</span>
                                                </div>
                                            </div>

                                            {/* Timer & Video Link Box */}
                                            <div className="consultation-timer-box">
                                                <div className="timer-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0da192"
                                                        strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span>Do rozpoczęcia spotkania:</span>{" "}
                                                    <strong className="timer-val" id="consultTimer">00h : 24m : 10s</strong>
                                                </div>
                                                <div className="meet-link-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6"
                                                        strokeWidth="2">
                                                        <path d="M23 7l-7 5 7 5V7z" />
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                                    </svg>
                                                    <span className="meet-text">Google Meet:</span>{" "}
                                                    <span className="meet-url">meet.google.com/ps-consult-982</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="booking-actions-row">
                                                <button className="mockup-btn-chat">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    Napisz wiadomość
                                                </button>
                                                <button className="mockup-btn-join">
                                                    Dołącz do spotkania
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mockup Summary Badges */}
                                        <div className="mockup-summary-pills">
                                            <span className="summary-pill">⚡ Automat w kalendarzu</span>{" "}
                                            <span className="summary-pill">💳 Płatność przy rezerwacji</span>{" "}
                                            <span className="summary-pill">🔔 Przypomnienie SMS/Mail</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-section: Laptop Video Call Showcase */}
                        <div className="container consultation-laptop-showcase animate-on-scroll" id="video-call" data-delay="100">
                            <div className="laptop-showcase-header">
                                <span className="laptop-badge">
                                    <span className="live-pulse-dot"></span>{" "} WIDEO-KONSULTACJE NA ŻYWO
                                </span>
                                <h3 className="laptop-showcase-title">
                                    Videorozmowa z klientem bez instalowania żadnych aplikacji
                                </h3>
                                <p className="laptop-showcase-desc">
                                    Klient klika link i od razu łączy się z Tobą w przeglądarce. Bezpieczne, szyfrowane połączenie
                                    HD z podglądem dokumentów.
                                </p>
                            </div>

                            {/* Laptop Frame */}
                            <div className="laptop-container" data-tilt="3">
                                {/* Top Screen Lid */}
                                <div className="laptop-screen-frame">
                                    {/* Camera Notch */}
                                    <div className="laptop-webcam">
                                        <span className="webcam-lens"></span>{" "}
                                        <span className="webcam-led-green"></span>
                                    </div>

                                    {/* Screen Content: Active Video Consultation */}
                                    <div className="laptop-screen-content">
                                        {/* Top App Header */}
                                        <div className="video-app-header">
                                            <div className="app-brand">
                                                <span className="live-tag"><span className="pulse-ring"></span>{" "} LIVE</span>{" "}
                                                <span className="app-title">ProstaSprawa Meet HD</span>{" "}
                                                <span className="divider">•</span>{" "}
                                                <span className="room-name">Porada Prawna: Jan Kowalski</span>
                                            </div>
                                            <div className="app-status">
                                                <span className="encrypt-badge">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                    </svg>
                                                    Szyfrowanie E2E
                                                </span>{" "}
                                                <span className="timer-badge" id="videoCallTimer">00:18:42</span>
                                            </div>
                                        </div>

                                        {/* Main Video Call Area */}
                                        <div className="video-call-viewport">
                                            {/* Grid of Video Streams */}
                                            <div className="video-streams-grid">
                                                {/* Stream 1: Lawyer (Main Focus) */}
                                                <div className="stream-tile lawyer-stream">
                                                    <img src="/images/lawyer_video.png" alt="r. pr. Jan Kowalski - Videorozmowa"
                                                        className="stream-video-img" />
                                                    <div className="stream-tag top-left">
                                                        <span className="role-chip lawyer-chip">Prawnik</span>
                                                    </div>
                                                    <div className="stream-tag bottom-left">
                                                        <div className="user-info-box">
                                                            <span className="user-name">r. pr. Jak Kowalski</span>
                                                            <div className="audio-wave-indicator">
                                                                <span className="wave-bar"></span>{" "}
                                                                <span className="wave-bar"></span>{" "}
                                                                <span className="wave-bar"></span>{" "}
                                                                <span className="wave-bar"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="stream-tag top-right">
                                                        <span className="hd-badge">1080p 60fps</span>
                                                    </div>
                                                </div>

                                                {/* Stream 2: Client */}
                                                <div className="stream-tile client-stream">
                                                    <img src="/images/client_video.png" alt="Jan Kowalski - Klient"
                                                        className="stream-video-img" />
                                                    <div className="stream-tag top-left">
                                                        <span className="role-chip client-chip">Klient</span>
                                                    </div>
                                                    <div className="stream-tag bottom-left">
                                                        <div className="user-info-box">
                                                            <span className="user-name">Anna Wiśniewska</span>{" "}
                                                            <span className="mic-active-dot">🎤</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Floating Document Side Panel Overlay */}
                                            <div className="video-doc-panel">
                                                <div className="doc-panel-header">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a864"
                                                        strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                    </svg>
                                                    <span>Udostępniony dokument</span>
                                                </div>
                                                <div className="doc-panel-body">
                                                    <div className="doc-file-info">
                                                        <span className="doc-icon-pdf">PDF</span>
                                                        <div>
                                                            <div className="doc-title">Projekt_Umowy_Majątkowej.pdf</div>
                                                            <div className="doc-status">Strona 3 z 8 • Podgląd na żywo</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Call Controls Bar */}
                                        <div className="video-toolbar">
                                            <div className="toolbar-center">
                                                <button className="tool-btn active-tool" title="Wycisz mikrofon">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                                    </svg>
                                                </button>
                                                <button className="tool-btn active-tool" title="Wyłącz kamerę">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M23 7l-7 5 7 5V7z"></path>
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                    </svg>
                                                </button>
                                                <button className="tool-btn highlight-tool" title="Udostępnij ekran">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                                    </svg>
                                                    <span className="tool-text">Ekran</span>
                                                </button>
                                                <button className="tool-btn" title="Czat na żywo">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z">
                                                        </path>
                                                    </svg>
                                                    <span className="chat-count">2</span>
                                                </button>
                                                <button className="tool-btn end-call-tool" title="Zakończ rozmowę">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2">
                                                        <path
                                                            d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4s0 0 0 0z">
                                                        </path>
                                                        <line x1="23" y1="1" x2="1" y2="23"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Laptop Lower Keyboard Chassis */}
                                <div className="laptop-keyboard-chassis">
                                    <div className="chassis-opening-notch"></div>
                                    <div className="chassis-glow-reflection"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3 & 4: Advisor */}
                <section className="advisor" id="advisor">
                    <div className="container">
                        <div className="advisor-section-header">
                            <span className="section-label animate-on-scroll">PANEL, W KTÓRYM NIC NIE GINIE</span>
                            <h2 className="section-title animate-on-scroll">
                                Twój opiekun profilu <br />pomoże Ci być widocznym
                            </h2>
                            <p className="section-subtitle animate-on-scroll">
                                Po zalogowaniu masz cały dashboard i całą pracę w jednym miejscu. Nie zostajesz z tym sam –
                                masz swojego opiekuna profilu, który podpowiada, co poprawić.
                            </p>
                        </div>

                        <div className="advisor-layout">
                            {/* Left Pane: Interactive Mockup/Dashboard */}
                            <div className="advisor-visual-card animate-on-scroll" data-delay="0" data-tilt="4">
                                <div className="mockup-header">
                                    <div className="mockup-dots">
                                        <span className="dot-red"></span>{" "}
                                        <span className="dot-yellow"></span>{" "}
                                        <span className="dot-green"></span>
                                    </div>
                                    <div className="mockup-title">prostasprawa.pl — Panel Doradcy</div>
                                </div>
                                <div className="mockup-body">
                                    {/* Advisor Profile Widget */}
                                    <div className="advisor-widget">
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
                                        <div className="chat-bubble">
                                            <div className="chat-typing" aria-hidden="true">
                                                <span></span><span></span><span></span>
                                            </div>
                                            <p>Cześć! Przeanalizowałam Twój profil i mam dla Ciebie wskazówkę. Uzupełnienie zakładki
                                                &quot;Skill Law Focus&quot; zwiększy widoczność Twoich ofert o blisko{" "}
                                                <strong>40%</strong>.
                                            </p>
                                            <span className="chat-time">10:42</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="mockup-stats-grid">
                                        <div className="stat-mini-card">
                                            <span className="stat-label">Moc profilu</span>
                                            <div className="progress-ring-container">
                                                <div className="progress-bar-wrapper">
                                                    <div className="progress-bar-fill" data-bar style={{ width: "85%" }}></div>
                                                </div>
                                                <span className="stat-value" data-count="85" data-suffix="%">85%</span>
                                            </div>
                                            <span className="stat-tip">Uzupełnij certyfikaty (+15%)</span>
                                        </div>
                                        <div className="stat-mini-card">
                                            <span className="stat-label">Widoczność ofert</span>{" "}
                                            <span className="stat-big-value text-gold" data-count="148" data-prefix="+"
                                                data-suffix="%">+148%</span>{" "}
                                            <span className="stat-subtext">Wzrost w tym tygodniu</span>
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    <div className="mockup-checklist">
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
                                <div className="advisor-feature-item animate-on-scroll" data-delay="100">
                                    <div className="feature-header">
                                        <div className="feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="feature-title-group">
                                            <h3 className="feature-title">Profil, który pracuje na markę</h3>
                                            <span className="feature-badge badge-green">Skill Law Focus</span>
                                        </div>
                                    </div>
                                    <p className="feature-text">
                                        Pokazujesz specjalizacje, doświadczenie, przynależność do OIRP albo ORA, publikacje,
                                        certyfikaty i materiały wideo. System Skill Law Focus podpowiada klientowi, w czym
                                        naprawdę się specjalizujesz.
                                    </p>
                                </div>

                                <div className="advisor-feature-item animate-on-scroll" data-delay="200">
                                    <div className="feature-header">
                                        <div className="feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="feature-title-group">
                                            <h3 className="feature-title">Wszystkie sprawy w jednym miejscu</h3>
                                            <span className="feature-badge badge-gold">Dashboard</span>
                                        </div>
                                    </div>
                                    <p className="feature-text">
                                        Wszystkie sprawy z ich statusem, historia kontaktu i statystyki aktywności. Z klientem
                                        rozmawiasz przez wbudowany czat, a rozliczenia i faktury ogarniasz bez wychodzenia z
                                        platformy.
                                    </p>
                                </div>

                                <div className="advisor-feature-item animate-on-scroll" data-delay="300">
                                    <div className="feature-header">
                                        <div className="feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <div className="feature-title-group">
                                            <h3 className="feature-title">Artykuły eksperckie</h3>
                                            <span className="feature-badge badge-gray">Widoczność w AI</span>
                                        </div>
                                    </div>
                                    <p className="feature-text">
                                        W panelu publikujesz artykuły eksperckie. Takie treści budują Twoją widoczność w sieci,
                                        mogą trafiać do wyników wyszukiwania i coraz częściej do odpowiedzi generowanych przez AI.
                                    </p>
                                </div>

                                <div className="advisor-feature-item animate-on-scroll" data-delay="400">
                                    <div className="feature-header">
                                        <div className="feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <div className="feature-title-group">
                                            <h3 className="feature-title">Opiekun profilu</h3>
                                            <span className="feature-badge badge-gold">Zawsze wsparcie</span>
                                        </div>
                                    </div>
                                    <p className="feature-text">
                                        Nie zostajesz z tym sam. Masz swojego opiekuna profilu, który pomaga ustawić
                                        widoczność, zadbać o profil i podpowiada, co poprawić.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Security & Privacy */}
                <section className="security-section" id="security">
                    <div className="container">
                        <div className="security-layout">
                            <div className="security-left animate-on-scroll">
                                <span className="section-label">TWOJE ROZMOWY ZOSTAJĄ MIĘDZY WAMI</span>
                                <h2 className="section-title">
                                    Dane klienta i czat <br />są szyfrowane
                                </h2>
                                <p className="section-subtitle-left">
                                    Klient przychodzi z rzeczami, których nie powie byle komu. Zostają między Wami.
                                </p>

                                <ul className="security-list">
                                    <li className="security-item">
                                        <div className="security-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Szyfrowana rozmowa i dokumenty</strong>{" "} – czat i pliki, które klient wrzuca, są
                                            szyfrowane. Nie krążą po zwykłym mailu ani po komunikatorze, gdzie nie wiadomo, kto ma
                                            do nich wgląd.
                                        </div>
                                    </li>

                                    <li className="security-item">
                                        <div className="security-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Zabezpieczenia po naszej stronie</strong>{" "} – nie musisz nic konfigurować ani znać
                                            się na technice. Bierzemy to na siebie, Ty po prostu pracujesz.
                                        </div>
                                    </li>

                                    <li className="security-item">
                                        <div className="security-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Zgodne z tajemnicą zawodową</strong>{" "} – jeśli wiąże Cię tajemnica zawodowa, bez
                                            szyfrowania nie ma o czym rozmawiać. U nas ten warunek jest spełniony, więc spokojnie
                                            przenosisz kontakt z klientem do sieci.
                                        </div>
                                    </li>
                                </ul>

                                <div className="security-cta-row">
                                    <Link href={REGISTER_HREF} className="btn-primary">
                                        <span>Załóż profil</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Visual: Security Mockup */}
                            <div className="security-right animate-on-scroll" data-delay="150">
                                <div className="security-card-visual" data-tilt="5">
                                    <div className="mockup-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>{" "}
                                            <span className="dot-yellow"></span>{" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">BEZPIECZEŃSTWO & TAJEMNICA ZAWODOWA</div>
                                    </div>
                                    <div className="mockup-body">
                                        <div className="security-badge-main">
                                            <div className="shield-pulse-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#0da192" strokeWidth="2">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="security-status-title">Szyfrowanie End-to-End SSL/TLS</h4>
                                                <span className="security-status-subtitle">Chronione protokołem AES-256</span>
                                            </div>
                                        </div>

                                        <div className="security-checklist-box">
                                            <div className="sec-check-item">
                                                <span className="sec-icon-green">✓</span>{" "}
                                                <span>Prywatny czat ekspercki z klientem</span>
                                            </div>
                                            <div className="sec-check-item">
                                                <span className="sec-icon-green">✓</span>{" "}
                                                <span>Bezpieczna wymiana dokumentów (PDF, DOCX)</span>
                                            </div>
                                            <div className="sec-check-item">
                                                <span className="sec-icon-green">✓</span>{" "}
                                                <span>Zgodność z Tajemnicą Zawodową & RODO</span>
                                            </div>
                                            <div className="sec-check-item">
                                                <span className="sec-icon-green">✓</span>{" "}
                                                <span>Brak dostępu osób trzecich</span>
                                            </div>
                                        </div>

                                        <div className="security-footer-note">
                                            🔒 Dedykowana infrastruktura chroniąca prywatność Twoją i klienta.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Differentiators */}
                <section className="differentiators" id="differentiators">
                    <div className="container">
                        <div className="diff-split-container">
                            <div className="diff-card-left animate-on-scroll">
                                <span className="section-label">MARKETING BIERZEMY NA SIEBIE</span>
                                <h2 className="section-title">
                                    Za ProstaSprawa.pl stoi <br />Dom Mediowy 4Connection
                                </h2>
                                <ul className="diff-list">
                                    <li className="diff-item">
                                        <div className="diff-bullet"></div>
                                        <div>
                                            <strong>Marketingiem nie zajmujesz się po godzinach</strong>{" "} – robimy content,
                                            prowadzimy social media, YouTube i LinkedIn za Ciebie.
                                        </div>
                                    </li>
                                    <li className="diff-item">
                                        <div className="diff-bullet"></div>
                                        <div>
                                            <strong>Materiały na miejscu</strong>{" "} – jak trzeba, przyjeżdżamy do Ciebie,
                                            nagrywamy materiały wideo i robimy zdjęcia.
                                        </div>
                                    </li>
                                    <li className="diff-item">
                                        <div className="diff-bullet"></div>
                                        <div>
                                            <strong>Spójna obecność w sieci</strong>{" "} – Twoja marka przestaje wyglądać zrywami
                                            raz na kwartał i zaczyna wyglądać spójnie.
                                        </div>
                                    </li>
                                </ul>
                                <Link href={REGISTER_HREF} className="btn-primary">
                                    <span>Tak, zakładam konto</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Section 6: Why Us */}
                <section className="why-us" id="why-us">
                    <div className="container">
                        <div className="why-us-layout">
                            {/* Left Pane: List */}
                            <div className="why-us-left animate-on-scroll">
                                <span className="section-label">TWOJA POZYCJA ZALEŻY OD CIEBIE</span>
                                <h2 className="section-title">
                                    Widoczność, na którą <br />masz realny wpływ
                                </h2>
                                <ul className="why-list">
                                    <li className="why-item">
                                        <div className="why-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                <polyline points="17 6 23 6 23 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Aktywność się opłaca</strong>{" "} – widoczność w serwisie to nie tylko kwestia
                                            pakietu. Liczy się też, jak aktywnie działasz, jak wygląda Twój profil i jak angażujesz
                                            się w sprawy. Im więcej realnej roboty, tym wyżej jesteś i tym więcej zapytań do Ciebie
                                            trafia.
                                        </div>
                                    </li>
                                    <li className="why-item">
                                        <div className="why-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon
                                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Punkty za aktywność</strong>{" "} – im więcej realnie robisz na platformie, choćby
                                            wypełniając ankiety, tym więcej punktów zbierasz. A punkty podbijają Cię wyżej w
                                            wynikach.
                                        </div>
                                    </li>
                                    <li className="why-item">
                                        <div className="why-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                                <polyline points="2 17 12 22 22 17" />
                                                <polyline points="2 12 12 17 22 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Pakiety pod siebie</strong>{" "} – dobierasz pakiet dopasowany do swoich potrzeb, a
                                            najwyższy daje nielimitowany dostęp do spraw.
                                        </div>
                                    </li>
                                    <li className="why-item">
                                        <div className="why-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Nie tylko prawnicy</strong>{" "} – na platformie działają nie tylko adwokaci czy
                                            radcy prawni. Dołączają rzeczoznawcy, doradcy finansowi, księgowi, architekci,
                                            specjaliści BHP i PPOŻ. Przy trudniejszej sprawie masz pod ręką ludzi z innych
                                            dziedzin i możesz poprowadzić klienta szerzej, niż gdybyś działał w pojedynkę.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Right Pane: Ranking & Points Mockup */}
                            <div className="why-us-right animate-on-scroll" data-delay="150">
                                <div className="ranking-card" data-tilt="5">
                                    <div className="mockup-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>{" "}
                                            <span className="dot-yellow"></span>{" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">RANKING & PUNKTY AKTYWNOŚCI</div>
                                    </div>
                                    <div className="mockup-body">
                                        {/* Position Widget */}
                                        <div className="rank-position-box">
                                            <div className="rank-position-info">
                                                <span className="rank-label">Twoja pozycja w wynikach</span>{" "}
                                                <span className="rank-value" data-count="3" data-prefix="#">#3</span>
                                            </div>
                                            <div className="rank-trend">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    strokeWidth="2.5">
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    <polyline points="17 6 23 6 23 12" />
                                                </svg>
                                                <span>+<span data-count="5">5</span>{" "} miejsc<br />w tym tygodniu</span>
                                            </div>
                                        </div>

                                        {/* Weekly Visibility Chart */}
                                        <div className="rank-chart-box">
                                            <span className="rank-box-label">Widoczność profilu – ostatnie 7 dni</span>
                                            <div className="rank-chart">
                                                <span className="rank-bar" style={{ "--h": "32%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar" style={{ "--h": "45%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar" style={{ "--h": "38%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar" style={{ "--h": "58%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar" style={{ "--h": "66%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar" style={{ "--h": "84%" } as React.CSSProperties}></span>{" "}
                                                <span className="rank-bar today" style={{ "--h": "100%" } as React.CSSProperties}></span>
                                            </div>
                                            <div className="rank-chart-days">
                                                <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>So</span><span>Nd</span>
                                            </div>
                                        </div>

                                        {/* Level Progress */}
                                        <div className="rank-level-box">
                                            <div className="rank-level-row">
                                                <span className="rank-box-label">Poziom: Specjalista → Ekspert</span>{" "}
                                                <span className="rank-level-val" data-count="72" data-suffix="%">72%</span>
                                            </div>
                                            <div className="progress-bar-wrapper">
                                                <div className="progress-bar-fill" data-bar style={{ width: "72%" }}></div>
                                            </div>
                                        </div>

                                        {/* Points Feed */}
                                        <div className="points-feed">
                                            <span className="rank-box-label">Ostatnia aktywność</span>
                                            <div className="points-item">
                                                <span className="points-check">✓</span>{" "}
                                                <span className="points-name">Wypełniona ankieta</span>{" "}
                                                <span className="points-val">+10 pkt</span>
                                            </div>
                                            <div className="points-item">
                                                <span className="points-check">✓</span>{" "}
                                                <span className="points-name">Odpowiedź na zapytanie</span>{" "}
                                                <span className="points-val">+25 pkt</span>
                                            </div>
                                            <div className="points-item">
                                                <span className="points-check">✓</span>{" "}
                                                <span className="points-name">Ukończona sprawa</span>{" "}
                                                <span className="points-val">+40 pkt</span>
                                            </div>
                                            <div className="points-item highlight">
                                                <span className="points-check">★</span>{" "}
                                                <span className="points-name">Nowa opinia od klienta</span>{" "}
                                                <span className="points-val">+30 pkt</span>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="rank-summary">
                                            <span className="rank-summary-dot"></span>{" "}
                                            Łącznie <strong><span data-count="320">320</span>{" "} pkt</strong>{" "} w tym miesiącu
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Trust Signals */}
                <section className="trust-section" id="trust">
                    <div className="container">
                        <div className="trust-layout">
                            <div className="trust-left animate-on-scroll">
                                <span className="section-label">ZAUFANIE OD PIERWSZEGO KLIKNIĘCIA</span>
                                <h2 className="section-title">
                                    Sygnały, które przekonują <br />klienta, żeby się odezwał
                                </h2>
                                <p className="section-subtitle-left">
                                    Klient ogląda profil kilka sekund i w tym czasie decyduje, czy pisze do Ciebie, czy do
                                    następnego z listy.
                                </p>

                                <div className="trust-features-grid">
                                    <div className="trust-feature-item">
                                        <div className="trust-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon
                                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Opinie od klientów</h4>
                                            <p>Ktoś, kto się waha, czyta, co napisali inni. Zebrane opinie robią tę robotę za
                                                Ciebie, nawet kiedy akurat nie siedzisz przy komputerze.</p>
                                        </div>
                                    </div>

                                    <div className="trust-feature-item">
                                        <div className="trust-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>Odznaka „zweryfikowany”</h4>
                                            <p>Klient od razu widzi, że trafił na fachowca z papierami, a nie na przypadkowe konto.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="trust-feature-item">
                                        <div className="trust-feature-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4>„Odpowiada zwykle w 24 h”</h4>
                                            <p>Ten znacznik bierze się z tego, jak realnie działasz, a nie z tego, ile zapłaciłeś.
                                                Dlatego masz go też na darmowym koncie. Wiarygodności u nas się nie kupuje.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="trust-cta-row">
                                    <Link href={REGISTER_HREF} className="btn-primary">
                                        <span>Załóż profil</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Visual: Trust Badges Mockup */}
                            <div className="trust-right animate-on-scroll" data-delay="150">
                                <div className="trust-card-visual" data-tilt="5">
                                    <div className="mockup-header">
                                        <div className="mockup-dots">
                                            <span className="dot-red"></span>{" "}
                                            <span className="dot-yellow"></span>{" "}
                                            <span className="dot-green"></span>
                                        </div>
                                        <div className="mockup-title">KARTA WIZYTÓWKI & SYGNAŁY ZAUFANIA</div>
                                    </div>
                                    <div className="mockup-body">
                                        {/* Expert Header Mockup */}
                                        <div className="trust-expert-card">
                                            <div className="expert-top">
                                                <div className="expert-avatar-box">
                                                    <div className="expert-avatar">PS</div>
                                                    <span className="verified-badge-icon" title="Zweryfikowany Prawnik">✓</span>
                                                </div>
                                                <div className="expert-details">
                                                    <div className="expert-name-row">
                                                        <h4 className="expert-name">r. pr. Piotr Stankiewicz</h4>
                                                        <span className="verified-pill">● Zweryfikowany profil</span>
                                                    </div>
                                                    <span className="expert-spec">Prawo Cywilne i Gospodarcze</span>
                                                    <div className="expert-rating-row">
                                                        <span className="stars">★★★★★</span>{" "}
                                                        <span className="rating-val">5.0</span>{" "}
                                                        <span className="reviews-count">(34 opinie klientów)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="trust-metrics-bar">
                                                <div className="trust-metric">
                                                    <span className="metric-icon">⚡</span>{" "}
                                                    <span className="metric-text">Odpowiada zwykle w <strong>24 h</strong></span>
                                                </div>
                                                <div className="trust-metric">
                                                    <span className="metric-icon">🏆</span>{" "}
                                                    <span className="metric-text">Skuteczność: <strong>98%</strong></span>
                                                </div>
                                            </div>

                                            {/* Mini Review Quote */}
                                            <div className="trust-review-quote">
                                                <p>„Świetny kontakt, rzeczowe podejście do sprawy rozwodowej. Odpowiedź otrzymałem w
                                                    niespełna 2 godziny!”</p>
                                                <span className="quote-author">— Marek K., Klient zweryfikowany</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: Contact & Footer */}
                <section className="contact-section" id="contact">
                    <div className="container">
                        <h2 className="contact-title animate-on-scroll">
                            <span className="contact-line"></span>{" "}
                            Załóż profil{" "}
                            <span className="contact-line"></span>
                        </h2>
                        <p className="section-subtitle animate-on-scroll" style={{ textAlign: "center" }}>
                            Konto jest darmowe, prowizji nie ma, a sprawy przychodzą do Ciebie. Zobacz, jakie zapytania
                            wpadają w Twojej kategorii.
                        </p>
                        <div className="contact-card animate-on-scroll">
                            <div className="contact-row">
                                <div className="contact-icon phone-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"
                                            stroke="currentColor" strokeWidth="1.5" />
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
                                        <path
                                            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                                            stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M9 12l2 2 4-4" stroke="#5a9a5a" strokeWidth="1.5" strokeLinecap="round"
                                            strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <Link href={REGISTER_HREF} className="contact-btn">ZAŁÓŻ DARMOWY PROFIL</Link>
                            </div>
                        </div>
                    </div>
                </section>


            </div>
        </>
    )
}
