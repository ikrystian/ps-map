"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MessageSquare, Check, Pencil, Euro } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Consultation = {
  id: string
  client: {
    imie: string
    nazwisko: string
  }
  description: string
  dateRanges: string
  status: "REQUESTED" | "ACCEPTED" | "PAID" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  proposedDateTime?: string
  price?: number
}

const statusConfig = {
    REQUESTED: { label: "Oczekuje", color: "bg-yellow-500" },
    ACCEPTED: { label: "Zaakceptowana", color: "bg-blue-500" },
    PAID: { label: "Opłacona", color: "bg-green-500" },
    CONFIRMED: { label: "Potwierdzona", color: "bg-green-600" },
    CANCELLED: { label: "Anulowana", color: "bg-red-500" },
    COMPLETED: { label: "Zakończona", color: "bg-gray-500" },
  }

export default function LawFirmConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [price, setPrice] = useState("")
  const [proposedDate, setProposedDate] = useState("")

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    const response = await fetch("/api/consultations")
    if (response.ok) {
      const data = await response.json()
      setConsultations(data)
    }
  }

  const handleAccept = async () => {
    if (!selectedConsultation) return

    const response = await fetch(`/api/consultations/${selectedConsultation.id}/accept`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            price: parseFloat(price),
            proposedDateTime: new Date(proposedDate).toISOString(),
        }),
    })

    if (response.ok) {
        toast.success("Konsultacja została zaakceptowana.")
        fetchConsultations()
        setSelectedConsultation(null)
    } else {
        toast.error("Nie udało się zaakceptować konsultacji.")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-3xl font-bold">Zapytania o konsultacje</h1>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> {consultation.client.imie} {consultation.client.nazwisko}
                </CardTitle>
                <CardDescription className="mt-2">
                  <Badge className={`${statusConfig[consultation.status].color} hover:${statusConfig[consultation.status].color}`}>
                    {statusConfig[consultation.status].label}
                  </Badge>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  {consultation.status === 'REQUESTED' && (
                      <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedConsultation(consultation)}>
                              <Check className="mr-2 h-4 w-4" /> Akceptuj i wyceń
                          </Button>
                    </DialogTrigger>
                  )}
                   {consultation.status === 'ACCEPTED' && (
                    <Button size="sm" variant="outline" onClick={() => setSelectedConsultation(consultation)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edytuj
                    </Button>
                  )}
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Akceptuj i wyceń konsultację</DialogTitle>
                          <DialogDescription>
                              Zaproponuj termin i cenę za konsultację.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                          <div>
                              <label htmlFor="price">Cena (w punktach)</label>
                              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                          </div>
                          <div>
                              <label htmlFor="date">Proponowany termin</label>
                              <Input id="date" type="datetime-local" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
                          </div>
                      </div>
                      <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedConsultation(null)}>Anuluj</Button>
                          <Button onClick={handleAccept}>Zatwierdź</Button>
                      </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <p className="flex-1">{consultation.description}</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Proponowane terminy przez klienta:</h4>
                  <ul className="list-disc pl-5 mt-1">
                    {JSON.parse(consultation.dateRanges).map((range: any, index: number) => (
                      <li key={index}>
                        {new Date(range.from).toLocaleDateString()} - {new Date(range.to).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {consultation.proposedDateTime && (
                <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-md">
                  <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Zaproponowany termin:</h4>
                    <p>{new Date(consultation.proposedDateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <Euro className="h-5 w-5"/>
                    <span>{consultation.price} PLN</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}