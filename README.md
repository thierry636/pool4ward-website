# Pool4ward — site public

Next.js 14 (App Router), TypeScript, Tailwind, `next-intl` (FR/EN).

- **Branche `main`** : site public actuel (version 1).
- **Branche `version2`** : refonte complète (cette version). Documentation, audit,
  protection des données, raccordements restants et résultats de vérification :
  [`docs/version2/`](docs/version2/README.md).

```bash
npm ci
npm run dev       # http://localhost:3000
npm test          # vitest
npm run build && npm start
```

Variables d'environnement : voir
[`docs/version2/INTEGRATIONS.md`](docs/version2/INTEGRATIONS.md).
