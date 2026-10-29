import raw from "@/content/showcase.json";
import type { Showcase } from "./types";
import { validateShowcase } from "./validate.mjs";

/**
 * La vitrine publiée, validée à l'import. Elle est lue au build (JSON intégré) :
 * le site n'a ni base de données ni accès à la source. Un fichier invalide fait
 * échouer le build plutôt que d'afficher n'importe quoi.
 */
const checked = validateShowcase(raw);
if (!checked.ok) throw new Error(`src/content/showcase.json invalide :\n- ${checked.errors.join("\n- ")}`);

export const showcase = raw as unknown as Showcase;
