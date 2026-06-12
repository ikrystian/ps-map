
import { faker } from '@faker-js/faker/locale/pl';
import { CaseStatus, CaseType, ClientType, LawFirmType, OfferStatus, OfferType, OrderType, PaymentMethod, PaymentStatus, PaymentTerms, PreferredContact, PrismaClient, SubscriptionPackage, UserRole, UserStatus } from '@prisma/client';
import { REALISTIC_LAW_FIRMS } from './data/realistic-law-firms';
import { REALISTIC_REVIEWS } from './data/realistic-reviews';

export function createRandomUser(prisma: PrismaClient, role: UserRole) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    return {
        email,
        name: `${firstName} ${lastName} `,
        image: faker.image.avatar(),
        password: 'Password123', // Plain text for now, will be hashed in the seed script
        role: role,
        emailVerified: new Date(),
        status: UserStatus.ACTIVE,
    };
}

export function createRandomClientB2B() {
    const companyType = faker.helpers.arrayElement(["Sp. z o.o.", "S.A.", "Sp. k.", "Sp. j.", "S.C."]);
    const companyName = `${faker.company.name()} ${companyType}`;
    const contactFirstName = faker.person.firstName();
    const contactLastName = faker.person.lastName();
    return {
        clientType: ClientType.BUSINESS,
        imie: contactFirstName,
        nazwisko: contactLastName,
        nazwaFirmy: companyName,
        nip: faker.string.numeric('10'),
        regon: faker.string.numeric('9'),
        krs: faker.string.numeric('10'),
    };
}

// Telefon i adres klienta — przeniesione do modelu User
export function createRandomClientUserContact() {
    return {
        numerTelefonu: faker.phone.number(),
        adres: faker.location.streetAddress(),
        kodPocztowy: faker.location.zipCode('##-###'),
        miasto: faker.location.city(),
    };
}


// Dane kontaktowe/adresowe eksperta — przeniesione do modelu User
export function createRandomLawFirmUserContact() {
    return {
        imie: faker.person.firstName(),
        nazwisko: faker.person.lastName(),
        numerTelefonu: faker.phone.number(),
        numerTelefonu2: faker.phone.number(),
        adres: faker.location.streetAddress(),
        kodPocztowy: faker.location.zipCode('##-###'),
        miasto: faker.location.city(),
    };
}

export function createRandomLawFirm(prisma: PrismaClient) {
    const realisticFirm = faker.helpers.arrayElement(REALISTIC_LAW_FIRMS);
    const companyName = realisticFirm.nazwa;
    const contactFirstName = faker.person.firstName();
    const contactLastName = faker.person.lastName();
    const hasOirp = faker.datatype.boolean();
    const hasOra = faker.datatype.boolean();

    const descriptionHtml = `<p><strong>${realisticFirm.tagline}</strong></p><p>${realisticFirm.opis}</p>` +
        faker.lorem.paragraphs(2, '\n\n')
            .split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('');

    return {
        typ: faker.helpers.arrayElement(Object.values(LawFirmType)),
        nazwa: companyName,
        nazwaFirmy: companyName,
        nip: faker.string.numeric('##########'),
        regon: faker.string.numeric('#########'),
        krs: faker.string.numeric('##########'),
        opis: descriptionHtml,
        logo: faker.image.avatar(),
        zdjecieGlowne: faker.image.url({ width: 1920, height: 400 }),
        galeriaZdjec: JSON.stringify(Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => faker.image.url())),
        filmYouTube: faker.datatype.boolean() ? 'https://www.youtube.com/watch?v=quC2GkURViU' : '',
        okladkaFilmu: faker.image.url(),
        statusGodzinyOtwarcia: faker.datatype.boolean(),
        godzinyOtwarcia: JSON.stringify({
            pon: "09:00-17:00",
            wt: "09:00-17:00",
            sr: "09:00-17:00",
            czw: "09:00-17:00",
            pt: "09:00-17:00",
            sob: "Zamknięte",
            nd: "Zamknięte",
        }),
        linkLinkedIn: `https://linkedin.com/in/${faker.internet.username()}`,
        linkFacebook: `https://facebook.com/${faker.internet.username()}`,
        linkInstagram: `https://instagram.com/${faker.internet.username()}`,
        stronaWww: faker.internet.url(),
        edukacja: JSON.stringify(Array.from({ length: faker.number.int({ min: 1, max: 6 }) }, () => ({
            uczelnia: `Uniwersytet ${faker.location.city()}`,
            wydzial: `Wydział Prawa i Administracji`,
            stopien: "magister",
            rokOd: 2005 + faker.number.int({ min: 0, max: 5 }),
            rokDo: 2010 + faker.number.int({ min: 0, max: 5 }),
        }))),
        oirpMiasto: hasOirp ? faker.location.city() : undefined,
        oirpWpis: hasOirp ? `WR-${faker.string.numeric(4)}` : undefined,
        oirpStatus: hasOirp,
        oraMiasto: hasOra ? faker.location.city() : undefined,
        oraWpis: hasOra ? `WAW/${faker.string.numeric(5)}` : undefined,
        oraStatus: hasOra,
        unikatowyOpisUslugi: realisticFirm.tagline,
        slowaKluczowe: JSON.stringify(faker.lorem.words(3).split(' ')),
        onlineOnly: faker.datatype.boolean(),
        typOferty: faker.helpers.arrayElement(Object.values(OfferType)),
        pakietSubskrypcji: faker.helpers.arrayElement(Object.values(SubscriptionPackage)),
        zweryfikowana: faker.datatype.boolean(),
        aktywna: true,
        zgodaRegulamin: true,
        zgodaPrzetwarzanie: true,
    };
}


