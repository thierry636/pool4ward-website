import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AGENT_ACTS, CAPACITE_IDS, SHOTS } from "./capabilities";

type Cap = { shots: { title: string; alt: string }[]; agent: Record<string, string>; name: string };
type Msg = { Capabilities: Record<string, unknown> & { agent: Record<string, string>; captures: string } };
const load = (loc: string) => JSON.parse(readFileSync(`messages/${loc}/common.json`, "utf8")) as Msg;
const OPERATORS = /milence|engie|hexafret|hupac|cfl|basf|arctic|thermo|tsm|sl express|premium transport|bretagne|rosette|atlantic trans|elltrans|carlider|woz|dls trans|mszczon/i;

describe("les captures du portail et l'agent IA de chaque capacité", () => {
  it("chaque capacité a au moins une capture, et le fichier existe dans le dépôt", () => {
    for (const id of CAPACITE_IDS) {
      expect(SHOTS[id].length, `${id} : au moins une capture`).toBeGreaterThan(0);
      for (const shot of SHOTS[id]) {
        expect(existsSync(`public/images/capabilities/${shot.file}.webp`), `${id} : ${shot.file}.webp`).toBe(true);
        expect(shot.width / shot.height, `${shot.file} : proportions plausibles`).toBeGreaterThan(0.4);
      }
    }
  });

  it.each(["fr", "en"])("%s : un titre de fenêtre et un texte alternatif par capture, dans le même nombre que les fichiers", (loc) => {
    const c = load(loc).Capabilities;
    for (const id of CAPACITE_IDS) {
      const cap = c[id] as Cap;
      expect(cap.shots.length, `${loc}/${id}`).toBe(SHOTS[id].length);
      for (const s of cap.shots) {
        expect(s.title.length, `${loc}/${id}/title`).toBeGreaterThan(2);
        expect(s.alt.length, `${loc}/${id}/alt`).toBeGreaterThan(30);
      }
    }
  });

  it.each(["fr", "en"])("%s : l'agent IA de chaque étape prioriser, relance et propose", (loc) => {
    const c = load(loc).Capabilities;
    for (const act of AGENT_ACTS) expect(c.agent[act].length, `${loc}/agent/${act}`).toBeGreaterThan(3);
    for (const id of CAPACITE_IDS) {
      const cap = c[id] as Cap;
      for (const act of AGENT_ACTS) expect(cap.agent[act].length, `${loc}/${id}/agent/${act}`).toBeGreaterThan(10);
    }
  });

  it.each(["fr", "en"])("%s : aucun nom d'opérateur, de transporteur ou de client dans les textes des captures, et la légende dit que les noms sont masqués", (loc) => {
    const c = load(loc).Capabilities;
    const texts = CAPACITE_IDS.flatMap((id) => {
      const cap = c[id] as Cap;
      return [...cap.shots.flatMap((s) => [s.title, s.alt]), ...Object.values(cap.agent)];
    });
    for (const x of texts) expect(x, `${loc} : « ${x} »`).not.toMatch(OPERATORS);
    expect(c.captures, `${loc} : noms masqués`).toMatch(loc === "fr" ? /masqu/i : /masked/i);
  });
});
