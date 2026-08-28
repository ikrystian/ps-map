"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import {
  HowItWorksIcon,
  PayForRealHelpIcon,
  NotOnlyLawyersIcon,
  ConcreteHelpIcon,
  TrustDecisionIcon,
  AllInOnePlaceIcon,
  SecuredDataIcon,
  MultiDisciplinaryIcon,
  SimpleStartIcon,
  DescribeCaseIcon,
  ReceiveOffersIcon,
  ChooseAndActIcon,
  SearchLawyerIcon,
  DirectWriteIcon,
  ScheduleMeetingIcon
} from "@/components/ui/win-with-us-icons"

export default function WinWithUsClientPage() {
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
              { label: "Z nami wygrywasz" },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-65px)] bg-background flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left"
            >
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-foreground font-light tracking-tight leading-tight mb-6">
                Z nami <span className="font-bold">wygrywasz</span>
              </h1>

              <p className="text-[#0da192] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
                Znajdź właściwego specjalistę bez obdzwaniania połowy miasta
              </p>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                Masz problem i nie wiesz, do kogo się z nim zwrócić? Zwykle zaczyna się tak samo: wpisujesz
                w wyszukiwarkę, szukasz na grupach w social mediach, otwierasz dziesięć zakładek, dzwonisz do
                trzech prawników, w dwóch nikt nie odbiera. ProstaSprawa.pl skraca to do jednego kroku.
                Opisujesz sprawę raz, a specjaliści sami się zgłaszają.
              </p>

              <Link href="/logowanie">
                <InteractiveHoverButton>Opisz swoją sprawę</InteractiveHoverButton>
              </Link>
            </motion.div>

            {/* Right Column: Key value props */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-10 lg:gap-12">

              {/* How it works */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex gap-6 items-start group"
              >
                <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                  <HowItWorksIcon className="w-14 h-14 md:w-16 md:h-16" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-playfair text-xl sm:text-2xl text-foreground font-light leading-snug">
                    <span className="font-bold">Jak to działa?</span>
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-2">
                    Opisujesz swój problem, wybierasz kategorię i lokalizację. Potem czekasz na oferty od
                    specjalistów, którzy chcą się tą sprawą zająć. Możesz spokojnie porównać, co każdy proponuje,
                    ile ma doświadczenia i ile to kosztuje — bez pośpiechu i bez presji.
                  </p>
                </div>
              </motion.div>

              {/* Pay for real help */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                className="flex gap-6 items-start group"
              >
                <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                  <PayForRealHelpIcon className="w-14 h-14 md:w-16 md:h-16" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-playfair text-xl sm:text-2xl text-foreground font-light leading-snug">
                    <span className="font-bold">Płacisz</span> tylko za realną pomoc
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-2">
                    Założenie konta nic nie kosztuje. Nie płacisz nam za rejestrację, nie dopłacasz żadnej
                    prowizji — ani teraz, ani później. Rozliczasz się wprost z wybranym specjalistą za konkretną
                    pomoc. Żadnych ukrytych opłat po drodze.
                  </p>
                </div>
              </motion.div>

              {/* Not only lawyers */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                className="flex gap-6 items-start group"
              >
                <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                  <NotOnlyLawyersIcon className="w-14 h-14 md:w-16 md:h-16" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-playfair text-xl sm:text-2xl text-foreground font-light leading-snug">
                    Nie tylko <span className="font-bold">prawnicy</span>
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-2">
                    Nie każda sprawa to od razu sąd i paragrafy. Znajdziesz tu też rzeczoznawców, doradców
                    finansowych, księgowych, architektów i innych specjalistów. Gdy jeden problem zahacza
                    o kilka dziedzin — masz wszystkich w jednym miejscu.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Benefits Grid */}
      <section className="relative bg-card py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-border/60 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-teal-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative z-10">

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl sm:text-4xl lg:text-[40px] text-foreground font-light leading-tight text-center mb-4"
          >
            Dlaczego z nami <span className="font-bold">wygrywasz?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground text-sm sm:text-base text-center max-w-2xl mx-auto mb-16"
          >
            Bo zamiast obdzwaniać pół miasta, opisujesz sprawę raz i to specjaliści zgłaszają się do Ciebie.
            Widzisz, z kim masz do czynienia, i wybierasz sam.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <ConcreteHelpIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Konkret zamiast ogólników
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Nie znajdziesz tu darmowych porad rzucanych w powietrze. Specjalista, który odpowiada
                  na Twoją sprawę, robi to świadomie i od razu proponuje konkretną współpracę — nie zdawkowe
                  „to zależy". Dostajesz propozycję, na której da się coś zbudować.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <TrustDecisionIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Ty decydujesz, komu zaufasz
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Wybór należy do Ciebie. Zanim się zdecydujesz, sprawdzasz profil: doświadczenie,
                  publikacje, zakres usług. Masz przed sobą to, czego potrzebujesz, żeby wybrać świadomie
                  — nie w ciemno.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <AllInOnePlaceIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Wszystko w jednym miejscu
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Po założeniu konta dostajesz własny panel: czat ze specjalistą, szybkie dodawanie nowych
                  spraw i pełna historia zgłoszeń. Komunikacja uporządkowana — bez szukania po mailach i SMS-ach.
                </p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <SecuredDataIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Twoje dane są chronione
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Twoje dane są ściśle chronione i przetwarzane tylko w naszym systemie.
                  Żadne informacje nie trafiają na zewnątrz bez Twojej wiedzy i zgody.
                </p>
              </div>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <MultiDisciplinaryIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Eksperci z wielu dziedzin
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Prawnicy, rzeczoznawcy, doradcy finansowi, księgowi, architekci i inni. Gdy problem zahacza
                  o kilka dziedzin — masz wszystkich w jednym miejscu i nie musisz szukać każdego z osobna.
                </p>
              </div>
            </motion.div>

            {/* Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col gap-5 group hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)] transition-all duration-300"
            >
              <div className="text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <SimpleStartIcon />
              </div>
              <div>
                <h3 className="font-playfair text-lg sm:text-xl text-foreground font-normal mb-3">
                  Pierwszy krok jest prosty
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Opisujesz sprawę raz. Widzisz, z kim masz do czynienia, i wybierasz sam. Płacisz tylko
                  za realną pomoc, bez żadnej prowizji. Dokładnie po to powstała ProstaSprawa.pl.
                </p>
              </div>
            </motion.div>

          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mt-16"
          >
            <Link href="/logowanie">
              <InteractiveHoverButton>Opisz swoją sprawę i sprawdź, kto się zgłosi</InteractiveHoverButton>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Section 3: Process */}
      <section className="relative bg-background py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-border/60 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative z-10">

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl sm:text-4xl lg:text-[40px] text-foreground font-light text-center leading-tight mb-20 max-w-3xl mx-auto"
          >
            <span className="text-sm tracking-[0.25em] text-[#0da192] uppercase block mb-3">Jak zacząć:</span>
            Opisz swoją sprawę i&nbsp;zobacz, kto się do&nbsp;niej&nbsp;<span className="font-bold">zgłosi</span>
          </motion.h2>

          <div className="flex flex-col gap-16 max-w-5xl mx-auto mb-16">

            {/* Card 1: Zadaj pytanie przez platformę */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative bg-card border border-border/80 rounded-3xl p-8 md:p-12 transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)]"
            >
              <div className="absolute -top-6 left-8 px-6 py-2 bg-background border border-border/80 rounded-xl flex items-center justify-center shadow-lg z-20">
                <span className="font-playfair text-foreground font-bold text-3xl leading-none">01</span>
              </div>

              <h3 className="font-playfair text-xl sm:text-2xl text-foreground font-normal text-center mb-16 mt-4">
                Aby zadać pytanie za pośrednictwem ProstaSprawa.pl, wystarczą trzy kroki:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">

                <svg viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-[35px] left-0 w-full h-20 pointer-events-none z-0 hidden md:block">
                  <path d="M 50,40 C 200,0 250,80 400,40 C 550,0 600,80 750,40"
                    stroke="#2a2926" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="50" cy="40" r="4.5" fill="#fff" />
                  <g transform="translate(740, 27) scale(0.65)" fill="#666">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </g>
                </svg>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">01</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <DescribeCaseIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Opisz<br />swoją sprawę
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Zakładasz darmowe konto i w kilku zdaniach piszesz, z czym potrzebujesz pomocy. Wybierasz
                    kategorię i lokalizację. Nie musisz znać przepisów — wystarczy napisać po ludzku.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">02</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <ReceiveOffersIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Odbierz oferty<br />od specjalistów
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Twoja sprawa trafia do specjalistów, których profil i doświadczenie do niej pasują.
                    Ci, którzy chcą się nią zająć, sami się do Ciebie zgłaszają z konkretną propozycją.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">03</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <ChooseAndActIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Wybierz<br />i działaj
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Porównujesz zgłoszenia: zakres pomocy, doświadczenie, cenę. Sprawdzasz profil każdego
                    specjalisty i wybierasz tego, przy którym czujesz się najpewniej. Rozliczasz się z nim wprost.
                  </p>
                </div>

              </div>

              <div className="border-t border-border/40 pt-8 mt-12 flex flex-col items-center gap-3">
                <span className="text-[#2b8265] font-playfair font-bold text-sm tracking-wider uppercase">Bezpłatnie</span>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed max-w-2xl text-center">
                  Założenie konta i publikacja sprawy są całkowicie bezpłatne. Nie pobieramy żadnej prowizji —
                  rozliczasz się wyłącznie z wybranym specjalistą, za konkretną pomoc, którą od niego dostajesz.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Bezpośredni kontakt z prawnikiem */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-card border border-border/80 rounded-3xl p-8 md:p-12 transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)]"
            >
              <div className="absolute -top-6 left-8 px-6 py-2 bg-background border border-border/80 rounded-xl flex items-center justify-center shadow-lg z-20">
                <span className="font-playfair text-foreground font-bold text-3xl leading-none">02</span>
              </div>

              <h3 className="font-playfair text-xl sm:text-2xl text-foreground font-normal text-center mb-16 mt-4">
                Aby bezpośrednio skontaktować się z prawnikiem, wystarczą trzy kroki:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">

                <svg viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-[35px] left-0 w-full h-20 pointer-events-none z-0 hidden md:block">
                  <path d="M 50,40 C 200,0 250,80 400,40 C 550,0 600,80 750,40"
                    stroke="#2a2926" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="50" cy="40" r="4.5" fill="#fff" />
                  <g transform="translate(740, 27) scale(0.65)" fill="#666">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </g>
                </svg>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">01</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <SearchLawyerIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Wybierz prawnika<br />z listy
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Przeglądasz profile i zawężasz listę: specjalizacja, miasto, rodzaj sprawy. Nie musisz
                    nikomu opisywać problemu z góry — po prostu wybierasz osobę, która pasuje Ci najbardziej.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">02</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <DirectWriteIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Napisz<br />wprost do niego
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Przy profilu masz przycisk kontaktu. Zakładasz darmowe konto, otwierasz czat i piszesz
                    od razu do tej jednej, konkretnej osoby. Bez pośredników.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">03</div>
                  <div className="mb-6 bg-card border border-border/80 rounded-2xl p-4 shadow-lg flex items-center justify-center w-24 h-24 relative z-10 transition-transform duration-300 hover:scale-105 text-[#2b8265] hover:text-emerald-400">
                    <ScheduleMeetingIcon />
                  </div>
                  <h4 className="text-foreground font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Umówcie rozmowę<br />lub spotkanie
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed text-center max-w-[240px]">
                    Prawnik odpisuje w czacie, a jak temat jest szerszy — ustalacie telefon albo spotkanie
                    online. Warunki i cenę dogadujecie między sobą, bez prowizji dla platformy.
                  </p>
                </div>

              </div>

              <div className="border-t border-border/40 pt-8 mt-12 flex flex-col items-center gap-3">
                <span className="text-[#2b8265] font-playfair font-bold text-sm tracking-wider uppercase">Bez prowizji</span>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed max-w-2xl text-center">
                  Kontakt z ekspertem jest całkowicie bezpłatny i nie wiąże się z żadnymi opłatami na rzecz serwisu.
                  Warunki współpracy i wysokość honorarium ustalasz bezpośrednio z wybraną osobą.
                </p>
              </div>
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-24"
          >
            <Link href="/logowanie">
              <InteractiveHoverButton>Załóż bezpłatne konto!</InteractiveHoverButton>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Section 4: Online meetings */}
      <section className="relative bg-card py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-border/60 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-amber-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center relative"
            >
              <div className="relative w-full max-w-[420px]">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/80 aspect-square">
                  <Image
                    src="/images/spotkanie_online.webp"
                    alt="Spotkanie online z ekspertem"
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover"
                    priority
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 bg-card/95 border border-border/60 rounded-2xl shadow-2xl flex items-center justify-center p-5 z-20 backdrop-blur-sm"
                >
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="emerald-meet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0da192" />
                        <stop offset="50%" stopColor="#2b8265" />
                        <stop offset="100%" stopColor="#065f46" />
                      </linearGradient>
                    </defs>
                    <rect x="10" y="25" width="55" height="50" rx="8" stroke="url(#emerald-meet-grad)" strokeWidth="6" />
                    <path d="M65 42l25-12v40L65 58V42z" stroke="url(#emerald-meet-grad)" strokeWidth="6" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              <p className="text-[#0da192] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
                Spotkania online
              </p>

              <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[42px] text-foreground font-light leading-tight tracking-tight mb-6">
                Ważne: spotkania online umówisz{" "}
                <span className="font-bold">bezpośrednio na platformie</span>
              </h2>

              <div className="flex flex-col gap-5 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
                <p>
                  Nie musisz nic dogrywać przez telefon ani mailowo. Prawnik wpisuje w systemie swoje wolne
                  terminy, a Ty wybierasz ten, który Ci pasuje, i rezerwujesz go od ręki. Po rezerwacji
                  i opłaceniu terminu masz spotkanie ustawione — nie trzeba do tego wracać.
                </p>
                <p>
                  Link do Google Meet generuje się automatycznie na 30 minut przed spotkaniem, więc nie
                  musisz go szukać ani przepisywać. Przypomnienie dostajesz na maila i w swoim dashboardzie
                  na koncie ProstaSprawa.pl.
                </p>
                <p className="text-foreground/80 font-medium">
                  Wchodzisz, klikasz i rozmawiasz.
                </p>
              </div>

              <div className="flex flex-col gap-4 mb-10">
                {[
                  "Wolne terminy widoczne bezpośrednio na profilu eksperta",
                  "Rezerwacja od ręki — bez mailowania i telefonowania",
                  "Link do Google Meet generuje się automatycznie",
                  "Przypomnienie na maila i w panelu na koncie",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="8" stroke="#2b8265" strokeWidth="1.5" />
                        <path d="M5.5 9l2.5 2.5 5-5" stroke="#2b8265" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-foreground/80 text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Link href="/logowanie">
                <InteractiveHoverButton>Załóż bezpłatne konto!</InteractiveHoverButton>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 5: Final CTA */}
      <section className="relative bg-background py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-border/60 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/80 aspect-[730/296] w-full mb-12"
          >
            <Image
              src="/images/lawyers_meeting.png"
              alt="Zespół specjalistów ProstaSprawa.pl"
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-3xl sm:text-4xl text-foreground font-normal mb-8 text-left"
          >
            Dlaczego z nami wygrywasz?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-5 text-muted-foreground text-sm sm:text-base leading-relaxed text-left mb-16"
          >
            <p>
              Bo zamiast obdzwaniać pół miasta, opisujesz sprawę raz i to specjaliści zgłaszają się do Ciebie.
              Widzisz, z kim masz do czynienia, i wybierasz sam.
            </p>
            <p>
              Płacisz tylko za realną pomoc, bez żadnej prowizji. Masz dostęp nie tylko do prawników,
              ale też do rzeczoznawców, doradców finansowych, księgowych, architektów i innych ekspertów
              — wszystkich w jednym miejscu.
            </p>
            <p>
              <span className="font-bold text-foreground">Pierwszy krok do rozwiązania problemu</span> robi się
              po prostu prosty. Dokładnie po to powstała{" "}
              <span className="font-bold text-foreground">ProstaSprawa.pl</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-border/40"
          >
            <p className="text-sm sm:text-base font-semibold text-foreground max-w-md text-left">
              Opisz swoją sprawę i&nbsp;zobacz, kto się do&nbsp;niej zgłosi.
            </p>
            <Link href="/logowanie">
              <InteractiveHoverButton>Załóż bezpłatne konto!</InteractiveHoverButton>
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  )
}
