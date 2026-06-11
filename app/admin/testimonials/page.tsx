"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

type Testimonial = {
  id: string
  name: string
  designation: string
  quote: string
  src: string
  active: boolean
  order: number
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  // Form fields
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [quote, setQuote] = useState("")
  const [src, setSrc] = useState("")
  const [active, setActive] = useState(true)
  const [order, setOrder] = useState(0)

  const [submitting, setSubmitting] = useState(false)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/testimonials")
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const openAddModal = () => {
    setEditingTestimonial(null)
    setName("")
    setDesignation("")
    setQuote("")
    setSrc("")
    setActive(true)
    setOrder(testimonials.length)
    setIsModalOpen(true)
  }

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t)
    setName(t.name)
    setDesignation(t.designation)
    setQuote(t.quote)
    setSrc(t.src)
    setActive(t.active)
    setOrder(t.order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTestimonial(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !designation || !quote || !src) return

    setSubmitting(true)
    try {
      const payload = { name, designation, quote, src, active, order }
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : "/api/admin/testimonials"

      const res = await fetch(url, {
        method: editingTestimonial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        closeModal()
        fetchTestimonials()
      } else {
        const err = await res.json()
        alert(err.error || "Wystąpił błąd podczas zapisywania.")
      }
    } catch (err) {
      console.error("Submit error:", err)
      alert("Wystąpił błąd sieci.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę opinię?")) return

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleToggleActive = async (t: Testimonial) => {
    const updatedStatus = !t.active
    // Optimistic update
    setTestimonials(prev =>
      prev.map(item => item.id === t.id ? { ...item, active: updatedStatus } : item)
    )

    try {
      await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus })
      })
    } catch (err) {
      console.error("Status update error:", err)
      // Rollback
      setTestimonials(prev =>
        prev.map(item => item.id === t.id ? { ...item, active: t.active } : item)
      )
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === testimonials.length - 1) return

    const targetIdx = direction === "up" ? index - 1 : index + 1
    const newList = [...testimonials]
    const temp = newList[index]
    newList[index] = newList[targetIdx]
    newList[targetIdx] = temp

    // Re-assign order numbers
    const updatedList = newList.map((item, idx) => ({ ...item, order: idx }))
    setTestimonials(updatedList)

    // Save orders sequentially
    try {
      await Promise.all([
        fetch(`/api/admin/testimonials/${updatedList[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[index].order })
        }),
        fetch(`/api/admin/testimonials/${updatedList[targetIdx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedList[targetIdx].order })
        })
      ])
    } catch (err) {
      console.error("Error sorting testimonials:", err)
    }
  }

  return (
    <div className="space-y-8 text-zinc-100 p-6 min-h-screen">
      <AdminHeaderSetter title="Opinie na głównej" subtitle="Zarządzaj referencjami w karuzeli Aceternity UI 3D na głównej landing page" />
      {/* Upper header action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div />

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Dodaj opinię
        </button>
      </div>

      {/* Main content table */}
      <div className="bg-zinc-700 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="py-20 text-center text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            Ładowanie opinii...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 px-4">
            <Sparkles className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Brak opinii</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-2">
              Nie zdefiniowano jeszcze żadnych referencji. Kliknij przycisk powyżej, aby dodać pierwszą opinię!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                  <th className="py-4 px-6 w-16">Kolejność</th>
                  <th className="py-4 px-6 w-20">Zdjęcie</th>
                  <th className="py-4 px-6">Autor i Rola</th>
                  <th className="py-4 px-6 max-w-sm">Tresc opinii</th>
                  <th className="py-4 px-6 w-28 text-center">Widoczność</th>
                  <th className="py-4 px-6 w-32 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {testimonials.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors duration-150">
                    {/* Order buttons */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className={cn(
                            "p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer",
                            idx === 0 && "opacity-30 cursor-not-allowed"
                          )}
                          title="Przesuń w górę"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={idx === testimonials.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className={cn(
                            "p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer",
                            idx === testimonials.length - 1 && "opacity-30 cursor-not-allowed"
                          )}
                          title="Przesuń w dół"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Image Avatar */}
                    <td className="py-4 px-6">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                        {t.src ? (
                          <img
                            src={t.src}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name & Designation */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white text-[15px]">{t.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{t.designation}</div>
                    </td>

                    {/* Testimonial Quote */}
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                        "{t.quote}"
                      </p>
                    </td>

                    {/* Active toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={cn(
                          "mx-auto flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer",
                          t.active
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-400"
                        )}
                        title={t.active ? "Ukryj na stronie" : "Pokaż na stronie"}
                      >
                        {t.active ? (
                          <Eye className="h-4.5 w-4.5" />
                        ) : (
                          <EyeOff className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </td>

                    {/* Actions (Edit / Delete) */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all duration-150 cursor-pointer"
                          title="Edytuj opinię"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-150 cursor-pointer"
                          title="Usuń opinię"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over / Modal for adding and editing testimonials */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Dialog Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 z-10"
            >
              {/* Close X button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-6 pr-8">
                {editingTestimonial ? "Edytuj opinię" : "Dodaj nową opinię"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Autor (Imię i nazwisko)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="np. Anna Kowalska"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>


                {/* Src image url field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    URL Zdjęcia (Kwadratowe, Unsplash)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  />
                </div>

                {/* Quote field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Treść opinii
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Wpisz treść opinii udzielonej przez klienta..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed text-sm"
                  />
                </div>

                {/* Visibility active checkbox & sorting order row */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-zinc-800 accent-primary bg-zinc-950 focus:ring-0"
                    />
                    <span className="text-sm font-semibold text-zinc-300">Widoczna na stronie</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-400">Order:</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-center focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-6 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold transition-colors cursor-pointer"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-lg hover:shadow-primary/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Zapisywanie..." : "Zapisz"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
