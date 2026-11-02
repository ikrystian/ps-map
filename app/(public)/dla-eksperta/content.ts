export interface ExpertProblem {
    /** Kategoria serwisu, w której taka sprawa się pojawia. */
    category: string
    /** Sprawa opisana słowami klienta. */
    quote: string
    /** Zawód, który może pomóc. */
    profession: string
}

export interface ExpertArea {
    label: string
    problems: ExpertProblem[]
    professions: string[]
}

/** Dziedziny z przykładowymi sprawami klientów (sekcja z zakładkami). */
export const EXPERT_AREAS: ExpertArea[] = [
    {
        label: "Nieruchomości i budowa",
        problems: [
            {
                category: "Wycena nieruchomości (operat szacunkowy)",
                quote: "„Dzielimy dom po rozwodzie i każde z nas podaje inną kwotę. Potrzebujemy wyceny, którą przyjmie sąd.”",
                profession: "rzeczoznawca majątkowy",
            },
            {
                category: "Nieruchomości",
                quote: "„Sąsiad postawił nowy płot i mam wrażenie, że zabrał mi metr działki. Chcę wiedzieć, gdzie naprawdę jest granica.”",
                profession: "geodeta",
            },
            {
                category: "Spory z wykonawcą i deweloperem",
                quote: "„Pół roku po odbiorze mieszkania pękają ściany, a deweloper twierdzi, że to normalne.”",
                profession: "rzeczoznawca budowlany",
            },
            {
                category: "Adaptacja projektu",
                quote: "„Kupiliśmy gotowy projekt domu i trzeba go dopasować do naszej działki i warunków zabudowy.”",
                profession: "architekt",
            },
        ],
        professions: [
            "architekt",
            "rzeczoznawca majątkowy",
            "rzeczoznawca budowlany",
            "geodeta",
            "inspektor nadzoru",
            "kierownik budowy",
            "kosztorysant",
            "audytor energetyczny",
            "pośrednik nieruchomości",
        ],
    },
    {
        label: "Finanse i podatki",
        problems: [
            {
                category: "Rozliczenia PIT",
                quote: "„Sprzedałam mieszkanie po trzech latach i urząd skarbowy wzywa mnie do wyjaśnień.”",
                profession: "doradca podatkowy",
            },
            {
                category: "Zakładanie firmy",
                quote: "„Otwieram jednoosobową firmę i nie wiem, czy wybrać ryczałt, czy podatek liniowy.”",
                profession: "księgowy",
            },
            {
                category: "Kredyty hipoteczne i doradztwo kredytowe",
                quote: "„Bierzemy pierwszy kredyt na mieszkanie i nie umiemy porównać ofert trzech banków.”",
                profession: "doradca finansowy",
            },
            {
                category: "Kontrole i spory z fiskusem",
                quote: "„W firmie zaczyna się kontrola podatkowa, a księgowa, która prowadziła nam papiery, już z nami nie pracuje.”",
                profession: "doradca podatkowy",
            },
        ],
        professions: [
            "doradca podatkowy",
            "doradca finansowy",
            "księgowy",
            "biegły rewident",
        ],
    },
    {
        label: "Auto i szkody",
        problems: [
            {
                category: "Wycena szkód i ruchomości",
                quote: "„Ubezpieczyciel wycenił naprawę auta na połowę tego, co policzył warsztat.”",
                profession: "rzeczoznawca samochodowy",
            },
            {
                category: "Opinie i ekspertyzy do sądu",
                quote: "„Miesiąc po zakupie używanego auta mechanik powiedział, że było po poważnym wypadku. Sprzedawca zaprzecza.”",
                profession: "rzeczoznawca samochodowy",
            },
            {
                category: "Odszkodowania",
                quote: "„Po wypadku na rowerze towarzystwo ubezpieczeniowe przyznało mi grosze za uszczerbek na zdrowiu.”",
                profession: "ekspert ds. odszkodowań",
            },
        ],
        professions: [
            "rzeczoznawca samochodowy",
            "ekspert ds. odszkodowań",
        ],
    },
    {
        label: "Firma",
        problems: [
            {
                category: "Przepisy BHP",
                quote: "„Za miesiąc mamy kontrolę inspekcji pracy, a nasza dokumentacja BHP ma kilka lat.”",
                profession: "specjalista BHP",
            },
            {
                category: "RODO i ochrona danych osobowych",
                quote: "„Klient napisał, że jego dane wyciekły z naszego sklepu internetowego. Nie wiemy, co zrobić najpierw.”",
                profession: "inspektor ochrony danych",
            },
            {
                category: "Postępowania przetargowe",
                quote: "„Chcemy pierwszy raz wystartować w przetargu gminy i boimy się, że odrzucą ofertę przez formalności.”",
                profession: "specjalista zamówień publicznych",
            },
            {
                category: "Ochrona własności intelektualnej",
                quote: "„Konkurencja sprzedaje kopię naszego produktu. Chcemy go wreszcie zastrzec.”",
                profession: "rzecznik patentowy",
            },
            {
                category: "Ubezpieczenie OC działalności gospodarczej",
                quote: "„Inwestor wymaga od naszej firmy budowlanej polisy OC na wyższą sumę.”",
                profession: "broker ubezpieczeniowy",
            },
        ],
        professions: [
            "doradca restrukturyzacyjny",
            "specjalista BHP",
            "specjalista PPOŻ",
            "inspektor ochrony danych",
            "specjalista compliance",
            "rzecznik patentowy",
            "specjalista zamówień publicznych",
            "doradca biznesowy",
            "specjalista marketingu",
            "specjalista HR",
            "agent i broker ubezpieczeniowy",
        ],
    },
    {
        label: "Zdrowie i opinie",
        problems: [
            {
                category: "Podział majątku, kontakty z dziećmi",
                quote: "„Ustalamy kontakty z dzieckiem po rozstaniu i chcę porozmawiać z psychologiem przed rozprawą.”",
                profession: "psycholog",
            },
            {
                category: "Opinie i ekspertyzy do sądu",
                quote: "„Po wypadku przy pracy ZUS ocenił uszczerbek niżej, niż się spodziewałem. Szukam niezależnej opinii lekarza.”",
                profession: "lekarz orzecznik",
            },
            {
                category: "Rehabilitacja",
                quote: "„Po złamaniu nogi potrzebuję planu rehabilitacji i dokumentacji leczenia do odszkodowania.”",
                profession: "fizjoterapeuta",
            },
        ],
        professions: [
            "psycholog",
            "psycholog sądowy",
            "lekarz orzecznik",
            "fizjoterapeuta",
        ],
    },
    {
        label: "IT",
        problems: [
            {
                category: "Bezpieczeństwo IT",
                quote: "„Ktoś przejął firmową skrzynkę i wysłał klientom faktury z innym numerem konta.”",
                profession: "specjalista cyberbezpieczeństwa",
            },
            {
                category: "Opinie i ekspertyzy do sądu",
                quote: "„Mam w telefonie wiadomości, które chcę przedstawić w sądzie. Nie wiem, jak je zabezpieczyć.”",
                profession: "informatyk śledczy",
            },
            {
                category: "Spory z pracownikami",
                quote: "„Pracownik przed odejściem usunął pliki z firmowego laptopa. Chcemy je odzyskać i to udokumentować.”",
                profession: "informatyk śledczy",
            },
        ],
        professions: [
            "specjalista IT i cyberbezpieczeństwa",
            "informatyk śledczy",
        ],
    },
    {
        label: "Tłumaczenia",
        problems: [
            {
                category: "Cudzoziemcy",
                quote: "„Bierzemy ślub w Polsce, a urząd chce przysięgłego tłumaczenia aktu urodzenia mojego narzeczonego.”",
                profession: "tłumacz przysięgły",
            },
            {
                category: "Zatrudnianie cudzoziemców",
                quote: "„Zatrudniamy pracownika z Kolumbii i do zezwolenia potrzebujemy przetłumaczonych dokumentów.”",
                profession: "tłumacz przysięgły",
            },
            {
                category: "Kwestie międzynarodowe",
                quote: "„Podpisujemy umowę z kontrahentem z Ukrainy i potrzebujemy jej tłumaczenia z pieczęcią.”",
                profession: "tłumacz przysięgły",
            },
        ],
        professions: [
            "tłumacz przysięgły",
        ],
    },
]

