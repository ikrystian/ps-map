"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import PublicHeader from "@/components/PublicHeader"

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  logo?: string
  opis?: string
  miasto: string
  voivodeship: {
    nazwa: string
  }
  zweryfikowana: boolean
  categories: Array<{
    nazwa: string
    slug: string
  }>
  avgRating: number
  reviewCount: number
}

export default function Home() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const response = await fetch("/api/law-firms?limit=8")
        if (response.ok) {
          const data = await response.json()
          setLawFirms(data.lawFirms)
        }
      } catch (error) {
        console.error("Error fetching law firms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLawFirms()
  }, [])

  return (
    <div>
      <PublicHeader />

    </div>
  )
}
