"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heart, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const SprawyPage = () => {
  const initialSprawy = [
    {
      id: 1,
      kategoria: "Prawo cywilne",
      nazwa: "Sprawa o odszkodowanie",
      miasto: "Warszawa",
      typOsoby: "Osoba prywatna",
      daneKontaktowe: "jan.kowalski@example.com",
      eksperci: 5,
      favorited: false,
    },
    {
      id: 2,
      kategoria: "Prawo karne",
      nazwa: "Obrona w sprawie karnej",
      miasto: "Kraków",
      typOsoby: "Firma",
      daneKontaktowe: "biuro@firma.pl",
      eksperci: 2,
      favorited: true,
    },
    {
      id: 3,
      kategoria: "Prawo administracyjne",
      nazwa: "Skarga na decyzję urzędu",
      miasto: "Gdańsk",
      typOsoby: "Osoba prywatna",
      daneKontaktowe: "anna.nowak@example.com",
      eksperci: 8,
      favorited: false,
    },
  ];

  const [sprawy, setSprawy] = useState(initialSprawy);

  const toggleFavorite = (id: number) => {
    setSprawy(sprawy.map(sprawa => 
      sprawa.id === id ? { ...sprawa, favorited: !sprawa.favorited } : sprawa
    ));
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Zarządzaj Sprawami</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input placeholder="Szukaj po nazwie sprawy..." className="flex-grow" />
        <div className="flex gap-2">
          <Button variant="outline">Sprawy prywatne</Button>
          <Button variant="outline">Sprawy firmowe</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nowe sprawy</CardTitle>
            <span className="text-2xl font-bold">15</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Nowe zlecenia do przejrzenia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obserwowane</CardTitle>
            <span className="text-2xl font-bold">{sprawy.filter(s => s.favorited).length}</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sprawy, które obserwujesz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące</CardTitle>
            <span className="text-2xl font-bold">3</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Złożone oferty czekające na akceptację</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zamknięte</CardTitle>
            <span className="text-2xl font-bold">28</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Zakończone i zarchiwizowane sprawy</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <h2 className="text-2xl font-bold mb-4">Moje Sprawy</h2>

      <div className="space-y-6">
        {sprawy.map((sprawa) => (
          <Card key={sprawa.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between bg-muted/50 px-6 py-3">
              <div className="text-sm font-semibold text-muted-foreground">{sprawa.kategoria}</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{sprawa.eksperci}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(sprawa.id)}>
                  <Heart className={cn("h-5 w-5", sprawa.favorited && "fill-current text-red-500")} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">{sprawa.nazwa}</h3>
                  <p className="text-sm text-muted-foreground mb-1">Lokalizacja: {sprawa.miasto}</p>
                  <p className="text-sm text-muted-foreground mb-1">Typ klienta: {sprawa.typOsoby}</p>
                  <p className="text-sm text-muted-foreground">Kontakt: {sprawa.daneKontaktowe}</p>
                </div>
                <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6 flex items-center">
                  <Button>Zobacz więcej</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SprawyPage;