export interface FaqItem {
    question: string
    answer: string
}

/** Pytania i odpowiedzi - te same dane trafiają do widoku i do JSON-LD (FAQPage). */
export const EXPERT_FAQ: FaqItem[] = [
    {
        question: "Ile kosztuje profil eksperta?",
        answer: "Pakiet Podstawowy kosztuje 0 zł i nie wygasa. Daje dostęp do 10 spraw w miesiącu w jednym województwie i dwóch kategoriach. Więcej spraw, województw i kategorii odblokowują pakiety płatne.",
    },
    {
        question: "Czy serwis bierze procent od moich zleceń?",
        answer: "Nie. Cenę ustalasz z klientem, a on płaci bezpośrednio Tobie. Te pieniądze w ogóle nie przechodzą przez serwis.",
    },
    {
        question: "Jakie dokumenty są potrzebne do weryfikacji?",
        answer: "To, co potwierdza Twój zawód: uprawnienia, wpis do rejestru, certyfikat albo zaświadczenie biegłego sądowego. Sprawdza je zespół ProstaSprawa.pl, a zweryfikowany profil dostaje oznaczenie widoczne dla klientów.",
    },
    {
        question: "Pracuję w terenie. Czy to coś dla mnie?",
        answer: "Tak. W profilu wskazujesz województwo, powiaty i miasta, w których działasz, więc dostajesz sprawy z okolicy. Zakres zlecenia możesz omówić z klientem przez wideo, zanim pojedziesz na miejsce.",
    },
    {
        question: "Czy muszę współpracować z prawnikiem?",
        answer: "Nie musisz. Większość wycen, pomiarów czy tłumaczeń prowadzisz sam. Jeśli sprawa trafi do sądu, klient znajdzie prawnika w tym samym serwisie.",
    },
    {
        question: "Czy mogę później zmienić kategorie?",
        answer: "Tak. Kategorie i obszar działania zmieniasz w panelu, w ramach limitu swojego pakietu.",
    },
    {
        question: "Od czego zależy moja pozycja w wynikach?",
        answer: "Od wyniku punktowego. Składają się na niego weryfikacja profilu, jego wyświetlenia i oceny klientów, a także promocje i pakiet. Dokładny sposób liczenia opisuje strona rankingu.",
    },
]
