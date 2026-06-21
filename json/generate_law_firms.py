import json
import random
import itertools

random.seed(42)

first_names = [
    "Jan", "Andrzej", "Piotr", "Krzysztof", "Stanisław", "Tomasz", "Paweł", "Michał",
    "Marcin", "Jakub", "Adam", "Marek", "Łukasz", "Dariusz", "Artur", "Rafał",
    "Jacek", "Wojciech", "Grzegorz", "Robert", "Mateusz", "Bartosz", "Kamil", "Maciej",
    "Mariusz", "Sebastian", "Szymon", "Damian", "Patryk", "Konrad", "Kacper", "Wiktor",
    "Anna", "Maria", "Katarzyna", "Agnieszka", "Małgorzata", "Ewa", "Joanna", "Barbara",
    "Monika", "Aleksandra", "Magdalena", "Elżbieta", "Marta", "Beata", "Krystyna",
    "Justyna", "Natalia", "Paulina", "Dorota", "Izabela", "Renata", "Jolanta", "Sylwia"
]

last_names = [
    "Kowalski", "Nowak", "Wiśniewski", "Dąbrowski", "Lewandowski", "Wójcik", "Kamiński",
    "Zieliński", "Szymański", "Woźniak", "Kozłowski", "Jankowski", "Mazur", "Krawczyk",
    "Kaczmarek", "Piotrowicz", "Grabowski", "Pawlak", "Michalski", "Stępień", "Górski",
    "Witkowski", "Walczak", "Rutkowski", "Sikora", "Baran", "Orłowski", "Szewczyk",
    "Ostrowski", "Tomaszewski", "Pietrzak", "Zalewski", "Wróbel", "Jasiński", "Adamczyk",
    "Malinowski", "Kwiatkowski", "Baranowski", "Brzeziński", "Czarnecki", "Sadowski",
    "Sawicki", "Chmielewski", "Borkowski", "Kubiak", "Zawadzki", "Szczepański", "Kucharski",
    "Wysocki", "Kołodziej", "Jabłoński", "Krajewski", "Makowski", "Urbański", "Olszewski",
    "Lisiecki", "Głowacki", "Ziółkowski", "Szulc", "Bąk", "Czerwiński"
]

