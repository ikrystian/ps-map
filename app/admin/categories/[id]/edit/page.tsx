"use client"

import { CategoryForm, CategoryFormValues } from "@/components/admin/category-form"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useState } from "react"

import { Category } from "@/types/categories"

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

  const fetchData = useCallback(async () => {
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
  }, [id, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
        router.refresh()
        await fetchData()
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
