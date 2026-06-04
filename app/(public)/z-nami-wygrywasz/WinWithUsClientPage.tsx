"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export default function WinWithUsClientPage() {
  return (
    <>
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

      {/* New Section: Prawniku, dlaczego warto współpracować z ProstaSprawa.pl? */}
      <section className="relative bg-[#181816] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
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

                {/* Overlapping Gold Double Checkmark Logo */}
                <div className="absolute -right-8 -bottom-8 w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 z-20 pointer-events-none drop-shadow-[0_15px_30px_rgba(202,138,4,0.25)]">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="35%" stopColor="#eab308" />
                        <stop offset="70%" stopColor="#ca8a04" />
                        <stop offset="100%" stopColor="#854d0e" />
                      </linearGradient>
                    </defs>
                    {/* First/Back Checkmark */}
                    <path
                      d="M 12 50 L 32 70 L 80 22"
                      stroke="url(#gold-metallic)"
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Second/Front Checkmark, offset to the right & down */}
                    <path
                      d="M 28 50 L 44 66 L 90 20"
                      stroke="url(#gold-metallic)"
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
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

      {/* New Section: Serwis ProstaSprawa.pl pozwala na znalezienie klientów w dwojaki sposób */}
      <section className="relative bg-[#121212] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
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
            Serwis ProstaSprawa.pl pozwala na <br />
            <span className="font-bold">znalezienie klientów</span> w dwojaki sposób:
          </motion.h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto mb-16">
            
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              {/* Green circular badge */}
              <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-[#1b6349] flex items-center justify-center text-white font-bold text-lg shadow-lg z-20">
                01.
              </div>
              {/* Card Container */}
              <div className="bg-[#1a1916] border border-neutral-800/80 rounded-2xl p-8 pt-12 h-full flex flex-col justify-between transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.08)]">
                <div>
                  <h3 className="font-playfair text-xl sm:text-2xl text-white font-normal mb-6 leading-snug">
                    Kompleksowa <br />
                    <span className="font-bold">obsługa prawna.</span>
                  </h3>
                  <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                    Dzięki naszej platformie masz bezpośredni dostęp do szerokiej sieci doświadczonych prawników z całego kraju. Problemy związane z działalnością gospodarczą, kwestie podatkowe, spory pracownicze czy osobiste wyzwania prawne jak rozwód czy sprawy spadkowe - u nas znajdziesz wsparcie ekspertów z każdej dziedzin.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              {/* Green circular badge */}
              <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-[#1b6349] flex items-center justify-center text-white font-bold text-lg shadow-lg z-20">
                02.
              </div>
              {/* Card Container */}
              <div className="bg-[#1a1916] border border-neutral-800/80 rounded-2xl p-8 pt-12 h-full flex flex-col justify-between transition-all duration-300 hover:border-emerald-600/30 hover:shadow-[0_15px_30px_rgba(27,99,73,0.08)]">
                <div>
                  <h3 className="font-playfair text-xl sm:text-2xl text-white font-normal mb-6 leading-snug">
                    Odpowiadaj na pytania <br />
                    <span className="font-bold">i buduj zaufanie.</span>
                  </h3>
                  <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
                    Aktywność w serwisie przyciąga uwagę, budując równocześnie wizerunek eksperta, budzącego zaufanie klientów. Najbardziej aktywni Prawnicy są dodatkowo promowani w serwisie oraz na naszych zewnętrznych, zaprzyjaźnionych stronach.
                  </p>
                </div>
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

      {/* New Section: Ranking */}
      <section className="relative bg-[#181816] py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-neutral-900/60 flex items-center justify-center">
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
              Chcesz abyśmy promowali właśnie Ciebie? Wszystko jest w Twoich rękach. Twoje zaangażowanie i rzetelność pozwoli Ci na dotarcie do szerszego grona potencjalnych klientów. Wyższa pozycja w naszym rankingu to więcej wyświetleń Twojej wizytówki przez użytkowników serwisu i za pośrednictwem przeglądarek. Naszych najlepszych prawników promujemy również na stronach zewnętrznych zaprzyjaźnionych serwisów za pośrednictwem dynamicznych widgetów.
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
