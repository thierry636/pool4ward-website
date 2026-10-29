import { inflateSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as tileRoute } from "@/app/api/globe/tiles/[layer]/[z]/[x]/[y]/route";
import { GET as zoneRoute } from "@/app/api/globe/zones/[zone]/route";
import { GET as manifestRoute } from "@/app/api/globe/manifest/route";
import { GET as exploreRoute } from "@/app/api/globe/explore/route";
import { POST as sessionRoute } from "@/app/api/globe/session/route";

import { MemoryStore, setStoreForTests } from "@/server/ratelimit";
import { emptyGrid } from "./grid";
import { COUNT_BUCKETS } from "./layers";
import { setAuthorizerForTests, denyAll } from "./explore";
import { DemoSource, setSourceForTests, type AggregateSource } from "./source";
import { clearTileCache } from "./tiles";
import { bucketOf } from "./summary";
import { ZONES } from "./zones";
import { SESSION_COOKIE, issueSession, sessionSecret, verifySession } from "./session";
import { LIMITS, setSleepForTests } from "./guard";
import { blankTile } from "./raster";

const BASE = "http://localhost:3000";

function req(path: string, init: RequestInit = {}, ip = "203.0.113.7") {
  const headers = new Headers(init.headers);
  headers.set("x-real-ip", ip);
  return new Request(`${BASE}${path}`, { ...init, headers });
}

async function openSession(ip = "203.0.113.7"): Promise<string> {
  const res = await sessionRoute(req("/api/globe/session", { method: "POST" }, ip));
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie") ?? "";
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("SameSite=Lax");
  return cookie.split(";")[0];
}

const tile = (layer: string, z: number | string, x: number | string, y: number | string, cookie?: string, ip?: string) =>
  tileRoute(req(`/api/globe/tiles/${layer}/${z}/${x}/${y}`, { headers: cookie ? { cookie } : {} }, ip), {
    params: Promise.resolve({ layer, z: String(z), x: String(x), y: String(y) }),
  });

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  setSleepForTests(async () => {});
  setStoreForTests(new MemoryStore());
  setSourceForTests(new DemoSource());
  setAuthorizerForTests(denyAll);
  clearTileCache();
});
afterEach(() => {
  vi.restoreAllMocks();
  setSleepForTests(null);
  setStoreForTests(null);
  setSourceForTests(null);
});

describe("manifeste", () => {
  it("décrit les couches et les zones sans contenir de donnée", async () => {
    const body = await (await manifestRoute()).json();
    expect(body.mode).toBe("demo");
    expect(body.layers.map((l: { id: string }) => l.id)).toEqual(["services", "carriers", "parkings", "charging", "networks"]);
    expect(body.layers.find((l: { id: string }) => l.id === "parkings").availability).toBe("unavailable");
    const flat = JSON.stringify(body);
    expect(flat).not.toMatch(/counts|minCount|refCount|coordinates/);
    expect(body.zones.length).toBe(ZONES.length);
  });
});

describe("session", () => {
  it("signe, expire et refuse la falsification", () => {
    const secret = "s".repeat(40);
    const s = issueSession(secret, 1_000_000);
    expect(verifySession(s.value, secret, 1_000_000)?.id).toBe(s.id);
    expect(verifySession(s.value, secret, 1_000_000 + 31 * 60_000)).toBeNull(); // expirée
    expect(verifySession(s.value, "autre-secret".padEnd(40, "x"), 1_000_000)).toBeNull();
    const parts = s.value.split(".");
    expect(verifySession([parts[0], parts[1], "zzzzzz", parts[3]].join("."), secret, 1_000_000)).toBeNull();
    expect(verifySession("n'importe quoi", secret)).toBeNull();
    expect(verifySession(undefined, secret)).toBeNull();
  });

  it("n'accepte la source de démonstration sans secret que pour elle", () => {
    expect(sessionSecret("demo")).toMatch(/^[0-9a-f]{64}$/);
    expect(sessionSecret("live")).toBeNull();
  });
});

describe("tuiles : validation", () => {
  it("refuse sans session", async () => {
    expect((await tile("services", 2, 1, 1)).status).toBe(401);
  });

  it("refuse un cookie falsifié", async () => {
    const forged = `${SESSION_COOKIE}=v1.${"a".repeat(18)}.zzzzzz.${"b".repeat(27)}`;
    expect((await tile("services", 2, 1, 1, forged)).status).toBe(401);
  });

  it("rejette les couches, zooms et coordonnées hors politique avant tout accès aux données", async () => {
    const cookie = await openSession();
    expect((await tile("secret", 2, 1, 1, cookie)).status).toBe(404);
    expect((await tile("services", 6, 0, 0, cookie)).status).toBe(404); // au-delà du zoom servi
    expect((await tile("carriers", 5, 0, 0, cookie)).status).toBe(404);
    expect((await tile("services", 2, 4, 0, cookie)).status).toBe(400); // x hors de la grille
    expect((await tile("services", 2, 0, 9, cookie)).status).toBe(400);
    expect((await tile("services", -1, 0, 0, cookie)).status).toBe(400);
    expect((await tile("services", "2.5", 0, 0, cookie)).status).toBe(400);
    expect((await tile("services", "02", 0, 0, cookie)).status).toBe(400);
    expect((await tile("services", 2, "1e3", 0, cookie)).status).toBe(400);
    expect((await tile("services", 2, "99999999999", 0, cookie)).status).toBe(400);
  });

  it("déclare non raccordée une couche sans référentiel", async () => {
    const cookie = await openSession();
    expect((await tile("parkings", 2, 1, 1, cookie)).status).toBe(404);
  });
});

