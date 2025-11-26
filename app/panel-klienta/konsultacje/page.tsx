"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Euro, Clock } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type Consultation = {
    id: string;
    lawFirm: {
        nazwa: string;
    };
    description: string;
    dateRanges: string;
    status: "REQUESTED" | "ACCEPTED" | "PAID" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    proposedDateTime?: string;
    price?: number;
}

const formSchema = z.object({
  lawFirmId: z.string().nonempty("Musisz wybrać kancelarię."),
  description: z.string().min(50, "Opis musi mieć co najmniej 50 znaków."),
  dateRanges: z.array(z.object({
    from: z.date(),
    to: z.date(),
  })).nonempty("Musisz wybrać co najmniej jeden zakres dat."),
})

export default function ConsultationsPage() {
  const router = useRouter()
  const [dates, setDates] = useState<({ from: Date, to: Date })[]>([])
  const [lawFirms, setLawFirms] = useState<{ id: string, nazwa: string }[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])

  useEffect(() => {
    fetchLawFirms()
    fetchConsultations()
  }, [])

  async function fetchLawFirms() {
    const response = await fetch("/api/law-firms")
    if (response.ok) {
      const data = await response.json()
      setLawFirms(data)
    }
  }

  async function fetchConsultations() {
    const response = await fetch("/api/consultations")
    if (response.ok) {
        const data = await response.json()
        setConsultations(data)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lawFirmId: "",
      description: "",
      dateRanges: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("/api/consultations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        dateRanges: JSON.stringify(values.dateRanges),
      }),
    })

    if (response.ok) {
      toast.success("Prośba o konsultację została wysłana.")
      fetchConsultations()
      form.reset()
    } else {
      toast.error("Nie udało się wysłać prośby o konsultację.")
    }
  }

  async function handlePay(consultationId: string) {
    const response = await fetch(`/api/consultations/${consultationId}/pay`, {
        method: "POST",
    })

    if (response.ok) {
        toast.success("Konsultacja została opłacona.")
        fetchConsultations()
    } else {
        toast.error("Nie udało się opłacić konsultacji.")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moje konsultacje</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi prośbami o konsultacje i opłacaj je.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
            <Card key={consultation.id}>
                <CardHeader>
                    <CardTitle>{consultation.lawFirm.nazwa}</CardTitle>
                    <CardDescription>
                        <Badge>{consultation.status}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{consultation.description}</p>
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
                    {consultation.status === "ACCEPTED" && (
                        <Button onClick={() => handlePay(consultation.id)}>
                            Akceptuj i opłać
                        </Button>
                    )}
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nowa prośba o konsultację</CardTitle>
          <CardDescription>
            Wypełnij poniższy formularz, aby wysłać prośbę o konsultację do wybranej kancelarii.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="lawFirmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kancelaria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kancelarię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lawFirms.map(firm => (
                          <SelectItem key={firm.id} value={firm.id}>{firm.nazwa}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis sprawy</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Opisz szczegółowo swoją sprawę, aby kancelaria mogła się do niej przygotować..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Im więcej szczegółów podasz, tym lepiej kancelaria będzie w stanie Ci pomóc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateRanges"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Proponowane terminy</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Wybierz zakresy dat</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              const newRanges = [...dates, { from: range.from, to: range.to }]
                              setDates(newRanges)
                              field.onChange(newRanges)
                            }
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="mt-4 space-y-2">
                      {dates.map((range, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm">
                            {format(range.from, "PPP")} - {format(range.to, "PPP")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Wybierz jeden lub więcej zakresów dat, w których jesteś dostępny/a.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Wyślij prośbę</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}