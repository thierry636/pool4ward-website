import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryStore, clientKey, limit } from "./ratelimit";

const h = (init: Record<string, string>) => new Headers(init);

afterEach(() => vi.unstubAllEnvs());

describe("clientKey", () => {
  it("ne croit en production que l'en-tête garanti par l'hébergeur", () => {
    vi.stubEnv("NODE_ENV", "production");
    // Un client qui écrit x-real-ip ou le premier maillon de X-Forwarded-For ne change pas d'identité.
    expect(clientKey(h({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientKey(h({ "x-real-ip": "1.1.1.1" }))).toBe("inconnue");
  });

  it("lit CLIENT_IP_HEADER s'il est défini", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLIENT_IP_HEADER", "cf-connecting-ip");
    expect(clientKey(h({ "cf-connecting-ip": "198.51.100.4", "x-forwarded-for": "9.9.9.9" }))).toBe("198.51.100.4");
  });

  it("lit l'en-tête de Netlify sur Netlify", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NETLIFY", "true");
    expect(clientKey(h({ "x-nf-client-connection-ip": "192.0.2.77", "x-real-ip": "1.1.1.1" }))).toBe("192.0.2.77");
  });

  it("accepte x-real-ip hors production, pour simuler en test", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(clientKey(h({ "x-real-ip": "10.0.0.1" }))).toBe("10.0.0.1");
  });

  it("refuse une valeur démesurée", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(clientKey(h({ "x-real-ip": "x".repeat(200) }))).toBe("inconnue");
  });
});

describe("MemoryStore", () => {
  it("compte dans une fenêtre glissante", async () => {
    const s = new MemoryStore();
    const rule = { max: 2, windowMs: 1000 };
    expect((await limit(s, "k", rule, 0)).allowed).toBe(true);
    expect((await limit(s, "k", rule, 100)).allowed).toBe(true);
    expect((await limit(s, "k", rule, 200)).allowed).toBe(false);
    expect((await limit(s, "k", rule, 1300)).allowed).toBe(true);
  });

  it("compte les membres distincts, pas les répétitions", async () => {
    const s = new MemoryStore();
    expect(await s.distinct("d", "a", 1000, 0)).toBe(1);
    expect(await s.distinct("d", "a", 1000, 10)).toBe(1);
    expect(await s.distinct("d", "b", 1000, 20)).toBe(2);
    expect(await s.distinct("d", "c", 1000, 2000)).toBe(1); // les deux premiers ont expiré
  });

  it("borne sa mémoire face à un balayage de clés", async () => {
    const s = new MemoryStore(100);
    for (let i = 0; i < 500; i++) await s.hit(`k${i}`, 60_000, i);
    expect(await s.count("k499", 60_000, 500)).toBeLessThanOrEqual(1);
  });
});
