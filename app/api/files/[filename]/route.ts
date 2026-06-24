import { isInlineSafeMime } from '@/lib/file-validation';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'files', filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const file = await readFile(filePath);

    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'svg': 'image/svg+xml',
    };

    if (ext && mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    const isSvg = contentType === 'image/svg+xml';

    // Bezpieczeństwo serwowania:
    // - nosniff: przeglądarka nie zgaduje typu (blokuje sztuczki MIME-sniffing/XSS),
    // - inline tylko dla bezpiecznych obrazów; pozostałe wymuszają pobranie (attachment),
    //   co zapobiega renderowaniu np. HTML w kontekście naszej domeny.
    // - SVG serwujemy inline (żeby ikony renderowały się w <img>), ale neutralizujemy
    //   wektor XSS restrykcyjnym CSP + sandbox: nawet bezpośrednie wejście na plik
    //   nie wykona skryptów ani nie pobierze zasobów zewnętrznych.
    const disposition = (isInlineSafeMime(contentType) || isSvg)
      ? 'inline'
      : `attachment; filename="${encodeURIComponent(filename)}"`;

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': disposition,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (isSvg) {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }

    return new Response(file, { headers });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}