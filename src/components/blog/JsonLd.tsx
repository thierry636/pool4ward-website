/**
 * Données structurées. Le contenu vient du front-matter du repo, jamais d'une
 * saisie extérieure ; `<` est tout de même échappé pour qu'une chaîne
 * contenant `</script>` ne puisse pas refermer la balise.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
