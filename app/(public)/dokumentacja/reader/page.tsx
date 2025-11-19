'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MarkdownReaderPage() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const url = searchParams.get('url');

    if (!url) {
      setError('Brak parametru URL w adresie');
      setLoading(false);
      return;
    }

    // Walidacja URL - tylko允许访问 public/docs 文件夹
    if (!url.startsWith('/docs/') && !url.startsWith('docs/')) {
      setError('Nieprawidłowa ścieżka pliku. Dozwolone są tylko pliki z folderu docs/');
      setLoading(false);
      return;
    }

    // Usunięcie początkowego '/' jeśli istnieje
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    setFileName(cleanUrl.replace('docs/', ''));

    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/${cleanUrl}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Plik nie został znaleziony');
          } else {
            setError(`Błąd podczas ładowania pliku: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        setError('Wystąpił błąd podczas pobierania pliku');
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie dokumentu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dokumentacja"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do dokumentacji
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="mb-2">Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dokumentacja"
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do dokumentacji
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-muted-foreground mr-3" />
            <CardTitle className="text-2xl">
              {fileName || 'Dokument'}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-lg max-w-none markdown-content">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}