"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

export const CITIES = [
  { nazwa: "Augustów", wojewodztwo: "Podlaskie" },
  { nazwa: "Baranowo", wojewodztwo: "Mazowieckie" },
  { nazwa: "Bartoszyce", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Bełchatów", wojewodztwo: "Łódzkie" },
  { nazwa: "Biała Podlaska", wojewodztwo: "Lubelskie" },
  { nazwa: "Białogard", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Białystok", wojewodztwo: "Podlaskie" },
  { nazwa: "Bielawa", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Bielsko-Biała", wojewodztwo: "Śląskie" },
  { nazwa: "Biłgoraj", wojewodztwo: "Lubelskie" },
  { nazwa: "Braniewo", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Brodnica", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Brzeg", wojewodztwo: "Opolskie" },
  { nazwa: "Brzesko", wojewodztwo: "Małopolskie" },
  { nazwa: "Brzeziny", wojewodztwo: "Łódzkie" },
  { nazwa: "Busko-Zdrój", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Bydgoszcz", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Bytom", wojewodztwo: "Śląskie" },
  { nazwa: "Bytów", wojewodztwo: "Pomorskie" },
  { nazwa: "Chełm", wojewodztwo: "Lubelskie" },
  { nazwa: "Chełmno", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Chojnice", wojewodztwo: "Pomorskie" },
  { nazwa: "Chorzów", wojewodztwo: "Śląskie" },
  { nazwa: "Cieszyn", wojewodztwo: "Śląskie" },
  { nazwa: "Ciechanów", wojewodztwo: "Mazowieckie" },
  { nazwa: "Czarnków", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Częstochowa", wojewodztwo: "Śląskie" },
  { nazwa: "Czyżew", wojewodztwo: "Podlaskie" },
  { nazwa: "Dąbrowa Górnicza", wojewodztwo: "Śląskie" },
  { nazwa: "Dębica", wojewodztwo: "Podkarpackie" },
  { nazwa: "Dzierżoniów", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Elbląg", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Ełk", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Gdańsk", wojewodztwo: "Pomorskie" },
  { nazwa: "Gdynia", wojewodztwo: "Pomorskie" },
  { nazwa: "Giżycko", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Gliwice", wojewodztwo: "Śląskie" },
  { nazwa: "Głogów", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Gniezno", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Goleniów", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Gorlice", wojewodztwo: "Małopolskie" },
  { nazwa: "Gorzów Wielkopolski", wojewodztwo: "Lubuskie" },
  { nazwa: "Gostynin", wojewodztwo: "Mazowieckie" },
  { nazwa: "Grajewo", wojewodztwo: "Podlaskie" },
  { nazwa: "Grodzisk Mazowiecki", wojewodztwo: "Mazowieckie" },
  { nazwa: "Grudziądz", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Gryfice", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Gryfino", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Hajnówka", wojewodztwo: "Podlaskie" },
  { nazwa: "Iława", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Inowrocław", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Jarocin", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Jarosław", wojewodztwo: "Podkarpackie" },
  { nazwa: "Jastrzębie-Zdrój", wojewodztwo: "Śląskie" },
  { nazwa: "Jasło", wojewodztwo: "Podkarpackie" },
  { nazwa: "Jawor", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Jaworzno", wojewodztwo: "Śląskie" },
  { nazwa: "Jedlińsk", wojewodztwo: "Mazowieckie" },
  { nazwa: "Jelenia Góra", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Kalisz", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Kamień Pomorski", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Katowice", wojewodztwo: "Śląskie" },
  { nazwa: "Kędzierzyn-Koźle", wojewodztwo: "Opolskie" },
  { nazwa: "Kępno", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Kielce", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Kluczbork", wojewodztwo: "Opolskie" },
  { nazwa: "Kłodzko", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Knurów", wojewodztwo: "Śląskie" },
  { nazwa: "Kołobrzeg", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Koło", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Konin", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Końskie", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Koszalin", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Kozienice", wojewodztwo: "Mazowieckie" },
  { nazwa: "Kraków", wojewodztwo: "Małopolskie" },
  { nazwa: "Kraśnik", wojewodztwo: "Lubelskie" },
  { nazwa: "Krosno", wojewodztwo: "Podkarpackie" },
  { nazwa: "Kutno", wojewodztwo: "Łódzkie" },
  { nazwa: "Legnica", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Leszno", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Lidzbark Warmiński", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Limanowa", wojewodztwo: "Małopolskie" },
  { nazwa: "Lubań", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Lubin", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Lublin", wojewodztwo: "Lubelskie" },
  { nazwa: "Lubliniec", wojewodztwo: "Śląskie" },
  { nazwa: "Luboń", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Łańcut", wojewodztwo: "Podkarpackie" },
  { nazwa: "Łask", wojewodztwo: "Łódzkie" },
  { nazwa: "Łęczyca", wojewodztwo: "Łódzkie" },
  { nazwa: "Łomża", wojewodztwo: "Podlaskie" },
  { nazwa: "Łowicz", wojewodztwo: "Łódzkie" },
  { nazwa: "Łódź", wojewodztwo: "Łódzkie" },
  { nazwa: "Łuków", wojewodztwo: "Lubelskie" },
  { nazwa: "Malbork", wojewodztwo: "Pomorskie" },
  { nazwa: "Marki", wojewodztwo: "Mazowieckie" },
  { nazwa: "Mielec", wojewodztwo: "Podkarpackie" },
  { nazwa: "Mikołów", wojewodztwo: "Śląskie" },
  { nazwa: "Miłosław", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Mińsk Mazowiecki", wojewodztwo: "Mazowieckie" },
  { nazwa: "Mława", wojewodztwo: "Mazowieckie" },
  { nazwa: "Mogilno", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Mrągowo", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Mysłowice", wojewodztwo: "Śląskie" },
  { nazwa: "Myszków", wojewodztwo: "Śląskie" },
  { nazwa: "Nakło nad Notecią", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Nowa Dęba", wojewodztwo: "Podkarpackie" },
  { nazwa: "Nowa Ruda", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Nowa Sól", wojewodztwo: "Lubuskie" },
  { nazwa: "Nowe Miasto Lubawskie", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Nowy Dwór Mazowiecki", wojewodztwo: "Mazowieckie" },
  { nazwa: "Nowy Sącz", wojewodztwo: "Małopolskie" },
  { nazwa: "Nowy Targ", wojewodztwo: "Małopolskie" },
  { nazwa: "Nysa", wojewodztwo: "Opolskie" },
  { nazwa: "Oborniki", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Olecko", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Oleśnica", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Olkusz", wojewodztwo: "Małopolskie" },
  { nazwa: "Olsztyn", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Opole", wojewodztwo: "Opolskie" },
  { nazwa: "Opole Lubelskie", wojewodztwo: "Lubelskie" },
  { nazwa: "Orneta", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Ostrołęka", wojewodztwo: "Mazowieckie" },
  { nazwa: "Ostrowiec Świętokrzyski", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Ostrów Mazowiecka", wojewodztwo: "Mazowieckie" },
  { nazwa: "Ostrów Wielkopolski", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Oświęcim", wojewodztwo: "Małopolskie" },
  { nazwa: "Pabianice", wojewodztwo: "Łódzkie" },
  { nazwa: "Pajęczno", wojewodztwo: "Łódzkie" },
  { nazwa: "Piaseczno", wojewodztwo: "Mazowieckie" },
  { nazwa: "Piła", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Pińczów", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Piotrków Trybunalski", wojewodztwo: "Łódzkie" },
  { nazwa: "Pisz", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Płock", wojewodztwo: "Mazowieckie" },
  { nazwa: "Płońsk", wojewodztwo: "Mazowieckie" },
  { nazwa: "Poniatowa", wojewodztwo: "Lubelskie" },
  { nazwa: "Poznań", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Proszowice", wojewodztwo: "Małopolskie" },
  { nazwa: "Pruszcz Gdański", wojewodztwo: "Pomorskie" },
  { nazwa: "Pruszków", wojewodztwo: "Mazowieckie" },
  { nazwa: "Przemyśl", wojewodztwo: "Podkarpackie" },
  { nazwa: "Przeworsk", wojewodztwo: "Podkarpackie" },
  { nazwa: "Przasnysz", wojewodztwo: "Mazowieckie" },
  { nazwa: "Puck", wojewodztwo: "Pomorskie" },
  { nazwa: "Puławy", wojewodztwo: "Lubelskie" },
  { nazwa: "Pułtusk", wojewodztwo: "Mazowieckie" },
  { nazwa: "Raciąż", wojewodztwo: "Mazowieckie" },
  { nazwa: "Racibórz", wojewodztwo: "Śląskie" },
  { nazwa: "Radom", wojewodztwo: "Mazowieckie" },
  { nazwa: "Radomsko", wojewodztwo: "Łódzkie" },
  { nazwa: "Radzymin", wojewodztwo: "Mazowieckie" },
  { nazwa: "Rawa Mazowiecka", wojewodztwo: "Łódzkie" },
  { nazwa: "Reda", wojewodztwo: "Pomorskie" },
  { nazwa: "Ropczyce", wojewodztwo: "Podkarpackie" },
  { nazwa: "Ruda Śląska", wojewodztwo: "Śląskie" },
  { nazwa: "Rumia", wojewodztwo: "Pomorskie" },
  { nazwa: "Rybnik", wojewodztwo: "Śląskie" },
  { nazwa: "Ryki", wojewodztwo: "Lubelskie" },
  { nazwa: "Rzeszów", wojewodztwo: "Podkarpackie" },
  { nazwa: "Sanok", wojewodztwo: "Podkarpackie" },
  { nazwa: "Sandomierz", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Sejny", wojewodztwo: "Podlaskie" },
  { nazwa: "Siedlce", wojewodztwo: "Mazowieckie" },
  { nazwa: "Siemianowice Śląskie", wojewodztwo: "Śląskie" },
  { nazwa: "Sieradz", wojewodztwo: "Łódzkie" },
  { nazwa: "Siemiatycze", wojewodztwo: "Podlaskie" },
  { nazwa: "Skierniewice", wojewodztwo: "Łódzkie" },
  { nazwa: "Słubice", wojewodztwo: "Lubuskie" },
  { nazwa: "Słupca", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Słupsk", wojewodztwo: "Pomorskie" },
  { nazwa: "Sokołów Podlaski", wojewodztwo: "Mazowieckie" },
  { nazwa: "Sopot", wojewodztwo: "Pomorskie" },
  { nazwa: "Sosnowiec", wojewodztwo: "Śląskie" },
  { nazwa: "Stalowa Wola", wojewodztwo: "Podkarpackie" },
  { nazwa: "Starachowice", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Stargard", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Starogard Gdański", wojewodztwo: "Pomorskie" },
  { nazwa: "Staszów", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Stawiski", wojewodztwo: "Podlaskie" },
  { nazwa: "Śrem", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Środa Wielkopolska", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Świdnica", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Świdnik", wojewodztwo: "Lubelskie" },
  { nazwa: "Świebodzice", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Świebodzin", wojewodztwo: "Lubuskie" },
  { nazwa: "Świecie", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Świętochłowice", wojewodztwo: "Śląskie" },
  { nazwa: "Świnoujście", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Szczecin", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Szczecinek", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Szczytno", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Szprotawa", wojewodztwo: "Lubuskie" },
  { nazwa: "Sztum", wojewodztwo: "Pomorskie" },
  { nazwa: "Tarnobrzeg", wojewodztwo: "Podkarpackie" },
  { nazwa: "Tarnów", wojewodztwo: "Małopolskie" },
  { nazwa: "Tarnowskie Góry", wojewodztwo: "Śląskie" },
  { nazwa: "Tczew", wojewodztwo: "Pomorskie" },
  { nazwa: "Tomaszów Lubelski", wojewodztwo: "Lubelskie" },
  { nazwa: "Tomaszów Mazowiecki", wojewodztwo: "Łódzkie" },
  { nazwa: "Toruń", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Trzebinia", wojewodztwo: "Małopolskie" },
  { nazwa: "Turek", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Tychowo", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Tychy", wojewodztwo: "Śląskie" },
  { nazwa: "Ustka", wojewodztwo: "Pomorskie" },
  { nazwa: "Wadowice", wojewodztwo: "Małopolskie" },
  { nazwa: "Wałbrzych", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Wałcz", wojewodztwo: "Zachodniopomorskie" },
  { nazwa: "Warszawa", wojewodztwo: "Mazowieckie" },
  { nazwa: "Wąbrzeźno", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Wąchock", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Węgorzewo", wojewodztwo: "Warmińsko-Mazurskie" },
  { nazwa: "Węgrów", wojewodztwo: "Mazowieckie" },
  { nazwa: "Wieliczka", wojewodztwo: "Małopolskie" },
  { nazwa: "Wieluń", wojewodztwo: "Łódzkie" },
  { nazwa: "Wieruszów", wojewodztwo: "Łódzkie" },
  { nazwa: "Włocławek", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Włodawa", wojewodztwo: "Lubelskie" },
  { nazwa: "Włoszczowa", wojewodztwo: "Świętokrzyskie" },
  { nazwa: "Wodzisław Śląski", wojewodztwo: "Śląskie" },
  { nazwa: "Wołomin", wojewodztwo: "Mazowieckie" },
  { nazwa: "Wołów", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Września", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Wrocław", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Wschowa", wojewodztwo: "Lubuskie" },
  { nazwa: "Wysokie Mazowieckie", wojewodztwo: "Podlaskie" },
  { nazwa: "Zabrze", wojewodztwo: "Śląskie" },
  { nazwa: "Zakopane", wojewodztwo: "Małopolskie" },
  { nazwa: "Zambrów", wojewodztwo: "Podlaskie" },
  { nazwa: "Zamość", wojewodztwo: "Lubelskie" },
  { nazwa: "Zduńska Wola", wojewodztwo: "Łódzkie" },
  { nazwa: "Zgorzelec", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Zielona Góra", wojewodztwo: "Lubuskie" },
  { nazwa: "Ziębice", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Złotoryja", wojewodztwo: "Dolnośląskie" },
  { nazwa: "Złotów", wojewodztwo: "Wielkopolskie" },
  { nazwa: "Żary", wojewodztwo: "Lubuskie" },
  { nazwa: "Żnin", wojewodztwo: "Kujawsko-Pomorskie" },
  { nazwa: "Żory", wojewodztwo: "Śląskie" },
  { nazwa: "Żuromin", wojewodztwo: "Mazowieckie" },
  { nazwa: "Żyrardów", wojewodztwo: "Mazowieckie" },
]

export function CitiesList() {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/api/cities")
        const data = await res.json()
        if (Array.isArray(data)) {
          setCities(data.map((c: any) => c.nazwa))
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cities.length === 0) {
    return null
  }

  const visibleCities = isExpanded ? cities : cities.slice(0, 25)

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Znajdź usługi w swoim mieście
          </h2>
          <p className="text-xl text-muted-foreground">
            Eksperci prawni dostępni w całej Polsce
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {visibleCities.map((city) => (
              <Button
                key={city}
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href={`/szukaj-prawnika?miasto=${city}`}>
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {city}
                </Link>
              </Button>
            ))}
          </div>

          {cities.length > 25 && (
            <div className="text-center mt-10">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="lg"
                className="gap-2 font-medium"
              >
                {isExpanded ? (
                  <>
                    Pokaż mniej <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Pokaż więcej <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
