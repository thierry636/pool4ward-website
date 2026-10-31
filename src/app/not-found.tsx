/**
 * 404 hors d'une langue (adresse sans préfixe `/fr` ou `/en`). Le layout racine
 * ne rend ni `<html>` ni `<body>` : cette page les porte elle-même, et reste
 * volontairement autonome (pas de messages, pas de chrome).
 */
export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#020617", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "8rem 1.5rem" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "2.4rem", lineHeight: 1.1 }}>
            Cette page n’existe pas. <span style={{ display: "block", opacity: 0.7, fontSize: "1.4rem" }}>This page does not exist.</span>
          </h1>
          <p style={{ marginTop: "2rem", display: "flex", gap: "1.5rem" }}>
            <a href="/fr" style={{ color: "#5eead4" }}>Accueil</a>
            <a href="/en" style={{ color: "#5eead4" }}>Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
