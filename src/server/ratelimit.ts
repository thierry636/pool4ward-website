/**
 * Limitation de débit à fenêtre glissante, derrière une interface de stockage.
 *
 * Le stockage par défaut vit en mémoire du processus. Sur une plateforme
 * serverless (Netlify), chaque instance a sa propre mémoire : la limite y est
 * donc une barrière de bon sens, pas un garde-fou global. En production, le
 * même contrat se branche sur un stockage partagé (voir `UpstashStore`) et
 * doit être doublé d'une règle au niveau du pare-feu applicatif de
 * l'hébergeur — voir docs/version2/PROTECTION.md.
 */

export interface RateStore {
  /** Enregistre un événement pour `key` et renvoie le nombre d'événements dans la fenêtre. */
  hit(key: string, windowMs: number, now: number): Promise<number>;
  /** Nombre d'événements dans la fenêtre, sans en ajouter. */
  count(key: string, windowMs: number, now: number): Promise<number>;
}

export class MemoryStore implements RateStore {
  private events = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(private readonly maxKeys = 50_000) {}

  private prune(key: string, windowMs: number, now: number): number[] {
    const kept = (this.events.get(key) ?? []).filter((t) => now - t < windowMs);
    if (kept.length) this.events.set(key, kept);
    else this.events.delete(key);
    return kept;
  }

  private sweep(now: number) {
    if (now - this.lastSweep < 60_000 && this.events.size < this.maxKeys) return;
    this.lastSweep = now;
    for (const [key, times] of this.events) {
      if (now - times[times.length - 1] > 3_600_000) this.events.delete(key);
    }
    // Garde-fou mémoire : au-delà du plafond, on repart de zéro plutôt que de
    // laisser un balayage d'adresses faire grossir le processus sans limite.
    if (this.events.size > this.maxKeys) this.events.clear();
  }

  async hit(key: string, windowMs: number, now: number): Promise<number> {
    this.sweep(now);
    const kept = this.prune(key, windowMs, now);
    kept.push(now);
    this.events.set(key, kept);
    return kept.length;
  }

  async count(key: string, windowMs: number, now: number): Promise<number> {
    return this.prune(key, windowMs, now).length;
  }
}

/**
 * Stockage partagé par l'API REST d'Upstash Redis (ou tout service compatible).
 * Fenêtre fixe par compteur à expiration : plus grossière que la fenêtre
 * glissante mémoire, mais partagée entre instances. NON ÉPROUVÉ contre un
 * service réel dans cette livraison : le contrat est testé avec un faux
 * serveur uniquement.
 */
export class UpstashStore implements RateStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async pipeline(commands: (string | number)[][]): Promise<{ result: unknown }[]> {
    const res = await this.fetchImpl(`${this.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`rate-store ${res.status}`);
    return (await res.json()) as { result: unknown }[];
  }

  private bucket(key: string, windowMs: number, now: number) {
    return `rl:${key}:${Math.floor(now / windowMs)}`;
  }

  async hit(key: string, windowMs: number, now: number): Promise<number> {
    const k = this.bucket(key, windowMs, now);
    const out = await this.pipeline([
      ["INCR", k],
      ["PEXPIRE", k, windowMs],
    ]);
    return Number(out[0].result);
  }

  async count(key: string, windowMs: number, now: number): Promise<number> {
    const out = await this.pipeline([["GET", this.bucket(key, windowMs, now)]]);
    return Number(out[0].result ?? 0);
  }
}

let shared: RateStore | null = null;

/** Un seul stockage par processus ; Upstash si les deux variables sont fournies. */
export function defaultStore(): RateStore {
  if (!shared) {
    const url = process.env.RATE_LIMIT_REDIS_URL;
    const token = process.env.RATE_LIMIT_REDIS_TOKEN;
    shared = url && token ? new UpstashStore(url, token) : new MemoryStore();
  }
  return shared;
}

export function setStoreForTests(store: RateStore | null) {
  shared = store;
}

/* ------------------------------------------------------------- identité */

/**
 * Clé réseau d'une requête. On lit les en-têtes posés par l'hébergeur ; on ne
 * les croit que pour limiter, jamais pour autoriser. Une IP seule est un
 * signal faible (NAT d'entreprise, proxys) : elle se combine à d'autres.
 */
export function clientKey(headers: Headers): string {
  const forwarded =
    headers.get("x-nf-client-connection-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded && forwarded.length < 64 ? forwarded : "inconnue";
}

export interface Limit {
  /** Nombre maximal d'événements dans la fenêtre. */
  max: number;
  windowMs: number;
}

export interface LimitResult {
  allowed: boolean;
  count: number;
  retryAfterSec: number;
}

export async function limit(
  store: RateStore,
  key: string,
  rule: Limit,
  now = Date.now(),
): Promise<LimitResult> {
  const count = await store.hit(key, rule.windowMs, now);
  return {
    allowed: count <= rule.max,
    count,
    retryAfterSec: Math.ceil(rule.windowMs / 1000),
  };
}