describe("tuiles : contenu", () => {
  it("sert un PNG 512×512, en cache privé, qui varie avec le cookie", async () => {
    const cookie = await openSession();
    const res = await tile("services", 3, 4, 2, cookie);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toMatch(/^private/);
    expect(res.headers.get("vary")).toBe("Cookie");
    expect(res.headers.get("cross-origin-resource-policy")).toBe("same-origin");
    expect(res.headers.get("access-control-allow-origin")).toBeNull();

    const png = Buffer.from(await res.arrayBuffer());
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(512);
    expect(png.readUInt32BE(20)).toBe(512);
    const idatLen = png.readUInt32BE(33);
    const raw = inflateSync(png.subarray(41, 41 + idatLen));
    expect(raw.length).toBe((512 * 4 + 1) * 512);
  });

  it("est déterministe : aucune variation d'une requête à l'autre", async () => {
    const cookie = await openSession();
    const a = Buffer.from(await (await tile("services", 3, 4, 2, cookie)).arrayBuffer());
    clearTileCache();
    const b = Buffer.from(await (await tile("services", 3, 4, 2, cookie)).arrayBuffer());
    expect(a.equals(b)).toBe(true);
  });

  it("répond 304 à un ETag connu", async () => {
    const cookie = await openSession();
    const first = await tile("networks", 2, 2, 1, cookie);
    const etag = first.headers.get("etag") as string;
    const res = await tileRoute(
      req("/api/globe/tiles/networks/2/2/1", { headers: { cookie, "if-none-match": etag } }),
      { params: Promise.resolve({ layer: "networks", z: "2", x: "2", y: "1" }) },
    );
    expect(res.status).toBe(304);
  });

  it("masque les cellules sous le seuil de petits effectifs", async () => {
    const make = (count: number): AggregateSource => ({
      mode: "demo",
      availability: () => "demo",
      corridors: async () => [],
      grid: async (layer) => {
        const g = emptyGrid(layer, "demo", null);
        g.counts[Math.round((48 + 90) / g.cellDeg) * g.cols + Math.round((2 + 180) / g.cellDeg)] = count;
        return g;
      },
    });
    const cookie = await openSession();
    const sizeFor = async (count: number) => {
      setSourceForTests(make(count));
      clearTileCache();
      // z=3, x=4, y=2 couvre l'Europe de l'Ouest
      return Buffer.from(await (await tile("services", 3, 4, 2, cookie)).arrayBuffer());
    };
    const hidden = await sizeFor(3); // sous minCount (4) : tuile vide
    const shown = await sizeFor(40);
    expect(hidden.equals(blankTile())).toBe(true);
    expect(shown.equals(blankTile())).toBe(false);
  });
});

describe("garde : quotas et balayages", () => {
  it("limite l'ouverture de sessions par adresse puis exige un défi", async () => {
    const ip = "198.51.100.9";
    for (let i = 0; i < LIMITS.sessionsPerIpHour; i++) {
      expect((await sessionRoute(req("/api/globe/session", { method: "POST" }, ip))).status).toBe(200);
    }
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) statuses.push((await sessionRoute(req("/api/globe/session", { method: "POST" }, ip))).status);
    expect(statuses[0]).toBe(429);
    expect(statuses).toContain(403); // défi demandé après des refus répétés
    const challenged = await sessionRoute(req("/api/globe/session", { method: "POST" }, ip));
    expect([403, 429]).toContain(challenged.status);
  });

  it("reconnaît un balayage de tuiles fines et le coupe", async () => {
    const cookie = await openSession();
    let blockedAt = -1;
    let lastStatus = 200;
    for (let i = 0; i < LIMITS.deepTilesPerSession + 20; i++) {
      const res = await tile("networks", 5, i % 32, Math.floor(i / 32), cookie);
      lastStatus = res.status;
      if (res.status !== 200) {
        blockedAt = i;
        break;
      }
    }
    expect(blockedAt).toBe(LIMITS.deepTilesPerSession);
    expect(lastStatus).toBe(429);
    expect([403, 429]).toContain((await tile("networks", 5, 31, 3, cookie)).status);
  });

  it("n'inquiète pas une visite normale", async () => {
    const cookie = await openSession();
    // Un globe : une vingtaine de tuiles, deux couches, zoom modéré.
    for (let i = 0; i < 24; i++) {
      const res = await tile(i % 2 ? "networks" : "carriers", 2, i % 4, Math.floor(i / 8) % 4, cookie);
      expect(res.status).toBe(200);
    }
  });

  it("coupe une session qui dépasse son débit, sans toucher aux autres", async () => {
    const a = await openSession("192.0.2.10");
    const b = await openSession("192.0.2.11");
    let status = 200;
    for (let i = 0; i < LIMITS.tilesPerSessionMin + 5; i++) {
      status = (await tile("networks", 1, i % 2, 0, a, "192.0.2.10")).status;
      if (status !== 200) break;
    }
    expect([429, 403]).toContain(status);
    expect((await tile("networks", 1, 0, 0, b, "192.0.2.11")).status).toBe(200);
  });
});

