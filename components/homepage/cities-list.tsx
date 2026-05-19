import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function CitiesList() {
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
            {[
              "Augustów", "Baranowo", "Bartoszyce", "Bełchatów", "Biała Podlaska",
              "Białogard", "Białystok", "Bielawa", "Bielsko-Biała", "Biłgoraj",
              "Braniewo", "Brodnica", "Brzeg", "Brzesko", "Brzeziny",
              "Busko-Zdrój", "Bydgoszcz", "Bytom", "Bytów", "Chełm",
              "Chełmno", "Chojnice", "Chorzów", "Cieszyn", "Ciechanów",
              "Czarnków", "Częstochowa", "Czyżew", "Dąbrowa Górnicza", "Dębica",
              "Dzierżoniów", "Elbląg", "Ełk", "Gdańsk", "Gdynia",
              "Giżycko", "Gliwice", "Głogów", "Gniezno", "Goleniów",
              "Gorlice", "Gorzów Wielkopolski",
              "Gostynin", "Grajewo", "Grodzisk Mazowiecki", "Grudziądz", "Gryfice",
              "Gryfino", "Hajnówka", "Iława", "Inowrocław", "Jarocin",
              "Jarosław", "Jastrzębie-Zdrój", "Jasło", "Jawor", "Jaworzno",
              "Jedlińsk", "Jelenia Góra", "Kalisz", "Kamień Pomorski", "Katowice",
              "Kędzierzyn-Koźle", "Kępno", "Kielce", "Kluczbork", "Kłodzko",
              "Knurów", "Kołobrzeg", "Koło", "Konin", "Końskie",
              "Koszalin", "Kozienice", "Kraków", "Kraśnik", "Krosno",
              "Kutno", "Legnica", "Leszno", "Lidzbark Warmiński", "Limanowa",
              "Lubań", "Lubin", "Lublin", "Lubliniec", "Luboń",
              "Łańcut", "Łask", "Łęczyca", "Łomża", "Łowicz",
              "Łódź", "Łuków", "Malbork", "Marki", "Mielec",
              "Mikołów", "Miłosław", "Mińsk Mazowiecki", "Mława", "Mogilno",
              "Mragowo", "Mysłowice", "Myszków", "Nakło nad Notecią", "Nowa Dęba",
              "Nowa Ruda", "Nowa Sól", "Nowe Miasto Lubawskie", "Nowy Dwór Mazowiecki", "Nowy Sącz",
              "Nowy Targ", "Nysa", "Oborniki", "Olecko", "Oleśnica",
              "Olkusz", "Olsztyn", "Opole", "Opole Lubelskie", "Orneta",
              "Ostrołęka", "Ostrowiec Świętokrzyski", "Ostrów Mazowiecka", "Ostrów Wielkopolski", "Oświęcim",
              "Pabianice", "Pajęczno", "Piaseczno", "Piła", "Pińczów",
              "Piotrków Trybunalski", "Pisz", "Płock", "Płońsk", "Poniatowa",
              "Poznań", "Proszowice", "Pruszcz Gdański", "Pruszków", "Przemyśl",
              "Przeworsk", "Przasnysz", "Puck", "Puławy", "Pułtusk",
              "Raciąż", "Racibórz", "Radom", "Radomsko", "Radzymin",
              "Rawa Mazowiecka", "Reda", "Ropczyce", "Ruda Śląska", "Rumia",
              "Rybnik", "Ryki", "Rzeszów", "Sanok", "Sandomierz",
              "Sejny", "Siedlce", "Siemianowice Śląskie", "Sieradz", "Siemiatycze",
              "Skierniewice", "Słubice", "Słupca", "Słupsk", "Sokołów Podlaski",
              "Sopot", "Sosnowiec", "Stalowa Wola", "Starachowice", "Stargard",
              "Starogard Gdański", "Staszów", "Stawiski", "Śrem", "Środa Wielkopolska",
              "Świdnica", "Świdnik", "Świebodzice", "Świebodzin", "Świecie",
              "Świętochłowice", "Świnoujście", "Szczecin", "Szczecinek", "Szczytno",
              "Szprotawa", "Sztum", "Tarnobrzeg", "Tarnów", "Tarnowskie Góry",
              "Tczew", "Tomaszów Lubelski", "Tomaszów Mazowiecki", "Toruń", "Trzebinia",
              "Turek", "Tychowo", "Tychy", "Ustka", "Wadowice",
              "Wałbrzych", "Wałcz", "Warszawa", "Wąbrzeźno", "Wąchock",
              "Węgorzewo", "Węgrów", "Wieliczka", "Wieluń", "Wieruszów",
              "Włocławek", "Włodawa", "Włoszczowa", "Wodzisław Śląski", "Wołomin",
              "Wołów", "Września", "Wrocław", "Wschowa", "Wysokie Mazowieckie",
              "Zabrze", "Zakopane", "Zambrów", "Zamość", "Zduńska Wola",
              "Zgorzelec", "Zielona Góra", "Ziębice", "Złotoryja", "Złotów",
              "Żary", "Żnin", "Żory", "Żuromin", "Żyrardów"
            ].map((city) => (
              <Button
                key={city}
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href={`/szukaj-prawnika?miasto=${city}`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {city}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
