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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Najnowsi użytkownicy</CardTitle>
            <CardDescription>Ostatnio zarejestrowani</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-sm text-base">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadge(user.role)}>{user.role}</Badge>
                    <div className="text-xs text-base mt-1">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Najnowsze sprawy</CardTitle>
            <CardDescription>Ostatnio utworzone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.cases.map((caseItem) => (
                <div key={caseItem.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{caseItem.nazwaSprawy}</div>
                    <div className="text-sm text-base">
                      {caseItem.client.user.name || 'Brak nazwy'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadge(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                    <div className="text-xs text-base mt-1">
                      {formatDate(caseItem.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Blog Posts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Najnowsze zamówienia</CardTitle>
            <CardDescription>Ostatnie transakcje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-base">
                      {order.lawFirm?.nazwa || 'Brak nazwy'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.kwota)}</div>
                    <Badge className={getStatusBadge(order.statusPlatnosci)}>
                      {order.statusPlatnosci}
                    </Badge>
                    <div className="text-xs text-base mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Najnowsze artykuły</CardTitle>
            <CardDescription>Ostatnio utworzone wpisy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.blogPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{post.tytul}</div>
                    <div className="text-sm text-base">
                      {post.lawFirm.nazwa || 'Brak kancelarii'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={post.opublikowany ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-base'}>
                      {post.opublikowany ? 'Opublikowany' : 'Szkic'}
                    </Badge>
                    <div className="text-xs text-base mt-1">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
