"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FaFacebook as Facebook,
  FaTwitter as Twitter,
  FaLinkedin as Linkedin,
  FaYoutube as Youtube,
  FaInstagram as Instagram
} from "react-icons/fa"
import { Phone, Mail, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/sonner"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

export default function ContactClientPage() {
  const [formData, setFormData] = useState({
    imie: "",
    nazwisko: "",
    email: "",
    telefon: "",
    tresc: "",
    politykaPrivacy: false,
  })

  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      politykaPrivacy: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCaptchaVerified) {
      toast.error("Proszę potwierdzić, że nie jesteś robotem.")
      return
    }

    if (!formData.politykaPrivacy) {
      toast.error("Musisz zaakceptować politykę prywatności, aby wysłać wiadomość.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        imieNazwisko: `${formData.imie} ${formData.nazwisko}`.trim(),
        email: formData.email,
        telefon: formData.telefon,
        tresc: formData.tresc,
        politykaPrivacy: formData.politykaPrivacy,
        temat: "INFORMACJA", // Default topic
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania wiadomości.")
      }

      toast.success("Wiadomość została pomyślnie wysłana! Skontaktujemy się z Tobą wkrótce.")

      // Reset form
      setFormData({
        imie: "",
        nazwisko: "",
        email: "",
        telefon: "",
        tresc: "",
        politykaPrivacy: false,
      })
      setIsCaptchaVerified(false)
    } catch (error: any) {
      toast.error(error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-65px)] text-white pb-20 relative overflow-hidden ">
      {/* Breadcrumbs Banner */}
      <div
        className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Kontakt" },
            ]}
          />
        </div>
      </div>

      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Column: Form & Title */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col space-y-8"
          >
            <motion.div variants={fadeIn} className="space-y-4">
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-[54px] leading-tight text-white font-light tracking-tight">
                Chcesz porozmawiać? <br />
                <span className="font-bold">Dobrze trafiłeś!</span>
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base font-light">
                Chętnie odpowiemy na wszystkie Twoje pytania
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              variants={fadeIn}
              className="bg-[#242320]/80 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold font-playfair mb-6 text-white tracking-wide border-b border-neutral-800/50 pb-4">
                Formularz kontaktowy
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Row 1: Imię & Nazwisko */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imie" className="text-xs text-neutral-300 tracking-wider uppercase font-medium">Imię</Label>
                    <Input
                      type="text"
                      id="imie"
                      name="imie"
                      required
                      value={formData.imie}
                      onChange={handleChange}
                      placeholder="Wpisz imię"
                      className="bg-[#1b1a18] border-neutral-800/80 text-white placeholder-neutral-600 focus:border-emerald-600 focus:ring-emerald-600 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nazwisko" className="text-xs text-neutral-300 tracking-wider uppercase font-medium">Nazwisko</Label>
                    <Input
                      type="text"
                      id="nazwisko"
                      name="nazwisko"
                      required
                      value={formData.nazwisko}
                      onChange={handleChange}
                      placeholder="Wpisz nazwisko"
                      className="bg-[#1b1a18] border-neutral-800/80 text-white placeholder-neutral-600 focus:border-emerald-600 focus:ring-emerald-600 h-11"
                    />
                  </div>
                </div>

                {/* Row 2: Telefon & E-mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefon" className="text-xs text-neutral-300 tracking-wider uppercase font-medium">Telefon</Label>
                    <Input
                      type="tel"
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      placeholder="+48 123 456 789"
                      className="bg-[#1b1a18] border-neutral-800/80 text-white placeholder-neutral-600 focus:border-emerald-600 focus:ring-emerald-600 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-neutral-300 tracking-wider uppercase font-medium">E-mail</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nazwa@domena.pl"
                      className="bg-[#1b1a18] border-neutral-800/80 text-white placeholder-neutral-600 focus:border-emerald-600 focus:ring-emerald-600 h-11"
                    />
                  </div>
                </div>

                {/* Row 3: Treść wiadomości */}
                <div className="space-y-2">
                  <Label htmlFor="tresc" className="text-xs text-neutral-300 tracking-wider uppercase font-medium">Treść wiadomości</Label>
                  <Textarea
                    id="tresc"
                    name="tresc"
                    required
                    value={formData.tresc}
                    onChange={handleChange}
                    placeholder="Napisz swoją wiadomość..."
                    rows={6}
                    className="bg-[#1b1a18] border-neutral-800/80 text-white placeholder-neutral-600 focus:border-emerald-600 focus:ring-emerald-600 resize-none"
                  />
                </div>


                {/* Privacy Consent Checkbox */}
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="politykaPrivacy"
                    checked={formData.politykaPrivacy}
                    onCheckedChange={handleCheckboxChange}
                    className="border-neutral-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 mt-1 cursor-pointer"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="politykaPrivacy"
                      className="text-[11px] text-neutral-400 font-normal cursor-pointer select-none leading-relaxed"
                    >
                      Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z {" "}
                      <a href="/polityka-prywatnosci" target="_blank" className="text-emerald-500 hover:underline">
                        Polityką prywatności
                      </a>{" "}
                      w celu obsługi zapytania. *
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto min-w-[200px] bg-[#0e7a57] hover:bg-[#0c6b4c] text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 cursor-pointer  text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </motion.div>

          {/* Right Column: Address Map & Information Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col space-y-8 h-full"
          >
            <motion.div variants={fadeIn} className="space-y-4">
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-[54px] leading-tight text-white font-light tracking-tight">
                Wybierz dogodną formę <br />
                kontaktu <span className="font-bold">z nami</span>
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base font-light invisible">
                Spacer
              </p>
            </motion.div>

            {/* Map Card */}
            <motion.div
              variants={fadeIn}
              className="bg-[#242320]/40 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl aspect-square lg:aspect-auto lg:h-[480px] w-full relative"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.4485501861053!2d20.6133887771146!3d50.86475727167389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471827e7f6a7d187%3A0x92f9d85ca6eb1d52!2sLangiewicza%2016%2C%2025-381%20Kielce%2C%20Poland!5e0!3m2!1sen!2sus!4v1717500000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(0.95)" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa dojazdu"
                className="w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
          </motion.div>

        </div>

        {/* Section: Inne preferowane formy kontaktu */}
        <div className="mt-28 border-t border-neutral-800/50 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h2 className="font-playfair text-3xl sm:text-4xl text-white font-light">
              Inne preferowane formy kontaktu
            </h2>

            {/* Social Icons */}
            <div className="flex space-x-3">
              {[
                { icon: <Facebook className="w-5 h-5" />, href: "#" },
                { icon: <Twitter className="w-5 h-5" />, href: "#" },
                { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                { icon: <Youtube className="w-5 h-5" />, href: "#" },
                { icon: <Instagram className="w-5 h-5" />, href: "#" },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ scale: 1.1, backgroundColor: "#1e1d1a", borderColor: "#0da192" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors duration-300 shadow-md"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Three Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Telefon */}
            <motion.div
              whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.2)" }}
              className="bg-[#242320]/60 border border-neutral-800/80 rounded-xl p-8 relative overflow-hidden group shadow-md transition-all duration-300"
            >
              {/* Dot Pattern Graphic */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <svg width="100" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="dots1" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#dots1)" />
                </svg>
              </div>

              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-500 group-hover:bg-emerald-950/40 group-hover:text-emerald-400 transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair text-xl text-white font-medium">Telefon</h3>
                </div>

                <div className="space-y-2 text-neutral-400  text-sm sm:text-base">
                  <a href="tel:+48123321321" className="block hover:text-emerald-500 transition-colors flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 opacity-40" />
                    +48 123 321 321
                  </a>
                  <a href="tel:+48123321321" className="block hover:text-emerald-500 transition-colors flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 opacity-40" />
                    +48 123 321 321
                  </a>
                  <a href="tel:+48123321321" className="block hover:text-emerald-500 transition-colors flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 opacity-40" />
                    +48 123 321 321
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Card 2: E-mail */}
            <motion.div
              whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.2)" }}
              className="bg-[#242320]/60 border border-neutral-800/80 rounded-xl p-8 relative overflow-hidden group shadow-md transition-all duration-300"
            >
              {/* Dot / Globe-like Pattern Graphic */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <svg width="120" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="dots2" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                  {/* Styled curves simulating connection arcs */}
                  <path d="M10 80 Q 50 10, 110 80" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                  <path d="M20 90 Q 60 30, 100 90" stroke="white" strokeWidth="0.8" strokeDasharray="2 2" />
                  <rect width="120" height="100" fill="url(#dots2)" />
                </svg>
              </div>

              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-500 group-hover:bg-emerald-950/40 group-hover:text-emerald-400 transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair text-xl text-white font-medium">E-mail</h3>
                </div>

                <div className="space-y-3 text-neutral-400  text-sm sm:text-base">
                  <a href="mailto:biuro@prostasprawa.pl" className="block hover:text-emerald-500 transition-colors flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 opacity-40" />
                    biuro@prostasprawa.pl
                  </a>
                  <a href="mailto:sprawy@prostasprawa.pl" className="block hover:text-emerald-500 transition-colors flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 opacity-40" />
                    sprawy@prostasprawa.pl
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Dane */}
            <motion.div
              whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.2)" }}
              className="bg-[#242320]/60 border border-neutral-800/80 rounded-xl p-8 relative overflow-hidden group shadow-md transition-all duration-300"
            >
              {/* Dot Pattern Graphic */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <svg width="100" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="dots3" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#dots3)" />
                </svg>
              </div>

              <div className="flex flex-col space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-500 group-hover:bg-emerald-950/40 group-hover:text-emerald-400 transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair text-xl text-white font-medium">Dane</h3>
                </div>

                <div className="space-y-2 text-neutral-400  text-xs sm:text-sm leading-relaxed">
                  <p className="text-white font-medium">Polska Grupa Identyfikacji Firm Sp. z o.o.</p>
                  <p className="flex items-start gap-2 hover:text-emerald-500 transition-colors">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 opacity-40 flex-shrink-0" />
                    <span>ul. Langiewicza 16/3,<br />25-381 Kielce</span>
                  </p>
                  <div className="border-t border-neutral-800/50 pt-2 mt-2 space-y-0.5 text-[11px] text-neutral-500">
                    <p>KRS: 0000768210</p>
                    <p>NIP: 9592020678</p>
                    <p>REGON: 382401289</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  )
}
