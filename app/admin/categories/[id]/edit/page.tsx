"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CategoryForm, CategoryFormValues } from "@/components/admin/category-form"

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"
  parentId?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, allCatsRes] = await Promise.all([
          fetch(`/api/categories/${id}`),
          fetch("/api/categories")
        ])

        if (catRes.ok && allCatsRes.ok) {
          const catData = await catRes.json()
          const allCatsData = await allCatsRes.json()
          setCategory(catData)
          setCategories(allCatsData)
        } else {
          toast.error("Nie udało się pobrać danych")
          router.push("/admin/categories")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Wystąpił błąd podczas pobierania danych")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const handleEditCategory = async (values: CategoryFormValues) => {
    setSaving(true)
    try {
      // Konwertuj "none" na null przed wysłaniem
      const dataToSend = {
        ...values,
        parentId: values.parentId === "none" ? null : values.parentId,
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast.success("Kategoria została zaktualizowana")
        router.push("/admin/categories")
        router.refresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji kategorii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować kategorii")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <CategoryForm
      title={`Edytuj kategorię: ${category.nazwa}`}
      initialData={category}
      categories={categories}
      onSubmit={handleEditCategory}
      isLoading={saving}
    />
  )
}
