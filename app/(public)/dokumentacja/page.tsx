import Link from 'next/link';
import { FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default function DocsPage() {
  const sampleDocs = [
    { name: 'Strony główne', path: 'docs/[1][strony-publiczne]strony-główne.md', description: '' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dokumentacja</h1>
        <p className="text-gray-600 text-lg">
          Przeglądaj dokumentację techniczną platformy "Prosta Sprawa"
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleDocs.map((doc, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-5 h-5 text-gray-600 mt-1" />
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                .md
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {doc.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {doc.description}
            </p>
            <Link
              href={`/dokumentacja/reader?url=${encodeURIComponent(doc.path)}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              Otwórz dokument
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}