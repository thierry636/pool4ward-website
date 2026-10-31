import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { MemoryStore, setStoreForTests } from "@/server/ratelimit";

const body = {
  name: "Jeanne Martin",
  email: "jeanne@exemple.fr",
  company: "Atelier <script>",
  topic: "engineering",
  message: "Bonjour,\nnous avons 4 sites.",
  locale: "fr",
};

const call = (payload: unknown, ip = "203.0.113.50") =>
  POST(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: JSON.stringify(payload),
    }),
  );

beforeEach(() => {
  setStoreForTests(new MemoryStore());
  vi.stubEnv("RESEND_API_KEY", "cle-de-test");
  vi.stubEnv("CONTACT_EMAIL_TO", "equipe@pool4ward.test");
  vi.stubEnv("CONTACT_EMAIL_FROM", "Pool4ward <site@pool4ward.test>");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  setStoreForTests(null);
});

describe("POST /api/contact", () => {
  it("répond 503 et n'envoie rien quand l'envoi n'est pas raccordé", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("DIAGNOSTIC_EMAIL_TO", "");
    const spy = vi.spyOn(globalThis, "fetch");
    const res = await call(body);
    expect(res.status).toBe(503);
    expect(spy).not.toHaveBeenCalled();
  });

  it("envoie la demande, échappée, avec l'adresse du visiteur en reply_to", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const res = await call(body);
    expect(res.status).toBe(200);
    const sent = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.reply_to).toBe("jeanne@exemple.fr");
    expect(sent.to).toEqual(["equipe@pool4ward.test"]);
    expect(sent.html).toContain("Atelier &lt;script&gt;");
    expect(sent.html).not.toContain("<script>");
    expect(sent.html).toContain("Bonjour,<br>nous avons 4 sites.");
  });

  it("n'annonce jamais « envoyé » quand Resend refuse", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 422 }));
    expect((await call(body)).status).toBe(502);
  });

  it("rejette une demande incomplète ou un sujet inconnu", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    expect((await call({ ...body, email: "pas-un-mail" })).status).toBe(400);
    expect((await call({ ...body, topic: "autre-chose" })).status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it("empêche l'injection d'en-tête par saut de ligne dans l'objet du message", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    await call({ ...body, company: "Atelier\r\nBcc: pirate@exemple.fr" });
    const sent = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.subject).not.toMatch(/[\r\n]/);
  });

  it("répond comme si tout allait bien au robot qui remplit le champ piège, sans rien envoyer", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const res = await call({ ...body, website: "http://spam.exemple" });
    expect(res.status).toBe(200);
    expect(spy).not.toHaveBeenCalled();
  });

  it("limite à cinq demandes par dix minutes et par adresse", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await call(body, "203.0.113.99")).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429]);
    expect((await call(body, "203.0.113.100")).status).toBe(200); // une autre adresse n'est pas touchée
  });
});
