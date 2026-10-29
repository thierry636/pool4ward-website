import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Session anonyme du globe : un cookie signé, de courte durée.
 *
 * Elle sert à COMPTER (quotas par session), pas à autoriser : un visiteur
 * anonyme peut en ouvrir autant qu'il veut, c'est pourquoi l'ouverture de
 * session est elle-même limitée par adresse (voir `guard.ts`). Un cookie signé
 * ne rend secret aucune des images qu'il permet d'obtenir.
 */

export const SESSION_COOKIE = "p4w_gs";
export const SESSION_TTL_SEC = 30 * 60;

const b64url = (buf: Buffer) => buf.toString("base64url");

function sign(secret: string, payload: string): string {
  return b64url(createHmac("sha256", secret).update(payload).digest()).slice(0, 27);
}

export interface Session {
  id: string;
  expiresAt: number;
}

export function issueSession(secret: string, now = Date.now()): Session & { value: string } {
  const id = randomBytes(9).toString("hex");
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SEC;
  const payload = `v1.${id}.${expiresAt.toString(36)}`;
  return { id, expiresAt, value: `${payload}.${sign(secret, payload)}` };
}

export function verifySession(value: string | undefined | null, secret: string, now = Date.now()): Session | null {
  if (!value || value.length > 120) return null;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || !/^[0-9a-f]{18}$/.test(parts[1])) return null;
  const payload = parts.slice(0, 3).join(".");
  const expected = Buffer.from(sign(secret, payload));
  const given = Buffer.from(parts[3]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const expiresAt = parseInt(parts[2], 36);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < now) return null;
  return { id: parts[1], expiresAt };
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return undefined;
}

/**
 * Secret de signature. En production avec une source réelle, il est
 * obligatoire. Avec la source de démonstration — dont le contenu est public par
 * construction — un secret dérivé suffit, pour que la prévisualisation
 * fonctionne sans configuration ; les quotas s'appliquent de la même façon.
 */
export function sessionSecret(sourceMode: "demo" | "live"): string | null {
  const configured = process.env.GLOBE_SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (sourceMode === "demo") {
    return createHash("sha256").update(`p4w-demo-session:${process.env.NEXT_PUBLIC_SITE_URL ?? ""}`).digest("hex");
  }
  return null;
}
