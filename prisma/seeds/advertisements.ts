import { PrismaClient } from '@prisma/client'

export async function seedAdvertisements(prisma: PrismaClient) {
  console.log('Seeding advertisements and clients...')

  // 1. Create AdClients (Advertising Clients)
  const clientsData = [
    {
      name: 'Wydawnictwo Prawnicze LexisNexis',
      contactName: 'Anna Kowalska',
      contactEmail: 'a.kowalska@lexisnexis.pl',
      contactPhone: '+48 601 234 567',
      notes: 'Kluczowy partner, reklamy książek i publikacji prawniczych.',
      active: true,
    },
    {
      name: 'Ubezpieczenia TUiR Warta S.A.',
      contactName: 'Jan Kowalski',
      contactEmail: 'kontakt@warta.pl',
      contactPhone: '+48 22 555 00 00',
      notes: 'Ubezpieczenia OC i zawodowe dla prawników.',
      active: true,
    },
    {
      name: 'LegalTech Software Sp. z o.o.',
      contactName: 'Tomasz Nowak',
      contactEmail: 'tomasz@legaltech-software.pl',
      contactPhone: '+48 700 800 900',
      notes: 'System CRM/ERP dla kancelarii prawnych.',
      active: true,
    },
    {
      name: 'Kancelaria Finansowa Profit',
      contactName: 'Magdalena Rygiel',
      contactEmail: 'm.rygiel@kfprofit.pl',
      contactPhone: '+48 500 600 700',
      notes: 'Pożyczki, faktoring i leasing dla adwokatów.',
      active: true,
    },
    {
      name: 'Nieaktywny Reklamodawca S.A.',
      contactName: 'Piotr Wiśniewski',
      contactEmail: 'p.wisniewski@nieaktywny.pl',
      contactPhone: '+48 111 222 333',
      notes: 'Wstrzymana współpraca z powodu braku płatności.',
      active: false,
    },
  ]

  const createdClients = []
  for (const client of clientsData) {
    const created = await prisma.adClient.create({
      data: client,
    })
    createdClients.push(created)
  }

  console.log(`✓ Created ${createdClients.length} advertising clients.`)

  const clientLexis = createdClients.find(c => c.name.includes('LexisNexis'))!
  const clientWarta = createdClients.find(c => c.name.includes('Warta'))!
  const clientLegalTech = createdClients.find(c => c.name.includes('LegalTech'))!
  const clientProfit = createdClients.find(c => c.name.includes('Profit'))!
  const clientInactive = createdClients.find(c => c.name.includes('Nieaktywny'))!

  // 2. Create Advertisements (with different slots/locations, weights, active status, and mock impressions/clicks)
  const now = new Date()
  
  const pastDate = new Date()
  pastDate.setDate(now.getDate() - 30)
  
  const futureDate = new Date()
  futureDate.setDate(now.getDate() + 30)

  const adsData = [
    // Slot: search_top (Baner Góra)
    {
      name: 'OC dla Adwokatów i Radców Prawnych - Warta',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=728&h=90',
      linkUrl: 'https://www.warta.pl/ubezpieczenia-dla-prawnikow',
      location: 'search_top',
      active: true,
      impressions: 24500,
      clicks: 392, // ~1.6% CTR
      weight: 5,
      priority: 1,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientWarta.id,
    },
    {
      name: 'System CRM dla kancelarii - LegalTech',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=728&h=90',
      linkUrl: 'https://legaltech-software.pl/demo',
      location: 'search_top',
      active: true,
      impressions: 18200,
      clicks: 218, // ~1.2% CTR
      weight: 3,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLegalTech.id,
    },
    {
      name: 'Archiwalna promocja CRM - LegalTech',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=728&h=90',
      linkUrl: 'https://legaltech-software.pl/old-promo',
      location: 'search_top',
      active: true,
      impressions: 12000,
      clicks: 98,
      weight: 1,
      priority: 0,
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      endDate: pastDate, // ended 30 days ago
      clientId: clientLegalTech.id,
    },

    // Slot: search_list_middle (Baner Środek Listy)
    {
      name: 'LexisNexis - Księgarnia Prawnicza i Nowe Kodeksy',
      imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=728&h=90',
      linkUrl: 'https://www.lexisnexis.pl/nowosci-2026',
      location: 'search_list_middle',
      active: true,
      impressions: 15400,
      clicks: 185, // ~1.2% CTR
      weight: 2,
      priority: 2,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLexis.id,
    },
    {
      name: 'Kancelaria Finansowa Profit - Faktoring i płynność finansowa',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=728&h=90',
      linkUrl: 'https://kfprofit.pl/faktoring-dla-prawnikow',
      location: 'search_list_middle',
      active: true,
      impressions: 8900,
      clicks: 134, // ~1.5% CTR
      weight: 4,
      priority: 1,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientProfit.id,
    },

    // Slot: category_top (Kategoria - Baner Góra)
    {
      name: 'Zautomatyzuj obieg dokumentów w kancelarii - LegalTech',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=970&h=90',
      linkUrl: 'https://legaltech-software.pl/dokumenty',
      location: 'category_top',
      active: true,
      impressions: 31000,
      clicks: 527, // ~1.7% CTR
      weight: 3,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLegalTech.id,
    },
    {
      name: 'Ubezpieczenie na życie i zdrowie - Warta',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=970&h=90',
      linkUrl: 'https://warta.pl/ubezpieczenia-zyciowe',
      location: 'category_top',
      active: true,
      impressions: 21000,
      clicks: 294, // ~1.4% CTR
      weight: 2,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientWarta.id,
    },
    {
      name: 'Wstrzymana reklama - Nieaktywny Klient',
      imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=970&h=90',
      linkUrl: 'https://nieaktywny.pl/reklama',
      location: 'category_top',
      active: true,
      impressions: 1500,
      clicks: 12,
      weight: 1,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientInactive.id,
    },

    // Slot: category_sidebar (Kategoria - Baner Sidebar)
    {
      name: 'Komentarze Prawo Pracy 2026 - LexisNexis',
      imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300&h=250',
      linkUrl: 'https://lexisnexis.pl/prawo-pracy-2026',
      location: 'category_sidebar',
      active: true,
      impressions: 14200,
      clicks: 284, // ~2.0% CTR
      weight: 4,
      priority: 1,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLexis.id,
    },
    {
      name: 'E-book: Nowoczesna Kancelaria w Chmurze - LegalTech',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300&h=250',
      linkUrl: 'https://legaltech-software.pl/darmowy-ebook',
      location: 'category_sidebar',
      active: true,
      impressions: 9800,
      clicks: 147, // ~1.5% CTR
      weight: 2,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLegalTech.id,
    },
    {
      name: 'Leasing aut premium dla prawników - Profit',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300&h=250',
      linkUrl: 'https://kfprofit.pl/leasing-samochodowy',
      location: 'category_sidebar',
      active: true,
      impressions: 6200,
      clicks: 68, // ~1.1% CTR
      weight: 1,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientProfit.id,
    },
    {
      name: 'Reklama nieaktywna (active: false)',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300&h=250',
      linkUrl: 'https://www.warta.pl/archiwalna',
      location: 'category_sidebar',
      active: false,
      impressions: 3400,
      clicks: 41,
      weight: 2,
      priority: 0,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientWarta.id,
    },
    {
      name: 'Niestandardowa Reklama HTML AdSense',
      imageUrl: null,
      htmlContent: `<div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h4 style="margin: 0 0 10px 0; font-size: 16px;">Szkolenia online dla prawników</h4>
  <p style="margin: 0 0 15px 0; font-size: 12px; opacity: 0.9;">Rodo, Cyberbezpieczeństwo i AI w pracy adwokata.</p>
  <a href="https://legaltech-software.pl/webinary" target="_blank" style="background: white; color: #1e3a8a; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block;">Zapisz się</a>
</div>`,
      linkUrl: 'https://legaltech-software.pl/webinary',
      location: 'category_sidebar',
      active: true,
      impressions: 11200,
      clicks: 201, // ~1.8% CTR
      weight: 3,
      priority: 2,
      startDate: pastDate,
      endDate: futureDate,
      clientId: clientLegalTech.id,
    },
  ]

  for (const ad of adsData) {
    await prisma.advertisement.create({
      data: ad,
    })
  }

  console.log(`✓ Created ${adsData.length} advertisements in database.`)
  console.log('✅ Advertisements & clients seeding completed successfully!')
}
