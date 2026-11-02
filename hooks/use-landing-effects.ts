"use client"

import { useEffect, type RefObject } from "react"

/**
 * Warstwa interakcji landingów `.ps-lp` (/dla-prawnika, /dla-eksperta):
 * animacje wejścia, parallax, tilt, liczniki i żywe makiety.
 *
 * Działa na elementach wewnątrz `rootRef` (szuka ich po klasach i id), więc nie
 * wymaga, żeby strona miała wszystkie sekcje. `searchPhrases` musi być stałą
 * spoza komponentu - zmiana referencji restartuje efekt.
 */
export function useLandingEffects(
    rootRef: RefObject<HTMLDivElement | null>,
    searchPhrases: readonly string[]
) {
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
                const phrase = searchPhrases[phraseIdx]
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
                        phraseIdx = (phraseIdx + 1) % searchPhrases.length
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
    }, [rootRef, searchPhrases])
}
