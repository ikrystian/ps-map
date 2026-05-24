/**
 * Hero Block - Sekcja główna z nagłówkiem i przyciskiem CTA
 */
export const heroBlockHtml = `<section class="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
  <div class="max-w-6xl mx-auto text-center">
    <h1 class="text-5xl font-bold mb-6">
      Witaj w Naszej Firmie Prawniczej
    </h1>
    <p class="text-xl mb-8 text-blue-100">
      Profesjonalne doradztwo prawne dla Twojego biznesu. Ponad 20 lat doświadczenia.
    </p>
    <div class="flex flex-col sm:flex-row gap-6 justify-center px-4">
      <a
        href="/kontakt"
        class="flex items-center justify-center min-w-[280px] h-[72px] bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-white font-medium text-base md:text-lg uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] text-center shadow-lg cursor-pointer"
      >
        Skontaktuj się z nami
      </a>
      <a
        href="/uslugi"
        class="flex items-center justify-center min-w-[280px] h-[72px] bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-white font-medium text-base md:text-lg uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] text-center shadow-lg cursor-pointer"
      >
        Nasze usługi
      </a>
    </div>
  </div>
</section>`
