import Image from "next/image"

interface SiteLogoProps {
  width?: number
  height?: number
  className?: string
  title?: string
  priority?: boolean
}

/**
 * Logo serwisu w wariancie dopasowanym do motywu.
 *
 * Sygnet jest złoty w obu motywach, ale napis w `logo.svg` jest biały — na
 * jasnym tle znikał. Renderujemy oba pliki i przełączamy je czystym CSS-em
 * (`dark:`), dzięki czemu nie ma mignięcia przy hydracji ani potrzeby
 * czytania motywu w JS.
 *
 * `className` trafia na wrapper, a nie na obrazki: wywołania przekazują tu
 * klasy widoczności (`block sm:hidden lg:block`, `hidden sm:block`), które na
 * obrazku nadpisywały przełącznik motywu i pokazywały oba warianty naraz.
 */
export function SiteLogo({
  width = 200,
  height = 50,
  className,
  title,
  priority,
}: SiteLogoProps) {
  // `style` utrzymuje proporcje, gdy rozmiar nadpisuje CSS (inaczej Next ostrzega).
  const common = {
    alt: "Prosta Sprawa",
    width,
    height,
    title,
    priority,
    style: { width: "auto", height: "auto" } as const,
  }
  return (
    <span className={className}>
      <Image {...common} src="/logo-light.svg" className="block dark:hidden" />
      <Image {...common} src="/logo.svg" className="hidden dark:block" />
    </span>
  )
}

export default SiteLogo