export function createRandomReview() {
    const realisticReview = faker.helpers.arrayElement(REALISTIC_REVIEWS);
    return {
        ocenaOgolna: realisticReview.ocena,
        profesjonalizm: realisticReview.ocena,
        komunikacja: faker.number.int({ min: 3, max: 5 }),
        terminowosc: faker.number.int({ min: 3, max: 5 }),
        stosunekJakosci: faker.number.int({ min: 3, max: 5 }),
        tytulOpinii: realisticReview.tytul,
        trescOpinii: realisticReview.tresc,
        polecam: realisticReview.ocena >= 4,
        anonimowa: faker.datatype.boolean(),
        zweryfikowana: true,
        aktywna: true,
    };
}

export function createRandomCase(prisma: PrismaClient) {
    return {
        typSprawy: faker.helpers.arrayElement(Object.values(CaseType)),
        nazwaSprawy: faker.lorem.sentence(),
        opisSprawy: faker.lorem.paragraphs(2),
        oczekiwanyTerminRealizacji: faker.date.future(),
        trybPilny: faker.datatype.boolean(),
        budzetOd: faker.number.int({ min: 100, max: 1000 }),
        budzetDo: faker.number.int({ min: 1000, max: 10000 }),
        doNegocjacji: faker.datatype.boolean(),
        imieNazwisko: faker.person.fullName(),
        telefonKontakt: faker.phone.number(),
        preferowanyKontakt: faker.helpers.arrayElement(Object.values(PreferredContact)),
        status: CaseStatus.NOWA,
        akceptujeKlauzule: true,
    }
}

export function createRandomTransaction(prisma: PrismaClient) {
    return {
        amount: faker.finance.amount({ min: 50, max: 1000, dec: 2 }),
        description: faker.lorem.sentence(),
        paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
        paymentStatus: faker.helpers.arrayElement(Object.values(PaymentStatus)),
        orderType: faker.helpers.arrayElement(Object.values(OrderType)),
    }
}

export function createRandomOffer(prisma: PrismaClient) {
    const netto = faker.number.int({ min: 500, max: 5000 });
    const vat = 23;
    const brutto = netto * (1 + vat / 100);

    const descriptions = [
        "Szanowni Państwo, chętnie podejmiemy się prowadzenia tej sprawy. Mamy duże doświadczenie w podobnych tematach. Proponujemy kompleksową obsługę prawną wraz z reprezentacją przed sądem.",
        "Dzień dobry, analizując Państwa zapytanie, jesteśmy w stanie zaoferować bardzo korzystne warunki współpracy. Nasza ekspert specjalizuje się w tym obszarze prawa.",
        "W odpowiedzi na zgłoszenie, przedstawiam ofertę prowadzenia sprawy. Cena obejmuje analizę dokumentacji, przygotowanie pism procesowych oraz udział w jednej rozprawie.",
        "Zapraszamy do współpracy. Gwarantujemy profesjonalizm i indywidualne podejście do zgłoszonego problemu. Możemy umówić się na spotkanie w celu omówienia szczegółów.",
        "Nasza ekspert posiada zespół ekspertów, którzy od lat zajmują się takimi sprawami. Oferujemy pełne wsparcie i doradztwo na każdym etapie postępowania."
    ];

    return {
        kwotaNetto: netto,
        vat: vat,
        kwotaBrutto: brutto,
        terminRealizacjiDni: faker.number.int({ min: 1, max: 30 }),
        opisOferty: faker.helpers.arrayElement(descriptions) + " " + faker.lorem.paragraph(),
        zakresUslug: "Pełna obsługa prawna, doradztwo, reprezentacja.",
        warunkiPlatnosci: faker.helpers.arrayElement(Object.values(PaymentTerms)),
        wyroznienie: faker.datatype.boolean(),
        status: faker.helpers.arrayElement(Object.values(OfferStatus)),
    }
}

import { generateSlug } from '../../lib/utils';

export function createRandomBlogPost() {
    const titles = [
        "Jak przygotować się do rozwodu?",
        "Zasiedzenie nieruchomości - co warto wiedzieć?",
        "Zmiany w prawie pracy w 2024 roku",
        "Rodo w małej firmie - najważniejsze kroki",
        "Odszkodowanie za wypadek komunikacyjny - jak walczyć?",
        "Jak założyć spółkę z o.o. przez internet?",
        "Alimenty na dziecko - od czego zależy ich wysokość?",
        "Podział majątku po rozwodzie - najczęstsze błędy",
        "Ochrona znaków towarowych dla przedsiębiorców",
        "Czym jest upadłość konsumencka?"
    ];
    const title = faker.helpers.arrayElement(titles);
    return {
        tytul: title,
        // Titles are drawn from a small fixed list, so the base slug repeats.
        // Append a random suffix to keep the unique `slug` constraint satisfied.
        slug: `${generateSlug(title)}-${faker.string.alphanumeric(8).toLowerCase()}`,
        tresc: faker.lorem.paragraphs(5),
        tagi: faker.lorem.words(5).split(' '),
        obrazekWyrozniajacy: faker.image.url(),
        metaTitle: title,
        metaDescription: faker.lorem.sentence(),
        opublikowany: faker.datatype.boolean(),
    }
}

export function createRandomAccountManager() {
    return {
        imie: faker.person.firstName(),
        nazwisko: faker.person.lastName(),
        email: faker.internet.email(),
        telefon: faker.phone.number(),
        avatar: faker.image.avatar(),
        aktywny: faker.datatype.boolean(),
    }
}

