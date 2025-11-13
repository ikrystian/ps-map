/**
 * Testimonials Block - Sekcja z opiniami klientów
 */
export default function TestimonialsBlock() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Co mówią nasi klienci
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Profesjonalna obsługa i szybka pomoc w mojej sprawie. Bardzo polecam!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                AK
              </div>
              <div>
                <p className="font-semibold text-gray-900">Anna Kowalska</p>
                <p className="text-sm text-gray-500">Klient indywidualny</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Świetne doradztwo prawne dla naszej firmy. Kompleksowa obsługa."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-semibold text-purple-700">
                PN
              </div>
              <div>
                <p className="font-semibold text-gray-900">Piotr Nowak</p>
                <p className="text-sm text-gray-500">Właściciel firmy</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Bardzo zadowolona z obsługi. Sprawa została rozwiązana szybko i efektywnie."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center font-semibold text-green-700">
                MW
              </div>
              <div>
                <p className="font-semibold text-gray-900">Maria Wiśniewska</p>
                <p className="text-sm text-gray-500">Klient biznesowy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
