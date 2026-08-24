import { auth } from '@/auth'
import { validateUploadedFile } from '@/lib/file-validation'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nie przesłano pliku' },
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Weryfikacja sygnatury pliku (magic bytes) — odporna na podrobiony MIME.
    const validation = validateUploadedFile(buffer, file.name, ['jpg', 'jpeg', 'png', 'webp', 'gif'])
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generowanie unikalnej nazwy pliku
    const ext = path.extname(file.name)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const uploadDir = path.join(process.cwd(), '.uploads', 'account-managers')

    // Utworzenie katalogu, jeśli nie istnieje
    await mkdir(uploadDir, { recursive: true })

    const filepath = path.join(uploadDir, filename)

    // Zapisanie pliku
    await writeFile(filepath, buffer)

    const url = `/api/uploads/account-managers/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Błąd podczas przesyłania pliku' },
      { status: 500 }
    )
  }
}
