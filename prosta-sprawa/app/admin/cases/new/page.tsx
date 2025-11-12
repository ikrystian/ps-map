"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NewCasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cases">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nowa sprawa</h1>
          <p className="text-muted-foreground">Utwórz nową sprawę dla klienta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formularz tworzenia sprawy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Formularz tworzenia nowej sprawy będzie dostępny wkrótce.
            </p>
            <p className="text-sm text-muted-foreground">
              Ta strona zostanie zaimplementowana w kolejnym etapie rozwoju systemu.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/admin/cases">
                Powrót do listy spraw
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