cities_voivodeships = {
    "Warszawa": ("Mazowieckie", 52.2297, 21.0122),
    "Kraków": ("Małopolskie", 50.0647, 19.9450),
    "Łódź": ("Łódzkie", 51.7592, 19.4560),
    "Wrocław": ("Dolnośląskie", 51.1079, 17.0385),
    "Poznań": ("Wielkopolskie", 52.4064, 16.9252),
    "Gdańsk": ("Pomorskie", 54.3520, 18.6466),
    "Szczecin": ("Zachodniopomorskie", 53.4285, 14.5528),
    "Bydgoszcz": ("Kujawsko-Pomorskie", 53.1235, 18.0084),
    "Lublin": ("Lubelskie", 51.2465, 22.5684),
    "Katowice": ("Śląskie", 50.2649, 19.0238),
    "Białystok": ("Podlaskie", 53.1325, 23.1688),
    "Gdynia": ("Pomorskie", 54.5189, 18.5305),
    "Częstochowa": ("Śląskie", 50.8118, 19.1203),
    "Radom": ("Mazowieckie", 51.4027, 21.1471),
    "Toruń": ("Kujawsko-Pomorskie", 53.0138, 18.5984),
    "Kielce": ("Świętokrzyskie", 50.8661, 20.6286),
    "Rzeszów": ("Podkarpackie", 50.0412, 21.9990),
    "Olsztyn": ("Warmińsko-Mazurskie", 53.7780, 20.4942),
    "Gliwice": ("Śląskie", 50.2945, 18.6714),
    "Zielona Góra": ("Lubuskie", 51.9356, 15.5062),
    "Opole": ("Opolskie", 50.6751, 17.9213),
    "Płock": ("Mazowieckie", 52.5464, 19.7066),
    "Tarnów": ("Małopolskie", 50.0121, 20.9887),
    "Elbląg": ("Warmińsko-Mazurskie", 54.1559, 19.4045),
    "Koszalin": ("Zachodniopomorskie", 54.1943, 16.1715),
    "Słupsk": ("Pomorskie", 54.4640, 17.0287),
    "Legnica": ("Dolnośląskie", 51.2070, 16.1619),
    "Jelenia Góra": ("Dolnośląskie", 50.9030, 15.7364),
    "Konin": ("Wielkopolskie", 52.2230, 18.2530),
    "Włocławek": ("Kujawsko-Pomorskie", 52.6480, 19.0678),
    "Leszno": ("Wielkopolskie", 51.8403, 16.5749),
    "Gorzów Wielkopolski": ("Lubuskie", 52.7368, 15.2281),
    "Wałbrzych": ("Dolnośląskie", 50.7714, 16.2843),
    "Sieradz": ("Łódzkie", 51.5958, 18.7302),
    "Przemyśl": ("Podkarpackie", 49.7830, 22.7840),
    "Chełm": ("Lubelskie", 51.1431, 23.4719),
    "Zamość": ("Lubelskie", 50.7214, 23.2522),
    "Nowy Sącz": ("Małopolskie", 49.6210, 20.6940),
    "Suwałki": ("Podlaskie", 54.0988, 22.9323),
    "Kalisz": ("Wielkopolskie", 51.7611, 18.0910),
    "Cieszyn": ("Śląskie", 49.7485, 18.6330),
    "Piła": ("Wielkopolskie", 53.1489, 16.7385),
    "Ostrołęka": ("Mazowieckie", 53.0870, 21.5720),
    "Stalowa Wola": ("Podkarpackie", 50.5750, 22.0540),
    "Mielec": ("Podkarpackie", 50.2850, 21.4230),
    "Tarnobrzeg": ("Podkarpackie", 50.5730, 21.6780),
    "Grudziądz": ("Kujawsko-Pomorskie", 53.4830, 18.7530),
    "Inowrocław": ("Kujawsko-Pomorskie", 52.7950, 18.2550),
    "Świnoujście": ("Zachodniopomorskie", 53.9100, 14.2470),
    "Ełk": ("Warmińsko-Mazurskie", 53.8280, 22.3640),
}

streets = [
    "ul. Marszałkowska", "ul. Krakowskie Przedmieście", "ul. Nowy Świat", "ul. Aleje Jerozolimskie",
    "ul. Puławska", "ul. Grójecka", "ul. Chmielna", "ul. Mokotowska", "ul. Koszykowa",
    "ul. Wilcza", "ul. Hoża", "ul. Piękna", "ul. Krucza", "ul. Widok", "ul. Złota",
    "ul. Sienna", "ul. Świętokrzyska", "ul. Czackiego", "ul. Traugutta", "ul. Królewska",
    "ul. Długa", "ul. Freta", "ul. Mostowa", "ul. Brzozowa", "ul. Piwna",
    "ul. Główna", "ul. Kościuszki", "ul. Mickiewicza", "ul. Słowackiego", "ul. Piłsudskiego",
    "ul. Kilińskiego", "ul. Kołłątaja", "ul. Staszica", "ul. Rejtana", "ul. Kopernika",
    "ul. Matejki", "ul. Sienkiewicza", "ul. Żeromskiego", "ul. Norwida", "ul. Wyspiańskiego",
    "ul. Moniuszki", "ul. Chopina", "ul. Paderewskiego", "ul. Konopnickiej", "ul. Orzeszkowej",
    "al. Niepodległości", "al. Róż", "al. Solidarności", "al. Wojska Polskiego", "al. Jana Pawła II"
]

law_firm_types = ["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]
offer_types = ["STALA_WSPOLPRACA", "JEDNORAZOWA_USLUGA", "KONSULTACJA", "WSZYSTKIE"]
subscription_packages = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]
service_units = ["ZA_USLUGE", "ZA_GODZINE", "RYCZALT", "DO_UZGODNIENIA"]

