"use client";

import { useState } from "react";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import type { SelectFieldCopy } from "@/content/diagnostic/copy-types";
import type { LeadFields } from "@/lib/diagnostic/types";

/**
 * Écran 10 — bloc email et qualification.
 *
 * L'indice, le niveau et les trois leviers sont déjà affichés au-dessus, sans
 * email. Ce bloc ne conditionne que le rapport détaillé — pas de mur d'email,
 * pas de popup, pas de compte à rebours.
 *
 * Rôle et périmètre sont de la donnée de qualification pure : ils ne modifient
 * pas le résultat affiché.
 */

type FieldName = "email" | "societe" | "role" | "perimetre";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadForm({
  copy,
  submitted,
  onSubmit,
}: {
  copy: DiagnosticCopy;
  submitted: boolean;
  onSubmit: (lead: LeadFields) => void;
}) {
  const [values, setValues] = useState({
    email: "",
    societe: "",
    role: "",
    perimetre: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const set = (name: keyof typeof values) => (value: string) =>
    setValues((previous) => ({ ...previous, [name]: value }));

  const validate = () => {
    const next: Partial<Record<FieldName, string>> = {};
    if (!values.email.trim()) next.email = copy.lead.errors.required;
    else if (!EMAIL_PATTERN.test(values.email.trim()))
      next.email = copy.lead.errors.email;
    if (!values.societe.trim()) next.societe = copy.lead.errors.required;
    if (!values.role) next.role = copy.lead.errors.required;
    if (!values.perimetre) next.perimetre = copy.lead.errors.required;
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      email: values.email.trim(),
      societe: values.societe.trim(),
      role: values.role,
      perimetre: values.perimetre,
      // Le budget est facultatif : « je préfère ne pas répondre » est une
      // réponse, l'absence de réponse aussi.
      budget: values.budget || null,
    });
  };

  if (submitted) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8"
      >
        <p className="text-[15px] font-medium leading-relaxed text-navy-800">
          {copy.lead.success}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="diagnostic-lead"
      className="rounded-2xl border border-navy-200/60 bg-white p-6 shadow-premium sm:p-8"
    >
      <h2 id="diagnostic-lead" className="text-xl font-bold text-navy-900">
        {copy.lead.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">
        {copy.lead.subtitle}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <TextField
          name="email"
          type="email"
          autoComplete="email"
          label={copy.lead.email.label}
          placeholder={copy.lead.email.placeholder}
          value={values.email}
          error={errors.email}
          onChange={set("email")}
        />

        <TextField
          name="societe"
          type="text"
          autoComplete="organization"
          label={copy.lead.societe.label}
          placeholder={copy.lead.societe.placeholder}
          value={values.societe}
          error={errors.societe}
          onChange={set("societe")}
        />

        <SelectField
          name="role"
          field={copy.lead.role}
          value={values.role}
          error={errors.role}
          onChange={set("role")}
        />

        <SelectField
          name="perimetre"
          field={copy.lead.perimetre}
          value={values.perimetre}
          error={errors.perimetre}
          onChange={set("perimetre")}
        />

        <SelectField
          name="budget"
          field={copy.lead.budget}
          value={values.budget}
          optionalLabel={copy.lead.optional}
          onChange={set("budget")}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:from-brand-700 hover:to-brand-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          {copy.lead.submit}
        </button>

        <p className="pt-1 text-xs leading-relaxed text-navy-400">
          {copy.lead.privacy}
        </p>
      </form>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1";

function TextField({
  name,
  type,
  label,
  placeholder,
  value,
  error,
  autoComplete,
  onChange,
}: {
  name: string;
  type: "text" | "email";
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-navy-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD_CLASSES} ${
          error ? "border-red-400" : "border-navy-200"
        }`}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  name,
  field,
  value,
  error,
  optionalLabel,
  onChange,
}: {
  name: string;
  field: SelectFieldCopy;
  value: string;
  error?: string;
  optionalLabel?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-navy-700">
        {field.label}
        {optionalLabel ? (
          <span className="ml-2 text-xs font-normal text-navy-400">
            {optionalLabel}
          </span>
        ) : null}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD_CLASSES} ${
          error ? "border-red-400" : "border-navy-200"
        } ${value ? "text-navy-900" : "text-navy-400"}`}
      >
        <option value="">{field.placeholder}</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
