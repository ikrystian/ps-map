"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import "./dla-prawnika.css"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

export default function ForLawyersClientPage() {
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

            {/* Section 1: Hero */}
            <section id="hero" className="relative min-h-[80vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/backgrounds/1.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 z-[1]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,32,29,0.3)_0%,rgba(32,32,29,0.6)_70%,#20201d_100%)] z-[3]" />
                </div>
                <div className="relative z-10 w-full mx-auto max-w-[1160px] px-4 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-[60px] items-center lg:py-0 lg:pt-[120px] lg:pb-[60px]">
                    <div className="text-left flex flex-col items-start text-center lg:text-left lg:items-start animate-on-scroll">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[3px] text-gold mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-dot" />
                            DLA PRAWNIKA I SPECJALISTY
                        </div>
                        <h1 className="font-playfair font-medium text-[clamp(2.2rem,4.5vw,3.2rem)] leading-[1.15] mb-6">
                            Sprawy, które mają sens.<br />
                            Bez prowizji, bez katalogu.
                        </h1>
                        <p className="text-base text-[#aaa] mb-9 leading-[1.7] max-w-[580px]">
                            Wiesz, jak to zwykle wygląda. Wisisz w katalogu obok setki innych prawników i czekasz, aż ktoś
                            Cię znajdzie. Albo płacisz za leady i oddzwaniasz do kogoś, kto „tylko sprawdzał ceny&rdquo;.
                            ProstaSprawa.pl działa inaczej – zamiast przypadkowych zapytań dostajesz{" "}
                            <strong>konkretne sprawy</strong> od osób, które realnie szukają pomocy i są gotowe za nią
                            zapłacić.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-[320px] sm:max-w-none sm:w-auto mx-auto sm:mx-0 lg:justify-start">
                            <Link href="/rejestracja/ekspert">
                                <InteractiveHoverButton>Załóż profil</InteractiveHoverButton>
                            </Link>
                        </div>
                        {/* Trust / Social Proof Widget */}
                        <div className="flex items-center gap-4 border-t border-white/5 pt-6 w-full max-w-[500px] mx-auto lg:mx-0 lg:justify-start justify-center">
                            <div className="text-xs text-[#777] leading-[1.5]">
                                Konto za darmo. Zero prowizji, <strong className="text-[#bbb] font-semibold">teraz i w przyszłości</strong>.
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Live Cases Mockup */}
                    <div className="flex justify-center lg:justify-end w-full animate-on-scroll" data-delay="150">
                        <div className="w-full max-w-[440px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.06] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl transition-[border-color,box-shadow] duration-400 ease-[cubic-bezier(.25,.8,.25,1)] hover:border-gold/15 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(200,168,100,0.02)]">
                            <div className="bg-black/30 border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                    <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                    <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                </div>
                                <div className="text-xs text-[#666] font-medium tracking-[0.5px]">BAZA SPRAW</div>
                            </div>
                            <div className="p-7 flex flex-col gap-5">
                                {/* Search & Filter bar */}
                                <div className="flex items-center gap-2 bg-black/20 border border-white/[0.04] px-4 py-3 rounded-xl text-[#555] text-xs mb-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                    <span>Wyszukaj specjalizację...</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* Case Item 1 */}
                                    <div
                                        onMouseEnter={() => setActiveCaseIdx(0)}
                                        className={`bg-white/[0.01] border rounded-2xl py-4 px-5 flex flex-col gap-2.5 transition-all duration-300 text-left hover:bg-white/[0.02] hover:border-white/[0.06] ${activeCaseIdx === 0 ? "bg-gold/[0.02] border-gold/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.15)]" : "border-white/[0.03]"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.7rem] font-semibold text-gold uppercase tracking-[0.5px]">Prawo Rodzinne</span>
                                            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl bg-gold/[0.08] border border-gold/[0.15] text-gold">Wysoki budżet</span>
                                        </div>
                                        <h4 className="font-playfair text-[0.95rem] font-semibold text-white m-0 leading-[1.45]">Podział majątku i sprawa rozwodowa</h4>
                                        <div className="flex items-center justify-between text-xs text-[#666]">
                                            <span className="flex items-center gap-1.5 [&_svg]:text-[#444]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                Warszawa (Mazowieckie)
                                            </span>
                                            <span className="flex items-center gap-1.5 text-primary font-medium">
                                                Szac. budżet: ~12 000 PLN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Case Item 2 */}
                                    <div
                                        onMouseEnter={() => setActiveCaseIdx(1)}
                                        className={`bg-white/[0.01] border rounded-2xl py-4 px-5 flex flex-col gap-2.5 transition-all duration-300 text-left hover:bg-white/[0.02] hover:border-white/[0.06] ${activeCaseIdx === 1 ? "bg-gold/[0.02] border-gold/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.15)]" : "border-white/[0.03]"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.7rem] font-semibold text-gold uppercase tracking-[0.5px]">Prawo Cywilne</span>
                                            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl bg-primary/[0.08] border border-primary/[0.15] text-primary">Nowa sprawa</span>
                                        </div>
                                        <h4 className="font-playfair text-[0.95rem] font-semibold text-white m-0 leading-[1.45]">Odszkodowanie za opóźniony lot i spór z OC</h4>
                                        <div className="flex items-center justify-between text-xs text-[#666]">
                                            <span className="flex items-center gap-1.5 [&_svg]:text-[#444]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                Gdańsk (Pomorskie)
                                            </span>
                                            <span className="flex items-center gap-1.5 text-primary font-medium">
                                                Szac. budżet: ~4 500 PLN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Case Item 3 */}
                                    <div
                                        onMouseEnter={() => setActiveCaseIdx(2)}
                                        className={`bg-white/[0.01] border rounded-2xl py-4 px-5 flex flex-col gap-2.5 transition-all duration-300 text-left hover:bg-white/[0.02] hover:border-white/[0.06] ${activeCaseIdx === 2 ? "bg-gold/[0.02] border-gold/[0.15] shadow-[0_8px_24px_rgba(0,0,0,0.15)]" : "border-white/[0.03]"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.7rem] font-semibold text-gold uppercase tracking-[0.5px]">Prawo Handlowe</span>
                                            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#777]">Stała obsługa</span>
                                        </div>
                                        <h4 className="font-playfair text-[0.95rem] font-semibold text-white m-0 leading-[1.45]">Przygotowanie regulaminu SaaS i polityki prywatności</h4>
                                        <div className="flex items-center justify-between text-xs text-[#666]">
                                            <span className="flex items-center gap-1.5 [&_svg]:text-[#444]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                Zdalnie (Online)
                                            </span>
                                            <span className="flex items-center gap-1.5 text-primary font-medium">
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
            <section id="benefits">
                <div className="bg-background py-20 relative">
                    <div className="container mx-auto max-w-[1160px] px-4">
                        <div className="text-center mb-[60px] animate-on-scroll">
                            <span className="inline-block text-xs font-semibold tracking-[3px] text-gold uppercase mb-5">ZERO HACZYKÓW</span>
                            <h2 className="font-playfair font-medium text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.25] text-white mt-3">
                                Dlaczego warto założyć profil<br />na ProstaSprawa.pl?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1 */}
                            <div className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-3xl px-7 pt-10 pb-9 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 animate-on-scroll" data-delay="0">
                                <div className="w-12 h-12 rounded-xl bg-primary/[0.06] border border-primary/[0.12] flex items-center justify-center text-primary mb-7 transition-all duration-300 group-hover:bg-gold/[0.08] group-hover:border-gold/[0.25] group-hover:text-gold group-hover:scale-105 [&_svg]:w-[22px] [&_svg]:h-[22px]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <line x1="20" y1="8" x2="20" y2="14" />
                                        <line x1="17" y1="11" x2="23" y2="11" />
                                    </svg>
                                </div>
                                <h3 className="font-playfair text-[1.15rem] font-semibold text-white mb-3">Zero prowizji</h3>
                                <p className="text-[0.85rem] text-[#777] leading-[1.65] m-0 transition-colors duration-300 group-hover:text-[#bbb]">Konto zakładasz za darmo, bez opłaty rejestracyjnej. Od spraw nie
                                    pobieramy prowizji – ani teraz, ani później.</p>
                                <span className="absolute top-7 right-7 text-[0.85rem] font-bold text-white/[0.03] transition-colors duration-300 group-hover:text-gold/[0.08]">01</span>
                            </div>
                            {/* Card 2 */}
                            <div className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-3xl px-7 pt-10 pb-9 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 animate-on-scroll" data-delay="100">
                                <div className="w-12 h-12 rounded-xl bg-primary/[0.06] border border-primary/[0.12] flex items-center justify-center text-primary mb-7 transition-all duration-300 group-hover:bg-gold/[0.08] group-hover:border-gold/[0.25] group-hover:text-gold group-hover:scale-105 [&_svg]:w-[22px] [&_svg]:h-[22px]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h3 className="font-playfair text-[1.15rem] font-semibold text-white mb-3">Konkretne sprawy</h3>
                                <p className="text-[0.85rem] text-[#777] leading-[1.65] m-0 transition-colors duration-300 group-hover:text-[#bbb]">Zapytania trafiają do Ciebie dopasowane do specjalizacji i
                                    lokalizacji. Żadnych „dzień dobry, ile kosztuje&rdquo;.</p>
                                <span className="absolute top-7 right-7 text-[0.85rem] font-bold text-white/[0.03] transition-colors duration-300 group-hover:text-gold/[0.08]">02</span>
                            </div>
                            {/* Card 3 */}
                            <div className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-3xl px-7 pt-10 pb-9 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 animate-on-scroll" data-delay="200">
                                <div className="w-12 h-12 rounded-xl bg-primary/[0.06] border border-primary/[0.12] flex items-center justify-center text-primary mb-7 transition-all duration-300 group-hover:bg-gold/[0.08] group-hover:border-gold/[0.25] group-hover:text-gold group-hover:scale-105 [&_svg]:w-[22px] [&_svg]:h-[22px]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </div>
                                <h3 className="font-playfair text-[1.15rem] font-semibold text-white mb-3">Panel bez chaosu</h3>
                                <p className="text-[0.85rem] text-[#777] leading-[1.65] m-0 transition-colors duration-300 group-hover:text-[#bbb]">Wszystkie sprawy, historia kontaktu i statystyki w jednym miejscu.
                                    Czat, rozliczenia i faktury bez wychodzenia z platformy.</p>
                                <span className="absolute top-7 right-7 text-[0.85rem] font-bold text-white/[0.03] transition-colors duration-300 group-hover:text-gold/[0.08]">03</span>
                            </div>
                            {/* Card 4 */}
                            <div className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-3xl px-7 pt-10 pb-9 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 animate-on-scroll" data-delay="300">
                                <div className="w-12 h-12 rounded-xl bg-primary/[0.06] border border-primary/[0.12] flex items-center justify-center text-primary mb-7 transition-all duration-300 group-hover:bg-gold/[0.08] group-hover:border-gold/[0.25] group-hover:text-gold group-hover:scale-105 [&_svg]:w-[22px] [&_svg]:h-[22px]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <h3 className="font-playfair text-[1.15rem] font-semibold text-white mb-3">Profil, który pracuje na markę</h3>
                                <p className="text-[0.85rem] text-[#777] leading-[1.65] m-0 transition-colors duration-300 group-hover:text-[#bbb]">Specjalizacje, doświadczenie, certyfikaty. Skill Law Focus
                                    podpowiada klientowi, w czym naprawdę się specjalizujesz.</p>
                                <span className="absolute top-7 right-7 text-[0.85rem] font-bold text-white/[0.03] transition-colors duration-300 group-hover:text-gold/[0.08]">04</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-section: Gain clients */}
                <div id="features" className="relative py-[120px] overflow-hidden bg-[#141414]">
                    <div className="absolute inset-0">
                        <img src="/backgrounds/3.png" alt="" className="w-full h-full object-cover opacity-[0.15]" />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,17,0.95),rgba(17,17,17,0.8))]" />
                    </div>
                    <div className="relative z-[2] mx-auto max-w-[1160px] px-4 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-[60px] items-center">
                        {/* Left Pane: Interactive statistics mockup card */}
                        <div className="flex justify-center w-full animate-on-scroll">
                            <div className="w-full max-w-[420px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.06] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl transition-[border-color,box-shadow] duration-400 ease-[cubic-bezier(.25,.8,.25,1)] hover:border-gold/15 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                                <div className="bg-black/30 border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                        <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                        <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                    </div>
                                    <div className="text-xs text-[#666] font-medium tracking-[0.5px]">&nbsp;</div>
                                </div>
                                <div className="p-6 flex flex-col gap-5">
                                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-5">
                                        <div className="flex flex-col gap-1 text-left">
                                            <span className="text-[0.65rem] font-semibold text-[#666] tracking-[0.5px]">MIESIĘCZNY PRZYCHÓD</span>
                                            <span className="text-[1.6rem] font-bold text-white">+24 800 PLN</span>
                                            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    <polyline points="17 6 23 6 23 12" />
                                                </svg>{" "}
                                                +34.2% m/m
                                            </span>
                                        </div>
                                        <div className="relative w-[68px] h-[68px]">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="fill-none stroke-white/[0.04] stroke-[3.5]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="fill-none stroke-primary [stroke-dasharray:88,100] stroke-[3.5] [stroke-linecap:round]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">88%</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 border border-white/[0.02] py-3.5 px-4 rounded-[14px] flex flex-col gap-1.5 transition-all duration-300 text-left hover:border-gold/15">
                                            <span className="text-[0.65rem] text-[#555] font-medium leading-[1.3]">Otrzymane zapytania</span>
                                            <span className="text-base font-bold text-white">48</span>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.02] py-3.5 px-4 rounded-[14px] flex flex-col gap-1.5 transition-all duration-300 text-left hover:border-gold/15">
                                            <span className="text-[0.65rem] text-[#555] font-medium leading-[1.3]">Wygrane zlecenia</span>
                                            <span className="text-base font-bold text-white">12</span>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.02] py-3.5 px-4 rounded-[14px] flex flex-col gap-1.5 transition-all duration-300 text-left hover:border-gold/15">
                                            <span className="text-[0.65rem] text-[#555] font-medium leading-[1.3]">Średni współczynnik konwersji</span>
                                            <span className="text-base font-bold text-white">25.0%</span>
                                        </div>
                                        <div className="bg-black/20 border border-white/[0.02] py-3.5 px-4 rounded-[14px] flex flex-col gap-1.5 transition-all duration-300 text-left hover:border-gold/15">
                                            <span className="text-[0.65rem] text-[#555] font-medium leading-[1.3]">Zadowoleni klienci</span>
                                            <span className="text-base font-bold text-white">100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: List & CTA */}
                        <div className="text-left flex flex-col items-start text-center lg:text-left lg:items-start animate-on-scroll" data-delay="150">
                            <span className="inline-block text-xs font-semibold tracking-[3px] text-gold uppercase mb-5">JAK TO DZIAŁA</span>
                            <h2 className="font-playfair font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.25] mb-6">
                                Jak sprawa<br />
                                trafia do Ciebie?
                            </h2>
                            <ul className="w-full m-0 mb-9 text-left p-0">
                                <li className="flex items-start gap-4 py-4 border-b border-white/[0.04] text-[0.9rem] text-[#ccc] leading-[1.5] [&:last-child]:border-b-0 [&_strong]:text-white">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong>Klient opisuje problem</strong> – wybiera kategorię i lokalizację, dokładnie
                                        określając, czego potrzebuje.
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 py-4 border-b border-white/[0.04] text-[0.9rem] text-[#ccc] leading-[1.5] [&:last-child]:border-b-0 [&_strong]:text-white">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong>Kierujemy sprawę do dopasowanych specjalistów</strong> – trafia do prawników,
                                        których profil i doświadczenie do niej pasują.
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 py-4 border-b border-white/[0.04] text-[0.9rem] text-[#ccc] leading-[1.5] [&:last-child]:border-b-0 [&_strong]:text-white">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong>Dostajesz konkretne zapytanie</strong> – takie, które ma ręce i nogi, a nie
                                        kolejne „dzień dobry, ile kosztuje&rdquo;.
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 py-4 border-b border-white/[0.04] text-[0.9rem] text-[#ccc] leading-[1.5] [&:last-child]:border-b-0 [&_strong]:text-white">
                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong>Ty decydujesz</strong> – wybierasz, które sprawy bierzesz i na jakich
                                        warunkach dogadujesz się z klientem. Nikt Ci niczego nie narzuca.
                                    </div>
                                </li>
                            </ul>
                            <Link href="/rejestracja/ekspert" className="self-center lg:self-start">
                                <InteractiveHoverButton>Testuj za darmo!</InteractiveHoverButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3 & 4: Advisor */}
            <section id="advisor" className="bg-background relative py-[120px] overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle,rgba(13,161,146,0.04)_0%,rgba(200,168,100,0.02)_50%,transparent_100%)] before:pointer-events-none before:z-0">
                <div className="container mx-auto max-w-[1200px] px-6 relative z-[1]">
                    <div className="max-w-[700px] mb-14 mx-auto text-center">
                        <span className="inline-block text-xs font-semibold tracking-[3px] text-gold uppercase mb-5 animate-on-scroll">PANEL, W KTÓRYM NIC NIE GINIE</span>
                        <h2 className="font-playfair font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.25] mb-6 animate-on-scroll">
                            Twój opiekun profilu<br />pomoże Ci być widocznym
                        </h2>
                        <p className="text-[1.05rem] text-[#aaa] max-w-[560px] mx-auto mb-0 animate-on-scroll">
                            Po zalogowaniu masz cały dashboard i całą pracę w jednym miejscu. Nie zostajesz z tym sam –
                            masz swojego opiekuna profilu, który podpowiada, co poprawić.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-start">
                        {/* Left Pane: Interactive Mockup/Dashboard */}
                        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.06] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl transition-[border-color,box-shadow] duration-400 ease-[cubic-bezier(.25,.8,.25,1)] hover:border-gold/15 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(200,168,100,0.02)] animate-on-scroll" data-delay="0">
                            <div className="bg-black/30 border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                    <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                    <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                </div>
                                <div className="text-xs text-[#666] font-medium tracking-[0.5px]">prostasprawa.pl — Panel Doradcy</div>
                            </div>
                            <div className="p-7 flex flex-col gap-5">
                                {/* Advisor Profile Widget */}
                                <div className={`bg-white/[0.02] border rounded-2xl py-4 px-5 flex items-center gap-4 transition-all duration-300 ${highlightedFeature === 2 ? "border-gold/30 bg-gold/5" : "border-white/[0.04]"}`}>
                                    <div className="relative w-11 h-11">
                                        <div className="w-full h-full rounded-full bg-primary/[0.15] border border-primary/[0.3] flex items-center justify-center text-primary [&_svg]:w-[22px] [&_svg]:h-[22px]">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <span className="absolute bottom-px right-px w-2.5 h-2.5 rounded-full border-2 border-[#141414] bg-primary shadow-[0_0_8px_rgba(13,161,146,0.6)]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="text-[0.95rem] font-semibold text-white m-0">Katarzyna Nowak</h4>
                                        <p className="text-xs text-[#777] m-0">Twój dedykowany doradca</p>
                                    </div>
                                    <div className="ml-auto text-[0.7rem] font-semibold text-primary bg-primary/[0.08] border border-primary/[0.15] py-1 px-2.5 rounded-full">Online</div>
                                </div>

                                {/* Advisor Chat Bubble */}
                                <div className="flex justify-start">
                                    <div className={`bg-primary/[0.06] border rounded-[18px_18px_18px_4px] py-4 px-5 max-w-[85%] relative transition-all duration-300 [&_p]:text-[0.85rem] [&_p]:leading-[1.6] [&_p]:text-[#ccc] [&_p]:m-0 [&_strong]:text-gold [&_strong]:font-semibold ${highlightedFeature === 3 ? "border-gold/30 bg-gold/[0.08]" : "border-primary/[0.12]"}`}>
                                        <p>
                                            Cześć! Przeanalizowałam Twój profil i mam dla Ciebie wskazówkę. Uzupełnienie zakładki
                                            &quot;Skill Law Focus&quot; zwiększy widoczność Twoich ofert o blisko <strong>40%</strong>.
                                        </p>
                                        <span className="block text-right text-[0.7rem] text-[#555] mt-2">10:42</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className={`bg-black/20 border rounded-2xl p-5 flex flex-col gap-2.5 transition-all duration-300 ${highlightedFeature === 0 ? "border-gold/30 bg-gold/5 shadow-[0_0_20px_rgba(200,168,100,0.05)]" : "border-white/[0.03]"}`}>
                                        <span className="text-[0.7rem] font-semibold text-[#666] uppercase tracking-[1px]">Moc profilu</span>
                                        <div className="flex items-center gap-3">
                                            <div className="grow h-1.5 bg-white/[0.08] rounded-[3px] overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-primary to-gold rounded-[3px] transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ width: "85%" }} />
                                            </div>
                                            <span className="text-[0.95rem] font-bold text-white">85%</span>
                                        </div>
                                        <span className="text-[0.7rem] text-primary m-0">Uzupełnij certyfikaty (+15%)</span>
                                    </div>
                                    <div className={`bg-black/20 border rounded-2xl p-5 flex flex-col gap-2.5 transition-all duration-300 ${highlightedFeature === 1 ? "border-gold/30 bg-gold/5 shadow-[0_0_20px_rgba(200,168,100,0.05)]" : "border-white/[0.03]"}`}>
                                        <span className="text-[0.7rem] font-semibold text-[#666] uppercase tracking-[1px]">Widoczność ofert</span>
                                        <span className="text-[1.8rem] font-bold leading-none text-gold [text-shadow:0_0_15px_rgba(200,168,100,0.15)]">+148%</span>
                                        <span className="text-[0.7rem] text-[#555] m-0">Wzrost w tym tygodniu</span>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className={`bg-white/[0.01] border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 ${highlightedFeature === 3 ? "border-gold/30 bg-gold/[0.02]" : "border-white/[0.03]"}`}>
                                    <h5 className="text-[0.8rem] font-semibold text-[#777] m-0 mb-1">Zadania dla Ciebie:</h5>
                                    <div className="flex items-center gap-3 text-[0.8rem] text-[#666] transition-all duration-300 [&_span]:line-through [&_span]:opacity-70">
                                        <div className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[0.7rem] bg-primary/[0.15] border border-primary/[0.3] text-primary">✓</div>
                                        <span>Weryfikacja dokumentów zawodowych</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[0.8rem] text-[#666] transition-all duration-300 [&_span]:line-through [&_span]:opacity-70">
                                        <div className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[0.7rem] bg-primary/[0.15] border border-primary/[0.3] text-primary">✓</div>
                                        <span>Konfiguracja powiadomień SMS</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[0.8rem] text-[#e0ddd5] font-medium transition-all duration-300">
                                        <div className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[0.7rem] border border-gold/[0.4] bg-gold/[0.05]"></div>
                                        <span>Dodanie pierwszego certyfikatu</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: Stacked Benefit Cards */}
                        <div className="flex flex-col gap-5">
                            <div
                                className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-[20px] py-6 px-7 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:translate-x-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors before:duration-300 hover:before:bg-gold animate-on-scroll"
                                data-delay="100"
                                onMouseEnter={() => setHighlightedFeature(0)}
                                onMouseLeave={() => setHighlightedFeature(null)}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-primary/[0.08] border border-primary/[0.15] flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-gold/[0.1] group-hover:border-gold/[0.3] group-hover:text-gold group-hover:scale-105 [&_svg]:w-5 [&_svg]:h-5">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="font-playfair text-[1.2rem] font-semibold text-white m-0">Profil, który pracuje na markę</h3>
                                        <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl tracking-[0.2px] bg-primary/[0.08] border border-primary/[0.2] text-primary">Skill Law Focus</span>
                                    </div>
                                </div>
                                <p className="text-base text-[#888] leading-[1.6] m-0 md:pl-[58px] transition-colors duration-300 group-hover:text-[#ccc]">
                                    Pokazujesz specjalizacje, doświadczenie, przynależność do OIRP albo ORA, publikacje,
                                    certyfikaty i materiały wideo. System Skill Law Focus podpowiada klientowi, w czym
                                    naprawdę się specjalizujesz.
                                </p>
                            </div>

                            <div
                                className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-[20px] py-6 px-7 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:translate-x-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors before:duration-300 hover:before:bg-gold animate-on-scroll"
                                data-delay="200"
                                onMouseEnter={() => setHighlightedFeature(1)}
                                onMouseLeave={() => setHighlightedFeature(null)}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-primary/[0.08] border border-primary/[0.15] flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-gold/[0.1] group-hover:border-gold/[0.3] group-hover:text-gold group-hover:scale-105 [&_svg]:w-5 [&_svg]:h-5">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="font-playfair text-[1.2rem] font-semibold text-white m-0">Wszystkie sprawy w jednym miejscu</h3>
                                        <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl tracking-[0.2px] bg-gold/[0.08] border border-gold/[0.2] text-gold">Dashboard</span>
                                    </div>
                                </div>
                                <p className="text-base text-[#888] leading-[1.6] m-0 md:pl-[58px] transition-colors duration-300 group-hover:text-[#ccc]">
                                    Wszystkie sprawy z ich statusem, historia kontaktu i statystyki aktywności. Z klientem
                                    rozmawiasz przez wbudowany czat, a rozliczenia i faktury ogarniasz bez wychodzenia z
                                    platformy.
                                </p>
                            </div>

                            <div
                                className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-[20px] py-6 px-7 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:translate-x-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors before:duration-300 hover:before:bg-gold animate-on-scroll"
                                data-delay="300"
                                onMouseEnter={() => setHighlightedFeature(2)}
                                onMouseLeave={() => setHighlightedFeature(null)}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-primary/[0.08] border border-primary/[0.15] flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-gold/[0.1] group-hover:border-gold/[0.3] group-hover:text-gold group-hover:scale-105 [&_svg]:w-5 [&_svg]:h-5">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="font-playfair text-[1.2rem] font-semibold text-white m-0">Artykuły eksperckie</h3>
                                        <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl tracking-[0.2px] bg-white/[0.04] border border-white/[0.08] text-[#888]">Widoczność w AI</span>
                                    </div>
                                </div>
                                <p className="text-base text-[#888] leading-[1.6] m-0 md:pl-[58px] transition-colors duration-300 group-hover:text-[#ccc]">
                                    W panelu publikujesz artykuły eksperckie. Takie treści budują Twoją widoczność w sieci,
                                    mogą trafiać do wyników wyszukiwania i coraz częściej do odpowiedzi generowanych przez AI.
                                </p>
                            </div>

                            <div
                                className="group relative bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.04] rounded-[20px] py-6 px-7 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] hover:border-gold/[0.2] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:translate-x-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors before:duration-300 hover:before:bg-gold animate-on-scroll"
                                data-delay="400"
                                onMouseEnter={() => setHighlightedFeature(3)}
                                onMouseLeave={() => setHighlightedFeature(null)}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-primary/[0.08] border border-primary/[0.15] flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-gold/[0.1] group-hover:border-gold/[0.3] group-hover:text-gold group-hover:scale-105 [&_svg]:w-5 [&_svg]:h-5">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="font-playfair text-[1.2rem] font-semibold text-white m-0">Opiekun profilu</h3>
                                        <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-xl tracking-[0.2px] bg-gold/[0.08] border border-gold/[0.2] text-gold">Zawsze wsparcie</span>
                                    </div>
                                </div>
                                <p className="text-base text-[#888] leading-[1.6] m-0 md:pl-[58px] transition-colors duration-300 group-hover:text-[#ccc]">
                                    Nie zostajesz z tym sam. Masz swojego opiekuna profilu, który pomaga ustawić
                                    widoczność, zadbać o profil i podpowiada, co poprawić.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Differentiators */}
            <section id="differentiators" className="relative py-[100px] bg-[url('/backgrounds/2.png')] bg-center bg-cover overflow-hidden">
                <div className="container mx-auto max-w-[1100px] px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-12 items-center mx-auto">
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 text-left animate-on-scroll">
                            <span className="inline-block text-xs font-semibold tracking-[3px] text-gold uppercase mb-5">MARKETING BIERZEMY NA SIEBIE</span>
                            <h2 className="font-playfair font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.25] mb-6">
                                Za ProstaSprawa.pl stoi<br />Dom Mediowy 4Connection
                            </h2>
                            <ul className="list-none my-8 mx-0">
                                <li className="flex items-start gap-4 py-3.5 text-[0.95rem] text-[#ccc] leading-[1.8]">
                                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-2.5" />
                                    <div>
                                        <strong className="text-[#e0ddd5]">Marketingiem nie zajmujesz się po godzinach</strong> – robimy content,
                                        prowadzimy social media, YouTube i LinkedIn za Ciebie.
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 py-3.5 text-[0.95rem] text-[#ccc] leading-[1.8]">
                                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-2.5" />
                                    <div>
                                        <strong className="text-[#e0ddd5]">Materiały na miejscu</strong> – jak trzeba, przyjeżdżamy do Ciebie,
                                        nagrywamy materiały wideo i robimy zdjęcia.
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 py-3.5 text-[0.95rem] text-[#ccc] leading-[1.8]">
                                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-2.5" />
                                    <div>
                                        <strong className="text-[#e0ddd5]">Spójna obecność w sieci</strong> – Twoja marka przestaje wyglądać zrywami
                                        raz na kwartał i zaczyna wyglądać spójnie.
                                    </div>
                                </li>
                            </ul>
                            <Link href="/rejestracja/ekspert">
                                <InteractiveHoverButton>Tak, zakładam konto</InteractiveHoverButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: Why Us */}
            <section id="why-us" className="bg-[#1a1915] py-[120px] relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_80%_20%,rgba(13,161,146,0.05)_0%,transparent_60%)] before:pointer-events-none">
                <div className="container mx-auto max-w-[1160px] px-4">
                    <div className="text-center mb-[72px] animate-on-scroll">
                        <span className="inline-block text-xs font-semibold tracking-[3px] text-gold uppercase mb-5">TWOJA POZYCJA ZALEŻY OD CIEBIE</span>
                        <h2 className="font-playfair font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.25] mb-6">
                            Widoczność, na którą<br />masz realny wpływ
                        </h2>
                        <ul className="max-w-4xl mx-auto list-none p-0 mt-12 text-left">
                            <li className="flex items-start gap-4 py-4 text-[0.95rem] text-[#ccc] leading-[1.7]">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-3" />
                                <div>
                                    <strong className="text-white">Aktywność się opłaca</strong> – widoczność w serwisie to nie tylko kwestia
                                    pakietu. Liczy się też, jak aktywnie działasz, jak wygląda Twój profil i jak angażujesz
                                    się w sprawy. Im więcej realnej roboty, tym wyżej jesteś i tym więcej zapytań do Ciebie
                                    trafia.
                                </div>
                            </li>
                            <li className="flex items-start gap-4 py-4 text-[0.95rem] text-[#ccc] leading-[1.7]">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-3" />
                                <div>
                                    <strong className="text-white">Pakiety pod siebie</strong> – dobierasz pakiet dopasowany do swoich potrzeb, a
                                    najwyższy daje nielimitowany dostęp do spraw.
                                </div>
                            </li>
                            <li className="flex items-start gap-4 py-4 text-[0.95rem] text-[#ccc] leading-[1.7]">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-3" />
                                <div>
                                    <strong className="text-white">Nie tylko prawnicy</strong> – na platformie działają nie tylko adwokaci czy
                                    radcy prawni. Dołączają rzeczoznawcy, doradcy finansowi, księgowi, architekci,
                                    specjaliści BHP i PPOŻ. Przy trudniejszej sprawie masz pod ręką ludzi z innych
                                    dziedzin i możesz poprowadzić klienta szerzej, niż gdybyś działał w pojedynkę.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 7: Contact */}
            <section id="contact" className="bg-[#0f0f0f] py-[120px] relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(13,161,146,0.05)_0%,transparent_70%)] before:pointer-events-none">
                <div className="container mx-auto max-w-[1200px] px-4">
                    <h2 className="font-playfair font-semibold text-[clamp(1.8rem,4vw,2.8rem)] text-white mb-6 text-center flex items-center justify-center gap-6 animate-on-scroll">
                        <span className="w-[60px] h-px bg-gold/60" />
                        Załóż profil
                        <span className="w-[60px] h-px bg-gold/60" />
                    </h2>
                    <p className="text-center text-[#aaa] text-[1.05rem] max-w-[560px] mx-auto mb-16 animate-on-scroll">
                        Konto jest darmowe, prowizji nie ma, a sprawy przychodzą do Ciebie. Zobacz, jakie zapytania
                        wpadają w Twojej kategorii.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto animate-on-scroll">
                        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] border border-white/[0.05] rounded-[32px] py-[50px] px-[30px] flex flex-col items-center text-center transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] hover:border-gold/[0.3] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                            <div className="w-[72px] h-[72px] rounded-[20px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-[#111] group-hover:rotate-[10deg] [&_svg]:w-8 [&_svg]:h-8">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-semibold text-white mb-5 font-sans">tel. +48 534 888 555</span>
                        </div>
                        <div className="group bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] border border-white/[0.05] rounded-[32px] py-[50px] px-[30px] flex flex-col items-center text-center transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] hover:border-gold/[0.3] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                            <div className="w-[72px] h-[72px] rounded-[20px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-[#111] group-hover:rotate-[10deg] [&_svg]:w-8 [&_svg]:h-8">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <a href="mailto:bok@prostasprawa.pl" className="inline-flex items-center justify-center py-3.5 px-7 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-sans text-[0.85rem] font-bold uppercase tracking-[1px] no-underline transition-all duration-300 w-full hover:bg-white hover:text-[#111]">
                                NAPISZ DO NAS
                            </a>
                        </div>
                        <div className="group bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] border border-white/[0.05] rounded-[32px] py-[50px] px-[30px] flex flex-col items-center text-center transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] hover:border-gold/[0.3] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                            <div className="w-[72px] h-[72px] rounded-[20px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-[#111] group-hover:rotate-[10deg] [&_svg]:w-8 [&_svg]:h-8">
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
                            <Link href="/rejestracja/ekspert" className="inline-flex items-center justify-center py-3.5 px-7 rounded-xl bg-gradient-to-br from-[#0da192] to-[#0b8c7f] border-none text-white font-sans text-[0.85rem] font-bold uppercase tracking-[1px] no-underline transition-all duration-300 w-full hover:shadow-[0_10px_20px_rgba(13,161,146,0.3)] hover:-translate-y-0.5">
                                ZAŁÓŻ DARMOWY PROFIL
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
