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
      title: string
      status: string
      createdAt: string
      client: { user: { name: string | null } }
    }>
    orders: Array<{
      id: string
      orderNumber: string
      amount: number
      paymentStatus: string
      createdAt: string
      user: { name: string | null }
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
        <div className="text-gray-500">Ładowanie...</div>
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
    return statusColors[status] || 'bg-gray-500/10 text-gray-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-2">Przegląd systemu i statystyki</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500">{statistics.activeUsers} aktywnych</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprawy</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCases}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-yellow-500">{statistics.pendingCases} oczekujących</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychody</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.totalOrders} zamówień
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nieopłacone</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.unpaidOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              zamówień do opłacenia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klienci</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kancelarie</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalLawFirms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artykuły</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalBlogPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opinie</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cases by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sprawy według statusu</CardTitle>
            <CardDescription>Rozkład statusów spraw</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {charts.casesByStatus.map((item) => {
                const total = charts.casesByStatus.reduce((sum, i) => sum + i.count, 0)
                const percentage = Math.round((item.count / total) * 100)
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-sm text-gray-500">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Przychody miesięczne</CardTitle>
            <CardDescription>Ostatnie 6 miesięcy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {charts.monthlyRevenue.map((item) => {
                const maxRevenue = Math.max(...charts.monthlyRevenue.map((i) => Number(i.revenue)))
                const percentage = maxRevenue > 0 ? Math.round((Number(item.revenue) / maxRevenue) * 100) : 0
                return (
                  <div key={item.month}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.month}</span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(Number(item.revenue))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
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
      <Card>
        <CardHeader>
          <CardTitle>Rejestracje użytkowników</CardTitle>
          <CardDescription>Ostatnie 7 dni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {charts.dailyRegistrations.map((item) => {
              const maxCount = Math.max(...charts.dailyRegistrations.map((i) => Number(i.count)))
              const height = maxCount > 0 ? (Number(item.count) / maxCount) * 100 : 0
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-medium">{Number(item.count)}</div>
                  <div
                    className="w-full bg-blue-600 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                    {formatDate(item.date)}
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
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadge(user.role)}>{user.role}</Badge>
                    <div className="text-xs text-gray-500 mt-1">
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
                    <div className="font-medium">{caseItem.title}</div>
                    <div className="text-sm text-gray-500">
                      {caseItem.client.user.name || 'Brak nazwy'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadge(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
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
                    <div className="text-sm text-gray-500">
                      {order.user.name || 'Brak nazwy'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.amount)}</div>
                    <Badge className={getStatusBadge(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
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
                    <div className="text-sm text-gray-500">
                      {post.lawFirm.nazwa || 'Brak kancelarii'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={post.opublikowany ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                      {post.opublikowany ? 'Opublikowany' : 'Szkic'}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
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
