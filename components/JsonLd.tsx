/**
 * Osadza dane strukturalne schema.org. `<` jest escapowany, bo treść (np. tytuły wpisów
 * pisanych przez ekspertów) mogłaby zawierać `</script>` i wyjść poza tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
