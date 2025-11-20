import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all users with their email and role
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
      orderBy: {
        role: 'asc',
      },
    })

    // Return users with their test passwords based on role
    const usersWithPasswords = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      // These are the test passwords from the seed files
      password: user.email === 'admin@bpcoders.pl' ? 'ADmin123' : 'Password123',
    }))

    return NextResponse.json({ users: usersWithPasswords })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