categories_list = [
    "Prawo Gospodarcze", "Prawo Cywilne", "Prawo Karne", "Prawo Rodzinne", "Prawo Pracy",
    "Prawo Administracyjne", "Prawo Podatkowe", "Prawo Nieruchomości", "Prawo Spadkowe",
    "Prawo Międzynarodowe", "Prawo Finansowe", "Prawo Spółek", "Prawo Budowlane",
    "Prawo Ochrony Środowiska", "Prawo Własności Intelektualnej", "Prawo Medyczne",
    "Prawo Sportowe", "Prawo Autorskie", "Prawo Konkurencji", "Prawo Dewizowe",
    "Prawo Energetyczne", "Prawo Bankowe", "Prawo Telekomunikacyjne", "Prawo Transportowe",
    "Prawo Morskie"
]

services_templates = [
    ("Rejestracja spółki", "Kompleksowa rejestracja spółki z o.o. w KRS", 1500, 5000),
    ("Umowa najmu", "Przygotowanie i opiniowanie umowy najmu lokalu", 500, 2000),
    ("Rozwód", "Prowadzenie sprawy rozwodowej z podziałem majątku", 3000, 8000),
    ("Sprawa karna", "Obrona w postępowaniu karnym", 3000, 15000),
    ("Opinia prawna", "Sporządzenie pisemnej opinii prawnej", 500, 3000),
    ("Pozew sądowy", "Przygotowanie i wniesienie pozwu do sądu", 1000, 5000),
    ("Doradztwo podatkowe", "Kompleksowe doradztwo podatkowe dla firm", 2000, 10000),
    ("Windykacja należności", "Windykacja należności na drodze sądowej i pozasądowej", 1000, 5000),
    ("Sprawa spadkowa", "Prowadzenie spraw spadkowych i notarialnych", 2000, 7000),
    ("Doradztwo korporacyjne", "Obsługa prawna spółek i korporacji", 3000, 15000),
    ("Kupno nieruchomości", "Obsługa prawna transakcji kupna nieruchomości", 1500, 5000),
    ("Umowa o pracę", "Przygotowanie i weryfikacja umowy o pracę", 300, 1000),
    ("Sprawa gospodarcza", "Prowadzenie spraw gospodarczych przed sądem", 2000, 10000),
    ("Mediacja", "Mediacje gospodarcze i rodzinne", 800, 3000),
    ("Prawa autorskie", "Ochrona praw autorskich i własności intelektualnej", 2000, 10000),
]

certificates_templates = [
    ("Radca Prawny", "Okręgowa Izba Radców Prawnych", "RP-"),
    ("Adwokat", "Okręgowa Rada Adwokacka", "ADR-"),
    ("Notariusz", "Krajowa Rada Notarialna", "NOT-"),
    ("Doradca Podatkowy", "Krajowa Izba Doradców Podatkowych", "DP-"),
    ("Mediator", "Centrum Mediacji", "MED-"),
    ("Sędzia Sądu Rejonowego", "Krajowa Szkoła Sądownictwa", "SSR-"),
    ("Specjalista Prawa Unijnego", "Europejski Instytut Prawa", "EU-"),
    ("Certyfikowany Compliance Officer", "Stowarzyszenie Compliance", "CCO-"),
    ("Rzecznik Patentowy", "Urząd Patentowy RP", "PAT-"),
    ("Arbiter Sądu Polubownego", "Stały Sąd Polubowny", "ARB-"),
]

