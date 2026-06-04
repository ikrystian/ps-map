"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

export default function WinWithUsClientPage() {
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
              { label: "Z nami wygrywasz" },
            ]}
          />
        </div>
      </div>

      <section className="min-h-[calc(100vh-65px)] bg-[#121212] flex items-center justify-center py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects to match the premium theme */}
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Title, Description, CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left"
            >
              {/* Title */}
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight leading-tight mb-8">
                Dlaczego <span className="font-bold">ProstaSprawa.pl</span>?
              </h1>

              {/* Description */}
              <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed mb-10 max-w-xl">
                Naszym głównym celem jest zwiększenie dostępności bezpłatnej pomocy
                i informacji prawnej oraz promocja ekspertów z całej Polski. Pragniemy
                aby za pośrednictwem serwisu prostasprawa.pl każdy mógł szybko
                i bezproblemowo znaleźć odpowiedź na nurtujący go problem lub
                prawnika, który zajmie się kompleksowo jego zagadnieniem.
              </p>

              {/* CTA Button */}
              <Link href="/rejestracja">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#1e6b4f] text-white font-medium px-10 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-base tracking-wide"
                >
                  Dołącz
                </motion.button>
              </Link>
            </motion.div>

            {/* Right Column: Statistics / Benefits Section */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-12 lg:gap-16">
              
              {/* Benefit Item 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex gap-6 items-start group"
              >
                {/* Icon 1: Custom SVG matching Growth Chart & User */}
                <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-14 h-14 md:w-16 md:h-16"
                  >
                    {/* Bars of the chart */}
                    <line x1="12" y1="40" x2="12" y2="28" />
                    <line x1="20" y1="40" x2="20" y2="20" />
                    <line x1="28" y1="40" x2="28" y2="14" />
                    {/* Horizontal baseline */}
                    <line x1="6" y1="40" x2="36" y2="40" />
                    
                    {/* Line graph line with arrow */}
                    <path d="M12 24L20 16L28 10L38 15" />
                    <path d="M32 10H38V16" />

                    {/* Circular User Avatar Overlay */}
                    <circle cx="43" cy="38" r="9" fill="#121212" className="fill-[#121212] group-hover:fill-[#1a1a1a] transition-colors duration-300" />
                    <circle cx="43" cy="38" r="9" />
                    <circle cx="43" cy="34" r="2.5" />
                    <path d="M37 43C37 40.5 40 39.5 43 39.5C46 39.5 49 40.5 49 43" />
                  </svg>
                </div>

                {/* Text Block 1 */}
                <div className="flex-1 text-left">
                  {/* Header */}
                  <h3 className="font-playfair text-xl sm:text-2xl text-white font-light leading-snug">
                    <span className="font-bold">18 mln</span> użytkowników
                  </h3>
                  {/* Highlight line */}
                  <p className="text-neutral-200 font-sans text-sm sm:text-base font-medium mt-1 mb-2 leading-relaxed">
                    miesięcznie odwiedza nasze serwisy.
                  </p>
                  {/* Paragraph */}
                  <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                    Od ponad 10 lat aktywnie wpływamy na rynek usług prawnych w Polsce!
                    Każdy nasz użytkownik może zostać Twoim klientem.
                  </p>
                </div>
              </motion.div>

              {/* Benefit Item 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="flex gap-6 items-start group"
              >
                {/* Icon 2: Custom SVG matching Document & Search */}
                <div className="flex-shrink-0 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300 pt-1">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-14 h-14 md:w-16 md:h-16"
                  >
                    {/* Document container */}
                    <rect x="10" y="8" width="30" height="40" rx="3" />
                    {/* Text lines in document */}
                    <line x1="16" y1="16" x2="30" y2="16" />
                    <line x1="16" y1="24" x2="34" y2="24" />
                    <line x1="16" y1="32" x2="26" y2="32" />
                    <line x1="16" y1="40" x2="22" y2="40" />

                    {/* Magnifying Glass Overlay */}
                    <circle cx="43" cy="38" r="8" fill="#121212" className="fill-[#121212] group-hover:fill-[#1a1a1a] transition-colors duration-300" />
                    <circle cx="43" cy="38" r="8" />
                    <line x1="48.5" y1="43.5" x2="53" y2="48" />
                  </svg>
                </div>

                {/* Text Block 2 */}
                <div className="flex-1 text-left">
                  {/* Header */}
                  <h3 className="font-playfair text-xl sm:text-2xl text-white font-light leading-snug">
                    <span className="font-bold">Ponad 150 osób</span> dziennie
                  </h3>
                  {/* Highlight line */}
                  <p className="text-neutral-200 font-sans text-sm sm:text-base font-medium mt-1 mb-2 leading-relaxed">
                    szuka w naszym serwisie porady prawnej lub odpowiedniego
                    Prawnika, który kompleksowo pokieruje daną kwestią.
                  </p>
                  {/* Paragraph */}
                  <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                    Możliwość zadania bezpłatnego pytania oraz intuicyjna, prosta w obsłudze
                    wyszukiwarka ułatwiają podjęcie świadomej decyzji, w wyborze
                    odpowiedniej ścieżki działania.
                  </p>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* New Section: Użytkowniku, dlaczego ProstaSprawa.pl? */}
      <section className="relative bg-[#181816] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-teal-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative z-10 text-center">
          
          {/* Section Heading */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl sm:text-4xl lg:text-[40px] text-white font-light leading-tight mb-20"
          >
            Użytkowniku, dlaczego <span className="font-bold">ProstaSprawa.pl</span>?
          </motion.h2>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            
            {/* Column 1: Bezpłatne pytanie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon 1: Speech bubble with question mark */}
              <div className="mb-6 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-16 h-16"
                >
                  <path d="M46 38c0 5.5-4.5 10-10 10H22l-8 8V48c-3.3 0-6-2.7-6-6V22c0-3.3 2.7-6 6-6h24c3.3 0 6 2.7 6 6v16z" />
                  <path d="M48 24h4c3.3 0 6 2.7 6 6v16l-8-8H44" opacity="0.5" />
                  <path d="M26 26c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5c0 2-3 3-3 3" />
                  <circle cx="29" cy="34" r="1.2" fill="currentColor" />
                </svg>
              </div>

              {/* Subheading */}
              <h3 className="font-playfair text-xl sm:text-2xl text-white font-normal mb-4">
                Bezpłatne pytanie
              </h3>

              {/* Paragraph */}
              <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Jako użytkownik serwisu prostasprawa.pl możesz w łatwy i szybki sposób uzyskać poradę prawną, bezpośrednio w swojej sprawie. Zadając anonimowo, bezpłatne pytanie, otrzymujesz informację prawną, odnoszącą się bezpośrednio do opisanej sytuacji.
              </p>

              {/* Button */}
              <Link href="/pytania">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#1e6b4f] text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-sm sm:text-base tracking-wide"
                >
                  Zobacz pytania
                </motion.button>
              </Link>
            </motion.div>

            {/* Column 2: Wyszukiwarka prawników */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon 2: Lawyer with scales */}
              <div className="mb-6 text-[#2b8265] group-hover:text-emerald-400 transition-colors duration-300">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-16 h-16"
                >
                  <circle cx="26" cy="18" r="6" />
                  <path d="M20 18c0-3 3-4 6-4s6 1 6 4" />
                  <path d="M12 48c0-5 4-9 9-9h10c5 0 9 4 9 9v4H12v-4z" />
                  <path d="M26 39v6l-2-2z" />
                  <path d="M21 39l5 4 5-4" />
                  <path d="M48 26h12" />
                  <path d="M54 18v26" />
                  <path d="M54 44h4M54 44h-4" />
                  <path d="M48 26l-2 8h4l-2-8z" />
                  <path d="M46 34c0 1.5 1 2 2 2s2-.5 2-2" />
                  <path d="M60 26l-2 8h4l-2-8z" />
                  <path d="M58 34c0 1.5 1 2 2 2s2-.5 2-2" />
                </svg>
              </div>

              {/* Subheading */}
              <h3 className="font-playfair text-xl sm:text-2xl text-white font-normal mb-4">
                Wyszukiwarka prawników
              </h3>

              {/* Paragraph */}
              <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Wolisz bezpośrednie rozwiązania? Skorzystaj z naszej wyszukiwarki i znajdź Prawnika z Twojej okolicy. W serwisie prostasprawa.pl zarejestrowani są Eksperci z całej Polski.
              </p>

              {/* Button */}
              <Link href="/szukaj-prawnika">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#1e6b4f] text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-sm sm:text-base tracking-wide"
                >
                  Zobacz prawnika
                </motion.button>
              </Link>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Section 3: Prawniku, dlaczego warto współpracować z ProstaSprawa.pl? */}
      <section className="relative bg-[#121212] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
        {/* Ambient glows to match premium theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-amber-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Image with overlapping Gold Double Checkmark Logo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center relative"
            >
              <div className="relative w-full max-w-[420px]">
                {/* Main Lawyer Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 aspect-square">
                  <Image
                    src="/images/lawyer_with_coffee.png"
                    alt="Prawnik przy komputerze z kawą"
                    fill
                    sizes="(max-w-768px) 100vw, 420px"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Overlapping gold double checkmark logo container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 bg-[#1e1d1a]/95 border border-neutral-700/60 rounded-2xl shadow-2xl flex items-center justify-center p-5 z-20 backdrop-blur-sm"
                >
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="50%" stopColor="#f3e5ab" />
                        <stop offset="100%" stopColor="#aa7c11" />
                      </linearGradient>
                    </defs>
                    {/* First checkmark */}
                    <path
                      d="M20 50 L40 70 L80 30"
                      stroke="url(#gold-grad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Second overlapping checkmark (offset) */}
                    <path
                      d="M32 58 L46 72 L76 42"
                      stroke="url(#gold-grad)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column: Text content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              {/* Heading */}
              <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[42px] text-white font-light leading-tight tracking-tight mb-4">
                <span className="font-bold">Prawniku</span>, dlaczego warto współpracować z <span className="font-bold text-white">ProstaSprawa.pl</span>?
              </h2>

              {/* Tagline/Label */}
              <p className="text-[#0da192] font-sans text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-6">
                BUDOWANIE MARKI
              </p>

              {/* Paragraph */}
              <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
                W dzisiejszych czasach internet jest pierwszym miejscem, za pośrednictwem którego klienci wyszukują interesujące ich informacje czy usługi. Praktycznie każdą działalność człowieka, można już wykonać za pośrednictwem komputera czy smartfona. Nie można pominąć tego medium, jeśli chcemy aby informacja o prowadzonej działalności dotarła do usługobiorców. Obecność w Internecie nie jest już opcją- tylko koniecznością.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 4: Działanie serwisu: Serwis ProstaSprawa.pl pozwala uzyskać pomoc prawną w dwojaki sposób: */}
      <section className="relative bg-[#181816] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          
          {/* Section Heading */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl sm:text-4xl lg:text-[40px] text-white font-light text-center leading-tight mb-20 max-w-3xl mx-auto"
          >
            <span className="text-sm font-sans tracking-[0.25em] text-[#0da192] uppercase block mb-3">Działanie serwisu:</span>
            Serwis ProstaSprawa.pl pozwala <br />
            <span className="font-bold">uzyskać pomoc prawną</span> w dwojaki sposób:
          </motion.h2>

          {/* Cards Grid */}
          <div className="flex flex-col gap-16 max-w-5xl mx-auto mb-16">
            
            {/* Card 1: Zadaj pytanie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative bg-[#1a1916] border border-neutral-800/80 rounded-3xl p-8 md:p-12 transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)]"
            >
              {/* Overlapping Badge */}
              <div className="absolute -top-6 left-8 px-6 py-2 bg-[#111110] border border-neutral-800/80 rounded-xl flex items-center justify-center shadow-lg z-20">
                <span className="font-playfair text-white font-bold text-3xl leading-none">01</span>
              </div>

              {/* Title */}
              <h3 className="font-playfair text-xl sm:text-2xl text-neutral-200 font-normal text-center mb-16 mt-4">
                Aby zadać pytanie za pośrednictwem ProstaSprawa.pl należy:
              </h3>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                
                {/* Connecting Curved Dotted SVG Line (only visible on md+) */}
                <svg
                  viewBox="0 0 800 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-[35px] left-0 w-full h-20 pointer-events-none z-0 hidden md:block"
                >
                  <path
                    d="M 50,40 C 200,0 250,80 400,40 C 550,0 600,80 750,40"
                    stroke="#2a2926"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                  <circle cx="50" cy="40" r="4.5" fill="#fff" />
                  <g transform="translate(740, 27) scale(0.65)" fill="#666">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </g>
                </svg>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    01
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* Envelope Icon with nested phone circle */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 12 L20 22 L36 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="28" cy="22" r="7" fill="#1e1d1a" stroke="currentColor" strokeWidth="1.5" />
                      {/* Phone inside circle */}
                      <path d="M26 20 C26 21.5 27 23 29 23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M25.5 19.5 L26.5 20.5 L26 21 C26.5 21.5 27 22 27.5 21.5 L28 21 L29 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Uzupełnić <br />
                    adres e-mail
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    na podany adres przesyłana jest informacja o pojawieniu się nowej odpowiedzi, jednak sam adres e-mail nie jest podawany do publicznej wiadomości;
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    02
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* Document Icon with nested phone circle */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <rect x="7" y="6" width="26" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 12 H28 M12 18 H22 M12 24 H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="28" cy="24" r="7" fill="#1e1d1a" stroke="currentColor" strokeWidth="1.5" />
                      {/* Phone inside circle */}
                      <path d="M26 22 C26 23.5 27 25 29 25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M25.5 21.5 L26.5 22.5 L26 23 C26.5 23.5 27 24 27.5 23.5 L28 23 L29 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Uzupełnić pole <br />
                    "Zadaj pytanie"
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    służy ono do określenia przedmiotu opisywanej sprawy;
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    03
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* User profile Icon with nested phone receiver */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <circle cx="20" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 30 C8 24 13 22 20 22 C27 22 32 24 32 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="29" cy="24" r="7" fill="#1e1d1a" stroke="currentColor" strokeWidth="1.5" />
                      {/* Phone inside circle */}
                      <path d="M27 22 C27 23.5 28 25 30 25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M26.5 21.5 L27.5 22.5 L27 23 C27.5 23.5 28 24 28.5 23.5 L29 23 L30 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Uzupełnić pole <br />
                    "Wyjaśnij sytuację"
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    tutaj pytający może zaprezentować kontekst opisywanej sytuacji w celu lepszego jej zobrazowania;
                  </p>
                </div>

              </div>

              {/* Extra info text below columns */}
              <p className="text-neutral-300 font-playfair text-sm sm:text-base italic text-center mt-12 mb-8 max-w-3xl mx-auto leading-relaxed">
                Osoba zadająca pytanie ma również możliwość wybrania kategorii, której ono dotyczy, jednak nie jest to krok obowiązkowy.
              </p>

              {/* Disclaimer / Warning */}
              <div className="border-t border-neutral-800/40 pt-8 mt-12 flex flex-col items-center gap-3">
                <span className="text-[#2b8265] font-playfair font-bold text-sm tracking-wider uppercase">Ważne!</span>
                <p className="text-neutral-500 font-sans text-[11px] sm:text-xs leading-relaxed max-w-2xl text-center">
                  Tekst, który Użytkownik umieści w powyższych polach zostanie w całości opublikowany w serwisie - bez uprzedniej moderacji. Mając więc na uwadze bezpieczeństwo naszych użytkowników nie zalecamy podawania żadnych danych osobowych w tychże polach.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Wyszukaj Prawnika */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-[#1a1916] border border-neutral-800/80 rounded-3xl p-8 md:p-12 transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.05)]"
            >
              {/* Overlapping Badge */}
              <div className="absolute -top-6 left-8 px-6 py-2 bg-[#111110] border border-neutral-800/80 rounded-xl flex items-center justify-center shadow-lg z-20">
                <span className="font-playfair text-white font-bold text-3xl leading-none">02</span>
              </div>

              {/* Title */}
              <h3 className="font-playfair text-xl sm:text-2xl text-neutral-200 font-normal text-center mb-16 mt-4">
                Aby bezpośrednio skontaktować się z Prawnikiem należy:
              </h3>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                
                {/* Connecting Curved Dotted SVG Line (only visible on md+) */}
                <svg
                  viewBox="0 0 800 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-[35px] left-0 w-full h-20 pointer-events-none z-0 hidden md:block"
                >
                  <path
                    d="M 50,40 C 200,0 250,80 400,40 C 550,0 600,80 750,40"
                    stroke="#2a2926"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                  <circle cx="50" cy="40" r="4.5" fill="#fff" />
                  <g transform="translate(740, 27) scale(0.65)" fill="#666">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </g>
                </svg>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    01
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* Search / Glass Icon */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="22" y1="22" x2="32" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="28" cy="28" r="5" fill="#1e1d1a" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Wyszukać <br />
                    Eksperta
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    skorzystaj z naszej wyszukiwarki lub rankingu na stronie głównej, filtrując według specjalizacji i lokalizacji;
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    02
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* Star / Profile review icon */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 12 H22 M12 18 H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <polygon points="16,24 18,28 22,28 19,30 20,34 16,32 12,34 13,30 10,28 14,28" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Zapoznać się <br />
                    z profilem
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    przeczytaj opinie innych klientów, sprawdź zakres oferowanej pomocy prawnej, cennik oraz dotychczasową aktywność;
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute -top-12 text-neutral-800/10 font-playfair font-bold text-[100px] pointer-events-none select-none">
                    03
                  </div>
                  <div className="mb-6 bg-[#1e1d1a] border border-neutral-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-center w-20 h-20 relative z-10 transition-transform duration-300 hover:scale-105">
                    {/* Calendar / Telephone icon */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2b8265]">
                      <rect x="6" y="8" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6 14 H34 M12 6 V10 M28 6 V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="28" cy="24" r="7" fill="#1e1d1a" stroke="currentColor" strokeWidth="1.5" />
                      {/* Phone inside circle */}
                      <path d="M26 22 C26 23.5 27 25 29 25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M25.5 21.5 L26.5 22.5 L26 23 C26.5 23.5 27 24 27.5 23.5 L28 23 L29 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-playfair text-lg font-normal mb-3 text-center leading-snug">
                    Nawiązać <br />
                    kontakt
                  </h4>
                  <p className="text-neutral-500 font-sans text-xs leading-relaxed text-center max-w-[240px]">
                    zadzwoń pod wskazany numer telefonu, wyślij wiadomość bezpośrednią lub zarezerwuj dogodny termin konsultacji;
                  </p>
                </div>

              </div>

              {/* Extra info text below columns */}
              <p className="text-neutral-300 font-playfair text-sm sm:text-base italic text-center mt-12 mb-8 max-w-3xl mx-auto leading-relaxed">
                Kontakt z Ekspertem jest całkowicie bezpłatny i nie wiąże się z żadnymi opłatami na rzecz serwisu.
              </p>

              {/* Disclaimer / Warning */}
              <div className="border-t border-neutral-800/40 pt-8 mt-12 flex flex-col items-center gap-3">
                <span className="text-[#2b8265] font-playfair font-bold text-sm tracking-wider uppercase">Ważne!</span>
                <p className="text-neutral-500 font-sans text-[11px] sm:text-xs leading-relaxed max-w-2xl text-center">
                  Warunki ewentualnej współpracy oraz wysokość honorarium są ustalane bezpośrednio pomiędzy Klientem a Prawnikiem. Serwis ProstaSprawa.pl nie pośredniczy w tych ustaleniach.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-24"
          >
            <Link href="/pytania">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#1e6b4f] text-white font-medium px-10 py-4 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-base tracking-wide"
              >
                Przejrzyj nasze najnowsze pytania
              </motion.button>
            </Link>
          </motion.div>

          {/* Disclaimer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="border-t border-neutral-900/60 pt-10 max-w-4xl mx-auto text-center flex flex-col gap-3"
          >
            <p className="text-neutral-500 font-sans text-xs leading-relaxed">
              Wszystkie dostępne w serwisie ProstaSprawa.pl rodzaje promocji działalności prawniczej są zgodne z zasadami etyki zawodowej.
            </p>
            <p className="text-neutral-500 font-sans text-xs leading-relaxed">
              Zniesienie ograniczenia terytorialnego pozwala Prawnikowi dzięki serwisowi prostasprawa.pl docierać ze swoimi usługami i wiedzą nie tylko do osób w swoim regionie, ale i z całej Polski.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Section 5: Ranking */}
      <section className="relative bg-[#121212] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-r from-amber-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full relative z-10">
          
          {/* Top Banner Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 aspect-[730/296] w-full mb-12"
          >
            <Image
              src="/images/lawyers_meeting.png"
              alt="Spotkanie prawników"
              fill
              sizes="(max-w-1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-3xl sm:text-4xl text-white font-normal mb-8 text-left"
          >
            Ranking
          </motion.h2>

          {/* Paragraphs */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 text-neutral-400 font-sans text-sm sm:text-base leading-relaxed text-left mb-16"
          >
            <p>
              <span className="font-bold text-white">ProstaSprawa.pl</span> stawia na najlepszych! Jako serwis chcemy promować naszych najbardziej aktywnych użytkowników. W tym celu prowadzimy ranking ekspertów, uwzględniający ich działania w serwisie ProstaSprawa.pl.
            </p>
            <p>
              Chcesz abyśmy promowali właśnie Ciebie? Wszystko jest w Twoich rękach. Twoje zaangażowanie i rzetelność pozwoli Ci na dotarcie do szerszego grona potencjalnych klientów. Wyższa pozycja w naszym rankingu to więcej wyświetleń Twojej wizytówki przez użytkowników serwisu i za profesjonalne przeglądarki. Naszych najlepszych prawników promujemy również na stronach zewnętrznych zaprzyjaźnionych serwisów za pośrednictwem dynamicznych widgetów.
            </p>
            <p>
              Pamiętaj - im bardziej aktywny jesteś, tym bardziej jesteś widoczny. Zacznij działać już dziś i nie zmarnuj swojej szansy.
            </p>
          </motion.div>

          {/* Bottom Bar: Text + CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-neutral-800/40"
          >
            <p className="font-sans text-sm sm:text-base font-semibold text-white max-w-md text-left">
              Twoja widoczność w serwisie prostasprawa.pl zależy więc tylko od Ciebie.
            </p>
            <Link href="/ranking">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#247e5d" }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#1e6b4f] text-white font-medium px-8 py-3.5 rounded-lg shadow-lg hover:shadow-emerald-950/25 transition-all duration-300 cursor-pointer font-sans text-base tracking-wide whitespace-nowrap"
              >
                Zobacz naszych najlepszych ekspertów
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  )
}