describe("synthèse de zone", () => {
  const zone = (id: string, cookie?: string) =>
    zoneRoute(req(`/api/globe/zones/${id}`, { headers: cookie ? { cookie } : {} }), { params: Promise.resolve({ zone: id }) });

  it("exige une session et rejette les identifiants mal formés ou inconnus", async () => {
    expect((await zone(ZONES[0].id)).status).toBe(401);
    const cookie = await openSession();
    expect((await zone("france", cookie)).status).toBe(400);
    expect((await zone("z-zzzzzz", cookie)).status).toBe(400);
    expect((await zone("z-abcdef", cookie)).status).toBe(404);
  });

  it("ne publie que des paliers, jamais un effectif exact ni une liste d'actifs", async () => {
    const cookie = await openSession();
    const res = await zone(ZONES.find((z) => z.slug === "benelux-rhine")!.id, cookie);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe("demo");
    const flat = JSON.stringify(body);
    expect(flat).not.toMatch(/lat|lon|coordinates|name|contact|id":"[a-z0-9]{8,}/i);
    for (const l of body.layers) {
      if (l.range) {
        expect(COUNT_BUCKETS).toContain(l.range.min);
        if (l.range.max !== null) expect(COUNT_BUCKETS).toContain(l.range.max + 1);
      }
    }
  });

  it("masque les petits effectifs plutôt que de les décrire", async () => {
    const cookie = await openSession();
    const res = await zone(ZONES.find((z) => z.slug === "oceania")!.id, cookie);
    const body = await res.json();
    const services = body.layers.find((l: { layer: string }) => l.layer === "services");
    expect(services.suppressed || services.range).toBeTruthy();
    const parkings = body.layers.find((l: { layer: string }) => l.layer === "parkings");
    expect(parkings.availability).toBe("unavailable");
  });

  it("découpe en paliers fixes : la différence de deux synthèses ne livre rien de plus fin", () => {
    expect(bucketOf(10)).toEqual({ min: 10, max: 24 });
    expect(bucketOf(24)).toEqual({ min: 10, max: 24 });
    expect(bucketOf(25)).toEqual({ min: 25, max: 49 });
    expect(bucketOf(5000)).toEqual({ min: 1000, max: null });
  });

  it("borne le nombre de synthèses par session", async () => {
    const cookie = await openSession();
    let last = 200;
    for (let i = 0; i < LIMITS.zonesPerSession + 2; i++) {
      last = (await zone(ZONES[i % ZONES.length].id, cookie)).status;
      if (last !== 200) break;
    }
    expect([429, 403]).toContain(last);
  });

  it("garde les zones disjointes (pas de soustraction possible entre zones emboîtées)", () => {
    for (let i = 0; i < ZONES.length; i++) {
      for (let j = i + 1; j < ZONES.length; j++) {
        const [aw, as, ae, an] = ZONES[i].bbox;
        const [bw, bs, be, bn] = ZONES[j].bbox;
        const overlapW = Math.min(ae, be) - Math.max(aw, bw);
        const overlapH = Math.min(an, bn) - Math.max(as, bs);
        expect(overlapW > 0 && overlapH > 0, `${ZONES[i].slug} / ${ZONES[j].slug}`).toBe(false);
      }
    }
  });
});

describe("exploration détaillée", () => {
  it("répond 401 sans justificatif, même avec des paramètres valides", async () => {
    const res = await exploreRoute(req("/api/globe/explore?layer=services&limit=5"));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBe("Bearer");
  });

  it("répond 401 à un justificatif inconnu : aucun jeton n'est accepté par défaut", async () => {
    const res = await exploreRoute(req("/api/globe/explore?layer=services", { headers: { authorization: "Bearer abc" } }));
    expect(res.status).toBe(401);
  });

  it("applique le contrat de validation dès qu'un justificatif est reconnu", async () => {
    setAuthorizerForTests({ authorize: async () => ({ organization: "org-test", scopes: ["explore"] }) });
    const get = (q: string) => exploreRoute(req(`/api/globe/explore?${q}`, { headers: { authorization: "Bearer ok" } }));
    expect((await get("layer=services&bbox=0,0,10,10")).status).toBe(400);
    expect((await get("layer=services&lat=48&lon=2")).status).toBe(400);
    expect((await get("layer=networks")).status).toBe(400);
    expect((await get("layer=services&limit=1000")).status).toBe(400);
    expect((await get("layer=services&page=50")).status).toBe(400);
    expect((await get("layer=services&country=fra")).status).toBe(400);
    expect((await get("layer=services&mode=air")).status).toBe(400);
    expect((await get("layer=services&mode=rail&country=FR&limit=25&page=3")).status).toBe(501);
  });
});