# More reliable data
uni_list = [
    ("Uniwersytet Warszawski", "Wydział Prawa i Administracji"),
    ("Uniwersytet Jagielloński", "Wydział Prawa i Administracji"),
    ("Uniwersytet im. Adama Mickiewicza w Poznaniu", "Wydział Prawa i Administracji"),
    ("Uniwersytet Wrocławski", "Wydział Prawa, Administracji i Ekonomii"),
    ("Uniwersytet Gdański", "Wydział Prawa i Administracji"),
    ("Uniwersytet Mikołaja Kopernika w Toruniu", "Wydział Prawa i Administracji"),
    ("Uniwersytet Łódzki", "Wydział Prawa i Administracji"),
    ("Uniwersytet Śląski w Katowicach", "Wydział Prawa i Administracji"),
    ("Katolicki Uniwersytet Lubelski Jana Pawła II", "Wydział Prawa, Prawa Kanonicznego i Administracji"),
    ("Uniwersytet Marii Curie-Skłodowskiej w Lublinie", "Wydział Prawa i Administracji"),
    ("Uniwersytet Warmińsko-Mazurski w Olsztynie", "Wydział Prawa i Administracji"),
    ("Uniwersytet w Białymstoku", "Wydział Prawa"),
    ("Uniwersytet Szczeciński", "Wydział Prawa i Administracji"),
    ("Uniwersytet Rzeszowski", "Wydział Prawa i Administracji"),
    ("Uniwersytet Opolski", "Wydział Prawa i Administracji"),
    ("Uniwersytet Zielonogórski", "Wydział Prawa i Administracji"),
    ("Uniwersytet Kazimierza Wielkiego w Bydgoszczy", "Wydział Prawa i Administracji"),
    ("Szkoła Główna Handlowa w Warszawie", "Kolegium Zarządzania i Finansów"),
]

keywords_pool = [
    "prawo gospodarcze", "spółki", "kontrakty", "prawo cywilne", "odszkodowania",
    "nieruchomości", "prawo karne", "obrona", "oskarżyciel", "prawo pracy",
    "umowy", "rozwiązanie umowy", "prawo rodzinne", "rozwód", "alimenty",
    "podatki", "PIT", "CIT", "VAT", "prawo administracyjne", "decyzje administracyjne",
    "postępowanie sądowe", "egzekucja", "windykacja", "upadłość", "restrukturyzacja",
    "fuzje i przejęcia", "due diligence", "prawo spadkowe", "testament", "dziedziczenie",
    "prawo handlowe", "KRS", "rejestracja", "prawo bankowe", "kredyty",
    "prawo medyczne", "błąd medyczny", "prawo własności intelektualnej", "patenty",
    "znaki towarowe", "prawo autorskie", "prawo budowlane", "pozwolenia",
    "prawo ochrony środowiska", "prawo energetyczne", "prawo sportowe",
    "prawo międzynarodowe", "arbitraż", "mediacja", "negocjacje",
    "prawo telekomunikacyjne", "ochrona danych", "RODO", "compliance"
]

def generate_email(first, last, index):
    base = f"{first.lower()}.{last.lower()}".replace("ł", "l").replace("ń", "n").replace("ó", "o").replace("ś", "s").replace("ć", "c").replace("ź", "z").replace("ż", "z").replace("ę", "e").replace("ą", "a")
    if index == 0:
        return f"{base}@bpcoders.pl"
    return f"{base}{index}@bpcoders.pl"

def generate_nip(index):
    return f"526{index:06d}"

def generate_regon(index):
    return f"12345{index:05d}"

def generate_krs(index):
    return f"0000{index:06d}"

def generate_phone():
    prefix = random.choice(["600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "512", "513", "514", "515", "516", "517", "518", "519", "660", "661", "662", "663", "664", "665", "666", "667", "668", "669", "691", "692", "693", "694", "695", "696", "697", "698", "699", "721", "722", "723", "724", "725", "726", "727", "728", "729", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739"])
    suffix = f"{random.randint(100, 999)}{random.randint(10, 99)}{random.randint(10, 99)}"
    return f"+48 {prefix} {suffix[:3]} {suffix[3:]}"

def generate_static_phone(idx):
    prefixes = ["600", "601", "602", "603", "604"]
    p = prefixes[idx % len(prefixes)]
    rest = f"{100000 + idx:06d}"
    return f"+48 {p} {rest[:3]} {rest[3:]}"

def generate_postal_code():
    return f"{random.randint(10, 99)}-{random.randint(100, 999)}"

