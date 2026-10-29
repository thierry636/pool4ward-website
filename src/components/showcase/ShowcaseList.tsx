import { getTranslations } from "next-intl/server";
import { chaptersOf } from "@/lib/showcase/chapters-of";
import type { Showcase } from "@/lib/showcase/types";

/**
 * Équivalent texte de l'animation : chaque liaison, chapitre par chapitre. Rendu
 * côté serveur, donc lisible sans JavaScript, au lecteur d'écran et aux
 * moteurs de recherche. C'est aussi là que les noms d'opérateurs publiés
 * s'affichent en toutes lettres.
 */
export async function ShowcaseList({ data }: { data: Showcase }) {
  const t = await getTranslations("Showcase");
  const site = new Map(data.sites.map((s) => [s.id, s]));

  return (
    <details className="mt-8 border" style={{ borderColor: "var(--rule)" }}>
      <summary className="cursor-pointer px-4 py-3 text-[0.95rem] font-medium sm:px-5">{t("list.summary")}</summary>
      <div className="px-4 pb-8 sm:px-5">
        <p className="text-[0.92rem]" style={{ color: "var(--fg-2)" }}>{t("list.intro")}</p>
        {data.mode === "demo" && (
          <p className="mt-2 text-[0.92rem]" style={{ color: "var(--warm)" }}>
            {t("demo.tag")} — {t("demo.note")}
          </p>
        )}
        {chaptersOf(data).map((c) => {
          const name = t(`chapters.${c.id}.name`);
          const rows = data.services.filter((v) => v.chapter === c.id);
          return (
            <section key={c.id} className="mt-8">
              <h3 className="h3">{name}</h3>
              <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label={name}>
                <table className="w-full min-w-[34rem] border-collapse text-left text-[0.92rem]">
                  <thead>
                    <tr className="eyebrow">
                      {(["route", "mode", "operator"] as const).map((k) => (
                        <th key={k} scope="col" className="pb-2 pr-4 font-normal">{t(`list.columns.${k}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((v) => {
                      const route = [v.from, ...(v.via ?? []), v.to].map((id) => site.get(id)!);
                      return (
                        <tr key={v.id} className="border-t align-top" style={{ borderColor: "var(--rule)" }}>
                          <th scope="row" className="py-2.5 pr-4 font-normal">
                            {route.map((s, i) => (
                              <span key={s.id}>
                                {i > 0 && (
                                  <>
                                    <span aria-hidden="true"> → </span>
                                    <span className="sr-only"> {t("list.arrow")} </span>
                                  </>
                                )}
                                {s.name}
                                <span className="sr-only"> ({t(`kinds.${s.kind}`)}, {s.country})</span>
                              </span>
                            ))}
                          </th>
                          <td className="py-2.5 pr-4">{t(`modes.${v.mode}`)}</td>
                          <td className="py-2.5" style={v.operator ? undefined : { color: "var(--fg-2)" }}>{v.operator ?? t("list.none")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </details>
  );
}
