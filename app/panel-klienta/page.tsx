"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  MessageSquare,
  FileCheck,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Mail,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ClientData {
  id: string
  imie: string
  nazwisko: string
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

interface BlogPost {
  id: string
  tytul: string
  slug: string
  obrazekWyrozniajacy?: string
  dataPublikacji: string
  category?: {
    nazwa: string
  }
  lawFirm: {
    nazwa: string
  }
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientData()
    fetchBlogPosts()
  }, [])

  const fetchClientData = async () => {
    try {
      const response = await fetch("/api/clients/me")
      if (response.ok) {
        const data = await response.json()
        setClientData(data)
      } else if (response.status === 404) {
        // User doesn't have a Client profile yet - redirect to complete registration
        router.push("/rejestracja/klient")
      }
    } catch (error) {
      console.error("Error fetching client data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch("/api/blog/posts?limit=3")
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Ładowanie...</div>
      </div>
    )
  }

  const initials = clientData
    ? `${clientData.imie[0]}${clientData.nazwisko[0]}`.toUpperCase()
    : "KL"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel Klienta</h1>
        <p className="text-muted-foreground mt-2">
          Witaj {clientData?.imie || ""}! Zarządzaj swoimi sprawami i komunikuj się z ekspertami.
        </p>
      </div>



      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-rows-3">
        {/* Box 1: Profil użytkownika */}
        <Card className="hover:shadow-lg transition-shadow col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Twój Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={clientData?.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {clientData?.imie} {clientData?.nazwisko}
                </p>
                <p className="text-sm text-muted-foreground">
                  {clientData?.user.email}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push("/panel-klienta/profil")}
            >
              <User className="mr-2 h-4 w-4" />
              Edytuj profil
            </Button>
          </CardContent>
        </Card>

        {/* Box 2: Korzyści */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Korzystaj z pełni możliwości naszego serwisu!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Szybki kontakt z profesjonalnymi kancelariami prawnymi</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Otrzymuj oferty dopasowane do Twojej sprawy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Przeglądaj opinie i certyfikaty ekspertów</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Zarządzaj wszystkimi sprawami w jednym miejscu</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Box 3: Wiadomości */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => router.push("/panel-klienta/wiadomosci")}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Wiadomości</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Komunikuj się z ekspertami
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Box 4: Sprawy */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => router.push("/panel-klienta/sprawy")}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors">
              <FileCheck className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Moje Sprawy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Zarządzaj swoimi sprawami
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Box 5: Najnowsze artykuły */}
        <div className="md:col-span-2 row-span-2">
          <Card className="hover:shadow-lg transition-shadow ">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Najnowsze Artykuły
              </CardTitle>
              <Button variant="link" className="text-primary" asChild>
                <Link href="/(public)/blog">
                  Więcej
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {blogPosts.length > 0 ? (
                <div className="space-y-4">
                  {blogPosts.map((post, index) => (
                    <div key={post.id}>
                      {index > 0 && <Separator />}
                      <ArticleItem
                        title={post.tytul}
                        category={post.category?.nazwa || "Bez kategorii"}
                        date={new Date(
                          post.dataPublikacji
                        ).toLocaleDateString("pl-PL")}
                        image={
                          post.obrazekWyrozniajacy || "/placeholder-article.jpg"
                        }
                        slug={post.slug}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak artykułów do wyświetlenia
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Box 6: Wybrani eksperci */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer group col-span-2"
          onClick={() => router.push("/panel-klienta/eksperci")}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors">
              <Star className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Wybrani Eksperci</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Twoje ulubione kancelarie
              </p>
            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}

interface ArticleItemProps {
  title: string
  category: string
  date: string
  image: string
  slug: string
}

function ArticleItem({ title, category, date, image, slug }: ArticleItemProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="flex items-center gap-4 group cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
    </Link>
  )
}