def generate_opening_hours(variant=None):
    if variant is None:
        variant = random.randint(0, 4)

    base = {
        "poniedzialek": "9:00-17:00",
        "wtorek": "9:00-17:00",
        "sroda": "9:00-17:00",
        "czwartek": "9:00-17:00",
        "piatek": "9:00-15:00",
        "sobota": "zamkniete",
        "niedziela": "zamkniete"
    }

    if variant == 0:
        base["sobota"] = "9:00-14:00"
    elif variant == 1:
        base["poniedzialek"] = "8:00-18:00"
        base["wtorek"] = "8:00-18:00"
        base["sroda"] = "8:00-18:00"
        base["czwartek"] = "8:00-18:00"
        base["piatek"] = "8:00-16:00"
    elif variant == 2:
        base["poniedzialek"] = "10:00-19:00"
        base["wtorek"] = "10:00-19:00"
        base["sroda"] = "10:00-19:00"
        base["czwartek"] = "10:00-19:00"
        base["piatek"] = "10:00-17:00"
    elif variant == 3:
        base["poniedzialek"] = "7:00-15:00"
        base["wtorek"] = "7:00-15:00"
        base["sroda"] = "7:00-15:00"
        base["czwartek"] = "7:00-15:00"
        base["piatek"] = "7:00-13:00"
        base["sobota"] = "zamkniete"
    elif variant == 4:
        base["poniedzialek"] = "9:00-20:00"
        base["wtorek"] = "9:00-20:00"
        base["sroda"] = "9:00-20:00"
        base["czwartek"] = "9:00-20:00"
        base["piatek"] = "9:00-18:00"
        base["sobota"] = "10:00-15:00"

    return base

def generate_description(first, last, city, firm_name):
    templates = [
        f"Kancelaria {last} to zespół doświadczonych prawników z siedzibą w {city}. Specjalizujemy się w kompleksowej obsłudze prawnej klientów indywidualnych i biznesowych. Naszym priorytetem jest najwyższa jakość usług i indywidualne podejście do każdej sprawy.",
        f"Profesjonalna pomoc prawna od {first} {last} w {city}. Oferujemy wsparcie w sprawach cywilnych, gospodarczych i rodzinnych. Długoletnie doświadczenie i zaangażowanie to nasze atuty.",
        f"Kancelaria {last} – Twój partner w sprawach prawnych w {city} i okolicach. Świadczymy usługi na najwyższym poziomie, łącząc wiedzę teoretyczną z praktycznym doświadczeniem zdobywanym od lat.",
        f"Zaufaj profesjonalistom z Kancelarii {firm_name}. Nasz zespół pod kierownictwem {first} {last} gwarantuje skuteczną reprezentację przed sądami i urzędami w {city} oraz na terenie całego kraju.",
        f"Kancelaria {last} w {city} to miejsce, gdzie prawo staje się zrozumiałe. Oferujemy jasne i konkretne porady prawne, reprezentację procesową oraz bieżącą obsługę firm. Zapraszamy do współpracy.",
        f"{first} {last} zaprasza do swojej kancelarii w {city}. Specjalizujemy się w prawie gospodarczym, cywilnym i karnym. Każdą sprawę traktujemy indywidualnie, proponując optymalne rozwiązania.",
        f"Praktyka prawna {last} z {city} świadczy usługi na rzecz klientów indywidualnych oraz przedsiębiorców. Nasza misja to zapewnienie iż nasi klienci otrzymują profesjonalne wpieranie prawne na każdym etapie trwania procesu sądowego, czy też administracyjnego na jego korzyść aż do jego zadowolenia z wyniku końcowego i jego wykonania do czasu jego całkowitego i należytego uzupełnienia.",
        f"Nowoczesna kancelaria prawna {first} {last} działająca w {city}. Łączymy tradycyjne podejście z nowoczesnymi narzędziami, aby zapewnić naszym klientom skuteczną i efektywną pomoc prawną.",
    ]
    return random.choice(templates)

