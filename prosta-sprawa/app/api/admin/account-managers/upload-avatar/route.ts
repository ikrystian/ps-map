import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nie przesłano pliku' },
        { status: 400 }
      )
    }

    // Walidacja typu pliku
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Plik musi być obrazem' },
        { status: 400 }
      )
    }

    // Walidacja rozmiaru (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Rozmiar pliku nie może przekraczać 5MB' },
        { status: 400 }
      )
    }

    // Generowanie unikalnej nazwy pliku
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const uploadDir = path.join(process.cwd(), 'public/uploads/account-managers')

    // Utworzenie katalogu, jeśli nie istnieje
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Katalog już istnieje
    }

    const filepath = path.join(uploadDir, filename)

    // Zapisanie pliku
    await writeFile(filepath, buffer)

    const url = `/uploads/account-managers/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Błąd podczas przesyłania pliku' },
      { status: 500 }
    )
  }
}
