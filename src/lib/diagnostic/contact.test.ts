import { describe, expect, it } from "vitest";

import {
  hasAcceptedExtension,
  isValid,
  MAX_FILES,
  MAX_FILES_BYTES,
  validateContact,
  type ContactAttachment,
} from "./contact";

const messages = {
  required: "obligatoire",
  email: "email",
  filesTooMany: "trop",
  filesTooLarge: "lourd",
  fileType: "type",
};

const valide = {
  email: "acheteur@chargeur.fr",
  societe: "Chargeur SA",
  role: "achats",
  perimetre: "multi_sites",
};

const fichier = (nom: string, taille: number): ContactAttachment => ({
  filename: nom,
  content: "",
  size: taille,
});

describe("validation de la demande de contact", () => {
  it("accepte une demande complète sans créneau ni fichier", () => {
    // On doit pouvoir écrire sans réserver.
    expect(isValid(validateContact(valide, messages))).toBe(true);
  });

  it("exige les champs de rappel", () => {
    const erreurs = validateContact({}, messages);
    expect(erreurs.email).toBe("obligatoire");
    expect(erreurs.societe).toBe("obligatoire");
    expect(erreurs.role).toBe("obligatoire");
    expect(erreurs.perimetre).toBe("obligatoire");
  });

  it("refuse une adresse email mal formée", () => {
    expect(validateContact({ ...valide, email: "pasunemail" }, messages).email).toBe(
      "email",
    );
    expect(validateContact({ ...valide, email: "a@b" }, messages).email).toBe(
      "email",
    );
  });

  it("exige la date et l'heure ensemble, ou aucune des deux", () => {
    expect(
      validateContact({ ...valide, creneauDate: "2026-09-03" }, messages)
        .creneauHeure,
    ).toBe("obligatoire");
    expect(
      validateContact({ ...valide, creneauHeure: "matin" }, messages).creneauDate,
    ).toBe("obligatoire");
    expect(
      isValid(
        validateContact(
          { ...valide, creneauDate: "2026-09-03", creneauHeure: "matin" },
          messages,
        ),
      ),
    ).toBe(true);
  });

  it("refuse une tranche horaire inconnue", () => {
    expect(
      validateContact(
        {
          ...valide,
          creneauDate: "2026-09-03",
          creneauHeure: "minuit" as never,
        },
        messages,
      ).creneauHeure,
    ).toBe("obligatoire");
  });

  it("plafonne le nombre et le poids des pièces jointes", () => {
    const trop = Array.from({ length: MAX_FILES + 1 }, (_, i) =>
      fichier(`flux-${i}.csv`, 1000),
    );
    expect(validateContact({ ...valide, attachments: trop }, messages).attachments).toBe(
      "trop",
    );

    const lourd = [fichier("flux.csv", MAX_FILES_BYTES + 1)];
    expect(
      validateContact({ ...valide, attachments: lourd }, messages).attachments,
    ).toBe("lourd");

    // Le plafond porte sur le total, pas sur chaque fichier pris isolément.
    const cumul = [
      fichier("a.csv", MAX_FILES_BYTES * 0.6),
      fichier("b.csv", MAX_FILES_BYTES * 0.6),
    ];
    expect(
      validateContact({ ...valide, attachments: cumul }, messages).attachments,
    ).toBe("lourd");
  });

  it("n'accepte que des formats de fichier de flux", () => {
    for (const nom of ["flux.csv", "FLUX.XLSX", "ordres.pdf", "export.tsv"]) {
      expect(hasAcceptedExtension(nom), nom).toBe(true);
    }
    for (const nom of ["script.js", "archive.zip", "photo.png", "flux"]) {
      expect(hasAcceptedExtension(nom), nom).toBe(false);
    }
    expect(
      validateContact(
        { ...valide, attachments: [fichier("charge.zip", 10)] },
        messages,
      ).attachments,
    ).toBe("type");
  });
});
