/**
 * Hero Block - Sekcja główna z nagłówkiem i przyciskiem CTA
 */
export default function HeroBlock() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">
          Witaj w Naszej Firmie Prawniczej
        </h1>
        <p className="text-xl mb-8 text-blue-100">
          Profesjonalne doradztwo prawne dla Twojego biznesu. Ponad 20 lat doświadczenia.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/kontakt"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Skontaktuj się z nami
          </a>
          <a
            href="/uslugi"
            className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Nasze usługi
          </a>
        </div>
      </div>
    </section>
  )
}
