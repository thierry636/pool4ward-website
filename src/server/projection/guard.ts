import { createHmac } from "node:crypto";
import { clientKey, defaultStore, type RateStore } from "@/server/ratelimit";
import { SESSION_COOKIE, readCookie, verifySession, type Session } from "./session";

/**
 * Garde des routes du globe : sessions, quotas, détection de balayage, réponses
 * graduées.
 *
 * Aucune de ces mesures n'empêche de COPIER ce qui est montré — une image se
 * capture. Elles rendent la reconstitution systématique coûteuse, bornée et
 * détectable, et laissent la visite normale fluide : un visiteur qui tourne le
 * globe et zoome sur deux régions reste très loin de tous les seuils.
 *
 * Gradation : ralentissement → quota (429) → défi (403, en-tête
 * `X-P4W-Challenge`) → blocage temporaire. Le défi n'est pas implémenté ici :
 * l'en-tête signale au pare-feu applicatif / à la solution anti-bot de
 * l'hébergeur qu'il doit en proposer un (docs/version2/PROTECTION.md).
 */

export const LIMITS = {
  /** Sessions ouvertes par adresse et par heure. */
  sessionsPerIpHour: 12,
  /** Tuiles par session et par minute / par adresse et par minute. */
  tilesPerSessionMin: 300,
  tilesPerIpMin: 900,
  /** Tuiles DISTINCTES par session / par adresse, sur dix minutes. */
  distinctTilesPerSession: 450,
  distinctTilesPerIp: 800,
  /** Tuiles distinctes aux deux niveaux de zoom les plus fins, par session : un balayage, pas une visite. */
  deepTilesPerSession: 100,
  /** Synthèses de zone par session sur dix minutes, et zones distinctes. */
  zonesPerSession: 40,
  distinctZonesPerSession: 20,
  /** Refus avant défi, puis avant blocage, par adresse et par heure. */
  strikesBeforeChallenge: 3,
  strikesBeforeBlock: 6,
  blockMs: 15 * 60_000,
} as const;

const MIN = 60_000;
const TEN_MIN = 10 * MIN;
const HOUR = 60 * MIN;

export type Denial = {
  ok: false;
  status: 401 | 403 | 429;
  body: { error: string };
  headers: Record<string, string>;
};

export type Granted = { ok: true; session: Session; delayMs: number };

export interface GuardEnv {
  store: RateStore;
  secret: string;
  now: number;
  /** Fait dormir la requête (ralentissement) ; remplaçable en test. */
  sleep?: (ms: number) => Promise<void>;
}

let sleeper: (ms: number) => Promise<void> = (ms) => new Promise<void>((r) => setTimeout(r, ms));

export function setSleepForTests(fn: ((ms: number) => Promise<void>) | null) {
  sleeper = fn ?? ((ms) => new Promise<void>((r) => setTimeout(r, ms)));
}

export function env(secret: string, store: RateStore = defaultStore()): GuardEnv {
  return { store, secret, now: Date.now(), sleep: (ms) => sleeper(ms) };
}

/** Identifiants journalisés : hachés, pour pouvoir corréler sans conserver d'adresse. */
function tag(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex").slice(0, 10);
}

function log(e: GuardEnv, level: string, reason: string, ip: string, session?: string) {
  console.warn(
    JSON.stringify({ evt: "globe.guard", level, reason, ip: tag(e.secret, ip), session: session ? tag(e.secret, session) : undefined }),
  );
}

async function strike(e: GuardEnv, ip: string, reason: string): Promise<number> {
  const n = await e.store.hit(`strike:${ip}`, HOUR, e.now);
  log(e, "strike", reason, ip);
  if (n >= LIMITS.strikesBeforeBlock) await e.store.hit(`block:${ip}`, LIMITS.blockMs, e.now);
  return n;
}

function deny(status: 401 | 403 | 429, error: string, extra: Record<string, string> = {}): Denial {
  return {
    ok: false,
    status,
    body: { error },
    headers: { "Cache-Control": "no-store", ...extra },
  };
}

async function refuse(e: GuardEnv, ip: string, reason: string, retryAfterSec: number): Promise<Denial> {
  const n = await strike(e, ip, reason);
  if (n >= LIMITS.strikesBeforeChallenge) {
    return deny(403, "challenge_required", { "X-P4W-Challenge": "required", "Retry-After": String(retryAfterSec) });
  }
  return deny(429, "too_many_requests", { "Retry-After": String(retryAfterSec) });
}

/** Ouverture de session : limitée par adresse, car une session ne coûte rien à créer. */
export async function guardSessionOpen(req: Request, e: GuardEnv): Promise<Denial | null> {
  const ip = clientKey(req.headers);
  if ((await e.store.count(`block:${ip}`, LIMITS.blockMs, e.now)) > 0) return deny(429, "blocked", { "Retry-After": "900" });
  const n = await e.store.hit(`sess:${ip}`, HOUR, e.now);
  if (n > LIMITS.sessionsPerIpHour) return refuse(e, ip, "session-burst", 3600);
  return null;
}

type Kind = { type: "tile"; key: string; deep: boolean } | { type: "zone"; key: string };

export async function guard(req: Request, e: GuardEnv, kind: Kind): Promise<Granted | Denial> {
  const ip = clientKey(req.headers);

  if ((await e.store.count(`block:${ip}`, LIMITS.blockMs, e.now)) > 0) {
    return deny(429, "blocked", { "Retry-After": "900" });
  }

  const session = verifySession(readCookie(req.headers.get("cookie"), SESSION_COOKIE), e.secret, e.now);
  if (!session) return deny(401, "session_required");

  let delayMs = 0;

  if (kind.type === "tile") {
    const perSession = await e.store.hit(`t:${session.id}`, MIN, e.now);
    const perIp = await e.store.hit(`ti:${ip}`, MIN, e.now);
    if (perSession > LIMITS.tilesPerSessionMin || perIp > LIMITS.tilesPerIpMin) {
      return refuse(e, ip, "tile-rate", 60);
    }
    const distinctSession = await e.store.distinct(`td:${session.id}`, kind.key, TEN_MIN, e.now);
    const distinctIp = await e.store.distinct(`tdi:${ip}`, kind.key, TEN_MIN, e.now);
    if (distinctSession > LIMITS.distinctTilesPerSession || distinctIp > LIMITS.distinctTilesPerIp) {
      return refuse(e, ip, "tile-distinct", 600);
    }
    if (kind.deep) {
      const deep = await e.store.distinct(`tdeep:${session.id}`, kind.key, TEN_MIN, e.now);
      if (deep > LIMITS.deepTilesPerSession) return refuse(e, ip, "deep-sweep", 600);
    }
    // Ralentissement progressif avant le quota : la visite normale n'y arrive pas.
    const load = Math.max(perSession / LIMITS.tilesPerSessionMin, distinctSession / LIMITS.distinctTilesPerSession);
    if (load > 0.85) delayMs = 800;
    else if (load > 0.6) delayMs = 250;
  } else {
    const n = await e.store.hit(`z:${session.id}`, TEN_MIN, e.now);
    const d = await e.store.distinct(`zd:${session.id}`, kind.key, TEN_MIN, e.now);
    if (n > LIMITS.zonesPerSession || d > LIMITS.distinctZonesPerSession) return refuse(e, ip, "zone-scan", 600);
    if (n > LIMITS.zonesPerSession * 0.7) delayMs = 400;
  }

  if (delayMs) log(e, "slow", kind.type, ip, session.id);
  return { ok: true, session, delayMs };
}

export const sleep = (ms: number) => sleeper(ms);
