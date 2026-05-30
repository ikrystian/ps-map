"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LawFirm {
  categories: Array<{
    id: string
    category: {
      nazwa: string
      slug: string
      opis?: string | null
      opisDodatkowy?: string | null
      typ: string
    }
  }>
}

interface ServicesTabProps {
  lawFirm: LawFirm
}

export function ServicesTab({ lawFirm }: ServicesTabProps) {
  return (
    <div className="space-y-4">
      {lawFirm.categories && lawFirm.categories.length > 0 ? (
        <>
          {/* Sprawy firmowe */}
          {lawFirm.categories.filter((c) => c.category.typ === "SPRAWY_FIRMOWE").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Sprawy firmowe</h3>
              <div className="grid gap-3">
                {lawFirm.categories
                  .filter((c) => c.category.typ === "SPRAWY_FIRMOWE")
                  .map((lawFirmCategory) => (
                    <Card key={lawFirmCategory.id}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {lawFirmCategory.category.nazwa}
                          <Badge variant="default">Firmowe</Badge>
                        </CardTitle>
                        {lawFirmCategory.category.opis && (
                          <CardDescription>{lawFirmCategory.category.opis}</CardDescription>
                        )}
                      </CardHeader>
                      {lawFirmCategory.category.opisDodatkowy && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {lawFirmCategory.category.opisDodatkowy}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Sprawy prywatne */}
          {lawFirm.categories.filter((c) => c.category.typ === "SPRAWY_PRYWATNE").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Sprawy prywatne</h3>
              <div className="grid gap-3">
                {lawFirm.categories
                  .filter((c) => c.category.typ === "SPRAWY_PRYWATNE")
                  .map((lawFirmCategory) => (
                    <Card key={lawFirmCategory.id}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {lawFirmCategory.category.nazwa}
                          <Badge variant="secondary">Prywatne</Badge>
                        </CardTitle>
                        {lawFirmCategory.category.opis && (
                          <CardDescription>{lawFirmCategory.category.opis}</CardDescription>
                        )}
                      </CardHeader>
                      {lawFirmCategory.category.opisDodatkowy && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {lawFirmCategory.category.opisDodatkowy}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Brak zdefiniowanych usług
          </CardContent>
        </Card>
      )}
    </div>
  )
}
