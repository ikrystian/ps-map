"use client"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { motion } from "framer-motion"
import { Check, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function HowItWorksSection() {
    const [activeTab, setActiveTab] = useState<"user" | "expert">("user")

    return (
        <section className="on-dark bg-black text-white py-8 lg:py-20 xl:py-24 overflow-hidden relative">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-playfair font-light mb-12">Jak to działa?</h2>

                    {/* Tabs */}
                    <div className="flex justify-center gap-4 md:gap-12 border-b border-border w-fit mx-auto">
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`pb-4 text-sm md:text-lg font-medium transition-colors relative px-4 ${activeTab === "user" ? "text-white" : "text-muted-foreground hover:text-foreground/80"
                                }`}
                        >
                            Dla użytkowników
                            {activeTab === "user" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("expert")}
                            className={`pb-4 text-sm md:text-lg font-medium transition-colors relative px-4 ${activeTab === "expert" ? "text-white" : "text-muted-foreground hover:text-foreground/80"
                                }`}
                        >
                            Dla ekspertów
                            {activeTab === "expert" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
                            )}
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    {/* Left Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl md:text-4xl font-playfair mb-6 leading-tight">
                                {activeTab === "user"
                                    ? "Szybka i wygodna pomoc prawna, finansowa i księgowa w jednym miejscu!"
                                    : "Rozwijaj swój biznes i zdobywaj nowych klientów!"}
                            </h3>

                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    {activeTab === "user"
                                        ? "Nie musisz szukać na własną rękę – wystarczy, że dodasz swoją sprawę, a specjaliści sami przedstawią Ci swoje oferty. Ty decydujesz, z kim chcesz współpracować."
                                        : "Dołącz do grona ekspertów i zyskaj dostęp do tysięcy potencjalnych klientów szukających Twojej pomocy. Buduj swoją markę i reputację online."}
                                </p>
                                <p>
                                    {activeTab === "user"
                                        ? "Wybieraj świadomie i korzystaj z najlepszych ofert. Na prostasprawa.pl znajdziesz specjalistów, którzy pomogą Ci rozwiązać problemy prawne, finansowe i księgowe – szybko, skutecznie i bez wychodzenia z domu."
                                        : "Oferujemy narzędzia, które ułatwią Ci zarządzanie sprawami, komunikację z klientami i rozliczenia. Skup się na tym, co robisz najlepiej – my zajmiemy się resztą."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-bold text-lg">Jak to działa?</h4>
                            <ul className="space-y-4">
                                {activeTab === "user" ? (
                                    <>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Dodaj swoją sprawę</span> – opisz problem, a my dopasujemy do Ciebie odpowiednich ekspertów.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Otrzymaj oferty</span> – specjaliści zaproponują warunki współpracy, a Ty wybierzesz najlepszą ofertę.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Rozwiąż swoją sprawę</span> – kontaktuj się bezpośrednio z wybranym ekspertem i uzyskaj pomoc.
                                            </div>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Załóż konto eksperta</span> – wypełnij profil i potwierdź swoje kwalifikacje.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Przeglądaj zlecenia</span> – otrzymuj powiadomienia o nowych sprawach pasujących do Twojej specjalizacji.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="mt-1 bg-[#163300] rounded-full p-1 min-w-[24px] h-[24px] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#C5A66F]">Zarabiaj i buduj markę</span> – realizuj zlecenia i zbieraj pozytywne opinie od klientów.
                                            </div>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">Dlaczego warto?</h4>
                            <ul className="space-y-2 text-sm text-foreground/80">
                                {activeTab === "user" ? (
                                    <>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Szeroki wybór ekspertów</span> – prawnicy, doradcy finansowi, biura rachunkowe w jednym miejscu.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Porównanie ofert</span> – wybierasz najlepszego specjalistę według ceny, opinii i doświadczenia.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Bezpieczne rozliczenia</span> – płacisz dopiero po akceptacji oferty.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Blog ekspercki, artykuły i porady</span> – poszerzaj swoją wiedzę dzięki poradom specjalistów.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span>Dodaj sprawę i znajdź pomoc dopasowaną do Twoich potrzeb.</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Stały dopływ klientów</span> – dostęp do bazy spraw z całej Polski.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Wygodny panel</span> – zarządzaj zleceniami i komunikacją w jednym miejscu.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-foreground mt-1 shrink-0" />
                                            <span><span className="font-bold text-foreground">Promocja usług</span> – wyróżnij się na tle konkurencji.</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <Link href={activeTab === "user" ? "/z-nami-wygrywasz" : "/dla-prawnika"}>
                            <InteractiveHoverButton >Zobacz więcej</InteractiveHoverButton>
                        </Link>

                    </motion.div>

                    {/* Right Content - Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative flex justify-center items-center mt-12 lg:mt-0"
                    >
                        <Image src={"/images/sekcja_jak_to_dziala.webp"} width={828} height={975} alt="Jak to działa" />
                    </motion.div>
                </div>
            </div>
        </section >
    )
}

