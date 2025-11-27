import Link from 'next/link';
import { FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocsPage() {
  const sampleDocs = [
    { name: 'Strony główne', path: 'docs/[1][strony-publiczne]strony-główne.md', description: 'Dokumentacja funkcjonalności stron publicznych' },
    { name: 'Weryfikacja email', path: 'docs/[2][strony-publiczne]weryfikacja-email.md', description: 'System weryfikacji adresu email' },
    { name: 'Strony informacyjne', path: 'docs/[3][strony-publiczne]informacyjne.md', description: 'Strony informacyjne platformy' },
    { name: 'Strony funkcjonalne', path: 'docs/[4][strony-publiczne]funkcjonalne.md', description: 'Strony funkcjonalne platformy' },
    { name: 'Kancelaria', path: 'docs/[5][strony-publiczne]kancelaria.md', description: 'Strona kancelarii prawnej' },
    { name: 'Panel klienta - główne', path: 'docs/[6][panel-klienta]glowne.md', description: 'Główne funkcje panelu klienta' },
    { name: 'Panel klienta - sprawy', path: 'docs/[7][panel-klienta]sprawy.md', description: 'Zarządzanie sprawami w panelu klienta' },
    { name: 'Panel klienta - oferty', path: 'docs/[8][panel-klienta]oferty.md', description: 'Oferty w panelu klienta' },
    { name: 'Panel klienta - komunikacja', path: 'docs/[9][panel-klienta]komunikacja.md', description: 'System komunikacji w panelu klienta' },
    { name: 'Panel klienta - inne', path: 'docs/[10][panel-klienta]inne.md', description: 'Dodatkowe funkcje panelu klienta' },
    { name: 'Panel kancelarii - główne', path: 'docs/[11][panel-eksperta]glowne.md', description: 'Główne funkcje panelu kancelarii' },
    { name: 'Panel kancelarii - sprawy i oferty', path: 'docs/[12][panel-eksperta]sprawy-i-oferty.md', description: 'Zarządzanie sprawami i ofertami' },
    { name: 'Panel kancelarii - zakres usług', path: 'docs/[13][panel-eksperta]zakres-uslug.md', description: 'Zarządzanie zakresem usług' },
    { name: 'Panel kancelarii - blog', path: 'docs/[14][panel-eksperta]blog.md', description: 'Funkcje bloga w panelu kancelarii' },
    { name: 'Panel kancelarii - certyfikaty', path: 'docs/[15][panel-eksperta]certyfikaty.md', description: 'Zarządzanie certyfikatami' },
    { name: 'Panel kancelarii - dokumenty', path: 'docs/[16][panel-eksperta]dokumenty.md', description: 'Zarządzanie dokumentami' },
    { name: 'Panel kancelarii - finansowe', path: 'docs/[17][panel-eksperta]finansowe.md', description: 'Funkcje finansowe panelu kancelarii' },
    { name: 'Panel kancelarii - system punktów', path: 'docs/[18][panel-eksperta]system-punktow.md', description: 'System punktowy w panelu kancelarii' },
    { name: 'Panel kancelarii - płatności', path: 'docs/[19][panel-eksperta]platnosci.md', description: 'System płatności w panelu kancelarii' },
    { name: 'Panel kancelarii - komunikacja', path: 'docs/[20][panel-eksperta]komunikacja.md', description: 'Komunikacja w panelu kancelarii' },
    { name: 'Panel kancelarii - program partnerski', path: 'docs/[21][panel-eksperta]program-partnerski.md', description: 'Program partnerski dla kancelarii' },
    { name: 'Panel admina - główne', path: 'docs/[22][panel-admina]glowne.md', description: 'Główne funkcje panelu administratora' },
    { name: 'Panel admina - użytkownicy', path: 'docs/[23][panel-admina]uzytkownicy.md', description: 'Zarządzanie użytkownikami' },
    { name: 'Panel admina - kancelarie', path: 'docs/[24][panel-admina]kancelarie.md', description: 'Zarządzanie kancelariami' },
    { name: 'Panel admina - sprawy', path: 'docs/[25][panel-admina]sprawy.md', description: 'Zarządzanie sprawami' },
    { name: 'Panel admina - kategorie', path: 'docs/[26][panel-admina]kategorie.md', description: 'Zarządzanie kategoriami' },
    { name: 'Panel admina - opinie', path: 'docs/[27][panel-admina]opinie.md', description: 'Zarządzanie opiniami' },
    { name: 'Panel admina - pakiety', path: 'docs/[29][panel-admina]pakiety.md', description: 'Zarządzanie pakietami' },
    { name: 'Panel admina - CMS', path: 'docs/[30][panel-admina]cms.md', description: 'System zarządzania treścią' },
    { name: 'Panel admina - finansowe', path: 'docs/[31][panel-admina]finansowe.md', description: 'Funkcje finansowe panelu admina' },
    { name: 'Panel admina - newsletter', path: 'docs/[32][panel-admina]newsletter.md', description: 'Zarządzanie newsletterem' },
    { name: 'Panel admina - pomoc', path: 'docs/[33][panel-admina]pomoc.md', description: 'System pomocy w panelu admina' },
    { name: 'Panel admina - klub partnerski', path: 'docs/[34][panel-admina]klub-partnerski.md', description: 'Zarządzanie klubem partnerskim' },
    { name: 'Panel admina - ustawienia', path: 'docs/[35][panel-admina]ustawienia.md', description: 'Ustawienia panelu administratora' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Dokumentacja</h1>
        <p className="text-muted-foreground text-lg">
          Przeglądaj dokumentację techniczną platformy "Prosta Sprawa"
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleDocs.map((doc, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                <Badge variant="secondary" className="text-xs">
                  .md
                </Badge>
              </div>
              <CardTitle className="text-lg">
                {doc.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {doc.description}
              </p>
              <Link
                href={`/dokumentacja/reader?url=${encodeURIComponent(doc.path)}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                Otwórz dokument
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}