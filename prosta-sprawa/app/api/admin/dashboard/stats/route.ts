import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total counts
    const [
      totalUsers,
      totalClients,
      totalLawFirms,
      totalCases,
      totalOrders,
      totalBlogPosts,
      totalReviews,
      activeUsers,
      pendingCases,
      unpaidOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.lawFirm.count(),
      prisma.case.count(),
      prisma.order.count(),
      prisma.blogPost.count(),
      prisma.review.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.case.count({ where: { status: 'NOWA' } }),
      prisma.order.count({ where: { statusPlatnosci: 'OCZEKUJE' } }),
    ])

    // Get recent cases (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCasesCount = await prisma.case.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Get revenue statistics
    const completedOrders = await prisma.order.findMany({
      where: {
        statusPlatnosci: 'ZAPLACONE',
      },
      select: {
        kwota: true,
      },
    })

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.kwota, 0)

    // Get monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT
        strftime('%Y-%m', createdAt) as month,
        SUM(kwota) as revenue
      FROM "Order"
      WHERE statusPlatnosci = 'ZAPLACONE'
        AND createdAt >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `

    // Get cases by status for chart
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    // Get user registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyRegistrations = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT
        strftime('%Y-%m-%d', createdAt) as date,
        COUNT(*) as count
      FROM "User"
      WHERE createdAt >= ${sevenDaysAgo.toISOString()}
      GROUP BY strftime('%Y-%m-%d', createdAt)
      ORDER BY date ASC
    `

    // Get recent activity data
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    const recentCases = await prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nazwaSprawy: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        kwota: true,
        statusPlatnosci: true,
        createdAt: true,
        lawFirm: {
          select: {
            nazwa: true,
          },
        },
      },
    })

    const recentBlogPosts = await prisma.blogPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tytul: true,
        opublikowany: true,
        createdAt: true,
        lawFirm: {
          select: {
            nazwa: true,
          },
        },
      },
    })

    return NextResponse.json({
      statistics: {
        totalUsers,
        totalClients,
        totalLawFirms,
        totalCases,
        totalOrders,
        totalBlogPosts,
        totalReviews,
        activeUsers,
        pendingCases,
        unpaidOrders,
        recentCasesCount,
        totalRevenue,
      },
      charts: {
        monthlyRevenue,
        casesByStatus: casesByStatus.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
        dailyRegistrations,
      },
      recentActivity: {
        users: recentUsers,
        cases: recentCases,
        orders: recentOrders,
        blogPosts: recentBlogPosts,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
