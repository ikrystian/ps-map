"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Plus, Star } from "lucide-react"
import Link from "next/link"

export function LawyerBenefitsSection() {
    return (
        <section className="bg-[#222222] text-white py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-medium">
                        Zyskaj klientów
                    </p>
                    <h2 className="text-4xl md:text-5xl font-serif">
                        Wypróbuj <span className="font-bold">ProstaSprawa.pl</span> od 0 zł
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                    {/* Card 1 */}
                    <div className="bg-[#1a1a1a] p-12 rounded-sm flex flex-col items-center text-center group hover:bg-[#252525] transition-colors duration-300">
                        <h3 className="text-2xl font-serif mb-2">Zwiększ</h3>
                        <h3 className="text-2xl font-serif mb-12">zasięg</h3>

                        <div className="relative w-16 h-16 text-[#008080]">
                            {/* Simplified map outline using SVG */}
                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="w-full h-full">
                                <path d="M20,30 L40,20 L70,25 L80,50 L70,80 L40,85 L20,60 Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#1a1a1a] p-12 rounded-sm flex flex-col items-center text-center group hover:bg-[#252525] transition-colors duration-300">
                        <h3 className="text-2xl font-serif mb-2">Buduj</h3>
                        <h3 className="text-2xl font-serif mb-12">markę</h3>

                        <div className="relative w-16 h-16 text-[#008080]">
                            <MapPin className="w-10 h-10 absolute bottom-0 left-0" />
                            <div className="absolute top-0 right-0 border-2 border-[#008080] rounded-sm p-1">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#1a1a1a] p-12 rounded-sm flex flex-col items-center text-center group hover:bg-[#252525] transition-colors duration-300">
                        <h3 className="text-2xl font-serif mb-2">Zdobywaj</h3>
                        <h3 className="text-2xl font-serif mb-12">więcej spraw</h3>

                        <div className="relative w-16 h-16 text-[#008080]">
                            <div className="flex flex-col gap-2">
                                <div className="h-1 w-12 bg-current rounded-full"></div>
                                <div className="h-1 w-8 bg-current rounded-full"></div>
                                <div className="h-1 w-10 bg-current rounded-full"></div>
                            </div>
                            <Plus className="w-8 h-8 absolute bottom-0 right-0 stroke-[4]" />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Button
                        asChild
                        className="bg-[#008080] hover:bg-[#006666] text-white px-12 py-6 text-lg rounded-md font-medium transition-all duration-300"
                    >
                        <Link href="/rejestracja/kancelaria">
                            Zarejestruj się
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
