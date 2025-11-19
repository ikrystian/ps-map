'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie dokumentu...</p>
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
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do dokumentacji
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-red-800">Błąd</h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dokumentacja"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do dokumentacji
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {fileName || 'Dokument'}
            </h1>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">{children}</h3>,
                p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">{children}</ol>,
                li: ({children}) => <li className="ml-2">{children}</li>,
                code: ({children}: any) => (
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">{children}</code>
                ),
                pre: ({children}: any) => (
                  <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                a: ({href, children}) => (
                  <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                hr: () => <hr className="border-gray-300 my-6" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}