def generate_service_desc(service_name):
    descs = {
        "Rejestracja spółki": "Kompleksowa rejestracja spółki z o.o. w KRS wraz z obsługą notarialną",
        "Umowa najmu": "Przygotowanie i opiniowanie umowy najmu lokalu mieszkalnego i użytkowego",
        "Rozwód": "Prowadzenie sprawy rozwodowej z podziałem majątku i opieką nad dziećmi",
        "Sprawa karna": "Obrona w postępowaniu karnym na każdym etapie postępowania",
        "Opinia prawna": "Sporządzenie pisemnej opinii prawnej w indywidualnej sprawie",
        "Pozew sądowy": "Przygotowanie i wniesienie pozwu do sądu właściwego dla sprawy",
        "Doradztwo podatkowe": "Kompleksowe doradztwo podatkowe dla firm i osób fizycznych",
        "Windykacja należności": "Windykacja należności na drodze sądowej i pozasądowej",
        "Sprawa spadkowa": "Prowadzenie spraw spadkowych i notarialnych",
        "Doradztwo korporacyjne": "Obsługa prawna spółek i korporacji w bieżącej działalności",
        "Kupno nieruchomości": "Obsługa prawna transakcji kupna nieruchomości wraz z due diligence",
        "Umowa o pracę": "Przygotowanie i weryfikacja umowy o pracę oraz innych dokumentów kadrowych",
        "Sprawa gospodarcza": "Prowadzenie spraw gospodarczych przed sądami powszechnymi",
        "Mediacja": "Mediacje gospodarcze i rodzinne jako alternatywna metoda rozwiązywania sporów",
        "Prawa autorskie": "Ochrona praw autorskich i własności intelektualnej w obrocie",
    }
    return descs.get(service_name, f"Profesjonalna usługa: {service_name.lower()}")

def generate_service_price_range(service_name):
    prices = {
        "Rejestracja spółki": (1500, 5000),
        "Umowa najmu": (500, 2000),
        "Rozwód": (3000, 8000),
        "Sprawa karna": (3000, 15000),
        "Opinia prawna": (500, 3000),
        "Pozew sądowy": (1000, 5000),
        "Doradztwo podatkowe": (2000, 10000),
        "Windykacja należności": (1000, 5000),
        "Sprawa spadkowa": (2000, 7000),
        "Doradztwo korporacyjne": (3000, 15000),
        "Kupno nieruchomości": (1500, 5000),
        "Umowa o pracę": (300, 1000),
        "Sprawa gospodarcza": (2000, 10000),
        "Mediacja": (800, 3000),
        "Prawa autorskie": (2000, 10000),
    }
    return prices.get(service_name, (500, 3000))

def generate_description_unique(first, last, city):
    templates = [
        f"Indywidualne podejście do każdego klienta – {first} {last} z {city}.",
        f"Skuteczna reprezentacja prawna w {city} i całej Polsce.",
        f"Kompleksowa obsługa prawna firm i klientów indywidualnych.",
        f"Pomoc prawna na najwyższym poziomie – Kancelaria {last}.",
        f"Doświadczenie, rzetelność, zaangażowanie – zapraszam do kontaktu.",
        f"Twój zaufany doradca prawny w {city} – {first} {last}.",
        f"Specjalistyczna pomoc prawna dostosowana do Twoich potrzeb.",
        f"Profesjonalna kancelaria prawna z {city} – skutecznie i terminowo.",
    ]
    return random.choice(templates)

def generate_service_unit():
    return random.choice(service_units)

def generate_voivodeships(city_voi):
    all_voi = ["Mazowieckie", "Małopolskie", "Łódzkie", "Dolnośląskie", "Wielkopolskie",
               "Pomorskie", "Zachodniopomorskie", "Kujawsko-Pomorskie", "Lubelskie",
               "Śląskie", "Podlaskie", "Świętokrzyskie", "Podkarpackie", "Warmińsko-Mazurskie",
               "Lubuskie", "Opolskie"]
    base = [city_voi]
    extras = random.sample([v for v in all_voi if v != city_voi], random.randint(0, 3))
    return base + extras

def generate_categories():
    return random.sample(categories_list, random.randint(1, 4))

