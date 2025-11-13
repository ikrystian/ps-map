/**
 * Contact Block - Sekcja kontaktowa z formularzem
 */
export const contactBlockHtml = `<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12">
      <!-- Left side - Contact Info -->
      <div>
        <h2 class="text-4xl font-bold mb-6 text-gray-900">
          Skontaktuj się z nami
        </h2>
        <p class="text-gray-600 mb-8">
          Jesteśmy tu, aby Ci pomóc. Wypełnij formularz lub skontaktuj się z nami bezpośrednio.
        </p>

        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Telefon</h3>
              <p class="text-gray-600">+48 123 456 789</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Email</h3>
              <p class="text-gray-600">kontakt@firma.pl</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Adres</h3>
              <p class="text-gray-600">ul. Prawnicza 10<br>00-001 Warszawa</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Form -->
      <div class="bg-gray-50 p-8 rounded-lg">
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Imię i nazwisko
            </label>
            <input
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jan Kowalski"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jan@example.com"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+48 123 456 789"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Wiadomość
            </label>
            <textarea
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Opisz swoją sprawę..."
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Wyślij wiadomość
          </button>
        </form>
      </div>
    </div>
  </div>
</section>`
