'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Briefcase,
  CreditCard,
  FileText,
  Star,
  TrendingUp,
  AlertCircle,
  Building2,
  UserCheck,
  Clock,
  ArrowUpRight,
  User,
  Scale,
  DollarSign,
  FileEdit,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DashboardStats {
  statistics: {
    totalUsers: number
    totalClients: number
    totalLawFirms: number
    totalCases: number
    totalOrders: number
    totalBlogPosts: number
    totalReviews: number
    activeUsers: number
    pendingCases: number
    unpaidOrders: number
    recentCasesCount: number
    totalRevenue: number
  }
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>
    casesByStatus: Array<{ status: string; count: number }>
    dailyRegistrations: Array<{ date: string; count: number }>
  }
  recentActivity: {
    users: Array<{
      id: string
      name: string | null
      email: string
      role: string
      createdAt: string
    }>
    cases: Array<{
      id: string
      nazwaSprawy: string
      status: string
      createdAt: string
      client: { user: { name: string | null } }
    }>
    orders: Array<{
      id: string
      orderNumber: string
      kwota: number
      statusPlatnosci: string
      createdAt: string
      lawFirm: { nazwa: string | null }
    }>
    blogPosts: Array<{
      id: string
      tytul: string
      opublikowany: boolean
      createdAt: string
      lawFirm: { nazwa: string | null }
    }>
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-base">Ładowanie...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Błąd wczytywania danych</div>
      </div>
    )
  }

  const { statistics, charts, recentActivity } = data

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const getAvatarBg = (id: string) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-emerald-500 to-teal-500',
      'from-blue-500 to-cyan-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
    ]
    const index = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length
    return gradients[index]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: 'bg-green-500/10 text-green-500',
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      COMPLETED: 'bg-blue-500/10 text-blue-500',
      REJECTED: 'bg-red-500/10 text-red-500',
      IN_PROGRESS: 'bg-purple-500/10 text-purple-500',
    }
    return statusColors[status] || 'bg-gray-500/10 text-base'
  }

  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      NOWA: 'Nowe',
      ACTIVE: 'Aktywne',
      PENDING: 'Oczekujące',
      COMPLETED: 'Zakończone',
      REJECTED: 'Odrzucone',
      IN_PROGRESS: 'W toku',
      W_TOKU: 'W toku',
      ZAKONCZONA: 'Zakończone',
    }
    return statusNames[status] || status
  }

  const getStatusGradient = (status: string) => {
    const gradients: Record<string, string> = {
      NOWA: 'from-amber-400 to-orange-500 shadow-orange-500/10',
      PENDING: 'from-yellow-400 to-amber-500 shadow-amber-500/10',
      ACTIVE: 'from-emerald-400 to-green-500 shadow-green-500/10',
      IN_PROGRESS: 'from-blue-500 to-indigo-500 shadow-indigo-500/10',
      W_TOKU: 'from-blue-500 to-indigo-500 shadow-indigo-500/10',
      COMPLETED: 'from-teal-400 to-emerald-500 shadow-emerald-500/10',
      ZAKONCZONA: 'from-teal-400 to-emerald-500 shadow-emerald-500/10',
      REJECTED: 'from-red-500 to-rose-600 shadow-rose-500/10',
    }
    return gradients[status] || 'from-slate-400 to-slate-500 shadow-slate-500/10'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-base mt-2">Przegląd systemu i statystyki</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalUsers}</div>
            <p className="text-xs text-base mt-1 flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span className="text-green-600 dark:text-green-500 font-medium">{statistics.activeUsers} aktywnych</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprawy</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalCases}</div>
            <p className="text-xs text-base mt-1 flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
              <span className="text-amber-600 dark:text-amber-500 font-medium">{statistics.pendingCases} oczekujących</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychody</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(statistics.totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {statistics.totalOrders} zamówień
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nieopłacone</CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.unpaidOrders}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              zamówień do opłacenia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klienci</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kancelarie</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalLawFirms}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artykuły</CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalBlogPosts}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-muted bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opinie</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <Star className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{statistics.totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cases by Status */}
        <Card className="hover:shadow-md transition-all duration-300 border border-muted/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Sprawy według statusu</CardTitle>
            <CardDescription>Rozkład statusów spraw w systemie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.casesByStatus.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">Brak spraw w bazie</div>
              ) : (
                charts.casesByStatus.map((item) => {
                  const total = charts.casesByStatus.reduce((sum, i) => sum + i.count, 0)
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                  return (
                    <div key={item.status} className="group/bar">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {getStatusName(item.status)}
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-100 transition-colors">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200/30 dark:border-slate-700/20">
                        <div
                          className={`bg-gradient-to-r ${getStatusGradient(item.status)} h-full rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="hover:shadow-md transition-all duration-300 border border-muted/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Przychody miesięczne</CardTitle>
            <CardDescription>Ostatnie 6 miesięcy (zamówienia opłacone)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.monthlyRevenue.map((item) => {
                const maxRevenue = Math.max(...charts.monthlyRevenue.map((i) => Number(i.revenue)))
                const percentage = maxRevenue > 0 ? Math.round((Number(item.revenue) / maxRevenue) * 100) : 0
                return (
                  <div key={item.month} className="group/bar">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.month}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500 group-hover/bar:scale-105 transition-transform origin-right">
                        {formatCurrency(Number(item.revenue))}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200/30 dark:border-slate-700/20">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(20,184,166,0.15)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Registrations */}
      <Card className="hover:shadow-md transition-all duration-300 border border-muted/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Rejestracje użytkowników</CardTitle>
          <CardDescription>Liczba rejestracji w ostatnich 7 dniach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-56 gap-3 pt-6 px-2">
            {charts.dailyRegistrations.map((item) => {
              const maxCount = Math.max(...charts.dailyRegistrations.map((i) => Number(i.count)))
              const height = maxCount > 0 ? Math.round((Number(item.count) / maxCount) * 100) : 0
              return (
                <div key={item.date} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                  {/* Floating Tooltip */}
                  <div className="absolute -top-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-md opacity-0 pointer-events-none transition-all duration-200 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 z-10 whitespace-nowrap">
                    {Number(item.count)} uż.
                  </div>

                  {/* Bar container */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-t-md relative flex-1 flex flex-col justify-end overflow-hidden border border-slate-200/30 dark:border-slate-700/20 min-h-[4px]">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 dark:from-blue-500 dark:via-indigo-600 dark:to-cyan-400 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110 shadow-md group-hover:shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  {/* Label without year */}
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-2 font-medium truncate w-full text-center">
                    {formatDate(item.date).replace(/ 202\d$/, '')}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-muted bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.05)] border border-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Najnowsi użytkownicy</CardTitle>
                  <CardDescription className="text-xs">Ostatnio zarejestrowani</CardDescription>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted/40 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-muted-foreground text-xs font-semibold gap-1"
              >
                Wszystkie
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {recentActivity.users.map((user) => {
                const initials = getInitials(user.name, user.email)
                const avatarBg = getAvatarBg(user.id)
                return (
                  <Link
                    href={`/admin/users?search=${user.email}`}
                    key={user.id}
                    className="group/item flex items-center justify-between p-3.5 rounded-xl border border-muted/20 hover:border-indigo-500/20 dark:hover:border-indigo-500/35 hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.02] hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)]`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-100 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                          {user.name || user.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {user.role === 'ADMIN' ? (
                        <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.05)]">
                          Admin
                        </span>
                      ) : user.role === 'LAW_FIRM' ? (
                        <span className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.05)]">
                          Kancelaria
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.05)]">
                          Klient
                        </span>
                      )}
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-muted bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)] border border-amber-500/10 group-hover:scale-105 transition-transform duration-300">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Najnowsze sprawy</CardTitle>
                  <CardDescription className="text-xs">Ostatnio utworzone</CardDescription>
                </div>
              </div>
              <Link
                href="/admin/cases"
                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted/40 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-muted-foreground text-xs font-semibold gap-1"
              >
                Wszystkie
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {recentActivity.cases.map((caseItem) => {
                const caseGradients = {
                  NOWA: 'from-amber-500/10 to-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
                  OFERTY_OTRZYMANE: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
                  W_TRAKCIE: 'from-sky-500/10 to-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
                  ZAKONCZONA: 'from-emerald-500/10 to-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
                  ANULOWANA: 'from-rose-500/10 to-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
                }
                const caseLabel = {
                  NOWA: 'Nowa',
                  OFERTY_OTRZYMANE: 'Oferty',
                  W_TRAKCIE: 'W toku',
                  ZAKONCZONA: 'Zakończona',
                  ANULOWANA: 'Anulowana',
                }
                const badgeStyle = caseGradients[caseItem.status as keyof typeof caseGradients] || 'from-slate-500/10 to-slate-600/10 border-slate-500/20 text-slate-600 dark:text-slate-400'
                const label = caseLabel[caseItem.status as keyof typeof caseLabel] || caseItem.status

                return (
                  <Link
                    href={`/admin/cases/${caseItem.id}`}
                    key={caseItem.id}
                    className="group/item flex items-center justify-between p-3.5 rounded-xl border border-muted/20 hover:border-amber-500/20 dark:hover:border-amber-500/35 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.02] hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Case visual tag */}
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <Scale className="h-4 w-4" />
                      </div>
                      <div className="max-w-[180px] sm:max-w-[240px]">
                        <div className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-100 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors truncate">
                          {caseItem.nazwaSprawy}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 truncate">
                          <User className="h-3 w-3 text-muted-foreground/75" />
                          {caseItem.client.user.name || 'Brak nazwy'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`bg-gradient-to-br ${badgeStyle} border font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full`}>
                        {label}
                      </span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(caseItem.createdAt)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Blog Posts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-muted bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)] border border-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Najnowsze zamówienia</CardTitle>
                  <CardDescription className="text-xs">Ostatnie transakcje</CardDescription>
                </div>
              </div>
              <Link
                href="/admin/transakcje"
                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted/40 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-muted-foreground text-xs font-semibold gap-1"
              >
                Wszystkie
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {recentActivity.orders.map((order) => {
                const paymentGradients = {
                  ZAPLACONE: 'from-emerald-500/10 to-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
                  OCZEKUJE: 'from-amber-500/10 to-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
                  ANULOWANE: 'from-rose-500/10 to-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
                  ZWROT: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
                }
                const paymentLabel = {
                  ZAPLACONE: 'Opłacone',
                  OCZEKUJE: 'Oczekuje',
                  ANULOWANE: 'Anulowane',
                  ZWROT: 'Zwrot',
                }
                const badgeStyle = paymentGradients[order.statusPlatnosci as keyof typeof paymentGradients] || 'from-slate-500/10 to-slate-600/10 border-slate-500/20 text-slate-600 dark:text-slate-400'
                const label = paymentLabel[order.statusPlatnosci as keyof typeof paymentLabel] || order.statusPlatnosci

                return (
                  <Link
                    href={`/admin/transakcje?search=${order.orderNumber}`}
                    key={order.id}
                    className="group/item flex items-center justify-between p-3.5 rounded-xl border border-muted/20 hover:border-emerald-500/20 dark:hover:border-emerald-500/35 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.02] hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Order Visual */}
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div className="max-w-[180px] sm:max-w-[240px]">
                        <div className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-100 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors truncate">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 truncate">
                          <Building2 className="h-3 w-3 text-muted-foreground/75" />
                          {order.lawFirm?.nazwa || 'Brak nazwy'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover/item:scale-105 transition-transform duration-200">
                        {formatCurrency(order.kwota)}
                      </div>
                      <span className={`bg-gradient-to-br ${badgeStyle} border font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full`}>
                        {label}
                      </span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-muted bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.05)] border border-violet-500/10 group-hover:scale-105 transition-transform duration-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Najnowsze artykuły</CardTitle>
                  <CardDescription className="text-xs">Ostatnio dodane wpisy</CardDescription>
                </div>
              </div>
              <Link
                href="/admin/blog"
                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted/40 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-muted-foreground text-xs font-semibold gap-1"
              >
                Wszystkie
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {recentActivity.blogPosts.map((post) => {
                return (
                  <Link
                    href={`/admin/blog`}
                    key={post.id}
                    className="group/item flex items-center justify-between p-3.5 rounded-xl border border-muted/20 hover:border-violet-500/20 dark:hover:border-violet-500/35 hover:bg-violet-500/[0.02] dark:hover:bg-violet-500/[0.02] hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Article Visual */}
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10 border border-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <FileEdit className="h-4 w-4" />
                      </div>
                      <div className="max-w-[180px] sm:max-w-[240px]">
                        <div className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-100 group-hover/item:text-violet-600 dark:group-hover/item:text-violet-400 transition-colors truncate">
                          {post.tytul}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 truncate">
                          <Building2 className="h-3 w-3 text-muted-foreground/75" />
                          {post.lawFirm.nazwa || 'Brak kancelarii'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {post.opublikowany ? (
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                          Opublikowany
                        </span>
                      ) : (
                        <span className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                          Szkic
                        </span>
                      )}
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
