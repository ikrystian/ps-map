
import { faker } from '@faker-js/faker/locale/pl';
import { PrismaClient, UserRole, UserStatus, LawFirmType, OfferType, SubscriptionPackage, CaseType, CaseStatus, PreferredContact, PaymentMethod, PaymentStatus, OrderType, PaymentTerms, OfferStatus, ClientType } from '@prisma/client';

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
        telefon: faker.phone.number(),
        nazwaFirmy: companyName,
        nip: faker.string.numeric('10'),
        regon: faker.string.numeric('9'),
        krs: faker.string.numeric('10'),
        adres: faker.location.streetAddress(),
        kodPocztowy: faker.location.zipCode('##-###'),
        miasto: faker.location.city(),
    };
}

export function createRandomLawFirm(prisma: PrismaClient) {
    const companyName = faker.company.name();
    const contactFirstName = faker.person.firstName();
    const contactLastName = faker.person.lastName();
    const hasOirp = faker.datatype.boolean();
    const hasOra = faker.datatype.boolean();


    const paragraphCount = faker.number.int({ min: 3, max: 7 }); // Losowa liczba akapitów (3 do 5)
    const descriptionHtml = faker.lorem.paragraphs(paragraphCount, '\n\n')
        // Zamień podwójne nowej linie ('\n\n') na znaczniki akapitu
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
        imieKontakt: contactFirstName,
        nazwiskoKontakt: contactLastName,
        stanowisko: faker.person.jobTitle(),
        numerTelefonu: faker.phone.number(),
        numerTelefonu2: faker.phone.number(),
        emailKontakt: faker.internet.email({ firstName: contactFirstName, lastName: contactLastName }),
        adres: faker.location.streetAddress(),
        kodPocztowy: faker.location.zipCode(),
        miasto: faker.location.city(),
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
        unikatowyOpisUslugi: faker.lorem.sentences(2),
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
    return {
        ocenaOgolna: faker.number.int({ min: 1, max: 5 }),
        profesjonalizm: faker.number.int({ min: 1, max: 5 }),
        komunikacja: faker.number.int({ min: 1, max: 5 }),
        terminowosc: faker.number.int({ min: 1, max: 5 }),
        stosunekJakosci: faker.number.int({ min: 1, max: 5 }),
        tytulOpinii: faker.lorem.sentence(),
        trescOpinii: faker.lorem.paragraph(),
        polecam: faker.datatype.boolean(),
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
        emailKontakt: faker.internet.email(),
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

    return {
        kwotaNetto: netto,
        vat: vat,
        kwotaBrutto: brutto,
        terminRealizacjiDni: faker.number.int({ min: 1, max: 30 }),
        opisOferty: faker.lorem.paragraphs(2),
        zakresUslug: faker.lorem.sentence(),
        warunkiPlatnosci: faker.helpers.arrayElement(Object.values(PaymentTerms)),
        wyroznienie: faker.datatype.boolean(),
        status: faker.helpers.arrayElement(Object.values(OfferStatus)),
    }
}

export function createRandomBlogPost() {
    const title = faker.lorem.sentence();
    return {
        tytul: title,
        slug: faker.helpers.slugify(title).toLowerCase(),
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
