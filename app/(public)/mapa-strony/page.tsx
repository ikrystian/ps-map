import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import { getSiteMapData } from "@/lib/site-map"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Mapa strony | ProstaSprawa.pl",
  description: "Pełna lista ekspertów oraz artykułów bloga dostępnych w serwisie ProstaSprawa.pl.",
}

export default async function SiteMapPage() {
  const { experts, blogGroups } = await getSiteMapData()
  const postCount = blogGroups.reduce((sum, group) => sum + group.posts.length, 0)

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <ResponsiveBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Mapa strony" },
        ]}
      />
      <h1 className="font-playfair text-3xl sm:text-4xl leading-tight text-foreground font-bold tracking-tight mt-3">
        Mapa strony
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base font-light mt-1">
        Wszyscy eksperci i artykuły bloga w jednym miejscu.
      </p>

      <section aria-labelledby="mapa-eksperci" className="mt-10">
        <h2 id="mapa-eksperci" className="font-playfair text-2xl text-foreground mb-4">
          Eksperci <span className="text-muted-foreground text-base font-light">({experts.length})</span>
        </h2>
        {experts.length > 0 ? (
          <ul className="columns-1 sm:columns-2 lg:columns-3 gap-8 text-sm">
            {experts.map((expert) => (
              <li key={expert.slug} className="break-inside-avoid py-1">
                <Link href={`/ekspert/${expert.slug}`} className="text-foreground/90 hover:text-[#d7b56d] transition-colors">
                  {expert.nazwa}
                </Link>
                {expert.miasto && <span className="text-muted-foreground font-light"> — {expert.miasto}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Brak ekspertów do wyświetlenia.</p>
        )}
      </section>

      <section aria-labelledby="mapa-blog" className="mt-12 pt-10 border-t border-border">
        <h2 id="mapa-blog" className="font-playfair text-2xl text-foreground mb-6">
          <Link href="/blog" className="hover:text-[#d7b56d] transition-colors">Blog</Link>{" "}
          <span className="text-muted-foreground text-base font-light">({postCount})</span>
        </h2>
        {blogGroups.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogGroups.map((group) => (
              <div key={group.slug ?? "pozostale"}>
                <h3 className="font-medium text-foreground mb-2">
                  {group.slug ? (
                    <Link href={`/blog?category=${group.slug}`} className="hover:text-[#d7b56d] transition-colors">
                      {group.nazwa}
                    </Link>
                  ) : (
                    group.nazwa
                  )}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {group.posts.map((post) => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.slug}`} className="text-muted-foreground hover:text-[#d7b56d] transition-colors">
                        {post.tytul}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Brak opublikowanych artykułów.</p>
        )}
      </section>
    </div>
  )
}
