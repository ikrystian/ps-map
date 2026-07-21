"use client";

import Link from "next/link";
import { useEffect } from "react";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Nie ładuj ponownie, jeśli skrypt już istnieje
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Nie udało się załadować skryptu: ${src}`));
    document.body.appendChild(script);
  });
}

export default function ComingSoon() {
  useEffect(() => {
    // Ustaw tło body jak w landing.html
    const previousBg = document.body.style.background;
    document.body.style.background = "#121212";

    // tsParticles (vanilla, CDN)
    (async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@tsparticles/engine@4/tsparticles.engine.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@tsparticles/slim@4/tsparticles.slim.bundle.min.js");
        const w = window as unknown as {
          tsParticles?: { load: (opts: Record<string, unknown>) => Promise<void> };
          loadSlim?: (engine: unknown) => Promise<void>;
        };
        if (w.tsParticles && w.loadSlim) {
          await w.loadSlim(w.tsParticles);
          await w.tsParticles.load({
            id: "tsparticles",
            options: {
              fpsLimit: 60,
              fullScreen: { enable: false },
              particles: {
                number: { value: 70, density: { enable: true } },
                color: { value: "#0da192" },
                links: {
                  enable: true,
                  color: "#0da192",
                  distance: 150,
                  opacity: 0.22,
                  width: 1,
                },
                move: {
                  enable: true,
                  speed: 0.8,
                  outModes: { default: "out" },
                },
                opacity: { value: 0.4 },
                size: { value: { min: 1, max: 3 } },
              },
              interactivity: {
                events: { onHover: { enable: true, mode: "grab" } },
                modes: { grab: { distance: 160, links: { opacity: 0.4 } } },
              },
              detectRetina: true,
            },
          });
        }
      } catch (error) {
        console.error("Błąd inicjalizacji tsParticles:", error);
      }
    })();

    // Countdown — Cel: 1 sierpnia 2026, 00:00 (czas lokalny)
    const target = new Date(2026, 7, 1, 0, 0, 0).getTime();
    const cd = document.getElementById("countdown");
    const elDays = cd?.querySelector("[data-days]");
    const elHours = cd?.querySelector("[data-hours]");
    const elMinutes = cd?.querySelector("[data-minutes]");
    const elSeconds = cd?.querySelector("[data-seconds]");

    const pad = (n: number) => String(n).padStart(2, "0");

    let timer: ReturnType<typeof setInterval> | undefined = undefined;

    function tick() {
      if (!cd) return;
      const diff = target - Date.now();
      if (diff <= 0) {
        cd.innerHTML = '<p class="countdown__done">Już wystartowaliśmy! 🎉</p>';
        if (timer !== undefined) clearInterval(timer);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (elDays) elDays.textContent = String(days);
      if (elHours) elHours.textContent = pad(hours);
      if (elMinutes) elMinutes.textContent = pad(minutes);
      if (elSeconds) elSeconds.textContent = pad(seconds);
    }

    tick();
    timer = setInterval(tick, 1000);

    return () => {
      if (timer !== undefined) clearInterval(timer);
      document.body.style.background = previousBg;
    };
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .app-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0 40px;
          background: url("/backgrounds/4.png") center / cover no-repeat;
        }

        /* Warstwa przyciemnienia dla czytelności */
        .app-hero__overlay {
          position: absolute;
          inset: 0;
          background: rgba(20, 20, 20, 0.72);
          backdrop-filter: blur(1px);
          z-index: 0;
        }

        /* Cząsteczki (tsParticles) – w obrębie sekcji hero */
        #tsparticles {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Animowane kule gradientowe */
        .app-hero__orb {
          position: absolute;
          width: 60%;
          height: 60%;
          border-radius: 50%;
          filter: blur(160px);
          z-index: 0;
          animation: app-hero-pulse 6s ease-in-out infinite;
        }

        .app-hero__orb--primary {
          top: 25%;
          left: -25%;
          background: rgba(13, 161, 146, 0.22);
        }

        .app-hero__orb--teal {
          bottom: 25%;
          right: -25%;
          background: rgba(20, 184, 166, 0.12);
          animation-delay: 1.5s;
        }

        @keyframes app-hero-pulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .app-hero__content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }

        .app-hero__badge {
          display: inline-block;
          padding: 9px 22px;
          border: 1px solid rgba(13, 161, 146, 0.4);
          background: rgba(13, 161, 146, 0.06);
          backdrop-filter: blur(8px);
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #d8efe9;
          margin-bottom: 32px;
        }

        .app-hero__title {
          font-family: "Playfair Display", serif;
          font-weight: 500;
          color: #fff;
          font-size: clamp(3.2rem, 11vw, 8rem);
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin-bottom: 32px;
          text-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }

        .app-hero__subtitle {
          font-family: "Playfair Display", serif;
          font-weight: 300;
          color: #e5e5e5;
          font-size: clamp(1.4rem, 3.5vw, 2.25rem);
          line-height: 1.3;
          margin-bottom: 20px;
        }

        .app-hero__subtitle em {
          font-style: italic;
          font-weight: 700;
          color: #fff;
          text-decoration: underline;
          text-decoration-color: rgba(13, 161, 146, 0.5);
          text-underline-offset: 8px;
        }

        .app-hero__desc {
          font-family: "Inter", sans-serif;
          color: #a3a3a3;
          font-size: clamp(1rem, 1.4vw, 1.25rem);
          line-height: 1.7;
          max-width: 640px;
          margin: 0 auto 48px;
        }

        /* Countdown */
        .app-hero__countdown-label {
          font-family: "Inter", sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c8a864;
          margin-bottom: 20px;
        }

        .countdown {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 72px;
          flex-wrap: wrap;
        }

        .countdown__box {
          min-width: 120px;
          padding: 24px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          transition:
            border-color 0.3s,
            background 0.3s;
        }

        .countdown__box:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .countdown__num {
          font-family: "Playfair Display", serif;
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          font-weight: 600;
          line-height: 1;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }

        .countdown__unit {
          display: block;
          margin-top: 10px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #9a9a9a;
        }

        .countdown__done {
          font-family: "Playfair Display", serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          color: #fff;
          margin-bottom: 72px;
        }

        /* Wskaźniki */
        .app-hero__indicators {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px 48px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .indicator__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(13, 161, 146, 0.12);
          color: #0da192;
        }

        .indicator__icon svg {
          width: 20px;
          height: 20px;
        }

        .indicator__text {
          text-align: left;
        }

        .indicator__value {
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .indicator__label {
          font-size: 0.72rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #777;
          margin-top: 5px;
        }

        /* Dolny gradient */
        .app-hero__fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 160px;
          background: linear-gradient(to top, #121212, transparent);
          z-index: 5;
        }

        /* Logo top-left */
        .app-hero__logo {
          position: absolute;
          top: 28px;
          left: 28px;
          z-index: 20;
        }

        .app-hero__logo img {
          height: 34px;
          width: auto;
        }

        @media (max-width: 560px) {
          .countdown__box {
            min-width: 0;
            flex: 1 1 40%;
          }
        }

        /* Dane kontaktowe – prawy dolny róg, kompaktowe */
        .floating-contact-card {
          position: fixed;
          bottom: 12px;
          right: 12px;
          z-index: 100;
          background: rgba(15, 15, 15, 0.85);
          border: 1px solid rgba(13, 161, 146, 0.25);
          border-radius: 8px;
          padding: 8px 12px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          gap: 5px;
          max-width: 240px;
          transition: border-color 0.3s;
        }

        .floating-contact-card:hover {
          border-color: rgba(13, 161, 146, 0.45);
        }

        .floating-contact-card__item {
          font-family: "Inter", sans-serif;
          font-size: 0.68rem;
          color: #999;
          display: flex;
          align-items: center;
          gap: 6px;
          line-height: 1.4;
          white-space: nowrap;
        }

        .floating-contact-card__icon {
          width: 12px;
          height: 12px;
          color: #0da192;
          flex-shrink: 0;
        }

        .floating-contact-card__item a {
          color: #999;
          text-decoration: none;
          transition: color 0.2s;
        }

        .floating-contact-card__item a:hover {
          color: #0da192;
        }
      `}</style>

      <section className="app-hero">
        <Link href="/" className="app-hero__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Prosta Sprawa" />
        </Link>

        <div className="app-hero__overlay"></div>
        <div className="app-hero__orb app-hero__orb--primary"></div>
        <div className="app-hero__orb app-hero__orb--teal"></div>
        <div id="tsparticles"></div>

        <div className="app-hero__content">
          <span className="app-hero__badge">Twoje wsparcie prawne w zasięgu ręki</span>

          <h1 className="app-hero__title">Prosta Sprawa</h1>

          <h2 className="app-hero__subtitle">
            Rozwiązujemy Twoje <em>problemy prawne</em> w kilku krokach.
          </h2>
          <p className="app-hero__desc">
            Dodaj sprawę i otrzymaj oferty od zweryfikowanych prawników. Szybko, bezpiecznie i na Twoich zasadach.
          </p>

          <p className="app-hero__countdown-label">Startujemy za</p>
          <div className="countdown" id="countdown">
            <div className="countdown__box">
              <span className="countdown__num" data-days>
                --
              </span>
              <span className="countdown__unit">Dni</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" data-hours>
                --
              </span>
              <span className="countdown__unit">Godzin</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" data-minutes>
                --
              </span>
              <span className="countdown__unit">Minut</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" data-seconds>
                --
              </span>
              <span className="countdown__unit">Sekund</span>
            </div>
          </div>

          <div className="app-hero__indicators">
            <div className="indicator">
              <div className="indicator__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="indicator__text">
                <p className="indicator__value">1000+</p>
                <p className="indicator__label">Ekspertów</p>
              </div>
            </div>
            <div className="indicator">
              <div className="indicator__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="indicator__text">
                <p className="indicator__value">100%</p>
                <p className="indicator__label">Bezpieczeństwa</p>
              </div>
            </div>
            <div className="indicator">
              <div className="indicator__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="indicator__text">
                <p className="indicator__value">98%</p>
                <p className="indicator__label">Skuteczności</p>
              </div>
            </div>
          </div>
        </div>

        <div className="app-hero__fade"></div>
      </section>

      {/* Dane kontaktowe */}
      <aside className="floating-contact-card" aria-label="Dane kontaktowe">
        <div className="floating-contact-card__item">
          <svg className="floating-contact-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <a href="mailto:bok@prostasprawa.pl">bok@prostasprawa.pl</a>
        </div>
        <div className="floating-contact-card__item">
          <svg className="floating-contact-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <a href="tel:+48534888555">+48 534 888 555</a>
        </div>
        <div className="floating-contact-card__item">
          <svg className="floating-contact-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>ul. Przykładowa 1, Warszawa</span>
        </div>
      </aside>
    </>
  );
}
