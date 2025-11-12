"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function EditCasePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)

  useEffect(() => {
    fetchCaseData()
  }, [params.id])

  const fetchCaseData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/cases/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data)
      } else {
        throw new Error("Błąd pobierania danych sprawy")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych sprawy",
        variant: "destructive",
      })
      router.push("/admin/cases")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  if (!caseData) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/cases/${params.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edycja sprawy</h1>
          <p className="text-muted-foreground">{caseData.nazwaSprawy}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formularz edycji sprawy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Formularz edycji sprawy będzie dostępny wkrótce.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Ta strona zostanie zaimplementowana w kolejnym etapie rozwoju systemu.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              W międzyczasie możesz zarządzać sprawą za pomocą API lub bezpośrednio w bazie danych.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href={`/admin/cases/${params.id}`}>
                  Powrót do szczegółów sprawy
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/cases">
                  Powrót do listy spraw
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
