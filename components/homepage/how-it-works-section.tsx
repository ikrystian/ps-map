"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Check, User, Briefcase, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { InteractiveHoverButton } from "../ui/interactive-hover-button"

export function HowItWorksSection() {
    const [activeTab, setActiveTab] = useState<"user" | "expert">("user")

    return (
        <section className="bg-black text-white py-20 overflow-hidden relative">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 font-playfair">Jak to działa?</h2>

                    {/* Tabs */}
                    <div className="flex justify-center gap-12 border-b border-gray-800 w-fit mx-auto">
                        <button
                            onClick={() => setActiveTab("user")}
                            className={`pb-4 text-lg font-medium transition-colors relative px-4 ${activeTab === "user" ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            Dla użytkowników
                            {activeTab === "user" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A66F]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("expert")}
                            className={`pb-4 text-lg font-medium transition-colors relative px-4 ${activeTab === "expert" ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            Dla ekspertów
                            {activeTab === "expert" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A66F]" />
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
                            <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                {activeTab === "user"
                                    ? "Szybka i wygodna pomoc prawna, finansowa i księgowa w jednym miejscu!"
                                    : "Rozwijaj swój biznes i zdobywaj nowych klientów!"}
                            </h3>

                            <div className="space-y-4 text-gray-400">
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
                            <ul className="space-y-2 text-sm text-gray-300">
                                {activeTab === "user" ? (
                                    <>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Szeroki wybór ekspertów</span> – prawnicy, doradcy finansowi, biura rachunkowe w jednym miejscu.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Porównanie ofert</span> – wybierasz najlepszego specjalistę według ceny, opinii i doświadczenia.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Bezpieczne rozliczenia</span> – płacisz dopiero po akceptacji oferty.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Blog ekspercki, artykuły i porady</span> – poszerzaj swoją wiedzę dzięki poradom specjalistów.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span>Dodaj sprawę i znajdź pomoc dopasowaną do Twoich potrzeb.</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Stały dopływ klientów</span> – dostęp do bazy spraw z całej Polski.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Wygodny panel</span> – zarządzaj zleceniami i komunikacją w jednym miejscu.</span>
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <Check className="w-4 h-4 text-white mt-1 shrink-0" />
                                            <span><span className="font-bold text-white">Promocja usług</span> – wyróżnij się na tle konkurencji.</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <Link href={activeTab === "user" ? "/dodaj-sprawe" : "/rejestracja-eksperta"}>
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
                        {/* Background Geometric Shapes (Gold V) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[150%] h-[150%] pointer-events-none">
                            {/* Simplified V shape using SVG */}
                            <svg viewBox="0 0 500 500" className="w-full h-full opacity-30">
                                <path d="M100,100 L250,400 L400,100" fill="none" stroke="#C5A66F" strokeWidth="40" />
                                <path d="M150,50 L250,250 L350,50" fill="none" stroke="#C5A66F" strokeWidth="20" opacity="0.5" />
                            </svg>
                        </div>

                        {/* Phone Frame */}
                        <div className="relative mx-auto border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl z-20">
                            <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>

                            {/* Screen Content */}
                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black relative flex flex-col">
                                {/* App Header */}
                                <div className="pt-12 px-4 pb-4 flex justify-between items-center">
                                    <div className="text-sm font-bold text-white flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-[#C5A66F]" />
                                        prostasprawa
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-white">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* App Body */}
                                <div className="flex-1 px-4 overflow-hidden relative">
                                    {/* Hero in Phone */}
                                    <div className="text-center mt-4 mb-8">
                                        <h3 className="text-xl font-playfair text-white mb-2">Prosta Sprawa</h3>
                                        <p className="text-xs text-gray-400">Tu rozwiązujemy Twoje problemy prawne</p>
                                    </div>

                                    {/* Buttons in Phone */}
                                    <div className="space-y-3 relative z-10">
                                        <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-gray-800 flex items-center justify-between group cursor-pointer hover:border-[#C5A66F]/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#C5A66F]/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-[#C5A66F]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Sprawy prywatne</div>
                                                    <div className="text-[10px] text-gray-500">Rozwody, spadki, odszkodowania</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-gray-800 flex items-center justify-between group cursor-pointer hover:border-[#C5A66F]/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Sprawy firmowe</div>
                                                    <div className="text-[10px] text-gray-500">Umowy, windykacja, podatki</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative background in phone */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent z-0" />
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#C5A66F]/10 to-transparent z-0" />
                                </div>

                                {/* Bottom Navigation */}
                                <div className="bg-gray-900 border-t border-gray-800 p-4 pb-6 flex justify-around items-center relative z-20">
                                    <div className="flex flex-col items-center gap-1 text-[#C5A66F]">
                                        <User className="w-5 h-5" />
                                        <span className="text-[10px]">Profil</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-gray-500">
                                        <Search className="w-5 h-5" />
                                        <span className="text-[10px]">Szukaj</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-gray-500">
                                        <Briefcase className="w-5 h-5" />
                                        <span className="text-[10px]">Zlecenia</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative dots/elements outside phone */}
                        <div className="absolute -right-12 bottom-12 w-24 h-24 opacity-20">
                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(36)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-[#4ADE80] rounded-full" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