def generate_services():
    count = random.randint(1, 4)
    chosen = random.sample(services_templates, count)
    result = []
    for name, desc, price_from, price_to in chosen:
        p_from = random.randint(price_from, price_from + (price_to - price_from) // 2)
        p_to = random.randint(max(p_from + 100, price_from + (price_to - price_from) // 2), price_to)
        result.append({
            "nazwaUslugi": name,
            "opisUslugi": generate_service_desc(name),
            "cenaOd": p_from,
            "cenaDo": p_to,
            "jednostka": generate_service_unit(),
            "aktywna": True
        })
    return result

def generate_certificates(idx):
    count = random.randint(0, 3)
    chosen = random.sample(certificates_templates, min(count, len(certificates_templates)))
    result = []
    for name, issuer, prefix in chosen:
        year = random.randint(1998, 2023)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        result.append({
            "nazwaCertyfikatu": name,
            "wydawca": issuer,
            "dataUzyskania": f"{year:04d}-{month:02d}-{day:02d}",
            "dataWaznosci": None if random.random() < 0.3 else f"{year + random.randint(3, 10):04d}-{month:02d}-{day:02d}",
            "numerCertyfikatu": f"{prefix}{random.randint(10000, 99999)}",
            "skanCertyfikatu": f"/uploads/certificates/cert_{idx}.pdf",
            "aktywny": True
        })
    return result

def generate_education():
    count = random.randint(1, 2)
    chosen = random.sample(uni_list, count)
    result = []
    for uni, faculty in chosen:
        year_to = random.randint(2010, 2020)
        year_from = year_to - random.randint(4, 6)
        result.append({
            "uczelnia": uni,
            "wydzial": faculty,
            "rokOd": year_from,
            "rokDo": year_to
        })
    return result

def generate_keywords(categories):
    words = set()
    for cat in categories:
        cat_lower = cat.lower()
        if "gospodarcz" in cat_lower:
            words.update(["prawo gospodarcze", "spółki", "kontrakty", "KRS", "handel"])
        if "cywiln" in cat_lower:
            words.update(["prawo cywilne", "odszkodowania", "umowy", "pozew"])
        if "karn" in cat_lower:
            words.update(["prawo karne", "obrona", "postępowanie karne"])
        if "rodzinn" in cat_lower:
            words.update(["prawo rodzinne", "rozwód", "alimenty", "opieka"])
        if "prac" in cat_lower:
            words.update(["prawo pracy", "umowy o pracę", "kodeks pracy"])
        if "podatk" in cat_lower:
            words.update(["podatki", "PIT", "CIT", "VAT", "doradztwo podatkowe"])
        if "nieruchom" in cat_lower:
            words.update(["nieruchomości", "kupno", "sprzedaż", "najem"])
        if "spadk" in cat_lower:
            words.update(["prawo spadkowe", "testament", "dziedziczenie"])
        if "administracyjn" in cat_lower:
            words.update(["prawo administracyjne", "decyzje", "postępowanie administracyjne"])
        if "międzynarodow" in cat_lower or "miedzynarodow" in cat_lower:
            words.update(["prawo międzynarodowe", "arbitraż"])
    if not words:
        words = random.sample(keywords_pool, 3)
    return list(words)[:6]

data = {"lawFirms": []}

used_emails = set()
used_nips = set()

for i in range(300):
    first = random.choice(first_names)
    last = random.choice(last_names)

    # Generate unique email
    email = generate_email(first, last, i)
    while email in used_emails:
        i += 1
        email = generate_email(first, last, i)
    used_emails.add(email)

    city = random.choice(list(cities_voivodeships.keys()))
    voivodeship, lat, lng = cities_voivodeships[city]

    firm_name = f"Kancelaria {last}"
    full_firm_name = f"{last} i Wspólnicy " + random.choice(["Sp. P.", "Sp. z o.o.", "Sp. k.", "Sp. j.", "S.C."])

    nip = generate_nip(i)
    while nip in used_nips:
        nip = generate_nip(i + 10000)
    used_nips.add(nip)

    typ = random.choice(law_firm_types)
    typ_inny = "Działalność nierejestrowa" if typ == "INNY" else None

    categories = generate_categories()

    entry = {
        "user": {
            "email": email,
            "password": "BezpieczneHaslo123!",
            "name": firm_name
        },
        "lawFirm": {
            "typ": typ,
            "typInny": typ_inny,
            "nazwa": firm_name,
            "nazwaFirmy": full_firm_name,
            "nip": nip,
            "regon": generate_regon(i),
            "krs": generate_krs(i),
            "imieKontakt": first,
            "nazwiskoKontakt": last,
            "numerTelefonu": generate_static_phone(i),
            "numerTelefonu2": generate_static_phone(i + 1000) if random.random() < 0.3 else None,
            "adres": f"{random.choice(streets)} {random.randint(1, 200)}",
            "kodPocztowy": generate_postal_code(),
            "miasto": city,
            "voivodeship": voivodeship,
            "latitude": round(lat + random.uniform(-0.05, 0.05), 6),
            "longitude": round(lng + random.uniform(-0.05, 0.05), 6),
            "opis": generate_description(first, last, city, full_firm_name),
            "logo": f"/uploads/law-firms/logo_{i}.png",
            "zdjecieGlowne": f"/uploads/law-firms/main_{i}.jpg",
            "galeriaZdjec": [f"/uploads/law-firms/gal_{i}_{j}.jpg" for j in range(random.randint(1, 4))],
            "filmYouTube": f"https://www.youtube.com/watch?v={random.choice(['abc', 'xyz', 'qwe', 'rty', 'uio', 'asd', 'fgh', 'jkl', 'zxc', 'vbn'])}{random.randint(100000, 999999)}" if random.random() < 0.5 else None,
            "okladkaFilmu": f"/uploads/law-firms/cover_{i}.jpg" if random.random() < 0.5 else None,
            "kolejnoscMultimedia": random.choice(["zdjecia", "film"]),
            "statusGodzinyOtwarcia": True,
            "godzinyOtwarcia": generate_opening_hours(i % 5),
            "linkLinkedIn": f"https://linkedin.com/company/{last.lower()}" if random.random() < 0.7 else None,
            "linkFacebook": f"https://facebook.com/{last.lower()}" if random.random() < 0.6 else None,
            "linkInstagram": f"https://instagram.com/{last.lower()}" if random.random() < 0.4 else None,
            "linkTwitter": f"https://twitter.com/{last.lower()}" if random.random() < 0.3 else None,
            "linkTikTok": f"https://tiktok.com/@{last.lower()}" if random.random() < 0.2 else None,
            "stronaWww": f"https://{last.lower()}-kancelaria.pl" if random.random() < 0.8 else None,
            "edukacja": generate_education(),
            "oirpMiasto": city if random.random() < 0.7 else None,
            "oirpWpis": f"WA-{random.randint(1000, 9999)}" if random.random() < 0.7 else None,
            "oirpStatus": random.random() < 0.8,
            "oraMiasto": city if random.random() < 0.3 else None,
            "oraWpis": f"ORA-{random.randint(1000, 9999)}" if random.random() < 0.3 else None,
            "oraStatus": random.random() < 0.5,
            "unikatowyOpisUslugi": generate_description_unique(first, last, city),
            "slowaKluczowe": generate_keywords(categories),
            "callaPolska": random.random() < 0.3,
            "onlineOnly": random.random() < 0.1,
            "typOferty": random.choice(offer_types),
            "pakietSubskrypcji": random.choice(subscription_packages),
            "zweryfikowana": random.random() < 0.7,
            "aktywna": True,
            "zgodaRegulamin": True,
            "zgodaPrzetwarzanie": True
        },
        "voivodeships": generate_voivodeships(voivodeship),
        "categories": categories,
        "services": generate_services(),
        "certificates": generate_certificates(i)
    }

    data["lawFirms"].append(entry)

# Save
output_path = "/home/krystian/Projects/ps-map/json/law_firms_300.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(data['lawFirms'])} law firms -> {output_path}")