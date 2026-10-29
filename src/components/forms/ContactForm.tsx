"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CONTACT_TOPICS,
  MAX_MESSAGE,
  isValid,
  validateContact,
  type ContactErrors,
  type ContactPayload,
  type ContactTopic,
} from "@/lib/contact";

type Phase = "idle" | "sending" | "success" | "error" | "unavailable" | "tooMany";

/**
 * Formulaire de contact. Il n'annonce « envoyé » que si le serveur l'a dit :
 * 503 (non raccordé) et 429 (trop d'essais) ont leur propre message.
 */
export function ContactForm({ defaultTopic = "other" }: { defaultTopic?: ContactTopic }) {
  const t = useTranslations("Contact.form");
  const locale = useLocale() as "fr" | "en";
  const uid = useId();
  const [values, setValues] = useState({ name: "", email: "", company: "", message: "" });
  const [topic, setTopic] = useState<ContactTopic>(defaultTopic);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [phase, setPhase] = useState<Phase>("idle");

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trap = (new FormData(e.currentTarget).get("website") as string) || "";
    const found = validateContact({ ...values, topic });
    setErrors(found);
    if (!isValid(found)) return;

    setPhase("sending");
    const payload: ContactPayload = { ...values, topic, locale, website: trap };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setPhase("success");
      else if (res.status === 503) setPhase("unavailable");
      else if (res.status === 429) setPhase("tooMany");
      else setPhase("error");
    } catch {
      setPhase("error");
    }
  };

  if (phase === "success") {
    return (
      <div role="status" className="border p-6 sm:p-8" style={{ borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
        <p className="h3">{t("success")}</p>
      </div>
    );
  }

  const field = (id: keyof typeof values, label: string, type = "text", autoComplete?: string) => {
    const err = errors[id as keyof ContactErrors];
    return (
      <div>
        <label htmlFor={`${uid}-${id}`} className="mb-1.5 block text-[0.9rem] font-medium">
          {label}
        </label>
        <input
          id={`${uid}-${id}`}
          type={type}
          name={id}
          value={values[id]}
          onChange={set(id)}
          autoComplete={autoComplete}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${uid}-${id}-err` : undefined}
          className="min-h-[2.75rem] w-full border bg-transparent px-3.5 py-2.5 text-[1rem]"
          style={{ borderColor: err ? "var(--warm)" : "var(--rule-strong)", borderRadius: 2 }}
        />
        {err && (
          <p id={`${uid}-${id}-err`} className="mt-1.5 text-[0.85rem]" style={{ color: "var(--warm)" }}>
            {t(err)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", t("name"), "text", "name")}
        {field("email", t("email"), "email", "email")}
      </div>
      {field("company", t("company"), "text", "organization")}

      <div>
        <label htmlFor={`${uid}-topic`} className="mb-1.5 block text-[0.9rem] font-medium">
          {t("topic")}
        </label>
        <select
          id={`${uid}-topic`}
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactTopic)}
          className="min-h-[2.75rem] w-full border bg-transparent px-3 py-2.5 text-[1rem]"
          style={{ borderColor: "var(--rule-strong)", borderRadius: 2 }}
        >
          {CONTACT_TOPICS.map((k) => (
            <option key={k} value={k} style={{ color: "#0e2219" }}>
              {t(`topics.${k}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className="mb-1.5 block text-[0.9rem] font-medium">
          {t("message")}
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          maxLength={MAX_MESSAGE}
          value={values.message}
          onChange={set("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={`${uid}-message-help${errors.message ? ` ${uid}-message-err` : ""}`}
          className="w-full resize-y border bg-transparent px-3.5 py-2.5 text-[1rem] leading-relaxed"
          style={{ borderColor: errors.message ? "var(--warm)" : "var(--rule-strong)", borderRadius: 2 }}
        />
        <p id={`${uid}-message-help`} className="mt-1.5 text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("messageHelp")}
        </p>
        {errors.message && (
          <p id={`${uid}-message-err`} className="mt-1 text-[0.85rem]" style={{ color: "var(--warm)" }}>
            {t(errors.message)}
          </p>
        )}
      </div>

      {/* Champ piège : invisible pour un humain, rempli par un robot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-solid" disabled={phase === "sending"}>
          {phase === "sending" ? t("sending") : t("submit")}
        </button>
        <p className="text-[0.85rem]" style={{ color: "var(--fg-2)" }}>
          {t("consent")}
        </p>
      </div>

      {(phase === "error" || phase === "unavailable" || phase === "tooMany") && (
        <p role="alert" className="border-l-2 py-1 pl-4 text-[0.95rem]" style={{ borderColor: "var(--warm)" }}>
          {t(phase)}
        </p>
      )}
    </form>
  );
}
