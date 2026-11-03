/**
 * Seeduje TYLKO zastępstwa procesowe (/panel-eksperta/zastepstwa) — bez czyszczenia
 * reszty bazy. Dane demonstracyjne pokazują możliwie każdy wariant widoków: wszystkie
 * statusy, giełdę z pasującymi i niepasującymi zleceniami, zapytania imienne,
 * aplikantów, raporty, problemy, oceny, rozliczenia z kilku miesięcy i pliki.
 *
 * UWAGA: USUWA wszystkie dotychczasowe zlecenia zastępstw (z ofertami, danymi
 * poufnymi i plikami w .substitutions/), ustawienia zastępców i powiadomienia typu
 * ZASTEPSTWO, po czym zakłada dane od nowa — z datami liczonymi od chwili
 * uruchomienia, więc po kilku dniach warto puścić go ponownie.
 *
 * Wymaga kont z pełnego seeda (bun run db:seed). Konta aplikantów i adwokata bez
 * weryfikacji zakłada albo aktualizuje sam (hasło: Ekspert123!).
 *
 * Uruchomienie: bun run db:seed:substitutions
 */
import { prisma } from '../lib/prisma'
import { seedSubstitutions } from './seeds/substitutions'

async function main() {
  await seedSubstitutions(prisma)
  console.log('✅ Zastępstwa procesowe zseedowane.')
  console.log('------------------------------------------------------------')
  console.log('📌 Konta do sprawdzenia (konta z seeda mają hasło Ekspert123!):')
  console.log('   • krystian@bpcoders.pl               — r.pr., Lublin: wszystkie statusy, giełda, zapytania, rozliczenia')
  console.log('   • adwokat.wisniewski@ps-dev.com.pl   — adw., Warszawa: raport do wysłania, poranne zestawienie')
  console.log('   • adwokat.mazur@ps-dev.com.pl        — adw., Lublin: zapytanie do odpowiedzi, oferta zgaszona')
  console.log('   • aplikantka.kaminska@ps-dev.com.pl  — apl. adw., 2. rok: zastępstwo na upoważnienie, bez SN')
  console.log('   • aplikantka.wrobel@ps-dev.com.pl    — apl. radc., 3. rok: wybór, rezygnacja, anulowanie')
  console.log('   • aplikant.lewandowski@ps-dev.com.pl — apl. adw., 1. rok: jeszcze bez zastępstw')
  console.log('   • radca.kowalczyk@ps-dev.com.pl      — r.pr., Kraków: wstrzymane przyjmowanie zastępstw')
  console.log('   • prawopracy.szymanska@ps-dev.com.pl — adw., Poznań: brak zapisanych ustawień, pakiet bez SMS')
  console.log('   • adwokat.nowicki@ps-dev.com.pl      — adw. czekający na weryfikację (brak dostępu)')
  console.log('   • podatki.wojcik@ps-dev.com.pl       — doradca podatkowy (moduł niedostępny)')
  console.log('------------------------------------------------------------')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
