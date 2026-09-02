"use client";

import { useMemo, useState } from "react";

import type { DiagnosticCopy } from "@/content/diagnostic/copy";
import type { SelectFieldCopy } from "@/content/diagnostic/copy-types";
import {
  ACCEPTED_FILE_EXTENSIONS,
  hasAcceptedExtension,
  isValid,
  MAX_FILES,
  MAX_FILES_BYTES,
  validateContact,
  type ContactAttachment,
  type ContactErrors,
} from "@/lib/diagnostic/contact";
import { formatSlotDate, nextWorkingDays } from "@/lib/diagnostic/slots";
import type { LeadFields } from "@/lib/diagnostic/types";

/**
 * Écran de fin de parcours — un seul formulaire.
 *
 * Contact, créneau souhaité, et pour les profils qui le demandent, dépôt des
 * ordres de transport. Il n'y a plus de bloc « envoyez-nous vos flux » séparé
 * du formulaire d'email : c'était deux demandes pour une seule intention.
 */

export type SubmitState = "idle" | "sending" | "sent" | "error";

export function ContactForm({
  copy,
  locale,
  withFiles,
  state,
  errorMessage,
  onSubmit,
}: {
  copy: DiagnosticCopy;
  locale: string;
  /** Le dépôt de fichiers n'est proposé qu'aux branches qui le déclarent. */
  withFiles: boolean;
  state: SubmitState;
  errorMessage: string | null;
  onSubmit: (lead: LeadFields, attachments: ContactAttachment[]) => void;
}) {
  const [values, setValues] = useState({
    email: "",
    societe: "",
    role: "",
    perimetre: "",
    budget: "",
    creneauDate: "",
    creneauHeure: "",
    message: "",
  });
  const [files, setFiles] = useState<ContactAttachment[]>([]);
  const [errors, setErrors] = useState<ContactErrors>({});

  const set = (name: keyof typeof values) => (value: string) =>
    setValues((previous) => ({ ...previous, [name]: value }));

  // Les jours ouvrés sont calculés une fois, à partir de la date du répondant.
  const jours: SelectFieldCopy = useMemo(
    () => ({
      ...copy.contact.creneauDate,
      options: nextWorkingDays(new Date()).map((iso) => ({
        value: iso,
        label: formatSlotDate(iso, locale),
      })),
    }),
    [copy.contact.creneauDate, locale],
  );

  const ajouterFichiers = async (liste: FileList | null) => {
    if (!liste) return;
    const lus = await Promise.all(
      Array.from(liste).map(
        (file) =>
          new Promise<ContactAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            reader.onload = () =>
              resolve({
                filename: file.name,
                // `data:<type>;base64,<contenu>` — on ne garde que le contenu.
                content: String(reader.result).split(",")[1] ?? "",
                size: file.size,
              });
            reader.readAsDataURL(file);
          }),
      ),
    );
    setFiles((precedents) => [...precedents, ...lus].slice(0, MAX_FILES + 1));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trouvees = validateContact(
      {
        email: values.email.trim(),
        societe: values.societe.trim(),
        role: values.role,
        perimetre: values.perimetre,
        creneauDate: values.creneauDate || null,
        creneauHeure: (values.creneauHeure || null) as never,
        attachments: files,
      },
      copy.contact.errors,
    );
    setErrors(trouvees);
    if (!isValid(trouvees)) return;

    onSubmit(
      {
        email: values.email.trim(),
        societe: values.societe.trim(),
        role: values.role,
        perimetre: values.perimetre,
        budget: values.budget || null,
        creneau_date: values.creneauDate || null,
        creneau_heure: values.creneauHeure || null,
        message: values.message.trim() || null,
        fichiers: files.map((f) => f.filename),
      },
      files,
    );
  };

  if (state === "sent") {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8"
      >
        <p className="text-lg font-semibold text-navy-900">
          {copy.contact.success.title}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-navy-700">
          {copy.contact.success.body}
        </p>
      </section>
    );
  }

  const totalOctets = files.reduce((somme, f) => somme + f.size, 0);

  return (
    <section
      aria-labelledby="diagnostic-contact"
      className="rounded-2xl border border-navy-200/60 bg-white p-6 shadow-premium sm:p-8"
    >
      <h2 id="diagnostic-contact" className="text-xl font-bold text-navy-900">
        {copy.contact.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">
        {copy.contact.subtitle}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <TextField
          name="email"
          type="email"
          autoComplete="email"
          field={copy.contact.email}
          value={values.email}
          error={errors.email}
          onChange={set("email")}
        />

        <TextField
          name="societe"
          type="text"
          autoComplete="organization"
          field={copy.contact.societe}
          value={values.societe}
          error={errors.societe}
          onChange={set("societe")}
        />

        <SelectField
          name="role"
          field={copy.contact.role}
          value={values.role}
          error={errors.role}
          onChange={set("role")}
        />

        <SelectField
          name="perimetre"
          field={copy.contact.perimetre}
          value={values.perimetre}
          error={errors.perimetre}
          onChange={set("perimetre")}
        />

        <SelectField
          name="budget"
          field={copy.contact.budget}
          value={values.budget}
          optionalLabel={copy.contact.optional}
          onChange={set("budget")}
        />

        {/* ---- Créneau ---- */}
        <fieldset className="rounded-xl border border-navy-200 p-4">
          <legend className="px-1 text-sm font-semibold text-navy-800">
            {copy.contact.creneauTitle}
          </legend>
          <p className="text-xs leading-relaxed text-navy-500">
            {copy.contact.creneauHelp}
          </p>
          <div className="mt-3 space-y-4">
            <SelectField
              name="creneauDate"
              field={jours}
              value={values.creneauDate}
              error={errors.creneauDate}
              optionalLabel={copy.contact.optional}
              onChange={set("creneauDate")}
            />
            <SelectField
              name="creneauHeure"
              field={copy.contact.creneauHeure}
              value={values.creneauHeure}
              error={errors.creneauHeure}
              optionalLabel={copy.contact.optional}
              onChange={set("creneauHeure")}
            />
          </div>
        </fieldset>

        {/* ---- Ordres de transport, branche complets ---- */}
        {withFiles ? (
          <fieldset className="rounded-xl border border-navy-200 p-4">
            <legend className="px-1 text-sm font-semibold text-navy-800">
              {copy.contact.files.title}
            </legend>
            <p className="text-xs leading-relaxed text-navy-500">
              {copy.contact.files.help}
            </p>

            <label
              htmlFor="fichiers"
              className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2"
            >
              {copy.contact.files.button}
              <input
                id="fichiers"
                name="fichiers"
                type="file"
                multiple
                accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
                className="sr-only"
                onChange={(event) => {
                  void ajouterFichiers(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>

            {files.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.filename}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-navy-50 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-navy-700">
                      {file.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((precedents) =>
                          precedents.filter((_, i) => i !== index),
                        )
                      }
                      className="shrink-0 text-xs font-medium text-navy-500 underline underline-offset-2 hover:text-navy-800"
                    >
                      {copy.contact.files.remove}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {errors.attachments ? (
              <p className="mt-2 text-xs text-red-600">{errors.attachments}</p>
            ) : totalOctets > MAX_FILES_BYTES ? (
              <p className="mt-2 text-xs text-red-600">
                {copy.contact.errors.filesTooLarge}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <TextArea
          name="message"
          field={copy.contact.message}
          value={values.message}
          optionalLabel={copy.contact.optional}
          onChange={set("message")}
        />

        {state === "error" && errorMessage ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:from-brand-700 hover:to-brand-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "sending" ? copy.contact.submitting : copy.contact.submit}
        </button>

        <p className="pt-1 text-xs leading-relaxed text-navy-400">
          {copy.contact.privacy}
        </p>
      </form>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const FIELD_CLASSES =
  "mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1";

function Label({
  htmlFor,
  children,
  optionalLabel,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optionalLabel?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-navy-700">
      {children}
      {optionalLabel ? (
        <span className="ml-2 text-xs font-normal text-navy-400">
          {optionalLabel}
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}

function TextField({
  name,
  type,
  field,
  value,
  error,
  autoComplete,
  onChange,
}: {
  name: string;
  type: "text" | "email";
  field: { label: string; placeholder: string };
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <Label htmlFor={name}>{field.label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD_CLASSES} ${error ? "border-red-400" : "border-navy-200"}`}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function TextArea({
  name,
  field,
  value,
  optionalLabel,
  onChange,
}: {
  name: string;
  field: { label: string; placeholder: string };
  value: string;
  optionalLabel?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={name} optionalLabel={optionalLabel}>
        {field.label}
      </Label>
      <textarea
        id={name}
        name={name}
        rows={3}
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${FIELD_CLASSES} border-navy-200`}
      />
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
      <Label htmlFor={name} optionalLabel={optionalLabel}>
        {field.label}
      </Label>
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
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function fileHint(filename: string): boolean {
  return hasAcceptedExtension(filename);
}
