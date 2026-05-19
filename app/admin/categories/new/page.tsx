"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CategoryForm, CategoryFormValues } from "@/components/admin/category-form"

interface Category {
  id: string
  nazwa: string
  slug: string
  typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"
  parentId?: string | null
  aktywna: boolean
  kolejnosc: number
}

export default function NewCategoryPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const handleCreateCategory = async (values: CategoryFormValues) => {
    setLoading(true)
    try {
      // Konwertuj "none" na null przed wysłaniem
      const dataToSend = {
        ...values,
        parentId: values.parentId === "none" ? null : values.parentId,
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast.success("Kategoria została utworzona")
        router.push("/admin/categories")
        router.refresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd tworzenia kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć kategorii")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CategoryForm
      title="Dodaj nową kategorię"
      categories={categories}
      onSubmit={handleCreateCategory}
      isLoading={loading}
    />
  )
}
