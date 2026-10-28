import {
  MessageStatus,
  NotificationType,
  PrismaClient,
} from "@prisma/client";

export async function seedCommunications(prisma: PrismaClient, clients: any[], lawFirms: any[]) {
  console.log("Seeding communications (messages, chat conversations, live messenger, notifications)...");

  // Pobierz użytkowników powiązanych z klientami i kancelariami
  const jan = await prisma.user.findUnique({ where: { email: "jan.kowalski@ps-dev.com.pl" } });
  const anna = await prisma.user.findUnique({ where: { email: "anna.nowak@ps-dev.com.pl" } });
  const piotr = await prisma.user.findUnique({ where: { email: "piotr.zielinski@ps-dev.com.pl" } });
  const techBiz = await prisma.user.findUnique({ where: { email: "biuro@techsolutions.pl" } });
  const ekoBiz = await prisma.user.findUnique({ where: { email: "zarzad@ekoenergia-polska.pl" } });

  const wisniewskiUser = await prisma.user.findUnique({ where: { email: "adwokat.wisniewski@ps-dev.com.pl" } });
  const kowalczykUser = await prisma.user.findUnique({ where: { email: "radca.kowalczyk@ps-dev.com.pl" } });
  const wojcikUser = await prisma.user.findUnique({ where: { email: "podatki.wojcik@ps-dev.com.pl" } });
  const lexvindexUser = await prisma.user.findUnique({ where: { email: "odszkodowania.lexvindex@ps-dev.com.pl" } });
  const kaczmarekUser = await prisma.user.findUnique({ where: { email: "techlaw.kaczmarek@ps-dev.com.pl" } });

  // 1. Tradycyjne wiadomości (Message)
  if (jan && wisniewskiUser) {
    await prisma.message.create({
      data: {
        senderId: jan.id,
        receiverId: wisniewskiUser.id,
        temat: "Pytanie o termin pierwszej rozprawy przed Sądem Okręgowym",
        tresc: "Dzień dobry Panie Mecenasie, czy wpłynęła już informacja z wydziału cywilnego w sprawie wyznaczenia wokandy? Pozdrawiam serdecznie, Jan Kowalski.",
        przeczytana: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.message.create({
      data: {
        senderId: wisniewskiUser.id,
        receiverId: jan.id,
        temat: "Re: Pytanie o termin pierwszej rozprawy przed Sądem Okręgowym",
        tresc: "Dzień dobry Panie Janie. Tak, sprawdziłem portal informacyjny sądów – rozprawa została wyznaczona na 14 grudnia o godz. 10:30 w sali 214. W przyszłym tygodniu prześlę podsumowanie dowodów do przygotowania przed rozprawą.",
        przeczytana: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 2. Nowoczesny czat Messenger (Conversation + ChatMessage)
  const chatPairs = [
    {
      clientUser: jan,
      firmUser: wisniewskiUser,
      messages: [
        { sender: jan, text: "Dzień dobry Panie Mecenasie, przesłałem dodatkowe skany faktur za remont.", agoMins: 180 },
        { sender: wisniewskiUser, text: "Dzień dobry. Dziękuję, zapoznałem się z dokumentami. Są w pełni czytelne.", agoMins: 140 },
        { sender: wisniewskiUser, text: "Dołączam je do kolejnego pisma procesowego jako załączniki dowodowe.", agoMins: 138 },
        { sender: jan, text: "Świetnie, dziękuję za szybkie działanie!", agoMins: 90 },
        { sender: wisniewskiUser, text: "Pismo zostanie złożone na biurze podawczym jutro do południa.", agoMins: 45 },
      ],
    },
    {
      clientUser: anna,
      firmUser: kowalczykUser,
      messages: [
        { sender: anna, text: "Pani Mecenas, mąż skontaktował się ze mną w sprawie ugody.", agoMins: 240 },
        { sender: kowalczykUser, text: "Pani Anno, proszę na razie nie składać żadnych ostatecznych deklaracji na piśmie.", agoMins: 210 },
        { sender: kowalczykUser, text: "Proszę przekazać, aby jego pełnomocnik przesłał oficjalny projekt porozumienia do mojej kancelarii.", agoMins: 208 },
        { sender: anna, text: "Rozumiem, tak właśnie zrobiłam. Dziękuję za czujność.", agoMins: 120 },
      ],
    },
    {
      clientUser: techBiz,
      firmUser: kaczmarekUser,
      messages: [
        { sender: techBiz, text: "Cześć Tomasz, czy zerknąłeś na klauzulę indemnification od klienta z USA?", agoMins: 300 },
        { sender: kaczmarekUser, text: "Cześć Marek, tak. Klauzula jest zbyt szeroka – proponuję ograniczyć ją do direct damages do wysokości 12-miesięcznego fee.", agoMins: 260 },
        { sender: techBiz, text: "Zgadzam się w 100%. Przygotujesz czerwone linie na markupie?", agoMins: 200 },
        { sender: kaczmarekUser, text: "Wersja z track changes jest już u Ciebie na mailu.", agoMins: 60 },
      ],
    },
    {
      clientUser: piotr,
      firmUser: lexvindexUser,
      messages: [
        { sender: piotr, text: "Dzień dobry, odebrałem ze szpitala kompletną historię choroby z wypisem.", agoMins: 500 },
        { sender: lexvindexUser, text: "Dzień dobry Panie Piotrze. Nasz lekarz orzecznik już czeka na analizę. Proszę o upload do zakładki dokumenty.", agoMins: 420 },
        { sender: piotr, text: "Pliki zostały przesłane. Czekam na informację o wysokości roszczenia zadośćuczynienia.", agoMins: 310 },
      ],
    },
    {
      clientUser: ekoBiz,
      firmUser: wojcikUser,
      messages: [
        { sender: ekoBiz, text: "Panie Piotrze, czy integracja z testowym środowiskiem KSeF przeszła pomyślnie?", agoMins: 120 },
        { sender: wojcikUser, text: "Tak, wysłaliśmy paczkę 100 faktur testowych FA(3) i odebraliśmy UPO bez żadnych odrzuceń.", agoMins: 70 },
        { sender: ekoBiz, text: "Rewelacyjna wiadomość, jesteśmy gotowi na start produkcyjny!", agoMins: 15 },
      ],
    },
  ];

  for (const pair of chatPairs) {
    if (!pair.clientUser || !pair.firmUser) continue;

    const lastMsg = pair.messages[pair.messages.length - 1];
    const lastMsgDate = new Date(Date.now() - lastMsg.agoMins * 60 * 1000);

    const conv = await prisma.conversation.create({
      data: {
        clientUserId: pair.clientUser.id,
        lawFirmUserId: pair.firmUser.id,
        lastMessageText: lastMsg.text,
        lastMessageAt: lastMsgDate,
        lastMessageSenderId: lastMsg.sender?.id || pair.clientUser.id,
      },
    });

    for (let mIdx = 0; mIdx < pair.messages.length; mIdx++) {
      const msg = pair.messages[mIdx];
      const msgDate = new Date(Date.now() - msg.agoMins * 60 * 1000);
      const isLatest = mIdx === pair.messages.length - 1;

      await prisma.chatMessage.create({
        data: {
          conversationId: conv.id,
          senderId: msg.sender?.id || pair.clientUser.id,
          content: msg.text,
          contentIv: null, // treść jawna
          status: isLatest ? MessageStatus.DELIVERED : MessageStatus.READ,
          deliveredAt: msgDate,
          isRead: !isLatest,
          readAt: !isLatest ? new Date(msgDate.getTime() + 10 * 60 * 1000) : null,
          createdAt: msgDate,
        },
      });
    }

    // Dodaj status online
    await prisma.userOnlineStatus.upsert({
      where: { userId: pair.firmUser.id },
      create: { userId: pair.firmUser.id, isOnline: true, lastSeen: new Date() },
      update: { isOnline: true, lastSeen: new Date() },
    });
  }

  // 3. Powiadomienia w systemie (Notification)
  const notificationsData = [
    {
      user: jan,
      typ: NotificationType.NOWA_OFERTA,
      tytul: "Otrzymałeś nową ofertę pomocy prawnej",
      tresc: "Kancelaria Adwokacka Adw. Michał Wiśniewski złożyła ofertę na sprawę: Spór z deweloperem o wady lokalu.",
      linkUrl: "/panel-klienta/sprawy",
      przeczytane: false,
    },
    {
      user: anna,
      typ: NotificationType.NOWA_KONSULTACJA,
      tytul: "Konsultacja wideo została potwierdzona",
      tresc: "Konsultacja z dr Anną Kowalczyk odbędzie się w wyznaczonym terminie. Wygenerowano pokój Google Meet.",
      linkUrl: "/panel-klienta/konsultacje",
      przeczytane: true,
    },
    {
      user: wisniewskiUser,
      typ: NotificationType.NOWA_OPINIA,
      tytul: "Nowa 5-gwiazdkowa opinia na profilu",
      tresc: "Klient Jan Kowalski opublikował opinię: 'Wybitny adwokat w sprawach gospodarczych i karnych'.",
      linkUrl: "/panel-eksperta/opinie",
      przeczytane: false,
    },
    {
      user: wojcikUser,
      typ: NotificationType.KONSULTACJA_ZAPLACONA,
      tytul: "Opłacono konsultację podatkową",
      tresc: "Klient EkoEnergia Group Sp. z o.o. dokonał płatności za konsultację podatkową online.",
      linkUrl: "/panel-eksperta/kalendarz",
      przeczytane: true,
    },
    {
      user: kaczmarekUser,
      typ: NotificationType.ZMIANA_STATUSU,
      tytul: "Twoja oferta została zaakceptowana!",
      tresc: "TechSolutions Sp. z o.o. zaakceptowała Twoją propozycję na audyt umowy wdrożeniowej.",
      linkUrl: "/panel-eksperta/oferty",
      przeczytane: false,
    },
    {
      user: szymanskaUser(lawFirms),
      typ: NotificationType.SYSTEM,
      tytul: "Profil zweryfikowany przez administratora",
      tresc: "Twoje uprawnienia zawodowe zostały pomyślnie potwierdzone w rejestrze ORA.",
      linkUrl: "/panel-eksperta/profil",
      przeczytane: true,
    },
  ];

  for (const n of notificationsData) {
    if (n.user) {
      await prisma.notification.create({
        data: {
          userId: n.user.id,
          typ: n.typ,
          tytul: n.tytul,
          tresc: n.tresc,
          linkUrl: n.linkUrl,
          przeczytane: n.przeczytane,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
        },
      });
    }
  }

  console.log(`✓ Utworzono konwersacje czatu na żywo, historię wiadomości, statusy online oraz powiadomienia systemowe`);
}

function szymanskaUser(lawFirms: any[]) {
  const szymanska = lawFirms.find((f: any) => f.slug === "kancelaria-prawa-pracy-szymanska");
  return szymanska?.user || null;
}
